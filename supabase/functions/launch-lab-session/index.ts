import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const sessionId = url.pathname.split('/').pop();

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('lab_sessions')
      .select(`
        *,
        labs (
          name,
          lab_type,
          runtime_host,
          default_data
        )
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if session is expired
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    
    if (now > expiresAt) {
      // Update session status
      await supabase
        .from('lab_sessions')
        .update({ status: 'expired', ended_at: now.toISOString() })
        .eq('id', sessionId);

      return new Response(
        JSON.stringify({ 
          error: 'Session expired',
          message: 'This lab session has expired. Please launch a new session.'
        }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update session status to active
    await supabase
      .from('lab_sessions')
      .update({ 
        status: 'active',
        started_at: session.started_at || now.toISOString()
      })
      .eq('id', sessionId);

    // Build runtime URL with session token
    const lab = session.labs as any;
    const runtimeUrl = `${lab.runtime_host}/session?token=${session.session_token}&user=${session.user_id}`;

    // For demo purposes, redirect to a placeholder page
    // In production, this would redirect to the actual lab runtime
    const demoUrl = `${req.headers.get('origin') || 'https://haritahive.com'}/labs/session/${sessionId}`;

    return new Response(
      JSON.stringify({
        success: true,
        redirectUrl: demoUrl,
        runtimeUrl: runtimeUrl,
        session: {
          id: session.id,
          status: 'active',
          expiresAt: session.expires_at
        },
        lab: {
          name: lab.name,
          type: lab.lab_type
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});