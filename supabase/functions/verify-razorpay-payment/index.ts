import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyPaymentRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    console.log('Starting payment verification...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing Authorization header');
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature }: VerifyPaymentRequest = await req.json();
    console.log('Verifying payment:', { razorpay_payment_id, razorpay_order_id });

    // Verify signature
    const razorpaySecret = Deno.env.get('RAZORPAY_SECRET_KEY');
    if (!razorpaySecret) {
      console.error('RAZORPAY_SECRET_KEY not found');
      return new Response('Payment configuration error', { status: 500, headers: corsHeaders });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(razorpaySecret),
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

    if (razorpay_signature !== computedSignature) {
      console.error('Invalid payment signature');
      return new Response('Payment verification failed', { status: 400, headers: corsHeaders });
    }

    console.log('Payment signature verified successfully');

    // Update payment transaction status
    const { data: transaction, error: updateError } = await supabase
      .from('payment_transactions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        webhook_data: { 
          payment_id: razorpay_payment_id,
          signature: razorpay_signature,
          verified_at: new Date().toISOString()
        }
      })
      .eq('payment_gateway_id', razorpay_order_id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError || !transaction) {
      console.error('Error updating transaction:', updateError);
      throw new Error('Failed to update payment status');
    }

    // Update user subscription
    const { error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: user.id,
        subscription_tier: transaction.subscription_type,
        status: 'active',
        started_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (subscriptionError) {
      console.error('Error updating subscription:', subscriptionError);
    }

    // Update profile plan
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        plan: transaction.subscription_type === 'pro' ? 'professional' : transaction.subscription_type,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
    }

    // Auto-enroll professional and enterprise users into courses
    if (transaction.subscription_type === 'pro' || transaction.subscription_type === 'enterprise') {
      console.log(`Auto-enrolling ${transaction.subscription_type} user into current course`);
      
      const { error: courseError } = await supabase
        .rpc('update_user_enrolled_courses', {
          p_user_id: user.id,
          p_course_title: 'Geospatial Technology Unlocked'
        });
      
      if (courseError) {
        console.error('Error updating enrolled courses:', courseError);
      }
    }

    console.log(`Payment verified and user upgraded to ${transaction.subscription_type}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Payment verified successfully',
      subscription_tier: transaction.subscription_type
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error verifying payment:', error);
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