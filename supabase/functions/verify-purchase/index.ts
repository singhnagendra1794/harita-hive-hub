import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyPurchaseRequest {
  toolId: string;
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

    const { toolId }: VerifyPurchaseRequest = await req.json();

    // Use service role to check purchase
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if user owns this tool (has completed purchase)
    const { data: order, error: orderError } = await supabaseService
      .from('tool_orders')
      .select(`
        *,
        marketplace_tools!inner(
          id,
          title,
          is_free,
          download_url,
          file_size_mb
        )
      `)
      .eq('user_id', user.id)
      .eq('tool_id', toolId)
      .eq('status', 'completed')
      .maybeSingle();

    if (orderError) {
      console.error("Error checking purchase:", orderError);
      throw orderError;
    }

    // Check if tool is free or user is admin
    const { data: tool } = await supabaseService
      .from('marketplace_tools')
      .select('is_free')
      .eq('id', toolId)
      .single();

    // Check if user is super admin
    const isAdmin = user.email === 'contact@haritahive.com';

    const canDownload = order || tool?.is_free || isAdmin;

    if (!canDownload) {
      return new Response(JSON.stringify({ 
        canDownload: false,
        reason: "Purchase required",
        needsPurchase: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check download limits if purchased
    if (order && order.download_count >= order.max_downloads) {
      return new Response(JSON.stringify({ 
        canDownload: false,
        reason: "Download limit exceeded",
        downloadCount: order.download_count,
        maxDownloads: order.max_downloads
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // User can download
    return new Response(JSON.stringify({ 
      canDownload: true,
      purchased: !!order,
      downloadCount: order?.download_count || 0,
      maxDownloads: order?.max_downloads || 5,
      toolTitle: order?.marketplace_tools?.title || tool?.title
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in verify-purchase:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to verify purchase" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});