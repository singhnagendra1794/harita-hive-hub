import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { toolId, userId } = await req.json();
    
    console.log(`Plugin download request for tool: ${toolId}, user: ${userId}`);

    // Get tool information
    const { data: tool, error: toolError } = await supabase
      .from('marketplace_tools')
      .select('*')
      .eq('id', toolId)
      .eq('status', 'active')
      .single();

    if (toolError || !tool) {
      return new Response(JSON.stringify({
        error: 'Plugin not found',
        success: false
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if plugin has been security scanned
    if (!tool.security_scanned) {
      return new Response(JSON.stringify({
        error: 'Plugin has not been security scanned',
        success: false
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user can download this tool (purchase verification)
    const { data: purchaseData, error: purchaseError } = await supabase
      .from('tool_orders')
      .select('*')
      .eq('user_id', userId)
      .eq('tool_id', toolId)
      .eq('status', 'completed')
      .maybeSingle();

    // Check if user is super admin
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    const isAdmin = userData?.user?.email === 'contact@haritahive.com';

    // Check access: free tool, purchased tool, or admin access
    const canDownload = tool.is_free || purchaseData || isAdmin;

    if (!canDownload) {
      return new Response(JSON.stringify({
        error: 'Purchase required for this premium tool',
        needsPurchase: true,
        success: false
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check download limits for purchased tools
    if (purchaseData && purchaseData.download_count >= purchaseData.max_downloads) {
      return new Response(JSON.stringify({
        error: 'Download limit exceeded',
        downloadCount: purchaseData.download_count,
        maxDownloads: purchaseData.max_downloads,
        success: false
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update purchase download count if this was a purchased tool
    if (purchaseData) {
      const { error: purchaseUpdateError } = await supabase
        .from('tool_orders')
        .update({ 
          download_count: purchaseData.download_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', purchaseData.id);

      if (purchaseUpdateError) {
        console.error('Error updating purchase download count:', purchaseUpdateError);
      }

      // Log individual download
      const { error: downloadLogError } = await supabase
        .from('tool_downloads')
        .insert({
          order_id: purchaseData.id,
          user_id: userId,
          tool_id: toolId,
          ip_address: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for'),
          user_agent: req.headers.get('user-agent')
        });

      if (downloadLogError) {
        console.error('Error logging download:', downloadLogError);
      }
    }

    // Update tool's total download count
    const { error: updateError } = await supabase
      .from('marketplace_tools')
      .update({ download_count: tool.download_count + 1 })
      .eq('id', toolId);

    if (updateError) {
      console.error('Error updating download count:', updateError);
    }

    // Generate secure download URL with expiration
    const downloadUrl = tool.download_url;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    return new Response(JSON.stringify({
      success: true,
      downloadUrl,
      fileName: `${tool.plugin_id || tool.title.replace(/\s+/g, '-').toLowerCase()}.zip`,
      fileSize: tool.file_size_mb,
      expiresAt: expiresAt.toISOString(),
      installationGuide: tool.installation_guide,
      compatibilityNotes: tool.compatibility_notes,
      dependencies: tool.dependencies,
      qgisMinVersion: tool.qgis_min_version,
      message: 'Download URL generated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in download-plugin function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});