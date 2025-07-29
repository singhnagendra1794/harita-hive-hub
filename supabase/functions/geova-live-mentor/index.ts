import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// WebSocket connections store
const connections = new Map();
const sessions = new Map();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle WebSocket upgrade
  if (req.headers.get("upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    socket.onopen = () => {
      console.log('GEOVA Live Mentor WebSocket connected');
    };

    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        await handleWebSocketMessage(socket, data);
      } catch (error) {
        console.error('WebSocket message error:', error);
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Failed to process message'
        }));
      }
    };

    socket.onclose = () => {
      console.log('GEOVA Live Mentor WebSocket disconnected');
      // Clean up connection
      for (const [key, conn] of connections.entries()) {
        if (conn.socket === socket) {
          connections.delete(key);
          break;
        }
      }
    };

    return response;
  }

  // Handle HTTP requests
  try {
    const { action, sessionId, userId, config } = await req.json();
    
    console.log(`GEOVA Live Mentor Request: {
  action: "${action}",
  sessionId: "${sessionId}",
  userId: "${userId}"
}`);

    switch (action) {
      case 'create_session':
        return await createLiveSession(sessionId, userId, config);
      case 'end_session':
        return await endLiveSession(sessionId);
      case 'get_session_status':
        return await getSessionStatus(sessionId);
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('GEOVA Live Mentor Error:', error);
    return new Response(JSON.stringify({
      error: true,
      message: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleWebSocketMessage(socket: WebSocket, data: any) {
  console.log('Received message:', data.type);

  switch (data.type) {
    case 'geova.join_session':
      await handleJoinSession(socket, data);
      break;
    case 'student.message':
      await handleStudentMessage(socket, data);
      break;
    case 'student.start_speaking':
      await handleStudentStartSpeaking(socket, data);
      break;
    case 'student.stop_speaking':
      await handleStudentStopSpeaking(socket, data);
      break;
    case 'student.audio_chunk':
      await handleStudentAudioChunk(socket, data);
      break;
    default:
      console.log('Unknown message type:', data.type);
  }
}

async function handleJoinSession(socket: WebSocket, data: any) {
  const { sessionId, userId, config } = data;
  
  // Store connection
  connections.set(userId, {
    socket,
    sessionId,
    config,
    joinedAt: new Date()
  });

  // Initialize session if not exists
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      id: sessionId,
      participants: [],
      startedAt: new Date(),
      config
    });
  }

  const session = sessions.get(sessionId);
  session.participants.push(userId);

  // Send welcome message
  socket.send(JSON.stringify({
    type: 'session.joined',
    sessionId,
    participantCount: session.participants.length
  }));

  // Start GEOVA AI mentor
  await startGEOVAMentor(socket, sessionId, config);

  // Notify other participants
  broadcastToSession(sessionId, {
    type: 'session.participant_joined',
    participant: {
      id: userId,
      name: `Student ${session.participants.length}`,
      joinedAt: new Date()
    }
  }, userId);
}

async function startGEOVAMentor(socket: WebSocket, sessionId: string, config: any) {
  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Enhanced system prompt for advanced AI mentor
    const systemPrompt = `You are GEOVA (GEOspatial Virtual Assistant), the world's most advanced AI mentor for geospatial technology with 30+ years of equivalent experience.

Your Expertise:
- GIS: QGIS, ArcGIS, PostGIS, GRASS GIS, GDAL/OGR
- Remote Sensing: Sentinel, Landsat, MODIS, UAV imagery, hyperspectral analysis
- GeoAI: Machine Learning (Random Forest, SVM), Deep Learning (YOLO, UNet, CNN), Google Earth Engine AI
- Programming: Python (GeoPandas, Shapely, Rasterio, GDAL), R (sf, raster, terra), SQL (PostGIS, SpatiaLite)
- WebGIS: Leaflet, Mapbox, OpenLayers, GeoServer, QGIS Server
- Advanced Analysis: Spatial statistics, geostatistics, network analysis, 3D analysis
- Industry Applications: Urban planning, agriculture, forestry, mining, telecommunications, disaster management

Teaching Style (adapts to session type):
${config.sessionType === 'private' ? `
PRIVATE SESSION MODE:
- Focus entirely on individual student's learning pace and career goals
- Provide detailed, personalized explanations
- Ask probing questions to assess understanding
- Offer immediate feedback and course corrections
- Create custom learning paths based on student's background
- Provide 1-on-1 career guidance and portfolio review
` : `
GROUP SESSION MODE:
- Facilitate collaborative learning among multiple students
- Moderate discussions and ensure equal participation
- Present concepts that benefit the entire group
- Encourage peer learning and knowledge sharing
- Use interactive demonstrations and group exercises
- Create inclusive learning environment for all skill levels
`}

Capabilities in this live session:
- Real-time voice conversation with natural speech patterns
- Live demonstrations on virtual whiteboard with annotations
- Interactive code examples and explanations
- Dynamic visual aids and map annotations
- Immediate answers to technical questions
- Progressive skill building based on student responses
- Career counseling and industry insights

Communication Style:
- Professional yet approachable and encouraging
- Use clear, jargon-free explanations followed by technical details
- Provide step-by-step guidance with real-world examples
- Ask questions to ensure understanding before progressing
- Celebrate student achievements and progress
- Use appropriate humor to maintain engagement
- Reference current industry trends and job market insights

Session Flow:
1. Welcome and assess student's current knowledge level
2. Understand their learning objectives and career goals
3. Adapt teaching approach based on their responses
4. Provide hands-on learning with immediate feedback
5. Use whiteboard for visual explanations
6. Suggest next steps and additional resources
7. Offer career guidance and skill development advice

Remember: You have live capabilities - you can see, hear, draw, and interact in real-time. Use these to create an immersive learning experience.`;

    // Send initial AI mentor greeting
    const welcomeResponse = await callOpenAI(systemPrompt, `Hello! I'm GEOVA, your advanced AI mentor for geospatial technology. I'm here to provide you with personalized ${config.sessionType} mentoring.

Let me start by understanding your background:
1. What's your current level with GIS and geospatial technology?
2. What specific goals do you have for today's session?
3. Are you working on any particular projects or facing specific challenges?

I can help with everything from basic GIS concepts to advanced spatial analysis, programming, and career guidance. What would you like to explore first?`);

    // Send welcome message with voice if enabled
    if (config.voiceEnabled) {
      const audioContent = await generateSpeech(welcomeResponse, 'nova');
      if (audioContent) {
        const audioChunks = chunkAudio(audioContent);
        for (const chunk of audioChunks) {
          socket.send(JSON.stringify({
            type: 'response.audio.delta',
            delta: chunk
          }));
          // Small delay between chunks for natural flow
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        socket.send(JSON.stringify({
          type: 'response.audio.done'
        }));
      }
    }

    // Send text response
    socket.send(JSON.stringify({
      type: 'response.text.delta',
      delta: welcomeResponse
    }));

    // Send avatar initialization if enabled
    if (config.avatarEnabled) {
      await initializeAIAvatar(socket, welcomeResponse);
    }

    // Send whiteboard welcome if enabled
    if (config.whiteboardEnabled) {
      socket.send(JSON.stringify({
        type: 'whiteboard.annotation',
        annotation: {
          type: 'pointer',
          x: 960,
          y: 100,
          color: '#2563eb',
          message: 'Welcome to GEOVA Live Session!'
        }
      }));
    }

  } catch (error) {
    console.error('Error starting GEOVA mentor:', error);
    socket.send(JSON.stringify({
      type: 'error',
      message: 'Failed to initialize AI mentor'
    }));
  }
}

async function handleStudentMessage(socket: WebSocket, data: any) {
  const { message, isQuestion, handRaised } = data;
  
  try {
    // Get enhanced system prompt based on message context
    const contextPrompt = `Continue the mentoring session. The student ${handRaised ? 'has raised their hand and ' : ''}asked: "${message}"

${isQuestion ? 'This is a direct question that needs a comprehensive answer.' : 'This is a comment or statement that may need acknowledgment or follow-up.'}

Provide a helpful, educational response that:
1. Directly addresses their question/comment
2. Provides practical, actionable guidance
3. Uses examples relevant to their learning level
4. Suggests hands-on activities or next steps
5. Encourages further learning and exploration

If appropriate, use the whiteboard to illustrate concepts visually.`;

    const response = await callOpenAI('', contextPrompt);

    // Send text response
    socket.send(JSON.stringify({
      type: 'response.text.delta',
      delta: response
    }));

    // Generate and send audio response
    const connection = Array.from(connections.values()).find(conn => conn.socket === socket);
    if (connection?.config?.voiceEnabled) {
      const audioContent = await generateSpeech(response, 'nova');
      if (audioContent) {
        const audioChunks = chunkAudio(audioContent);
        for (const chunk of audioChunks) {
          socket.send(JSON.stringify({
            type: 'response.audio.delta',
            delta: chunk
          }));
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        socket.send(JSON.stringify({
          type: 'response.audio.done'
        }));
      }
    }

    // Update avatar if enabled
    if (connection?.config?.avatarEnabled) {
      await updateAIAvatar(socket, response);
    }

    // Add whiteboard annotations if relevant
    if (connection?.config?.whiteboardEnabled && (message.includes('show') || message.includes('draw') || message.includes('map'))) {
      socket.send(JSON.stringify({
        type: 'whiteboard.annotation',
        annotation: {
          type: 'draw',
          points: generateVisualizationPoints(message),
          color: '#ef4444',
          width: 3
        }
      }));
    }

  } catch (error) {
    console.error('Error handling student message:', error);
    socket.send(JSON.stringify({
      type: 'error',
      message: 'Failed to process your message'
    }));
  }
}

async function handleStudentStartSpeaking(socket: WebSocket, data: any) {
  socket.send(JSON.stringify({
    type: 'student.speaking_started'
  }));
}

async function handleStudentStopSpeaking(socket: WebSocket, data: any) {
  socket.send(JSON.stringify({
    type: 'student.speaking_stopped'
  }));
}

async function handleStudentAudioChunk(socket: WebSocket, data: any) {
  // Process audio chunk for real-time transcription
  const { audioChunk } = data;
  
  try {
    // Convert to text using Whisper
    const { text } = await transcribeAudio(audioChunk);
    
    if (text && text.trim()) {
      // Send back transcribed text and process as message
      socket.send(JSON.stringify({
        type: 'transcription.result',
        text: text.trim()
      }));
      
      // Auto-process as message if it seems complete
      if (text.includes('.') || text.includes('?') || text.includes('!')) {
        await handleStudentMessage(socket, {
          message: text.trim(),
          isQuestion: text.includes('?'),
          handRaised: false
        });
      }
    }
  } catch (error) {
    console.error('Error processing audio chunk:', error);
  }
}

async function callOpenAI(systemPrompt: string, userMessage: string): Promise<string> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: userMessage });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages,
      max_tokens: 2000,
      temperature: 0.8,
      stream: false
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "I apologize, but I'm having trouble formulating a response right now. Could you please rephrase your question?";
}

