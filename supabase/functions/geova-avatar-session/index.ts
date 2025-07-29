import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const { action, sessionId, avatarConfig, text, voice, accent } = await req.json();
    
    console.log(`GEOVA Avatar Request: {
      action: "${action}",
      sessionId: "${sessionId}"
    }`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    switch (action) {
      case 'create_session':
        return await createAvatarSession(avatarConfig, sessionId);
      case 'speak':
        return await makeAvatarSpeak(text, voice, accent, sessionId);
      case 'update_avatar':
        return await updateAvatarSettings(avatarConfig, sessionId);
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('GEOVA Avatar Error:', error);
    return new Response(JSON.stringify({
      error: true,
      message: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createAvatarSession(avatarConfig: any, sessionId: string) {
  try {
    const didApiKey = Deno.env.get('DID_API_KEY');
    const elevenLabsApiKey = Deno.env.get('ELEVEN_LABS_API_KEY');
    
    if (!didApiKey) {
      console.log('DID API key not configured, using mock avatar');
      return new Response(JSON.stringify({
        success: true,
        streamUrl: '/placeholder-avatar.mp4',
        sessionId,
        mock: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create DID session
    const didResponse = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${didApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_url: avatarConfig.avatar_video_url || 'https://d-id-public-bucket.s3.amazonaws.com/alice.jpg',
        script: {
          type: 'text',
          provider: {
            type: 'eleven_labs',
            voice_id: avatarConfig.voice_id || 'pNczCjzI2devNBz1zQrb'
          },
          input: 'Hello! I am GEOVA, your AI mentor for geospatial technology. I am here to help you learn and grow in this exciting field.'
        },
        config: {
          fluent: true,
          pad_audio: 0.0,
          stitch: true
        }
      }),
    });

    if (!didResponse.ok) {
      console.error('DID API error:', await didResponse.text());
      throw new Error('Failed to create avatar session');
    }

    const didData = await didResponse.json();
    
    return new Response(JSON.stringify({
      success: true,
      streamUrl: didData.result_url,
      talkId: didData.id,
      sessionId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating avatar session:', error);
    throw error;
  }
}

async function makeAvatarSpeak(text: string, voice: string, accent: string, sessionId: string) {
  try {
    const didApiKey = Deno.env.get('DID_API_KEY');
    const elevenLabsApiKey = Deno.env.get('ELEVEN_LABS_API_KEY');

    if (!didApiKey) {
      console.log('DID API not configured, using mock speech');
      return new Response(JSON.stringify({
        success: true,
        message: 'Mock speech generated',
        duration: text.length * 50
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate speech with ElevenLabs
    let audioUrl = null;
    if (elevenLabsApiKey) {
      const elevenResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice || 'pNczCjzI2devNBz1zQrb'}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${elevenLabsApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        }),
      });

      if (elevenResponse.ok) {
        const audioBuffer = await elevenResponse.arrayBuffer();
        // In a real implementation, you'd upload this to storage
        // For now, we'll use the buffer directly
        audioUrl = 'data:audio/mp3;base64,' + btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
      }
    }

    // Create DID talk with the text
    const didResponse = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${didApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_url: 'https://d-id-public-bucket.s3.amazonaws.com/alice.jpg',
        script: {
          type: 'text',
          provider: {
            type: 'eleven_labs',
            voice_id: voice || 'pNczCjzI2devNBz1zQrb'
          },
          input: text
        },
        config: {
          fluent: true,
          pad_audio: 0.0,
          stitch: true
        }
      }),
    });

    if (!didResponse.ok) {
      throw new Error('Failed to generate avatar speech');
    }

    const didData = await didResponse.json();

    return new Response(JSON.stringify({
      success: true,
      talkId: didData.id,
      videoUrl: didData.result_url,
      audioUrl,
      duration: didData.duration || text.length * 50
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error making avatar speak:', error);
    throw error;
  }
}

async function updateAvatarSettings(avatarConfig: any, sessionId: string) {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data, error } = await supabase
      .from('geova_avatar_settings')
      .update({
        gender: avatarConfig.gender,
        accent: avatarConfig.accent,
        voice_id: avatarConfig.voice_id,
        avatar_id: avatarConfig.avatar_id,
        personality_traits: avatarConfig.personality_traits,
        updated_at: new Date().toISOString()
      })
      .eq('is_active', true)
      .select();

    if (error) throw error;

    return new Response(JSON.stringify({
      success: true,
      settings: data
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error updating avatar settings:', error);
    throw error;
  }
}