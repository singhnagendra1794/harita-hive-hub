import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { headers } = req;
    const upgradeHeader = headers.get("upgrade") || "";

    if (upgradeHeader.toLowerCase() !== "websocket") {
      return new Response("Expected WebSocket connection", { status: 400 });
    }

    const { socket, response } = Deno.upgradeWebSocket(req);
    console.log('GEOVA Live Teacher WebSocket connection established');

    // Connect to OpenAI Realtime API
    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      throw new Error('OpenAI API key not configured');
    }

    const openAISocket = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01', {
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'OpenAI-Beta': 'realtime=v1'
      }
    });

    let currentSession: any = null;
    let sessionSchedule: any = null;

    // Get current day's session
    const getCurrentSession = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('geova_teaching_schedule')
        .select('*')
        .eq('scheduled_date', today)
        .eq('status', 'scheduled')
        .single();
      
      if (error) {
        console.error('Error fetching session:', error);
        return null;
      }
      
      return data;
    };

    // Initialize GEOVA with teaching context
    const initializeGEOVA = async (schedule: any) => {
      const sessionPrompt = `You are GEOVA, an AI Geospatial Technology Mentor conducting a live class.

CURRENT SESSION DETAILS:
- Day ${schedule.day_number}: ${schedule.topic_title}
- Topic: ${schedule.topic_description}
- Learning Objectives: ${schedule.learning_objectives.join(', ')}
- Tools: ${schedule.tools_used.join(', ')}
- Duration: ${schedule.duration_minutes} minutes

TEACHING STYLE:
- Professional but engaging voice
- Use clear explanations with real-world examples
- Break complex concepts into digestible parts
- Encourage student interaction and questions
- Provide practical exercises and hands-on guidance
- Use "we" and "let's" to create inclusive learning environment

SESSION STRUCTURE:
1. Welcome & topic introduction (5 min)
2. Core concept explanation (15-20 min)  
3. Practical demonstration (20 min)
4. Hands-on exercise guidance (30-60 min)
5. Q&A and wrap-up (5 min)

VOICE GUIDELINES:
- Speak clearly and at moderate pace
- Use encouraging, supportive tone
- Pause appropriately for student understanding
- Ask engaging questions to check comprehension

You should start the session with a warm welcome and brief overview of today's topic.`;

      const sessionUpdate = {
        type: "session.update",
        session: {
          modalities: ["text", "audio"],
          instructions: sessionPrompt,
          voice: "nova", // Professional female voice for GEOVA
          input_audio_format: "pcm16",
          output_audio_format: "pcm16",
          input_audio_transcription: {
            model: "whisper-1"
          },
          turn_detection: {
            type: "server_vad",
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 1000
          },
          tools: [
            {
              type: "function",
              name: "update_student_progress",
              description: "Update a student's progress when they complete an activity",
              parameters: {
                type: "object",
                properties: {
                  user_id: { type: "string" },
                  day_number: { type: "number" },
                  activity_completed: { type: "string" }
                },
                required: ["user_id", "day_number"]
              }
            },
            {
              type: "function",
              name: "get_session_info",
              description: "Get information about the current teaching session",
              parameters: {
                type: "object",
                properties: {},
                required: []
              }
            }
          ],
          tool_choice: "auto",
          temperature: 0.7,
          max_response_output_tokens: "inf"
        }
      };

      openAISocket.send(JSON.stringify(sessionUpdate));
      console.log('GEOVA session updated with teaching context');
    };

    openAISocket.onopen = async () => {
      console.log('Connected to OpenAI Realtime API');
      sessionSchedule = await getCurrentSession();
      if (sessionSchedule) {
        console.log(`GEOVA teaching session: Day ${sessionSchedule.day_number} - ${sessionSchedule.topic_title}`);
      }
    };

    openAISocket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      console.log('OpenAI message:', data.type);

      if (data.type === 'session.created') {
        currentSession = data.session;
        if (sessionSchedule) {
          await initializeGEOVA(sessionSchedule);
        }
      } else if (data.type === 'response.function_call_arguments.done') {
        // Handle function calls
        const { name, arguments: args } = data;
        let result = null;

        if (name === 'update_student_progress') {
          const { user_id, day_number, activity_completed } = JSON.parse(args);
          try {
            await supabase.rpc('update_geova_student_progress', {
              p_user_id: user_id,
              p_day_number: day_number
            });
            result = `Progress updated for student ${user_id}`;
          } catch (error) {
            result = `Error updating progress: ${error.message}`;
          }
        } else if (name === 'get_session_info') {
          result = sessionSchedule ? JSON.stringify({
            day: sessionSchedule.day_number,
            topic: sessionSchedule.topic_title,
            objectives: sessionSchedule.learning_objectives,
            tools: sessionSchedule.tools_used
          }) : 'No active session';
        }

        // Send function result back to OpenAI
        openAISocket.send(JSON.stringify({
          type: 'conversation.item.create',
          item: {
            type: 'function_call_output',
            call_id: data.call_id,
            output: result
          }
        }));
      }

      // Forward all messages to client
      socket.send(JSON.stringify(data));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Client message:', data.type);

      // Handle special GEOVA commands
      if (data.type === 'geova.start_session') {
        // Start the live session
        const welcomeMessage = {
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: 'Please start today\'s live class session with a warm welcome and introduction to the topic.'
              }
            ]
          }
        };
        openAISocket.send(JSON.stringify(welcomeMessage));
        openAISocket.send(JSON.stringify({ type: 'response.create' }));
      } else if (data.type === 'geova.student_question') {
        // Handle student questions during live session
        const questionMessage = {
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: `A student is asking: "${data.question}". Please provide a helpful answer as GEOVA, the live instructor.`
              }
            ]
          }
        };
        openAISocket.send(JSON.stringify(questionMessage));
        openAISocket.send(JSON.stringify({ type: 'response.create' }));
      } else {
        // Forward other messages to OpenAI
        openAISocket.send(event.data);
      }
    };

    openAISocket.onclose = () => {
      console.log('OpenAI connection closed');
      socket.close();
    };

    openAISocket.onerror = (error) => {
      console.error('OpenAI error:', error);
      socket.close();
    };

    socket.onclose = () => {
      console.log('Client disconnected');
      openAISocket.close();
    };

    return response;

  } catch (error) {
    console.error('Error in GEOVA live teacher:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});