import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { 
      portfolioId, 
      eventType, 
      visitorIp, 
      userAgent, 
      referrer,
      metadata = {} 
    } = await req.json();

    console.log('Portfolio analytics event:', { portfolioId, eventType });

    // Get portfolio and user info
    const { data: portfolio, error: portfolioError } = await supabase
      .from('user_portfolios')
      .select('user_id')
      .eq('id', portfolioId)
      .single();

    if (portfolioError || !portfolio) {
      throw new Error('Portfolio not found');
    }

    // Track the event
    await supabase.rpc('track_portfolio_view', {
      p_portfolio_id: portfolioId,
      p_visitor_ip: visitorIp,
      p_user_agent: userAgent
    });

    // Insert detailed analytics
    const { error: analyticsError } = await supabase
      .from('portfolio_analytics')
      .insert({
        portfolio_id: portfolioId,
        user_id: portfolio.user_id,
        event_type: eventType,
        visitor_ip: visitorIp,
        user_agent: userAgent,
        referrer,
        metadata
      });

    if (analyticsError) {
      console.error('Analytics insert error:', analyticsError);
    }

    // Get updated stats
    const { data: stats, error: statsError } = await supabase
      .from('user_portfolios')
      .select('view_count, download_count')
      .eq('id', portfolioId)
      .single();

    console.log('Analytics tracked successfully');

    return new Response(JSON.stringify({ 
      success: true,
      stats: stats || {}
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in portfolio-analytics function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});