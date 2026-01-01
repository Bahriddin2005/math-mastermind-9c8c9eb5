import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-PAYMENT-PAYNET] ${step}${detailsStr}`);
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

    const paynetMerchantId = Deno.env.get("PAYNET_MERCHANT_ID");
    const paynetKey = Deno.env.get("PAYNET_KEY");

    if (!paynetMerchantId || !paynetKey) {
      throw new Error("Paynet payment credentials not configured");
    }

    // Paynet API ga so'rov yuborish
    const merchantTransactionId = `${user.id}_${Date.now()}`;
    const paymentData = {
      merchant_id: paynetMerchantId,
      amount: amount,
      currency: "UZS",
      order_id: merchantTransactionId,
      description: `IQROMAX ${planId} obuna`,
      return_url: `${req.headers.get("origin")}/pricing?payment=success&method=paynet`,
      cancel_url: `${req.headers.get("origin")}/pricing?payment=canceled&method=paynet`,
    };

    // Paynet API ga POST so'rov
    const paynetResponse = await fetch("https://paynet.uz/api/payment/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${paynetKey}`,
      },
      body: JSON.stringify(paymentData),
    });

    if (!paynetResponse.ok) {
      const errorText = await paynetResponse.text();
      throw new Error(`Paynet API error: ${errorText}`);
    }

    const paynetData = await paynetResponse.json();
    logStep("Paynet payment created", { paymentId: paynetData.payment_id });

    // To'lov holatini bazaga saqlash
    const { error: dbError } = await supabaseClient
      .from("payments")
      .insert({
        user_id: user.id,
        plan_id: planId,
        amount: amount,
        currency: "UZS",
        payment_method: "paynet",
        payment_id: paynetData.payment_id,
        merchant_trans_id: merchantTransactionId,
        status: "pending",
        is_yearly: isYearly,
      });

    if (dbError) {
      logStep("Database error", { error: dbError.message });
    }

    return new Response(
      JSON.stringify({
        url: paynetData.payment_url || paynetData.redirect_url,
        payment_id: paynetData.payment_id,
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

