import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RazorpayWebhookPayload {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment: {
      entity: {
        id: string;
        entity: string;
        amount: number;
        currency: string;
        status: string;
        order_id: string;
        invoice_id?: string;
        international: boolean;
        method: string;
        amount_refunded: number;
        refund_status?: string;
        captured: boolean;
        description?: string;
        card_id?: string;
        bank?: string;
        wallet?: string;
        vpa?: string;
        email: string;
        contact: string;
        notes: {
          user_id?: string;
          user_email?: string;
          subscription_type?: string;
          duration_days?: string;
        };
        fee?: number;
        tax?: number;
        created_at: number;
      };
    };
  };
  created_at: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify webhook signature
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
    
    if (!signature || !webhookSecret) {
      throw new Error("Missing signature or webhook secret");
    }

    const body = await req.text();
    
    // Verify signature
    const expectedSignature = await crypto.subtle.sign(
      "HMAC",
      await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(webhookSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      ),
      new TextEncoder().encode(body)
    );
    
    const expectedSignatureHex = Array.from(new Uint8Array(expectedSignature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (signature !== expectedSignatureHex) {
      console.error("Invalid webhook signature");
      return new Response("Invalid signature", { status: 400 });
    }

    const payload: RazorpayWebhookPayload = JSON.parse(body);
    
    console.log("Received webhook:", payload.event);

    if (payload.event === "payment.captured") {
      const payment = payload.payload.payment.entity;
      const orderId = payment.order_id;
      const userId = payment.notes.user_id;
      
      console.log("Processing payment captured for order:", orderId);

      const supabaseService = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      // Find and update the subscription
      const { data: subscription, error: findError } = await supabaseService
        .from('gis_marketplace_subscriptions')
        .select('*')
        .eq('razorpay_order_id', orderId)
        .single();

      if (findError || !subscription) {
        console.error("Subscription not found:", findError);
        throw new Error("Subscription not found");
      }

      // Calculate expiry date (90 days from now)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 90);

      // Update subscription to active
      const { error: updateError } = await supabaseService
        .from('gis_marketplace_subscriptions')
        .update({
          status: 'active',
          started_at: new Date().toISOString(),
          expires_at: expiryDate.toISOString(),
          razorpay_payment_id: payment.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id);

      if (updateError) {
        console.error("Error updating subscription:", updateError);
        throw updateError;
      }

      console.log(`GIS marketplace subscription activated for user ${userId}, expires on ${expiryDate.toISOString()}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in gis-marketplace-webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);