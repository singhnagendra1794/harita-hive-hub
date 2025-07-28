import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, ...payload } = await req.json()

    switch (action) {
      case 'get_auth_url':
        return await getAuthUrl(payload)
      case 'exchange_code':
        return await exchangeCode(supabase, payload)
      case 'refresh_token':
        return await refreshToken(supabase, payload)
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('YouTube OAuth Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function getAuthUrl(payload: any) {
  const YOUTUBE_CLIENT_ID = Deno.env.get('YOUTUBE_CLIENT_ID')
  const YOUTUBE_REDIRECT_URI = Deno.env.get('YOUTUBE_REDIRECT_URI')

  if (!YOUTUBE_CLIENT_ID || !YOUTUBE_REDIRECT_URI) {
    throw new Error('YouTube OAuth credentials not configured')
  }

  const scopes = [
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.force-ssl'
  ].join(' ')

  const params = new URLSearchParams({
    client_id: YOUTUBE_CLIENT_ID,
    redirect_uri: YOUTUBE_REDIRECT_URI,
    scope: scopes,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent'
  })

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

  return new Response(
    JSON.stringify({
      success: true,
      data: { authUrl }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function exchangeCode(supabase: any, payload: any) {
  const { code, userId } = payload
  const YOUTUBE_CLIENT_ID = Deno.env.get('YOUTUBE_CLIENT_ID')
  const YOUTUBE_CLIENT_SECRET = Deno.env.get('YOUTUBE_CLIENT_SECRET')
  const YOUTUBE_REDIRECT_URI = Deno.env.get('YOUTUBE_REDIRECT_URI')

  if (!YOUTUBE_CLIENT_ID || !YOUTUBE_CLIENT_SECRET || !YOUTUBE_REDIRECT_URI) {
    throw new Error('YouTube OAuth credentials not configured')
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: YOUTUBE_CLIENT_ID,
      client_secret: YOUTUBE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: YOUTUBE_REDIRECT_URI,
    }),
  })

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text()
    console.error('Token exchange error:', error)
    throw new Error(`Failed to exchange code: ${error}`)
  }

  const tokens = await tokenResponse.json()

  // Store tokens in database
  const { error: dbError } = await supabase
    .from('youtube_oauth_tokens')
    .upsert({
      user_id: userId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + (tokens.expires_in * 1000)).toISOString(),
      token_type: tokens.token_type,
      scope: tokens.scope,
    }, {
      onConflict: 'user_id'
    })

  if (dbError) {
    console.error('Database error:', dbError)
    throw new Error(`Failed to store tokens: ${dbError.message}`)
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        access_token: tokens.access_token,
        expires_in: tokens.expires_in
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function refreshToken(supabase: any, payload: any) {
  const { userId } = payload
  const YOUTUBE_CLIENT_ID = Deno.env.get('YOUTUBE_CLIENT_ID')
  const YOUTUBE_CLIENT_SECRET = Deno.env.get('YOUTUBE_CLIENT_SECRET')

  // Get stored refresh token
  const { data: tokenData, error: tokenError } = await supabase
    .from('youtube_oauth_tokens')
    .select('refresh_token')
    .eq('user_id', userId)
    .single()

  if (tokenError || !tokenData?.refresh_token) {
    throw new Error('No refresh token found')
  }

  const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: YOUTUBE_CLIENT_ID!,
      client_secret: YOUTUBE_CLIENT_SECRET!,
      refresh_token: tokenData.refresh_token,
      grant_type: 'refresh_token',
    }),
  })

  if (!refreshResponse.ok) {
    const error = await refreshResponse.text()
    throw new Error(`Failed to refresh token: ${error}`)
  }

  const tokens = await refreshResponse.json()

  // Update stored tokens
  const { error: updateError } = await supabase
    .from('youtube_oauth_tokens')
    .update({
      access_token: tokens.access_token,
      expires_at: new Date(Date.now() + (tokens.expires_in * 1000)).toISOString(),
    })
    .eq('user_id', userId)

  if (updateError) {
    throw new Error(`Failed to update tokens: ${updateError.message}`)
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        access_token: tokens.access_token,
        expires_in: tokens.expires_in
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}