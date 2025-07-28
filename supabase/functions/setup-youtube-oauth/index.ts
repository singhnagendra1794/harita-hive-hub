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

    // Get super admin user
    const { data: superAdmin } = await supabase.auth.admin.listUsers()
    const superAdminUser = superAdmin?.users?.find(user => user.email === 'contact@haritahive.com')

    if (!superAdminUser) {
      throw new Error('Super admin user not found')
    }

    console.log('Setting up YouTube OAuth for super admin:', superAdminUser.id)

    // Create the OAuth URL for manual setup
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
    const scopes = [
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.force-ssl',
      'https://www.googleapis.com/auth/youtube.readonly'
    ].join(' ')

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.set('client_id', clientId || '')
    authUrl.searchParams.set('redirect_uri', 'https://haritahive.com/auth/callback')
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', scopes)
    authUrl.searchParams.set('access_type', 'offline')
    authUrl.searchParams.set('prompt', 'consent')

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Manual OAuth setup required',
        data: {
          superAdminId: superAdminUser.id,
          authUrl: authUrl.toString(),
          instructions: 'Visit the auth URL to get authorization code, then use exchange_code action'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Setup error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})