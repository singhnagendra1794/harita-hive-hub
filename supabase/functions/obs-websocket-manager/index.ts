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
      case 'configure_obs':
        return await configureOBS(supabase, payload)
      case 'start_recording':
        return await startRecording(supabase, payload)
      case 'stop_recording':
        return await stopRecording(supabase, payload)
      case 'get_obs_status':
        return await getOBSStatus(supabase, payload)
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('OBS WebSocket Manager Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function configureOBS(supabase: any, payload: any) {
  const { scheduleId, streamUrl, streamKey, sceneTemplate } = payload

  // Get OBS configuration
  const { data: obsConfig, error: obsError } = await supabase
    .from('obs_configurations')
    .select('*')
    .eq('is_active', true)
    .single()

  if (obsError || !obsConfig) {
    throw new Error('OBS configuration not found')
  }

  try {
    // Connect to OBS WebSocket
    const obsConnection = await connectToOBS(obsConfig)
    
    // Configure streaming settings
    await obsConnection.call('SetStreamServiceSettings', {
      streamServiceType: 'rtmp_common',
      streamServiceSettings: {
        server: streamUrl,
        key: streamKey,
      },
    })

    // Load scene template
    if (sceneTemplate) {
      await obsConnection.call('SetCurrentProgramScene', {
        sceneName: sceneTemplate,
      })
    }

    // Update configuration status
    await supabase
      .from('obs_configurations')
      .update({
        last_configured: new Date().toISOString(),
        current_stream_url: streamUrl,
        current_stream_key: streamKey,
        current_scene: sceneTemplate || 'Default',
      })
      .eq('id', obsConfig.id)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'OBS configured successfully',
        data: {
          server: streamUrl,
          sceneTemplate,
          status: 'configured',
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('OBS Configuration Error:', error)
    throw new Error(`Failed to configure OBS: ${error.message}`)
  }
}

async function startRecording(supabase: any, payload: any) {
  const { scheduleId } = payload

  // Get OBS configuration
  const { data: obsConfig, error: obsError } = await supabase
    .from('obs_configurations')
    .select('*')
    .eq('is_active', true)
    .single()

  if (obsError || !obsConfig) {
    throw new Error('OBS configuration not found')
  }

  try {
    const obsConnection = await connectToOBS(obsConfig)
    
    // Start streaming
    await obsConnection.call('StartStream')
    
    // Start recording
    await obsConnection.call('StartRecord')

    // Update status
    await supabase
      .from('obs_configurations')
      .update({
        is_streaming: true,
        is_recording: true,
        stream_started_at: new Date().toISOString(),
      })
      .eq('id', obsConfig.id)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'OBS streaming and recording started',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('OBS Start Error:', error)
    throw new Error(`Failed to start OBS: ${error.message}`)
  }
}

async function stopRecording(supabase: any, payload: any) {
  const { scheduleId } = payload

  // Get OBS configuration
  const { data: obsConfig, error: obsError } = await supabase
    .from('obs_configurations')
    .select('*')
    .eq('is_active', true)
    .single()

  if (obsError || !obsConfig) {
    throw new Error('OBS configuration not found')
  }

  try {
    const obsConnection = await connectToOBS(obsConfig)
    
    // Stop streaming
    await obsConnection.call('StopStream')
    
    // Stop recording
    await obsConnection.call('StopRecord')

    // Update status
    await supabase
      .from('obs_configurations')
      .update({
        is_streaming: false,
        is_recording: false,
        stream_ended_at: new Date().toISOString(),
      })
      .eq('id', obsConfig.id)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'OBS streaming and recording stopped',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('OBS Stop Error:', error)
    throw new Error(`Failed to stop OBS: ${error.message}`)
  }
}

async function getOBSStatus(supabase: any, payload: any) {
  // Get OBS configuration
  const { data: obsConfig, error: obsError } = await supabase
    .from('obs_configurations')
    .select('*')
    .eq('is_active', true)
    .single()

  if (obsError || !obsConfig) {
    throw new Error('OBS configuration not found')
  }

  try {
    const obsConnection = await connectToOBS(obsConfig)
    
    // Get streaming status
    const streamStatus = await obsConnection.call('GetStreamStatus')
    
    // Get recording status
    const recordStatus = await obsConnection.call('GetRecordStatus')

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          isStreaming: streamStatus.outputActive,
          isRecording: recordStatus.outputActive,
          streamTime: streamStatus.outputTimecode,
          recordTime: recordStatus.outputTimecode,
          configuration: {
            host: obsConfig.websocket_host,
            port: obsConfig.websocket_port,
            scene: obsConfig.current_scene,
          },
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('OBS Status Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Could not connect to OBS',
        data: {
          isStreaming: false,
          isRecording: false,
          configuration: {
            host: obsConfig.websocket_host,
            port: obsConfig.websocket_port,
          },
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function connectToOBS(config: any) {
  // Mock OBS WebSocket connection for now
  // In a real implementation, you would use the OBS WebSocket library
  // This is a placeholder that returns mock responses
  
  console.log(`Connecting to OBS at ${config.websocket_host}:${config.websocket_port}`)
  
  return {
    call: async (method: string, params?: any) => {
      console.log(`OBS Call: ${method}`, params)
      
      // Mock responses for different methods
      switch (method) {
        case 'GetStreamStatus':
          return { outputActive: false, outputTimecode: '00:00:00' }
        case 'GetRecordStatus':
          return { outputActive: false, outputTimecode: '00:00:00' }
        default:
          return { success: true }
      }
    },
  }
}