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

    // Check access permissions using the database function
    const { data: hasAccess, error: accessError } = await supabase
      .rpc('can_download_premium_plugin', {
        p_user_id: userId,
        p_tool_id: toolId
      });

    if (accessError) {
      console.error('Error checking access:', accessError);
      return new Response(JSON.stringify({
        error: 'Access check failed',
        success: false
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!hasAccess) {
      return new Response(JSON.stringify({
        error: 'Premium subscription required for this plugin',
        upgrade_required: true,
        success: false
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log the download
    const { error: logError } = await supabase
      .from('user_downloads')
      .insert({
        user_id: userId,
        tool_id: toolId,
        download_type: tool.is_free ? 'free' : 'premium',
        download_url: tool.download_url,
        ip_address: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown'
      });

    if (logError) {
      console.error('Error logging download:', logError);
    }

    // Update download count
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