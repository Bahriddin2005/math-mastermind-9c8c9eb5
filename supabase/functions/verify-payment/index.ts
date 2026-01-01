import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
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

    const { paymentMethod, paymentId, merchantTransId } = await req.json();
    logStep("Received request", { paymentMethod, paymentId, merchantTransId });

    // To'lov holatini tekshirish
    let paymentStatus = "pending";
    let verified = false;

    if (paymentMethod === "click") {
      const clickMerchantId = Deno.env.get("CLICK_MERCHANT_ID");
      const clickSecretKey = Deno.env.get("CLICK_SECRET_KEY");

      if (clickMerchantId && clickSecretKey && merchantTransId) {
        // Click API dan to'lov holatini tekshirish
        const response = await fetch(
          `https://api.click.uz/v2/merchant/payment/status/${merchantTransId}`,
          {
            method: "GET",
            headers: {
              "Auth": `${clickMerchantId}:${clickSecretKey}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.status === 2) {
            // 2 = paid
            paymentStatus = "completed";
            verified = true;
          } else if (data.status === -1 || data.status === -2) {
            paymentStatus = "failed";
          }
        }
      }
    } else if (paymentMethod === "payme") {
      const paymeKey = Deno.env.get("PAYME_KEY");

      if (paymeKey && paymentId) {
        // Payme API dan to'lov holatini tekshirish
        const response = await fetch("https://checkout.paycom.uz/api", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Auth": paymeKey,
          },
          body: JSON.stringify({
            method: "receipts.get",
            params: {
              id: paymentId,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.result?.receipt?.state === 2) {
            // 2 = paid
            paymentStatus = "completed";
            verified = true;
          } else if (data.result?.receipt?.state === -1 || data.result?.receipt?.state === -2) {
            paymentStatus = "failed";
          }
        }
      }
    } else if (paymentMethod === "paynet") {
      const paynetKey = Deno.env.get("PAYNET_KEY");

      if (paynetKey && paymentId) {
        // Paynet API dan to'lov holatini tekshirish
        const response = await fetch(
          `https://paynet.uz/api/payment/status/${paymentId}`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${paynetKey}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.status === "paid" || data.status === "completed") {
            paymentStatus = "completed";
            verified = true;
          } else if (data.status === "failed" || data.status === "canceled") {
            paymentStatus = "failed";
          }
        }
      }
    }

    // To'lov holatini bazada yangilash
    const { data: payment, error: fetchError } = await supabaseClient
      .from("payments")
      .select("*")
      .or(`payment_id.eq.${paymentId},merchant_trans_id.eq.${merchantTransId}`)
      .single();

    if (fetchError || !payment) {
      throw new Error("Payment not found");
    }

    const { error: updateError } = await supabaseClient
      .from("payments")
      .update({
        status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    if (updateError) {
      throw updateError;
    }

    // Agar to'lov muvaffaqiyatli bo'lsa, obunani faollashtirish
    if (verified && paymentStatus === "completed") {
      const subscriptionEnd = new Date();
      if (payment.is_yearly) {
        subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
      } else {
        subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
      }

      // Obunani saqlash yoki yangilash
      const { error: subscriptionError } = await supabaseClient
        .from("subscriptions")
        .upsert({
          user_id: payment.user_id,
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
    }

    return new Response(
      JSON.stringify({
        verified,
        status: paymentStatus,
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