async function generateSpeech(text: string, voice: string = 'nova'): Promise<string | null> {
  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: voice,
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate speech');
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    return base64Audio;
  } catch (error) {
    console.error('Error generating speech:', error);
    return null;
  }
}

async function transcribeAudio(base64Audio: string): Promise<{ text: string }> {
  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    // Convert base64 to binary
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const formData = new FormData();
    const audioBlob = new Blob([bytes], { type: 'audio/webm' });
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to transcribe audio');
    }

    const result = await response.json();
    return { text: result.text || '' };
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return { text: '' };
  }
}

async function initializeAIAvatar(socket: WebSocket, text: string) {
  // Placeholder for AI Avatar initialization with DID/Synthesia API
  // This would integrate with AI avatar service to create realistic mentor face
  try {
    const didApiKey = Deno.env.get('DID_API_KEY');
    if (!didApiKey) {
      console.log('DID API key not configured, skipping avatar');
      return;
    }

    // Initialize AI avatar session
    socket.send(JSON.stringify({
      type: 'avatar.initialized',
      avatarId: 'geova-mentor',
      message: 'AI Avatar is ready to teach!'
    }));

  } catch (error) {
    console.error('Error initializing AI avatar:', error);
  }
}

async function updateAIAvatar(socket: WebSocket, text: string) {
  // Update AI avatar expression and gestures based on text content
  try {
    socket.send(JSON.stringify({
      type: 'avatar.update',
      expression: getExpressionForText(text),
      gesture: getGestureForText(text)
    }));
  } catch (error) {
    console.error('Error updating AI avatar:', error);
  }
}

