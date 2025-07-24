import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscribeRequest {
  fullName: string;
  email: string;
  occupation?: string;
  intendedUse?: string;
  amount: number;
  currency: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    const body = await req.json();
    
    // Input validation
    if (!body || typeof body !== 'object') {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { fullName, email, occupation, intendedUse, amount, currency }: SubscribeRequest = body;

    // Validate required fields
    if (!fullName || fullName.length > 100) {
      return new Response(JSON.stringify({ error: "Valid full name is required (max 100 chars)" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Valid email is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!amount || amount <= 0 || amount > 100000) {
      return new Response(JSON.stringify({ error: "Valid amount is required (1-100000)" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!currency || !/^[A-Z]{3}$/.test(currency)) {
      return new Response(JSON.stringify({ error: "Valid currency code is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Store user info
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await supabaseService
      .from('gis_marketplace_user_info')
      .insert({
        user_id: user.id,
        full_name: fullName,
        email: email,
        occupation: occupation,
        intended_use: intendedUse
      });

    // Create Razorpay order
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_SECRET_KEY");

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error("Razorpay API keys not configured");
      return new Response(JSON.stringify({ error: "Payment service configuration error" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    
    const orderData = {
      amount: Math.round(amount * 100), // Convert to smallest currency unit
      currency: currency,
      receipt: `gis_marketplace_${Date.now()}`,
      notes: {
        user_id: user.id,
        user_email: user.email,
        subscription_type: 'gis_marketplace_3_month',
        duration_days: '90'
      }
    };

    console.log("Creating Razorpay order for GIS marketplace:", orderData);

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Razorpay API error:", errorText);
      throw new Error("Failed to create Razorpay order");
    }

    const order = await response.json();

    // Store subscription order in database
    await supabaseService
      .from('gis_marketplace_subscriptions')
      .insert({
        user_id: user.id,
        status: 'inactive',
        amount_paid: amount,
        currency: currency,
        razorpay_order_id: order.id
      });

    console.log("GIS marketplace subscription order created:", order.id);

    return new Response(JSON.stringify({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorpayKeyId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in gis-marketplace-subscribe:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to create subscription order" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});