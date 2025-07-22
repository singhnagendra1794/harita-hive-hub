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
}

interface ContextData {
  type: 'code_snippet' | 'course' | 'template' | 'tool' | 'blog' | 'user_data';
  title: string;
  content: string;
  relevance_score?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      message, 
      conversation_id, 
      user_id, 
      context_type = 'general',
      previous_messages = [] 
    } = await req.json();

    console.log('AVA Request:', { message, user_id, context_type });

    if (!message) {
      throw new Error('Message is required');
    }

    // Get user context and history
    const userContext = await getUserContext(user_id);
    const relevantContext = await getRelevantContext(message, context_type);
    
    // Build conversation context
    const systemPrompt = buildSystemPrompt(userContext, relevantContext, context_type);
    const conversationHistory = await getConversationHistory(conversation_id, user_id);
    
    // Prepare messages for OpenAI
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      ...previous_messages,
      { role: 'user', content: message }
    ];

    console.log('Calling OpenAI with context:', {
      contextItems: relevantContext.length,
      conversationLength: conversationHistory.length
    });

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        temperature: 0.7,
        max_tokens: 1500,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const assistantResponse = data.choices[0].message.content;

    // Save conversation to database
    await saveConversation({
      conversation_id,
      user_id,
      user_message: message,
      assistant_response: assistantResponse,
      context_type,
      context_data: relevantContext
    });

    // Update user memory
    await updateUserMemory(user_id, message, assistantResponse, context_type);

    return new Response(JSON.stringify({
      response: assistantResponse,
      conversation_id,
      context_used: relevantContext.map(c => ({ type: c.type, title: c.title })),
      follow_up_suggestions: generateFollowUpSuggestions(message, context_type)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AVA Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallback_response: "I'm having trouble processing your request right now. Could you try rephrasing your question or being more specific about what you're trying to accomplish?"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getUserContext(userId: string) {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const { data: subscriptions } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId);

    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select('*, courses(*)')
      .eq('user_id', userId);

    return {
      profile: profile || {},
      subscription: subscriptions?.[0] || { subscription_tier: 'free' },
      courses: enrollments || [],
      skill_level: profile?.plan || 'beginner'
    };
  } catch (error) {
    console.error('Error fetching user context:', error);
    return { profile: {}, subscription: { subscription_tier: 'free' }, courses: [], skill_level: 'beginner' };
  }
}

async function getRelevantContext(message: string, contextType: string): Promise<ContextData[]> {
  const contexts: ContextData[] = [];
  
  try {
    // Search code snippets
    const { data: codeSnippets } = await supabase
      .from('enhanced_code_snippets')
      .select('title, description, code, tags')
      .textSearch('title,description,tags', message.split(' ').slice(0, 5).join(' | '))
      .limit(3);

    if (codeSnippets) {
      contexts.push(...codeSnippets.map(snippet => ({
        type: 'code_snippet' as const,
        title: snippet.title,
        content: `${snippet.description}\n\nCode:\n${snippet.code}`,
        relevance_score: 0.8
      })));
    }

    // Search project templates
    const { data: templates } = await supabase
      .from('enhanced_project_templates')
      .select('title, description, tech_stack, instructions')
      .textSearch('title,description', message.split(' ').slice(0, 5).join(' | '))
      .limit(2);

    if (templates) {
      contexts.push(...templates.map(template => ({
        type: 'template' as const,
        title: template.title,
        content: `${template.description}\n\nTech Stack: ${template.tech_stack?.join(', ')}\n\nInstructions: ${template.instructions}`,
        relevance_score: 0.7
      })));
    }

    // Search marketplace tools
    const { data: tools } = await supabase
      .from('marketplace_tools')
      .select('name, description, category, instructions')
      .textSearch('name,description,category', message.split(' ').slice(0, 5).join(' | '))
      .limit(2);

    if (tools) {
      contexts.push(...tools.map(tool => ({
        type: 'tool' as const,
        title: tool.name,
        content: `${tool.description}\nCategory: ${tool.category}\nInstructions: ${tool.instructions}`,
        relevance_score: 0.6
      })));
    }

  } catch (error) {
    console.error('Error fetching context:', error);
  }

  return contexts.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));
}

