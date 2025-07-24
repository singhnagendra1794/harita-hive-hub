import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DownloadRequest {
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

    const body = await req.json();
    
    // Input validation
    if (!body || typeof body !== 'object') {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { toolId }: DownloadRequest = body;

    if (!toolId || typeof toolId !== 'string' || !/^[0-9a-f-]{36}$/.test(toolId)) {
      return new Response(JSON.stringify({ error: "Valid tool ID is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if user has active GIS marketplace subscription
    const hasAccess = await supabaseService.rpc('check_gis_marketplace_access', { 
      p_user_id: user.id 
    });

    if (!hasAccess.data) {
      return new Response(JSON.stringify({ 
        error: "Active GIS marketplace subscription required",
        requiresSubscription: true 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // Get tool details
    const { data: tool, error: toolError } = await supabaseService
      .from('gis_tools')
      .select('*')
      .eq('id', toolId)
      .single();

    if (toolError || !tool) {
      throw new Error("Tool not found");
    }

    // Log the download
    await supabaseService
      .from('gis_tool_downloads')
      .insert({
        user_id: user.id,
        tool_id: toolId,
        download_type: 'subscription'
      });

    // For now, return a mock download URL
    // In production, this would generate a signed URL from storage
    const downloadUrl = `https://example.com/downloads/${toolId}/${tool.title.replace(/[^a-zA-Z0-9]/g, '_')}.zip`;

    console.log(`Tool download initiated: ${tool.title} by user ${user.email}`);

    return new Response(JSON.stringify({
      downloadUrl: downloadUrl,
      toolTitle: tool.title,
      version: tool.version || '1.0',
      canDownload: true
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in gis-tool-download:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to process download" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});