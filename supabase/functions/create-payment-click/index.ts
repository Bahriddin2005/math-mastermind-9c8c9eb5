import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-PAYMENT-CLICK] ${step}${detailsStr}`);
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

    const clickMerchantId = Deno.env.get("CLICK_MERCHANT_ID");
    const clickServiceId = Deno.env.get("CLICK_SERVICE_ID");
    const clickSecretKey = Deno.env.get("CLICK_SECRET_KEY");
    const clickMerchantUserId = Deno.env.get("CLICK_MERCHANT_USER_ID");

    if (!clickMerchantId || !clickServiceId || !clickSecretKey || !clickMerchantUserId) {
      throw new Error("Click payment credentials not configured");
    }

    // Click API ga so'rov yuborish
    const paymentData = {
      amount: amount,
      currency: "UZS",
      merchant_trans_id: `${user.id}_${Date.now()}`,
      merchant_prepare_id: null,
      merchant_user_id: clickMerchantUserId,
      service_id: clickServiceId,
      return_url: `${req.headers.get("origin")}/pricing?payment=success&method=click`,
      cancel_url: `${req.headers.get("origin")}/pricing?payment=canceled&method=click`,
    };

    // Click API ga POST so'rov
    const clickResponse = await fetch("https://api.click.uz/v2/merchant/payment/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Auth": `${clickMerchantId}:${clickSecretKey}`,
      },
      body: JSON.stringify(paymentData),
    });

    if (!clickResponse.ok) {
      const errorText = await clickResponse.text();
      throw new Error(`Click API error: ${errorText}`);
    }

    const clickData = await clickResponse.json();
    logStep("Click payment created", { paymentId: clickData.payment_id });

    // To'lov holatini bazaga saqlash
    const { error: dbError } = await supabaseClient
      .from("payments")
      .insert({
        user_id: user.id,
        plan_id: planId,
        amount: amount,
        currency: "UZS",
        payment_method: "click",
        payment_id: clickData.payment_id,
        merchant_trans_id: paymentData.merchant_trans_id,
        status: "pending",
        is_yearly: isYearly,
      });

    if (dbError) {
      logStep("Database error", { error: dbError.message });
    }

    return new Response(
      JSON.stringify({
        url: clickData.payment_url || `https://my.click.uz/services/pay?service_id=${clickServiceId}&merchant_trans_id=${paymentData.merchant_trans_id}`,
        payment_id: clickData.payment_id,
        merchant_trans_id: paymentData.merchant_trans_id,
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