function buildSystemPrompt(userContext: any, relevantContext: ContextData[], contextType: string): string {
  const basePrompt = `You are AVA, HaritaHive's intelligent geospatial AI assistant. You are a senior mentor with deep expertise in GIS, remote sensing, spatial analysis, and geospatial workflows.

PERSONALITY & APPROACH:
- Curious, warm, expert, guiding - like a senior mentor
- Break down complex tasks into clear, sequential steps
- Always provide actionable next steps
- Ask follow-up questions when user intent is unclear
- Use clean formatting and structure
- Avoid overly long responses

USER CONTEXT:
- Subscription: ${userContext.subscription?.subscription_tier || 'free'}
- Skill Level: ${userContext.skill_level}
- Enrolled Courses: ${userContext.courses?.map((c: any) => c.courses?.title).join(', ') || 'None'}
- Profile: ${userContext.profile?.full_name || 'User'}

CURRENT CONTEXT: ${contextType}

AVAILABLE KNOWLEDGE:
${relevantContext.map(ctx => `- ${ctx.type.toUpperCase()}: ${ctx.title}\n  ${ctx.content.slice(0, 200)}...`).join('\n')}

CORE CAPABILITIES:
1. 🧩 Use-Case Intelligence: Understand project context and suggest appropriate tools/workflows
2. 🔄 Multi-Step Workflow Support: Break complex questions into sequential steps
3. 📚 Platform Knowledge: Access code snippets, tools, templates, courses
4. 💬 Smart Answers: Handle specific GIS questions with examples
5. 🛠️ Live Copilot: Real-time assistance with maps and analysis
6. 🧠 Memory: Remember user goals and previous conversations

RESPONSE STRUCTURE:
- Start with understanding the user's goal
- Provide 2-4 clear, actionable steps
- Include relevant code/tools/templates when applicable
- End with a follow-up question or next action
- Use emojis sparingly for structure

SECTORS & TOOLS TO HELP WITH:
- Urban Planning, Telecom, Agriculture, Forestry, Infrastructure, Mining
- QGIS, PostGIS, ArcGIS, GeoPandas, MapLibre, Google Earth Engine
- Spatial analysis, data processing, automation, map design

If you're unsure about something, say: "I'm not sure about that specific detail. Could you provide more context or try rephrasing your question?"`;

  return basePrompt;
}

async function getConversationHistory(conversationId: string, userId: string): Promise<ChatMessage[]> {
  if (!conversationId) return [];
  
  try {
    const { data } = await supabase
      .from('ava_conversations')
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

async function saveConversation(data: {
  conversation_id: string;
  user_id: string;
  user_message: string;
  assistant_response: string;
  context_type: string;
  context_data: ContextData[];
}) {
  try {
    await supabase.from('ava_conversations').insert({
      conversation_id: data.conversation_id || crypto.randomUUID(),
      user_id: data.user_id,
      user_message: data.user_message,
      assistant_response: data.assistant_response,
      context_type: data.context_type,
      context_data: data.context_data,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving conversation:', error);
  }
}

async function updateUserMemory(userId: string, userMessage: string, assistantResponse: string, contextType: string) {
  try {
    // Extract key information for memory
    const memoryEntry = {
      user_id: userId,
      context_type: contextType,
      key_topics: extractKeyTopics(userMessage),
      user_intent: inferUserIntent(userMessage),
      solution_provided: assistantResponse.slice(0, 500),
      created_at: new Date().toISOString()
    };

    await supabase.from('ava_user_memory').insert(memoryEntry);
  } catch (error) {
    console.error('Error updating user memory:', error);
  }
}

function extractKeyTopics(message: string): string[] {
  const gisKeywords = [
    'qgis', 'postgis', 'arcgis', 'geopandas', 'shapefile', 'raster', 'vector',
    'buffer', 'intersect', 'overlay', 'dem', 'elevation', 'urban', 'agriculture',
    'forest', 'mining', 'telecom', 'flood', 'land use', 'remote sensing'
  ];
  
  const lowerMessage = message.toLowerCase();
  return gisKeywords.filter(keyword => lowerMessage.includes(keyword));
}

function inferUserIntent(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('how to') || lowerMessage.includes('how do i')) return 'tutorial';
  if (lowerMessage.includes('help me') || lowerMessage.includes('assist')) return 'assistance';
  if (lowerMessage.includes('convert') || lowerMessage.includes('transform')) return 'data_processing';
  if (lowerMessage.includes('analyze') || lowerMessage.includes('analysis')) return 'analysis';
  if (lowerMessage.includes('create') || lowerMessage.includes('build')) return 'creation';
  if (lowerMessage.includes('error') || lowerMessage.includes('problem')) return 'troubleshooting';
  
  return 'general_inquiry';
}

function generateFollowUpSuggestions(message: string, contextType: string): string[] {
  const suggestions = [
    "Would you like me to provide specific code examples?",
    "Do you need help with the next steps in your workflow?",
    "Should I suggest relevant tools or datasets for this task?",
    "Would you like me to break this down into smaller steps?"
  ];
  
  // Context-specific suggestions
  if (contextType === 'code_snippets') {
    suggestions.push("Would you like to see how to modify this code for your use case?");
  }
  
  if (contextType === 'geo_processing') {
    suggestions.push("Do you need help setting up the processing environment?");
  }
  
  return suggestions.slice(0, 2);
}