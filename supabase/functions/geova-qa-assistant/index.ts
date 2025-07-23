import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { action, recordingId, userId, question, timestampSeconds, aiResponder = 'GEOVA' } = await req.json();
    console.log(`GEOVA Q&A Assistant - Action: ${action}`);

    switch (action) {
      case 'ask_question': {
        // Get recording context
        const { data: recording, error: recordingError } = await supabase
          .from('geova_recordings')
          .select('*')
          .eq('id', recordingId)
          .single();

        if (recordingError) throw recordingError;

        // Create Q&A interaction record
        const { data: qaInteraction, error: qaError } = await supabase
          .from('recording_qa_interactions')
          .insert({
            user_id: userId,
            recording_id: recordingId,
            question,
            timestamp_seconds: timestampSeconds,
            ai_responder: aiResponder,
            interaction_type: 'question'
          })
          .select()
          .single();

        if (qaError) throw qaError;

        // Generate AI response based on the recording context
        const systemPrompt = aiResponder === 'GEOVA' ? `
You are GEOVA, an AI mentor for geospatial technology. You are answering a question about Day ${recording.day_number} of the Geospatial Technology Unlocked course.

Topic: ${recording.topic_title}
Description: ${recording.topic_description}

The student is asking about something from this specific class session. Provide a helpful, educational response that relates to the course content. Be encouraging and detailed in your explanations.

If the question refers to a specific timestamp in the recording (${timestampSeconds ? `around ${Math.floor(timestampSeconds / 60)} minutes ${timestampSeconds % 60} seconds` : 'general question'}), acknowledge that context.
        ` : `
You are AVA, Harita Hive's AI assistant. A student is asking about a GEOVA class recording.

Topic: ${recording.topic_title} (Day ${recording.day_number})
Description: ${recording.topic_description}

Help the student understand the course content and provide additional resources or clarification as needed.
        `;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4.1-2025-04-14',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: question }
            ],
            max_tokens: 500,
            temperature: 0.7,
          }),
        });

        const aiData = await response.json();
        const aiResponse = aiData.choices[0].message.content;

        // Update the Q&A interaction with AI response
        const { data: updatedQA, error: updateError } = await supabase
          .from('recording_qa_interactions')
          .update({ 
            ai_response: aiResponse,
            resolved: true
          })
          .eq('id', qaInteraction.id)
          .select()
          .single();

        if (updateError) throw updateError;

        // Track analytics
        await supabase.rpc('track_recording_view', {
          p_recording_id: recordingId,
          p_user_id: userId,
          p_event_type: 'question_ask',
          p_timestamp_seconds: timestampSeconds
        });

        console.log(`Generated ${aiResponder} response for recording question`);
        return new Response(JSON.stringify({ 
          success: true, 
          qaInteraction: updatedQA,
          aiResponse 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_recording_qa': {
        const { data: qaInteractions, error } = await supabase
          .from('recording_qa_interactions')
          .select(`
            *,
            profiles:user_id (
              full_name,
              avatar_url
            )
          `)
          .eq('recording_id', recordingId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        return new Response(JSON.stringify({ qaInteractions }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'follow_up_question': {
        // Get the original Q&A context
        const { data: originalQA, error: originalError } = await supabase
          .from('recording_qa_interactions')
          .select('*')
          .eq('recording_id', recordingId)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (originalError) throw originalError;

        // Create follow-up interaction
        const { data: followUpQA, error: followUpError } = await supabase
          .from('recording_qa_interactions')
          .insert({
            user_id: userId,
            recording_id: recordingId,
            question,
            ai_responder: aiResponder,
            interaction_type: 'follow_up'
          })
          .select()
          .single();

        if (followUpError) throw followUpError;

        // Generate context-aware follow-up response
        const followUpPrompt = `
Previous question: ${originalQA.question}
Previous answer: ${originalQA.ai_response}
Follow-up question: ${question}

Provide a helpful follow-up response that builds on the previous conversation.
        `;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4.1-2025-04-14',
            messages: [
              { role: 'user', content: followUpPrompt }
            ],
            max_tokens: 400,
            temperature: 0.7,
          }),
        });

        const aiData = await response.json();
        const aiResponse = aiData.choices[0].message.content;

        // Update follow-up with response
        const { data: updatedFollowUp, error: updateFollowUpError } = await supabase
          .from('recording_qa_interactions')
          .update({ 
            ai_response: aiResponse,
            resolved: true
          })
          .eq('id', followUpQA.id)
          .select()
          .single();

        if (updateFollowUpError) throw updateFollowUpError;

        return new Response(JSON.stringify({ 
          success: true, 
          qaInteraction: updatedFollowUp,
          aiResponse 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Error in GEOVA Q&A Assistant:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});