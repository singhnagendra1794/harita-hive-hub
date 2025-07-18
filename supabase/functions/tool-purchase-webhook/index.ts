import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
};

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        status: string;
        method: string;
        notes?: {
          purchase_type?: string;
          tool_id?: string;
          user_id?: string;
        };
      };
    };
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const signature = req.headers.get("x-razorpay-signature");
    const body = await req.text();
    
    // Verify webhook signature (if webhook secret is configured)
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
    if (webhookSecret && signature) {
      const expectedSignature = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(webhookSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );

      const signatureBytes = await crypto.subtle.sign(
        "HMAC",
        expectedSignature,
        new TextEncoder().encode(body)
      );

      const computedSignature = Array.from(new Uint8Array(signatureBytes))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

      if (signature !== computedSignature) {
        console.error("Invalid webhook signature");
        return new Response("Unauthorized", { status: 401, headers: corsHeaders });
      }
    }

    const payload: RazorpayWebhookPayload = JSON.parse(body);
    console.log("Received webhook:", payload.event);

    if (payload.event === "payment.captured") {
      const payment = payload.payload.payment.entity;
      
      // Check if this is a tool purchase
      const isToolPurchase = payment.notes?.purchase_type === 'marketplace_tool';
      
      if (isToolPurchase) {
        // Update tool order
        const { data: order, error: updateError } = await supabase
          .from('tool_orders')
          .update({
            status: 'completed',
            razorpay_payment_id: payment.id,
            updated_at: new Date().toISOString(),
            metadata: {
              ...{},
              payment_method: payment.method,
              completed_at: new Date().toISOString()
            }
          })
          .eq('razorpay_order_id', payment.order_id)
          .select()
          .single();

        if (updateError) {
          console.error("Error updating tool order:", updateError);
          throw updateError;
        }

        // Update tool download count
        if (order) {
          const { error: toolUpdateError } = await supabase
            .from('marketplace_tools')
            .update({
              download_count: supabase.rpc('increment', { x: 1, table_name: 'marketplace_tools', column_name: 'download_count', row_id: order.tool_id })
            })
            .eq('id', order.tool_id);

          if (toolUpdateError) {
            console.error("Error updating tool download count:", toolUpdateError);
          }
        }

        console.log(`Tool purchase completed for order ${payment.order_id}`);
      } else {
        // Handle subscription payments (existing logic)
        const { error: updateError } = await supabase
          .from('payment_transactions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            webhook_data: { payment_id: payment.id, method: payment.method }
          })
          .eq('payment_gateway_id', payment.order_id);

        if (updateError) {
          console.error("Error updating payment transaction:", updateError);
          throw updateError;
        }

        // Get the payment transaction to find plan type and user
        const { data: transaction, error: fetchError } = await supabase
          .from('payment_transactions')
          .select('user_id, subscription_type')
          .eq('payment_gateway_id', payment.order_id)
          .single();

        if (fetchError || !transaction) {
          console.error("Error fetching transaction:", fetchError);
          throw fetchError || new Error("Transaction not found");
        }

        // Update user subscription
        const { error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .update({
            subscription_tier: transaction.subscription_type,
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', transaction.user_id);

        if (subscriptionError) {
          console.error("Error updating subscription:", subscriptionError);
          throw subscriptionError;
        }

        // Update profile plan
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            plan: transaction.subscription_type === 'pro' ? 'professional' : transaction.subscription_type,
            updated_at: new Date().toISOString()
          })
          .eq('id', transaction.user_id);

        if (profileError) {
          console.error("Error updating profile:", profileError);
        }

        console.log(`Subscription payment successful for order ${payment.order_id}, user upgraded to ${transaction.subscription_type}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});