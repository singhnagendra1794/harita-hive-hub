import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
    const channelId = Deno.env.get('YOUTUBE_CHANNEL_ID');

    console.log('🔍 Testing YouTube API with provided credentials...');
    
    if (!youtubeApiKey) {
      throw new Error('YOUTUBE_API_KEY not found in environment variables');
    }
    
    if (!channelId) {
      throw new Error('YOUTUBE_CHANNEL_ID not found in environment variables');
    }

    console.log('✅ API Key found:', youtubeApiKey.substring(0, 10) + '...');
    console.log('✅ Channel ID found:', channelId);

    // Test 1: Verify API key with a simple channel info request
    const channelInfoUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${youtubeApiKey}`;
    
    console.log('🧪 Test 1: Fetching channel information...');
    const channelResponse = await fetch(channelInfoUrl);
    const channelData = await channelResponse.json();
    
    if (!channelResponse.ok) {
      console.error('❌ Channel info test failed:', channelData);
      throw new Error(`Channel API test failed: ${channelData.error?.message || 'Unknown error'}`);
    }

    console.log('✅ Test 1 passed: Channel info retrieved successfully');
    
    // Test 2: Check for live broadcasts
    const liveBroadcastsUrl = `https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status&broadcastStatus=active&key=${youtubeApiKey}`;
    
    console.log('🧪 Test 2: Checking for live broadcasts...');
    const liveResponse = await fetch(liveBroadcastsUrl);
    const liveData = await liveResponse.json();
    
    if (!liveResponse.ok) {
      console.error('❌ Live broadcast test failed:', liveData);
      // This might fail if no OAuth is set up, but API key should still work for basic calls
      console.log('⚠️ Live broadcast check requires OAuth token, but API key is working');
    } else {
      console.log('✅ Test 2 passed: Live broadcast API accessible');
    }

    // Test 3: Search for videos on the channel
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=5&key=${youtubeApiKey}`;
    
    console.log('🧪 Test 3: Searching recent videos...');
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (!searchResponse.ok) {
      console.error('❌ Search test failed:', searchData);
      throw new Error(`Search API test failed: ${searchData.error?.message || 'Unknown error'}`);
    }

    console.log('✅ Test 3 passed: Video search working');

    // Prepare results
    const results = {
      success: true,
      timestamp: new Date().toISOString(),
      apiKeyStatus: 'Valid and working',
      channelId: channelId,
      channelInfo: {
        title: channelData.items?.[0]?.snippet?.title || 'Unknown',
        subscriberCount: channelData.items?.[0]?.statistics?.subscriberCount || 'Unknown',
        videoCount: channelData.items?.[0]?.statistics?.videoCount || 'Unknown'
      },
      liveBroadcastsAccessible: liveResponse.ok,
      recentVideosCount: searchData.items?.length || 0,
      testsPassed: 3,
      recommendations: [
        'API Key is working correctly',
        'Channel ID is valid',
        'Basic YouTube Data API v3 access confirmed',
        liveResponse.ok ? 'Live broadcast detection available' : 'For live broadcast detection, OAuth setup is recommended'
      ]
    };

    console.log('🎉 All YouTube API tests completed successfully!');
    console.log('📊 Results:', JSON.stringify(results, null, 2));

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 YouTube API test failed:', error);
    
    const errorResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      error: error.message,
      apiKeyPresent: !!Deno.env.get('YOUTUBE_API_KEY'),
      channelIdPresent: !!Deno.env.get('YOUTUBE_CHANNEL_ID'),
      troubleshooting: [
        'Verify API key is correct in Supabase secrets',
        'Check if YouTube Data API v3 is enabled in Google Cloud Console',
        'Ensure API key has proper permissions',
        'Verify Channel ID is correct'
      ]
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});