import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateSessionRequest {
  labId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { labId } = await req.json() as CreateSessionRequest;

    // Check quota
    const { data: quotaData, error: quotaError } = await supabase
      .rpc('check_lab_quota', { p_user_id: user.id });

    if (quotaError) {
      console.error('Quota check error:', quotaError);
      return new Response(
        JSON.stringify({ error: 'Failed to check quota' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!quotaData.can_launch) {
      return new Response(
        JSON.stringify({
          error: 'Quota exceeded',
          message: `You've reached your monthly limit of ${quotaData.monthly_limit} lab sessions. Upgrade to launch more labs.`,
          quota: quotaData
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get lab details
    const { data: lab, error: labError } = await supabase
      .from('labs')
      .select('*')
      .eq('id', labId)
      .eq('is_active', true)
      .single();

    if (labError || !lab) {
      return new Response(
        JSON.stringify({ error: 'Lab not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate session token (JWT)
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + lab.duration_minutes * 60 * 1000);

    // Create session record
    const { data: session, error: sessionError } = await supabase
      .from('lab_sessions')
      .insert({
        user_id: user.id,
        lab_id: labId,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        status: 'pending',
        metadata: {
          user_email: user.email,
          lab_type: lab.lab_type,
          default_data: lab.default_data
        }
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record usage
    await supabase
      .from('lab_usage')
      .insert({
        user_id: user.id,
        lab_id: labId,
        session_id: session.id,
        usage_date: new Date().toISOString().split('T')[0]
      });

    // Build launch URL
    const launchUrl = `${req.headers.get('origin') || 'https://haritahive.com'}/labs/launch/${session.id}`;

    return new Response(
      JSON.stringify({
        success: true,
        session: {
          id: session.id,
          token: sessionToken,
          expiresAt: expiresAt.toISOString(),
          launchUrl
        },
        lab: {
          name: lab.name,
          type: lab.lab_type,
          duration: lab.duration_minutes
        },
        quota: {
          remaining: quotaData.remaining,
          total: quotaData.monthly_limit
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