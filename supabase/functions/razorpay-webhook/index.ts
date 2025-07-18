import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
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
      };
    };
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const signature = req.headers.get('x-razorpay-signature');
    const body = await req.text();
    
    // Verify webhook signature
    const secret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');
    if (!secret) {
      console.error('Razorpay webhook secret not found');
      return new Response('Configuration error', { status: 500, headers: corsHeaders });
    }

    const expectedSignature = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBytes = await crypto.subtle.sign(
      'HMAC',
      expectedSignature,
      new TextEncoder().encode(body)
    );

    const computedSignature = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (signature !== computedSignature) {
      console.error('Invalid webhook signature');
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const payload: RazorpayWebhookPayload = JSON.parse(body);
    console.log('Received webhook:', payload.event);

    if (payload.event === 'payment.captured') {
      const payment = payload.payload.payment.entity;
      
      // Update payment transaction
      const { error: updateError } = await supabase
        .from('payment_transactions')
        .update({
          razorpay_payment_id: payment.id,
          status: 'paid',
          updated_at: new Date().toISOString(),
          metadata: { payment_method: payment.method }
        })
        .eq('razorpay_order_id', payment.order_id);

      if (updateError) {
        console.error('Error updating payment transaction:', updateError);
        throw updateError;
      }

      // Get the payment transaction to find plan type and user
      const { data: transaction, error: fetchError } = await supabase
        .from('payment_transactions')
        .select('user_id, plan_type')
        .eq('razorpay_order_id', payment.order_id)
        .single();

      if (fetchError || !transaction) {
        console.error('Error fetching transaction:', fetchError);
        throw fetchError || new Error('Transaction not found');
      }

      // Update user subscription
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .update({
          subscription_tier: transaction.plan_type,
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', transaction.user_id);

      if (subscriptionError) {
        console.error('Error updating subscription:', subscriptionError);
        throw subscriptionError;
      }

      // Update profile plan
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          plan: transaction.plan_type === 'pro' ? 'professional' : transaction.plan_type,
          updated_at: new Date().toISOString()
        })
        .eq('id', transaction.user_id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }

      console.log(`Payment successful for order ${payment.order_id}, user upgraded to ${transaction.plan_type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);