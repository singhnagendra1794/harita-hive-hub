import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Initialize Supabase client with service role for full access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  feedback?: number;
  learningContext?: string;
  recommendations?: string[];
  progressUpdate?: any;
  nextLessonSuggestions?: string[];
}

interface LearningContext {
  type: 'course' | 'lesson' | 'exercise' | 'project' | 'tool' | 'concept';
  title: string;
  content: string;
  difficulty: string;
  relevance_score?: number;
}

serve(async (req) => {
  const startTime = Date.now();
  let logData = {
    user_id: '',
    ai_system: 'geova',
    message_text: '',
    response_text: '',
    error_message: '',
    retry_count: 0,
    response_time_ms: 0,
    status: 'success',
    context_type: 'learning'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      message, 
      conversation_id, 
      user_id, 
      context_type = 'learning',
      mode = 'chat',
      voice_enabled = false,
      retry_count = 0
    } = await req.json();

    // Update log data
    logData.user_id = user_id;
    logData.message_text = message;
    logData.context_type = context_type;
    logData.retry_count = retry_count;

    console.log('GEOVA Request:', { 
      message: message?.slice(0, 100), 
      user_id, 
      context_type, 
      mode, 
      retry: retry_count 
    });

    if (!message) {
      throw new Error('Message is required');
    }

    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      throw new Error('OpenAI API key not configured - please check Supabase secrets');
    }

    // Get user learning profile and context
    const learningProfile = await getUserLearningProfile(user_id);
    const relevantContent = await getRelevantLearningContent(message, context_type);
    const userMemory = await getUserMemory(user_id);
    
    // Build GEOVA-specific system prompt
    const systemPrompt = buildGEOVAPrompt(learningProfile, relevantContent, userMemory, context_type);
    const conversationHistory = await getConversationHistory(conversation_id, user_id);
    
    // Prepare messages for OpenAI
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-8), // Keep last 8 messages for context
      { role: 'user', content: message }
    ];

    console.log('Calling OpenAI for GEOVA response:', {
      contentItems: relevantContent.length,
      conversationLength: conversationHistory.length,
      userProgress: learningProfile.progress_percentage,
      retry: retry_count
    });

    // Call OpenAI with timeout and better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14', // Using latest model for best responses
          messages,
          temperature: 0.7,
          max_tokens: 1000,
          stream: false,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json();
        console.error('OpenAI API Error:', error);
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from OpenAI');
      }

      const assistantResponse = data.choices[0].message.content;

      logData.response_text = assistantResponse;
      logData.response_time_ms = Date.now() - startTime;
      logData.status = 'success';

      console.log(`GEOVA Response: ${assistantResponse.substring(0, 100)}... (${logData.response_time_ms}ms)`);

      // Process learning elements from response
      const learningContext = extractLearningContext(assistantResponse);
      const recommendations = extractRecommendations(assistantResponse);
      const progressUpdate = calculateProgressUpdate(user_id, message, assistantResponse);

      // Update health status to healthy
      await updateHealthStatus(supabase, 'geova', 'healthy', 0);

      // Log successful interaction
      await logInteraction(supabase, logData);

      // Save conversation to database
      await saveGEOVAConversation({
        conversation_id,
        user_id,
        user_message: message,
        assistant_response: assistantResponse,
        context_type,
        learning_context: learningContext,
        recommendations,
        progress_update: progressUpdate
      });

      // Update user learning progress
      await updateLearningProgress(user_id, message, assistantResponse, context_type);

      return new Response(JSON.stringify({
        response: assistantResponse,
        conversation_id,
        learning_context: learningContext,
        recommendations,
        progress_update: progressUpdate,
        next_lesson_suggestions: generateNextLessonSuggestions(learningProfile, message),
        context_used: relevantContent.map(c => ({ type: c.type, title: c.title })),
        status: 'success',
        retry_count
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (openaiError) {
      console.error('OpenAI Error:', openaiError);
      clearTimeout(timeoutId);
      throw openaiError; // Re-throw to be handled by outer catch
    }
  } catch (error) {
    console.error('GEOVA Error:', error);
    
    // Update log data with error
    logData.error_message = error.message || 'Unknown error';
    logData.response_time_ms = Date.now() - startTime;
    logData.status = error.name === 'AbortError' ? 'timeout' : 'error';

    // Log the error
    await logInteraction(supabase, logData);

    // Update health status and check for repeated failures
    await handleAIFailure(supabase, 'geova', error.message);

    // Determine response based on error type
    let fallbackResponse = "I'm experiencing a temporary issue. Please try again in a few seconds.";
    let status = 500;

    if (error.message.includes('quota') || error.message.includes('429')) {
      fallbackResponse = "I'm currently experiencing high demand. Please try again in a few minutes. 🔄";
      await createAlert(supabase, 'geova', 'api_quota_exceeded', error.message, 'high');
    } else if (error.name === 'AbortError' || error.message.includes('timeout')) {
      fallbackResponse = "My response took too long. Let me try to help differently - could you ask a more specific question? ⏱️";
      await createAlert(supabase, 'geova', 'timeout', error.message, 'medium');
    } else if (error.message.includes('API key')) {
      fallbackResponse = "I'm having configuration issues. Please contact support@haritahive.com. 🔧";
      await createAlert(supabase, 'geova', 'connection_failure', error.message, 'critical');
    } else {
      fallbackResponse = "I'm having some technical difficulties right now. Let me try to help you in a different way! Could you please rephrase your question or be more specific about what you're trying to learn? 🤔";
    }

    return new Response(JSON.stringify({ 
      error: error.message,
      fallback_response: fallbackResponse,
      status: 'error',
      can_retry: logData.retry_count < 3 && !error.message.includes('API key'),
      retry_count: logData.retry_count,
      support_contact: 'support@haritahive.com'
    }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to fetch user learning profile
async function getUserLearningProfile(userId: string) {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    const { data: progress } = await supabase
      .from('geova_student_progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    return {
      profile: profile || {},
      progress: progress || { current_day: 1, progress_percentage: 0, completed_days: [] },
      subscription: subscription || { subscription_tier: 'free' },
      skill_level: profile?.plan || 'beginner',
      days_learning: progress?.completed_days?.length || 0,
      current_day: progress?.current_day || 1,
      progress_percentage: progress?.progress_percentage || 0
    };
  } catch (error) {
    console.error('Error fetching learning profile:', error);
    return { 
      profile: {}, 
      progress: { current_day: 1, progress_percentage: 0, completed_days: [] },
      subscription: { subscription_tier: 'free' },
      skill_level: 'beginner',
      days_learning: 0,
      current_day: 1,
      progress_percentage: 0
    };
  }
}

async function getRelevantLearningContent(message: string, contextType: string): Promise<LearningContext[]> {
  const contents: LearningContext[] = [];
  
  try {
    // Search course content based on message keywords
    const keywords = message.toLowerCase().split(' ').filter(word => word.length > 3);
    const searchTerms = keywords.slice(0, 5).join(' | ');

    // Search geospatial courses and lessons
    const { data: courses } = await supabase
      .from('enhanced_courses')
      .select('title, description, course_outline, difficulty')
      .textSearch('title,description', searchTerms)
      .limit(2);

    if (courses) {
      contents.push(...courses.map(course => ({
        type: 'course' as const,
        title: course.title,
        content: `${course.description}\n\nOutline: ${course.course_outline}`,
        difficulty: course.difficulty || 'intermediate',
        relevance_score: 0.9
      })));
    }

    // Search for relevant tools and concepts
    const { data: tools } = await supabase
      .from('marketplace_tools')
      .select('name, description, category, instructions')
      .textSearch('name,description,category', searchTerms)
      .limit(2);

    if (tools) {
      contents.push(...tools.map(tool => ({
        type: 'tool' as const,
        title: tool.name,
        content: `${tool.description}\nCategory: ${tool.category}\nUsage: ${tool.instructions}`,
        difficulty: 'intermediate',
        relevance_score: 0.7
      })));
    }

  } catch (error) {
    console.error('Error fetching learning content:', error);
  }

  return contents.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));
}

async function getUserMemory(userId: string) {
  try {
    const { data } = await supabase
      .from('geova_user_memory')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    return data || [];
  } catch (error) {
    console.error('Error fetching user memory:', error);
    return [];
  }
}

function buildGEOVAPrompt(learningProfile: any, relevantContent: LearningContext[], userMemory: any[], contextType: string): string {
  const daysLearning = learningProfile.days_learning;
  const progressPercentage = Math.min((daysLearning / 120) * 100, 100);

  return `You are GEOVA (Geo Voice Assistant), an expert AI mentor specializing in geospatial technology education. Your mission is to help users become geospatial professionals in 120 days.

PERSONALITY & TEACHING STYLE:
- 🎓 Expert mentor who explains complex concepts clearly and progressively
- 🌟 Warm, encouraging, patient, and genuinely excited about geospatial technology
- 🚀 Break down complex topics into digestible, sequential steps
- 💡 Always provide practical, hands-on examples and exercises
- 🎯 Focus on real-world applications and career readiness

CURRENT STUDENT PROFILE:
- Learning Progress: Day ${learningProfile.current_day}/120 (${progressPercentage.toFixed(1)}% complete)
- Skill Level: ${learningProfile.skill_level}
- Days Learning: ${daysLearning}
- Subscription: ${learningProfile.subscription?.subscription_tier || 'free'}
- Context: ${contextType}

RELEVANT LEARNING CONTENT:
${relevantContent.map(content => `- ${content.type.toUpperCase()}: ${content.title}\n  ${content.content.slice(0, 200)}...`).join('\n')}

RECENT LEARNING HISTORY:
${userMemory.map(memory => `- Discussed: ${memory.key_topics?.join(', ') || 'N/A'} (${memory.user_intent})`).join('\n')}

120-DAY CURRICULUM OVERVIEW:
Days 1-30: GIS Fundamentals (QGIS, data types, coordinate systems)
Days 31-60: Advanced Analysis (spatial analysis, remote sensing, databases)
Days 61-90: Professional Tools (Python/R for GIS, web mapping, automation)
Days 91-120: Career Preparation (projects, portfolio, job readiness)

RESPONSE GUIDELINES:
1. **Assess Understanding**: Start by understanding what they know
2. **Teach Progressively**: Build on their current level, don't overwhelm
3. **Practical Focus**: Always include hands-on exercises or examples
4. **Career Connection**: Connect learning to real-world job applications
5. **Encouragement**: Celebrate progress and motivate continued learning
6. **Next Steps**: Always end with clear next actions or exercises

RESPONSE STRUCTURE:
- Start with understanding their specific goal/question
- Provide 2-4 clear, actionable learning steps
- Include practical exercises or examples
- Suggest relevant tools/resources when applicable
- End with an encouraging next step or question

AVAILABLE TOOLS & TOPICS TO HELP WITH:
- 🗺️ GIS Software: QGIS, ArcGIS, PostGIS, GRASS GIS
- 🐍 Programming: Python (GeoPandas, Rasterio), R (sf, raster)
- 🌍 Web Mapping: Leaflet, MapBox, OpenLayers, ArcGIS Online
- 📡 Remote Sensing: Google Earth Engine, SNAP, ENVI
- 🏗️ Career Paths: Urban Planning, Environmental, Telecom, Mining, Agriculture
- 📊 Analysis: Spatial statistics, modeling, automation workflows

Remember: You're not just answering questions - you're guiding their entire geospatial career journey! Keep responses focused, practical, and inspiring.`;
}

async function getConversationHistory(conversationId: string, userId: string): Promise<ChatMessage[]> {
  if (!conversationId) return [];
  
  try {
    const { data } = await supabase
      .from('geova_conversations')
      .select('user_message, assistant_response, created_at')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(10);

    if (!data) return [];

    return data.flatMap(conv => [
      { role: 'user' as const, content: conv.user_message, timestamp: conv.created_at },
      { role: 'assistant' as const, content: conv.assistant_response, timestamp: conv.created_at }
    ]);
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    return [];
  }
}

async function saveGEOVAConversation(data: {
  conversation_id: string;
  user_id: string;
  user_message: string;
  assistant_response: string;
  context_type: string;
  learning_context?: string;
  recommendations?: string[];
  progress_update?: any;
}) {
  try {
    await supabase.from('geova_conversations').insert({
      conversation_id: data.conversation_id || crypto.randomUUID(),
      user_id: data.user_id,
      user_message: data.user_message,
      assistant_response: data.assistant_response,
      context_type: data.context_type,
      learning_context: data.learning_context,
      recommendations: data.recommendations,
      progress_update: data.progress_update,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving conversation:', error);
  }
}

async function updateLearningProgress(userId: string, userMessage: string, assistantResponse: string, contextType: string) {
  try {
    // Extract learning indicators from the conversation
    const learningData = {
      user_id: userId,
      context_type: contextType,
      topic: extractMainTopic(userMessage),
      skill_practiced: extractSkillPracticed(userMessage, assistantResponse),
      progress_made: calculateProgressMade(userMessage, assistantResponse),
      created_at: new Date().toISOString()
    };

    await supabase.from('geova_user_memory').insert(learningData);
  } catch (error) {
    console.error('Error updating learning progress:', error);
  }
}

function extractLearningContext(response: string): string {
  // Extract key learning elements from the response
  const learningKeywords = ['learn', 'understand', 'practice', 'exercise', 'tutorial', 'concept', 'skill'];
  const sentences = response.split('.').filter(sentence => 
    learningKeywords.some(keyword => sentence.toLowerCase().includes(keyword))
  );
  return sentences.slice(0, 2).join('. ');
}

function extractRecommendations(response: string): string[] {
  // Extract actionable recommendations from the response
  const recommendations: string[] = [];
  const lines = response.split('\n');
  
  lines.forEach(line => {
    if (line.includes('try') || line.includes('practice') || line.includes('exercise') || 
        line.includes('next step') || line.includes('recommend')) {
      recommendations.push(line.trim());
    }
  });
  
  return recommendations.slice(0, 3);
}

function calculateProgressUpdate(userId: string, userMessage: string, assistantResponse: string) {
  // Simple progress calculation based on interaction complexity
  const complexity = userMessage.length + assistantResponse.length;
  const pointsEarned = Math.min(Math.floor(complexity / 100), 10);
  
  return {
    points_earned: pointsEarned,
    topic_covered: extractMainTopic(userMessage),
    engagement_level: calculateEngagement(userMessage, assistantResponse)
  };
}

function generateNextLessonSuggestions(learningProfile: any, currentMessage: string): string[] {
  const currentDay = learningProfile.current_day;
  const suggestions = [];
  
  if (currentDay <= 30) {
    suggestions.push(
      "Let's explore basic GIS concepts",
      "Practice with QGIS fundamentals",
      "Learn about coordinate systems"
    );
  } else if (currentDay <= 60) {
    suggestions.push(
      "Try advanced spatial analysis",
      "Explore remote sensing techniques",
      "Practice with spatial databases"
    );
  } else if (currentDay <= 90) {
    suggestions.push(
      "Learn Python for GIS automation",
      "Build web mapping applications",
      "Master professional workflows"
    );
  } else {
    suggestions.push(
      "Create portfolio projects",
      "Practice job interview skills",
      "Network with GIS professionals"
    );
  }
  
  return suggestions.slice(0, 3);
}

function extractMainTopic(message: string): string {
  const topics = ['qgis', 'arcgis', 'python', 'postgis', 'remote sensing', 'web mapping', 'spatial analysis'];
  const messageLower = message.toLowerCase();
  
  for (const topic of topics) {
    if (messageLower.includes(topic)) {
      return topic;
    }
  }
  
  return 'general geospatial';
}

function extractSkillPracticed(userMessage: string, assistantResponse: string): string {
  const skills = ['analysis', 'programming', 'visualization', 'data management', 'problem solving'];
  const combined = (userMessage + ' ' + assistantResponse).toLowerCase();
  
  for (const skill of skills) {
    if (combined.includes(skill)) {
      return skill;
    }
  }
  
  return 'general learning';
}

function calculateProgressMade(userMessage: string, assistantResponse: string): number {
  // Simple calculation based on interaction depth
  const totalLength = userMessage.length + assistantResponse.length;
  return Math.min(Math.floor(totalLength / 200), 5);
}

function calculateEngagement(userMessage: string, assistantResponse: string): string {
  const questionMarks = (userMessage.match(/\?/g) || []).length;
  const responseLength = assistantResponse.length;
  
  if (questionMarks > 2 && responseLength > 500) return 'high';
  if (questionMarks > 0 || responseLength > 200) return 'medium';
  return 'low';
}

// Helper functions for logging and health monitoring
async function logInteraction(supabase: any, logData: any) {
  try {
    await supabase.from('ai_interaction_logs').insert(logData);
  } catch (error) {
    console.error('Failed to log interaction:', error);
  }
}

async function updateHealthStatus(supabase: any, aiSystem: string, status: string, consecutiveFailures: number) {
  try {
    await supabase
      .from('ai_health_status')
      .upsert({
        ai_system: aiSystem,
        status,
        consecutive_failures: consecutiveFailures,
        last_successful_response: status === 'healthy' ? new Date().toISOString() : undefined,
        last_health_check: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'ai_system' });
  } catch (error) {
    console.error('Failed to update health status:', error);
  }
}

async function handleAIFailure(supabase: any, aiSystem: string, errorMessage: string) {
  try {
    // Get current health status
    const { data: currentStatus } = await supabase
      .from('ai_health_status')
      .select('consecutive_failures')
      .eq('ai_system', aiSystem)
      .single();

    const failures = (currentStatus?.consecutive_failures || 0) + 1;
    const status = failures >= 5 ? 'down' : failures >= 3 ? 'degraded' : 'healthy';

    await updateHealthStatus(supabase, aiSystem, status, failures);

    // Create alert for repeated failures
    if (failures >= 3) {
      await createAlert(supabase, aiSystem, 'repeated_failures', 
        `${aiSystem} has failed ${failures} consecutive times. Latest error: ${errorMessage}`,
        failures >= 5 ? 'critical' : 'high'
      );
    }
  } catch (error) {
    console.error('Failed to handle AI failure:', error);
  }
}

async function createAlert(supabase: any, aiSystem: string, alertType: string, message: string, severity: string) {
  try {
    await supabase.from('ai_alerts').insert({
      ai_system: aiSystem,
      alert_type: alertType,
      message,
      severity,
      notified_admin: false,
      resolved: false
    });
  } catch (error) {
    console.error('Failed to create alert:', error);
  }
}
