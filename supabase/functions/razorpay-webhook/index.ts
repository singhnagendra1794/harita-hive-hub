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
          status: 'completed',
          completed_at: new Date().toISOString(),
          webhook_data: { payment_id: payment.id, method: payment.method }
        })
        .eq('payment_gateway_id', payment.order_id);

      if (updateError) {
        console.error('Error updating payment transaction:', updateError);
        throw updateError;
      }

      // Check if this is a course enrollment payment first
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('user_id, full_name')
        .eq('razorpay_order_id', payment.order_id)
        .single();

      if (enrollment) {
        // This is a course enrollment payment
        console.log('Processing course enrollment payment for user:', enrollment.user_id);
        
        // Update user's enrolled courses tracking
        const { error: courseError } = await supabase
          .rpc('update_user_enrolled_courses', {
            p_user_id: enrollment.user_id,
            p_course_title: 'Geospatial Technology Unlocked'
          });
        
        if (courseError) {
          console.error('Error updating enrolled courses:', courseError);
        }

        // Update user subscription to professional after course purchase (respect plan lock)
        let planLocked = false;
        try {
          const { data: existingSub } = await supabase
            .from('user_subscriptions')
            .select('plan_locked')
            .eq('user_id', enrollment.user_id)
            .maybeSingle();
          planLocked = !!existingSub?.plan_locked;
        } catch (e) {
          console.warn('Could not check plan_locked for course enrollment flow');
        }

        if (!planLocked) {
          const { error: subscriptionError } = await supabase
            .from('user_subscriptions')
            .update({
              subscription_tier: 'pro',
              status: 'active',
              updated_at: new Date().toISOString()
            })
            .eq('user_id', enrollment.user_id);

          if (subscriptionError) {
            console.error('Error updating subscription:', subscriptionError);
          }

          // Update profile plan
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              plan: 'professional',
              updated_at: new Date().toISOString()
            })
            .eq('id', enrollment.user_id);

          if (profileError) {
            console.error('Error updating profile:', profileError);
          }
        } else {
          console.log('Plan is locked; skipping subscription/profile updates for course enrollment flow');
        }

        console.log('Course enrollment payment processed successfully');
        return new Response('Course enrollment payment processed', { status: 200, headers: corsHeaders });
      }

      // If not course enrollment, check for subscription payment
      const { data: transaction, error: fetchError } = await supabase
        .from('payment_transactions')
        .select('user_id, subscription_type')
        .eq('payment_gateway_id', payment.order_id)
        .single();

      if (fetchError || !transaction) {
        console.error('Error fetching transaction:', fetchError);
        throw fetchError || new Error('Transaction not found');
      }

      // Update user subscription (respect plan lock)
      let planLocked2 = false;
      try {
        const { data: existingSub2 } = await supabase
          .from('user_subscriptions')
          .select('plan_locked')
          .eq('user_id', transaction.user_id)
          .maybeSingle();
        planLocked2 = !!existingSub2?.plan_locked;
      } catch (e) {
        console.warn('Could not check plan_locked for subscription flow');
      }

      if (!planLocked2) {
        const { error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .update({
            subscription_tier: transaction.subscription_type,
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
            plan: transaction.subscription_type === 'pro' ? 'professional' : transaction.subscription_type,
            updated_at: new Date().toISOString()
          })
          .eq('id', transaction.user_id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
        }
      } else {
        console.log('Plan is locked; skipping subscription/profile updates for subscription payment flow');
      }

      // Auto-enroll professional and enterprise users into the current course
      if (transaction.subscription_type === 'pro' || transaction.subscription_type === 'enterprise' || 
          (transaction.subscription_type && transaction.subscription_type.includes('course'))) {
        console.log(`Auto-enrolling ${transaction.subscription_type} user into current course`);
        
        const { error: courseError } = await supabase
          .rpc('update_user_enrolled_courses', {
            p_user_id: transaction.user_id,
            p_course_title: 'Geospatial Technology Unlocked'
          });
        
        if (courseError) {
          console.error('Error updating enrolled courses:', courseError);
          // Don't fail the payment process if course update fails
        } else {
          console.log('Successfully enrolled user in current course');
        }
      }

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }

      console.log(`Payment successful for order ${payment.order_id}, user upgraded to ${transaction.subscription_type}`);
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