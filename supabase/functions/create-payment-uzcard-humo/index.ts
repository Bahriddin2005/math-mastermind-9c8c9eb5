import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-PAYMENT-UZCARD-HUMO] ${step}${detailsStr}`);
};

// Test mode: fake acquiring logic
const TEST_MODE = Deno.env.get("PAYMENT_TEST_MODE") !== "false";

// Generate signature/hash (bank-style)
const generateSignature = async (
  amount: number,
  transactionId: string,
  merchantId: string,
  terminalId: string,
  secretKey: string
): Promise<string> => {
  const data = `${amount}|${transactionId}|${merchantId}|${terminalId}`;
  const encoder = new TextEncoder();
  const dataWithKey = encoder.encode(data + secretKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataWithKey);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.toUpperCase();
};

// Mask card number
const maskCardNumber = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (cleaned.length < 4) return cardNumber;
  const last4 = cleaned.slice(-4);
  const first4 = cleaned.slice(0, 4);
  return `${first4} **** **** ${last4}`;
};

// Validate card number
const validateCardNumber = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\s/g, '');
  return /^\d{16}$/.test(cleaned);
};

// Test mode: simulate bank response
const simulateBankResponse = (cardNumber: string, amount: number): {
  success: boolean;
  requiresOtp: boolean;
  message?: string;
} => {
  const cleaned = cardNumber.replace(/\s/g, '');
  
  // Test cards
  if (cleaned.startsWith('8600')) {
    // UZCARD test card - success
    return { success: true, requiresOtp: true };
  } else if (cleaned.startsWith('9860')) {
    // HUMO test card - success
    return { success: true, requiresOtp: true };
  } else if (cleaned.startsWith('8601')) {
    // UZCARD test card - failure
    return { success: false, requiresOtp: false, message: 'Insufficient funds' };
  } else if (cleaned.startsWith('9861')) {
    // HUMO test card - failure
    return { success: false, requiresOtp: false, message: 'Card expired' };
  } else {
    // Other cards - failure
    return { success: false, requiresOtp: false, message: 'Invalid card number' };
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const {
      planId,
      amount,
      isYearly,
      cardSystem,
      cardNumber,
      expiryDate,
      phoneNumber,
    } = await req.json();

    logStep("Received request", { planId, amount, cardSystem });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Validate inputs
    if (!validateCardNumber(cardNumber)) {
      throw new Error("Invalid card number");
    }

    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      throw new Error("Invalid expiry date format");
    }

    // Generate transaction ID
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    
    // Get merchant credentials
    const merchantId = Deno.env.get("MERCHANT_ID") || "TEST_MERCHANT_001";
    const terminalId = Deno.env.get("TERMINAL_ID") || "TEST_TERMINAL_001";
    const secretKey = Deno.env.get("SECRET_KEY") || "TEST_SECRET_KEY";

    // Generate signature
    const signature = await generateSignature(amount, transactionId, merchantId, terminalId, secretKey);

    // Mask card number
    const cardNumberMasked = maskCardNumber(cardNumber);
    const cardLast4 = cardNumber.replace(/\s/g, '').slice(-4);

    // Determine card type
    const cardType = cardSystem.toUpperCase() === 'UZCARD' ? 'UZCARD' : 'HUMO';

    // Simulate bank response (TEST MODE)
    let bankResponse;
    if (TEST_MODE) {
      bankResponse = simulateBankResponse(cardNumber, amount);
      logStep("Test mode - simulated bank response", bankResponse);
    } else {
      // REAL MODE: Call actual bank API here
      // const bankResponse = await callBankAPI({...});
      // For now, we'll use test mode
      bankResponse = simulateBankResponse(cardNumber, amount);
    }

    // Save payment to database
    const { data: payment, error: dbError } = await supabaseClient
      .from("payments")
      .insert({
        user_id: user.id,
        plan_id: planId,
        amount: amount,
        currency: "UZS",
        card_type: cardType,
        card_number_masked: cardNumberMasked,
        card_last_4: cardLast4,
        expiry_date: expiryDate,
        phone_number: phoneNumber,
        status: bankResponse.success ? (bankResponse.requiresOtp ? 'otp_sent' : 'pending') : 'failed',
        transaction_id: transactionId,
        merchant_id: merchantId,
        terminal_id: terminalId,
        signature: signature,
        error_message: bankResponse.success ? null : bankResponse.message,
        is_yearly: isYearly,
      })
      .select()
      .single();

    if (dbError) {
      logStep("Database error", { error: dbError.message });
      throw dbError;
    }

    logStep("Payment created", { paymentId: payment.id, transactionId });

    // Return response
    return new Response(
      JSON.stringify({
        success: bankResponse.success,
        requiresOtp: bankResponse.requiresOtp,
        transactionId: transactionId,
        paymentId: payment.id,
        message: bankResponse.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

