import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StreamWebhookEvent {
  action: 'stream_started' | 'stream_ended' | 'stream_error' | 'viewer_update';
  stream_key: string;
  session_id?: string;
  viewer_count?: number;
  error_message?: string;
  timestamp: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const path = url.pathname;

    // Handle different endpoints
    if (path.includes('/webhook') && req.method === 'POST') {
      return await handleStreamWebhook(req, supabase);
    } else if (path.includes('/status') && req.method === 'GET') {
      return await getStreamStatus(req, supabase);
    } else if (path.includes('/generate-key') && req.method === 'POST') {
      return await generateStreamKey(req, supabase);
    } else if (path.includes('/viewer-count') && req.method === 'POST') {
      return await updateViewerCount(req, supabase);
    }

    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('Error in stream-manager function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

async function handleStreamWebhook(req: Request, supabase: any): Promise<Response> {
  const event: StreamWebhookEvent = await req.json();
  
  console.log('Stream webhook event:', event);

  try {
    // Find the stream session by stream key
    const { data: streamKey, error: keyError } = await supabase
      .from('stream_keys')
      .select('user_id')
      .eq('stream_key', event.stream_key)
      .single();

    if (keyError) {
      console.error('Stream key not found:', keyError);
      return new Response(
        JSON.stringify({ error: 'Invalid stream key' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Handle different stream events
    switch (event.action) {
      case 'stream_started':
        await handleStreamStarted(supabase, streamKey.user_id, event.stream_key);
        break;
      
      case 'stream_ended':
        await handleStreamEnded(supabase, streamKey.user_id);
        break;
      
      case 'viewer_update':
        await handleViewerUpdate(supabase, streamKey.user_id, event.viewer_count || 0);
        break;
      
      case 'stream_error':
        await handleStreamError(supabase, streamKey.user_id, event.error_message || 'Unknown error');
        break;
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('Error handling webhook:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
}

async function handleStreamStarted(supabase: any, userId: string, streamKey: string) {
  // Update any preparing sessions to live
  const { error } = await supabase
    .from('stream_sessions')
    .update({ 
      status: 'live',
      started_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('status', 'preparing');

  if (error) {
    console.error('Error updating stream to live:', error);
  }

  // Update stream key last used time
  await supabase
    .from('stream_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('stream_key', streamKey);
}

async function handleStreamEnded(supabase: any, userId: string) {
  const { error } = await supabase
    .from('stream_sessions')
    .update({ 
      status: 'ended',
      ended_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('status', 'live');

  if (error) {
    console.error('Error ending stream:', error);
  }
}

async function handleViewerUpdate(supabase: any, userId: string, viewerCount: number) {
  const { error } = await supabase
    .from('stream_sessions')
    .update({ viewer_count: viewerCount })
    .eq('user_id', userId)
    .eq('status', 'live');

  if (error) {
    console.error('Error updating viewer count:', error);
  }
}

async function handleStreamError(supabase: any, userId: string, errorMessage: string) {
  const { error } = await supabase
    .from('stream_sessions')
    .update({ 
      status: 'error',
      ended_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .in('status', ['preparing', 'live']);

  if (error) {
    console.error('Error updating stream error status:', error);
  }
}

async function getStreamStatus(req: Request, supabase: any): Promise<Response> {
  const url = new URL(req.url);
  const streamKey = url.searchParams.get('stream_key');

  if (!streamKey) {
    return new Response(
      JSON.stringify({ error: 'stream_key parameter required' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  try {
    // Get stream session info
    const { data: session, error } = await supabase
      .from('stream_sessions')
      .select(`
        *,
        stream_keys!inner (stream_key)
      `)
      .eq('stream_keys.stream_key', streamKey)
      .eq('status', 'live')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return new Response(
      JSON.stringify({
        is_live: !!session,
        session: session || null,
        viewer_count: session?.viewer_count || 0
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('Error getting stream status:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
}

async function generateStreamKey(req: Request, supabase: any): Promise<Response> {
  const { user_id } = await req.json();

  if (!user_id) {
    return new Response(
      JSON.stringify({ error: 'user_id required' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  try {
    const { data, error } = await supabase.rpc('generate_stream_key', {
      p_user_id: user_id
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ stream_key: data }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('Error generating stream key:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
}

async function updateViewerCount(req: Request, supabase: any): Promise<Response> {
  const { session_id, viewer_count } = await req.json();

  if (!session_id || viewer_count === undefined) {
    return new Response(
      JSON.stringify({ error: 'session_id and viewer_count required' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }

  try {
    const { error } = await supabase
      .from('stream_sessions')
      .update({ viewer_count })
      .eq('id', session_id);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('Error updating viewer count:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
}

serve(handler);