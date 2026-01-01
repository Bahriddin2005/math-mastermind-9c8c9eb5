import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-PAYMENT-PAYME] ${step}${detailsStr}`);
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

    const { planId, amount, isYearly } = await req.json();
    logStep("Received request", { planId, amount, isYearly });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const paymeMerchantId = Deno.env.get("PAYME_MERCHANT_ID");
    const paymeKey = Deno.env.get("PAYME_KEY");

    if (!paymeMerchantId || !paymeKey) {
      throw new Error("Payme payment credentials not configured");
    }

    // Payme API ga so'rov yuborish
    const merchantTransactionId = `${user.id}_${Date.now()}`;
    const paymentData = {
      method: "cards.create",
      params: {
        amount: amount * 100, // Payme so'mda kopeklarda
        currency: "UZS",
        account: {
          order_id: merchantTransactionId,
        },
        callback: `${req.headers.get("origin")}/pricing?payment=success&method=payme`,
        callback_timeout: 60000,
      },
    };

    // Payme API ga POST so'rov
    const paymeResponse = await fetch("https://checkout.paycom.uz/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Auth": paymeKey,
      },
      body: JSON.stringify(paymentData),
    });

    if (!paymeResponse.ok) {
      const errorText = await paymeResponse.text();
      throw new Error(`Payme API error: ${errorText}`);
    }

    const paymeData = await paymeResponse.json();
    logStep("Payme payment created", { paymentId: paymeData.result?.receipt?._id });

    // To'lov holatini bazaga saqlash
    const { error: dbError } = await supabaseClient
      .from("payments")
      .insert({
        user_id: user.id,
        plan_id: planId,
        amount: amount,
        currency: "UZS",
        payment_method: "payme",
        payment_id: paymeData.result?.receipt?._id || merchantTransactionId,
        merchant_trans_id: merchantTransactionId,
        status: "pending",
        is_yearly: isYearly,
      });

    if (dbError) {
      logStep("Database error", { error: dbError.message });
    }

    return new Response(
      JSON.stringify({
        url: paymeData.result?.receipt?.pay_url || `https://checkout.paycom.uz/${paymeData.result?.receipt?._id}`,
        payment_id: paymeData.result?.receipt?._id,
        merchant_trans_id: merchantTransactionId,
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
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

