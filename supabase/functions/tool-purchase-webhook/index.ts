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
        notes?: {
          tool_id?: string;
          user_id?: string;
          purchase_type?: string;
        };
      };
    };
    order?: {
      entity: {
        id: string;
        receipt: string;
        notes?: {
          tool_id?: string;
          user_id?: string;
        };
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
    console.log('Received tool purchase webhook:', payload.event);

    if (payload.event === 'payment.captured') {
      const payment = payload.payload.payment.entity;
      
      // Find the tool order
      const { data: order, error: orderError } = await supabase
        .from('tool_orders')
        .select('*')
        .eq('razorpay_order_id', payment.order_id)
        .single();

      if (orderError || !order) {
        console.error('Error finding tool order:', orderError);
        return new Response('Order not found', { status: 404, headers: corsHeaders });
      }

      // Update tool order status
      const { error: updateError } = await supabase
        .from('tool_orders')
        .update({
          status: 'completed',
          razorpay_payment_id: payment.id,
          payment_method: payment.method,
          completed_at: new Date().toISOString(),
          max_downloads: 5, // Allow 5 downloads per purchase
          download_count: 0
        })
        .eq('id', order.id);

      if (updateError) {
        console.error('Error updating tool order:', updateError);
        throw updateError;
      }

      // Create download log entry
      const { error: logError } = await supabase
        .from('download_logs')
        .insert({
          user_id: order.user_id,
          tool_id: order.tool_id,
          download_timestamp: new Date().toISOString(),
          tool_name: `Payment completed for ${order.tool_id}`,
          event_type: 'purchase_completed'
        });

      if (logError) {
        console.error('Error creating download log:', logError);
      }

      console.log(`Tool purchase completed for order ${order.id}, payment ${payment.id}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Tool purchase webhook processing error:', error);
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