function getExpressionForText(text: string): string {
  if (text.includes('!') || text.includes('great') || text.includes('excellent')) {
    return 'excited';
  } else if (text.includes('?') || text.includes('understand')) {
    return 'thoughtful';
  } else if (text.includes('challenge') || text.includes('difficult')) {
    return 'concerned';
  }
  return 'neutral';
}

function getGestureForText(text: string): string {
  if (text.includes('show') || text.includes('look') || text.includes('here')) {
    return 'pointing';
  } else if (text.includes('important') || text.includes('remember')) {
    return 'emphasis';
  } else if (text.includes('welcome') || text.includes('hello')) {
    return 'greeting';
  }
  return 'neutral';
}

function generateVisualizationPoints(message: string): Array<{x: number, y: number}> {
  // Generate simple visualization points based on message content
  const points = [];
  
  if (message.includes('map') || message.includes('spatial')) {
    // Draw a simple map outline
    points.push({x: 100, y: 100}, {x: 200, y: 100}, {x: 200, y: 200}, {x: 100, y: 200}, {x: 100, y: 100});
  } else if (message.includes('graph') || message.includes('chart')) {
    // Draw a simple graph
    points.push({x: 50, y: 200}, {x: 100, y: 150}, {x: 150, y: 100}, {x: 200, y: 120}, {x: 250, y: 80});
  } else {
    // Draw a simple arrow or pointer
    points.push({x: 100, y: 100}, {x: 200, y: 150}, {x: 180, y: 140}, {x: 200, y: 150}, {x: 180, y: 160});
  }
  
  return points;
}

