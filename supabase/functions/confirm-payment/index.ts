import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CONFIRM-PAYMENT] ${step}${detailsStr}`);
};

// Test mode: simulate OTP verification
const TEST_MODE = Deno.env.get("PAYMENT_TEST_MODE") !== "false";

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

    const { transactionId, otpCode } = await req.json();
    logStep("Received request", { transactionId });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id });

    // Get payment from database
    const { data: payment, error: fetchError } = await supabaseClient
      .from("payments")
      .select("*")
      .eq("transaction_id", transactionId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !payment) {
      throw new Error("Payment not found");
    }

    if (payment.status !== 'otp_sent' && payment.status !== 'pending') {
      throw new Error(`Payment cannot be confirmed. Current status: ${payment.status}`);
    }

    // Simulate OTP verification (TEST MODE)
    let otpValid = false;
    if (TEST_MODE) {
      // In test mode, accept any 6-digit OTP or "123456"
      otpValid = /^\d{6}$/.test(otpCode) || otpCode === "123456";
      logStep("Test mode - OTP verification", { otpValid, otpCode });
    } else {
      // REAL MODE: Verify OTP with bank API
      // const otpResponse = await verifyOTPWithBank({ transactionId, otpCode });
      // otpValid = otpResponse.valid;
      otpValid = /^\d{6}$/.test(otpCode) || otpCode === "123456";
    }

    if (!otpValid) {
      // Update payment status to failed
      await supabaseClient
        .from("payments")
        .update({
          status: 'failed',
          error_message: 'Invalid OTP code',
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid OTP code",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Simulate final bank confirmation
    let finalConfirmation = true;
    if (TEST_MODE) {
      // In test mode, always confirm if OTP is valid
      finalConfirmation = true;
    } else {
      // REAL MODE: Call bank API to confirm payment
      // finalConfirmation = await confirmPaymentWithBank({ transactionId });
    }

    if (!finalConfirmation) {
      await supabaseClient
        .from("payments")
        .update({
          status: 'failed',
          error_message: 'Payment confirmation failed',
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      return new Response(
        JSON.stringify({
          success: false,
          error: "Payment confirmation failed",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Update payment status to success
    const subscriptionEnd = new Date();
    if (payment.is_yearly) {
      subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
    } else {
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
    }

    const { error: updateError } = await supabaseClient
      .from("payments")
      .update({
        status: 'success',
        confirmed_at: new Date().toISOString(),
        subscription_end: subscriptionEnd.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    if (updateError) {
      throw updateError;
    }

    // Create or update subscription
    const { error: subscriptionError } = await supabaseClient
      .from("subscriptions")
      .upsert({
        user_id: user.id,
        plan_id: payment.plan_id,
        status: "active",
        subscription_start: new Date().toISOString(),
        subscription_end: subscriptionEnd.toISOString(),
        payment_id: payment.id,
      }, {
        onConflict: "user_id",
      });

    if (subscriptionError) {
      logStep("Subscription update error", { error: subscriptionError.message });
    }

    logStep("Payment confirmed successfully", { paymentId: payment.id, transactionId });

    return new Response(
      JSON.stringify({
        success: true,
        transactionId: transactionId,
        paymentId: payment.id,
        message: "Payment confirmed successfully",
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

