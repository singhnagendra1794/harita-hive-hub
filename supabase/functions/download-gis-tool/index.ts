import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DownloadRequest {
  toolId: string;
  userId?: string;
  paymentCompleted: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { toolId, userId, paymentCompleted }: DownloadRequest = await req.json();

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Mock tool data - in production, this would come from your database
    const tools = {
      "1": {
        downloadUrl: "https://example.com/downloads/spatial-analysis-toolkit.zip",
        filename: "spatial-analysis-toolkit.zip",
        size: "45.2 MB"
      },
      "2": {
        downloadUrl: "https://example.com/downloads/land-use-classification.zip",
        filename: "land-use-classification.zip",
        size: "67.8 MB"
      },
      "3": {
        downloadUrl: "https://example.com/downloads/web-mapping-dashboard.zip",
        filename: "web-mapping-dashboard.zip",
        size: "23.4 MB"
      },
      "4": {
        downloadUrl: "https://example.com/downloads/dem-processing-utilities.zip",
        filename: "dem-processing-utilities.zip",
        size: "34.7 MB"
      },
      "5": {
        downloadUrl: "https://example.com/downloads/remote-sensing-suite.zip",
        filename: "remote-sensing-suite.zip",
        size: "89.3 MB"
      },
      "6": {
        downloadUrl: "https://example.com/downloads/hydro-modeling-toolkit.zip",
        filename: "hydro-modeling-toolkit.zip",
        size: "56.1 MB"
      }
    };

    const tool = tools[toolId as keyof typeof tools];
    
    if (!tool) {
      return new Response(
        JSON.stringify({ error: "Tool not found" }),
        { 
          status: 404, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // For paid tools, verify payment completion
    if (!paymentCompleted) {
      return new Response(
        JSON.stringify({ 
          error: "Payment required",
          redirectToPayment: true
        }),
        { 
          status: 402, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Log download activity if user is provided
    if (userId) {
      try {
        await supabase.from('download_logs').insert({
          user_id: userId,
          tool_id: toolId,
          download_timestamp: new Date().toISOString(),
          tool_name: tool.filename
        });
      } catch (error) {
        console.log('Failed to log download:', error);
        // Don't block download if logging fails
      }
    }

    // Return download information
    return new Response(
      JSON.stringify({
        success: true,
        downloadUrl: tool.downloadUrl,
        filename: tool.filename,
        size: tool.size,
        message: "Download ready"
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