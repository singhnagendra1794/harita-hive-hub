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
  // Handle CORS preflight requests
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

    const { toolId }: DownloadRequest = await req.json();

    // Use service role to check access
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if user has purchased this tool or is premium user
    const { data: order } = await supabaseService
      .from('tool_orders')
      .select('*')
      .eq('user_id', user.id)
      .eq('tool_id', toolId)
      .eq('status', 'completed')
      .maybeSingle();

    // Check if user has premium access
    const { data: subscription } = await supabaseService
      .from('user_subscriptions')
      .select('subscription_tier, status')
      .eq('user_id', user.id)
      .single();

    const hasPremiumAccess = subscription && 
      ['pro', 'enterprise', 'premium'].includes(subscription.subscription_tier) && 
      subscription.status === 'active';

    // Check if user is super admin
    const isAdmin = user.email === 'contact@haritahive.com';

    if (!order && !hasPremiumAccess && !isAdmin) {
      return new Response(
        JSON.stringify({ 
          error: "Access denied",
          message: "Purchase required to download this tool",
          needsPurchase: true
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Tool metadata with actual download paths from Supabase Storage
    const toolData = {
      "1": {
        title: "Advanced Spatial Analysis Toolkit",
        storagePath: "gis-tools/spatial-analysis-toolkit.zip",
        version: "2.1.0",
        size: "45.2 MB"
      },
      "2": {
        title: "Land Use Classification Scripts", 
        storagePath: "gis-tools/land-use-classification.zip",
        version: "1.8.3",
        size: "67.8 MB"
      },
      "3": {
        title: "Web Mapping Dashboard Template",
        storagePath: "gis-tools/web-mapping-dashboard.zip", 
        version: "3.0.1",
        size: "23.4 MB"
      },
      "4": {
        title: "DEM Processing Utilities",
        storagePath: "gis-tools/dem-processing-utilities.zip",
        version: "1.5.2", 
        size: "34.7 MB"
      },
      "5": {
        title: "Remote Sensing Image Analysis Suite",
        storagePath: "gis-tools/remote-sensing-suite.zip",
        version: "2.3.0",
        size: "89.3 MB"
      },
      "6": {
        title: "Hydrological Modeling Toolkit",
        storagePath: "gis-tools/hydro-modeling-toolkit.zip",
        version: "1.7.1",
        size: "56.1 MB"
      }
    };

    const tool = toolData[toolId as keyof typeof toolData];
    
    if (!tool) {
      return new Response(
        JSON.stringify({ error: "Tool not found" }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Generate signed URL for secure download (expires in 1 hour)
    const { data: signedUrlData, error: signedUrlError } = await supabaseService
      .storage
      .from('geospatial-files')
      .createSignedUrl(tool.storagePath, 3600); // 1 hour expiry

    if (signedUrlError) {
      console.error('Error creating signed URL:', signedUrlError);
      // Fallback to a demo file if storage file doesn't exist
      const demoFileUrl = `https://github.com/haritahive/sample-tools/releases/download/v1.0/${toolId}-demo.zip`;
      
      return new Response(
        JSON.stringify({
          success: true,
          downloadUrl: demoFileUrl,
          filename: `${tool.title.replace(/[^a-zA-Z0-9]/g, '_')}_v${tool.version}.zip`,
          size: tool.size,
          version: tool.version,
          message: "Demo version available for download"
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Log download activity
    try {
      await supabaseService.from('download_logs').insert({
        user_id: user.id,
        tool_id: toolId,
        download_timestamp: new Date().toISOString(),
        tool_name: tool.title,
        file_size: tool.size,
        version: tool.version
      });
    } catch (error) {
      console.log('Failed to log download:', error);
      // Don't block download if logging fails
    }

    // Update download count if this is a purchase
    if (order) {
      await supabaseService
        .from('tool_orders')
        .update({ 
          download_count: (order.download_count || 0) + 1,
          last_downloaded_at: new Date().toISOString()
        })
        .eq('id', order.id);
    }

    // Return secure download URL
    return new Response(
      JSON.stringify({
        success: true,
        downloadUrl: signedUrlData.signedUrl,
        filename: `${tool.title.replace(/[^a-zA-Z0-9]/g, '_')}_v${tool.version}.zip`,
        size: tool.size,
        version: tool.version,
        expiresIn: "1 hour",
        message: "Secure download ready"
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error('Download error:', error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: "Failed to process download request"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});