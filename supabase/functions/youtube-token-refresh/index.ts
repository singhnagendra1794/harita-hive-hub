import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔄 Starting YouTube OAuth token refresh...');

    // Get tokens that are expired or expiring within 1 hour
    const { data: expiredTokens, error: fetchError } = await supabase
      .from('youtube_oauth_tokens')
      .select('*')
      .lt('expires_at', new Date(Date.now() + 3600000).toISOString()) // Expires within 1 hour
      .not('refresh_token', 'is', null);

    if (fetchError) {
      throw new Error(`Failed to fetch tokens: ${fetchError.message}`);
    }

    if (!expiredTokens || expiredTokens.length === 0) {
      console.log('✅ No tokens need refreshing');
      return new Response(JSON.stringify({
        success: true,
        message: 'No tokens need refreshing',
        refreshed: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`🔑 Found ${expiredTokens.length} tokens to refresh`);

    const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured');
    }

    let refreshedCount = 0;
    const errors = [];

    for (const tokenRecord of expiredTokens) {
      try {
        console.log(`🔄 Refreshing token for user: ${tokenRecord.user_id}`);

        // Refresh the access token using the refresh token
        const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: tokenRecord.refresh_token,
            grant_type: 'refresh_token',
          }),
        });

        if (!refreshResponse.ok) {
          const errorText = await refreshResponse.text();
          console.error(`❌ Failed to refresh token for user ${tokenRecord.user_id}: ${errorText}`);
          errors.push(`User ${tokenRecord.user_id}: ${errorText}`);
          continue;
        }

        const newTokens = await refreshResponse.json();
        
        // Update the token in the database
        const { error: updateError } = await supabase
          .from('youtube_oauth_tokens')
          .update({
            access_token: newTokens.access_token,
            expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', tokenRecord.id);

        if (updateError) {
          console.error(`❌ Failed to update token for user ${tokenRecord.user_id}:`, updateError);
          errors.push(`User ${tokenRecord.user_id}: Database update failed`);
        } else {
          console.log(`✅ Successfully refreshed token for user: ${tokenRecord.user_id}`);
          refreshedCount++;
        }

      } catch (error) {
        console.error(`❌ Error refreshing token for user ${tokenRecord.user_id}:`, error);
        errors.push(`User ${tokenRecord.user_id}: ${error.message}`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Token refresh completed`,
      refreshed: refreshedCount,
      total: expiredTokens.length,
      errors: errors.length > 0 ? errors : undefined
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('YouTube token refresh error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});