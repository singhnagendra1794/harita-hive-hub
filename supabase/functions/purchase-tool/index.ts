import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PurchaseToolRequest {
  toolId: string;
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

    const { toolId, amount, currency }: PurchaseToolRequest = await req.json();

    // Get tool details with service role to bypass RLS
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: tool, error: toolError } = await supabaseService
      .from('marketplace_tools')
      .select('*')
      .eq('id', toolId)
      .single();

    if (toolError || !tool) {
      throw new Error("Tool not found");
    }

    // Check if user already owns this tool
    const { data: existingOrder } = await supabaseService
      .from('tool_orders')
      .select('*')
      .eq('user_id', user.id)
      .eq('tool_id', toolId)
      .eq('status', 'completed')
      .maybeSingle();

    if (existingOrder) {
      return new Response(JSON.stringify({ 
        error: "You already own this tool",
        owned: true 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Create Razorpay order - using consistent key names
    const razorpayKeyId = 'rzp_live_brnHWpkHS6YtlJ';
    const razorpayKeySecret = Deno.env.get("RAZORPAY_SECRET_KEY");

    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error("Razorpay keys not configured");
    }

    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    
    const orderData = {
      amount: Math.round(amount * 100), // Convert to smallest currency unit
      currency: currency,
      receipt: `tool_${toolId}_${Date.now()}`,
      notes: {
        tool_id: toolId,
        tool_title: tool.title,
        user_id: user.id,
        user_email: user.email,
        purchase_type: 'marketplace_tool'
      }
    };

    console.log("Creating Razorpay order:", orderData);

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

    // Store order in database
    const { error: insertError } = await supabaseService
      .from('tool_orders')
      .insert({
        user_id: user.id,
        tool_id: toolId,
        razorpay_order_id: order.id,
        amount: amount,
        currency: currency,
        status: 'created',
        payment_method: 'razorpay',
        metadata: {
          tool_title: tool.title,
          user_email: user.email
        }
      });

    if (insertError) {
      console.error("Error storing order:", insertError);
      throw insertError;
    }

    console.log("Tool purchase order created successfully:", order.id);

    return new Response(JSON.stringify({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorpayKeyId,
      toolTitle: tool.title,
      toolPrice: amount
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in purchase-tool:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to create purchase order" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});