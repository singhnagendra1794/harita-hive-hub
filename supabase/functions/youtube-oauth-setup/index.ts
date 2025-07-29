import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// YouTube OAuth setup and token management
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, code, user_id } = await req.json()

    switch (action) {
      case 'get_auth_url':
        return handleGetAuthUrl()
      
      case 'exchange_code':
        return await handleExchangeCode(supabase, code, user_id)
      
      case 'refresh_token':
        return await handleRefreshToken(supabase, user_id)
      
      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    console.error('OAuth setup error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function handleGetAuthUrl() {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
  const redirectUri = 'https://haritahive.com/auth/youtube/callback'
  
  const scopes = [
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.readonly'
  ].join(' ')

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `response_type=code&` +
    `access_type=offline&` +
    `prompt=consent`

  return new Response(
    JSON.stringify({ auth_url: authUrl }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleExchangeCode(supabase: any, code: string, userId: string) {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
  const redirectUri = 'https://haritahive.com/auth/youtube/callback'

  // Exchange code for tokens
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri
    })
  })

  if (!tokenResponse.ok) {
    throw new Error('Failed to exchange authorization code')
  }

  const tokens = await tokenResponse.json()
  
  // Store tokens in database
  const { error } = await supabase
    .from('youtube_oauth_tokens')
    .upsert({
      user_id: userId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }, { 
      onConflict: 'user_id'
    })

  if (error) {
    throw new Error('Failed to store OAuth tokens')
  }

  return new Response(
    JSON.stringify({ success: true, message: 'OAuth setup complete' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleRefreshToken(supabase: any, userId: string) {
  // Get stored tokens
  const { data: tokenData, error: tokenError } = await supabase
    .from('youtube_oauth_tokens')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (tokenError || !tokenData) {
    throw new Error('No OAuth tokens found for user')
  }

  const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')

  // Refresh the access token
  const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      refresh_token: tokenData.refresh_token,
      grant_type: 'refresh_token'
    })
  })

  if (!refreshResponse.ok) {
    throw new Error('Failed to refresh access token')
  }

  const newTokens = await refreshResponse.json()
  
  // Update stored tokens
  const { error } = await supabase
    .from('youtube_oauth_tokens')
    .update({
      access_token: newTokens.access_token,
      expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)

  if (error) {
    throw new Error('Failed to update OAuth tokens')
  }

  return new Response(
    JSON.stringify({ success: true, access_token: newTokens.access_token }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}