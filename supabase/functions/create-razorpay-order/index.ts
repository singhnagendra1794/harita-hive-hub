import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateOrderRequest {
  amount: number;
  currency: string;
  plan_type?: string;
  enrollmentId?: string;
  isEmi?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    console.log('Starting Razorpay order creation...');
    
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

    console.log('User authenticated:', user.email);

    const { amount, currency, plan_type, enrollmentId, isEmi = false }: CreateOrderRequest = await req.json();
    console.log('Order details:', { amount, currency, plan_type, enrollmentId, isEmi });

    // Validate input
    if (!amount || !currency) {
      return new Response('Missing required fields', { status: 400, headers: corsHeaders });
    }

    // Create Razorpay order
    const razorpayKeyId = 'rzp_live_brnHWpkHS6YtlJ';
    const razorpaySecret = Deno.env.get('RAZORPAY_SECRET_KEY');
    
    if (!razorpaySecret) {
      console.error('RAZORPAY_SECRET_KEY not found in environment');
      return new Response(JSON.stringify({ error: 'Payment configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    const orderData = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency,
      payment_capture: 1,
      notes: {
        plan_type: plan_type || 'course_enrollment',
        user_id: user.id,
        enrollment_id: enrollmentId || '',
        is_emi: isEmi.toString()
      }
    };

    const credentials = btoa(`${razorpayKeyId}:${razorpaySecret}`);
    
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error('Razorpay API error:', errorText);
      throw new Error(`Razorpay API error: ${razorpayResponse.status}`);
    }

    const razorpayOrder = await razorpayResponse.json();

    // Store transaction in database or update enrollment
    let transaction = null;
    let dbError = null;

    if (enrollmentId) {
      // Update enrollment with Razorpay order details
      const { error: enrollmentError } = await supabase
        .from('enrollments')
        .update({
          razorpay_order_id: razorpayOrder.id,
          is_emi: isEmi,
          emi_plan: isEmi ? '3_months' : null
        })
        .eq('id', enrollmentId)
        .eq('user_id', user.id);

      if (enrollmentError) {
        console.error('Enrollment update error:', enrollmentError);
        throw enrollmentError;
      }
    } else {
      // Store transaction in database for subscription payments
      const { data: transactionData, error: transactionError } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: user.id,
          payment_gateway_id: razorpayOrder.id,
          amount: amount,
          currency: currency,
          payment_method: 'razorpay',
          subscription_type: plan_type,
          status: 'pending',
          payment_data: { razorpay_order: razorpayOrder }
        })
        .select()
        .single();

      transaction = transactionData;
      dbError = transactionError;

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }
    }

    console.log(`Created order ${razorpayOrder.id} for user ${user.id}, type: ${plan_type || 'course_enrollment'}`);

    return new Response(JSON.stringify({
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: razorpayKeyId,
      transaction_id: transaction?.id || null,
      enrollment_id: enrollmentId || null
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    console.error('Error stack:', error.stack);
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