import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, ...body } = await req.json()
    
    console.log(`YouTube OAuth: ${action}`, body)

    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
    const redirectUri = 'https://haritahive.com/auth/callback'

    if (!clientId || !clientSecret) {
      throw new Error('YouTube OAuth credentials not configured')
    }

    switch (action) {
      case 'get_auth_url':
        return await getAuthUrl(clientId, redirectUri)
      case 'exchange_code':
        return await exchangeCode(supabase, body, clientId, clientSecret, redirectUri)
      case 'refresh_token':
        return await refreshToken(supabase, body, clientId, clientSecret)
      case 'check_status':
        return await checkOAuthStatus(supabase, body)
      default:
        throw new Error(`Unknown action: ${action}`)
    }
  } catch (error) {
    console.error('YouTube OAuth error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function getAuthUrl(clientId: string, redirectUri: string) {
  const scopes = [
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.force-ssl',
    'https://www.googleapis.com/auth/youtube.readonly'
  ].join(' ')

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', scopes)
  authUrl.searchParams.set('access_type', 'offline')
  authUrl.searchParams.set('prompt', 'consent')

  return new Response(
    JSON.stringify({ 
      success: true, 
      data: { authUrl: authUrl.toString() } 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function exchangeCode(supabase: any, body: any, clientId: string, clientSecret: string, redirectUri: string) {
  const { code, userId } = body

  if (!code || !userId) {
    throw new Error('Code and userId are required')
  }

  // Exchange authorization code for tokens
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  })

  if (!tokenResponse.ok) {
    throw new Error('Failed to exchange authorization code')
  }

  const tokens = await tokenResponse.json()

  // Save tokens to database
  const { error } = await supabase
    .from('youtube_oauth_tokens')
    .upsert({
      user_id: userId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id'
    })

  if (error) throw error

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'YouTube account connected successfully' 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function refreshToken(supabase: any, body: any, clientId: string, clientSecret: string) {
  const { userId } = body

  // Get current refresh token
  const { data: tokenData, error: tokenError } = await supabase
    .from('youtube_oauth_tokens')
    .select('refresh_token')
    .eq('user_id', userId)
    .single()

  if (tokenError || !tokenData?.refresh_token) {
    throw new Error('No refresh token found')
  }

  // Refresh the access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: tokenData.refresh_token,
      grant_type: 'refresh_token',
    }),
  })

  if (!tokenResponse.ok) {
    throw new Error('Failed to refresh access token')
  }

  const tokens = await tokenResponse.json()

  // Update tokens in database
  const { error } = await supabase
    .from('youtube_oauth_tokens')
    .update({
      access_token: tokens.access_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (error) throw error

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Token refreshed successfully' 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function checkOAuthStatus(supabase: any, body: any) {
  const { userId } = body

  const { data: tokenData, error } = await supabase
    .from('youtube_oauth_tokens')
    .select('access_token, expires_at')
    .eq('user_id', userId)
    .single()

  if (error || !tokenData) {
    return new Response(
      JSON.stringify({ 
        success: true, 
        connected: false 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const isExpired = new Date(tokenData.expires_at) < new Date()

  return new Response(
    JSON.stringify({ 
      success: true, 
      connected: true,
      expired: isExpired
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}