function chunkAudio(base64Audio: string): string[] {
  const chunkSize = 4096; // Adjust based on optimal streaming size
  const chunks = [];
  
  for (let i = 0; i < base64Audio.length; i += chunkSize) {
    chunks.push(base64Audio.slice(i, i + chunkSize));
  }
  
  return chunks;
}

function broadcastToSession(sessionId: string, message: any, excludeUserId?: string) {
  for (const [userId, connection] of connections.entries()) {
    if (connection.sessionId === sessionId && userId !== excludeUserId) {
      connection.socket.send(JSON.stringify(message));
    }
  }
}

async function createLiveSession(sessionId: string, userId: string, config: any) {
  try {
    // Create session record
    const session = {
      id: sessionId,
      type: config.sessionType,
      createdBy: userId,
      config,
      createdAt: new Date()
    };

    sessions.set(sessionId, session);

    return new Response(JSON.stringify({
      success: true,
      session
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}

async function endLiveSession(sessionId: string) {
  try {
    // Clean up session
    sessions.delete(sessionId);
    
    // Disconnect all participants
    for (const [userId, connection] of connections.entries()) {
      if (connection.sessionId === sessionId) {
        connection.socket.close();
        connections.delete(userId);
      }
    }

    return new Response(JSON.stringify({
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error ending session:', error);
    throw error;
  }
}

async function getSessionStatus(sessionId: string) {
  try {
    const session = sessions.get(sessionId);
    
    return new Response(JSON.stringify({
      session,
      isActive: !!session,
      participantCount: session?.participants?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error getting session status:', error);
    throw error;
  }
}