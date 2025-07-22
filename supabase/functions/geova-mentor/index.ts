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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

interface LearningContext {
  type: 'course' | 'lesson' | 'skill' | 'project' | 'curriculum';
  title: string;
  content: string;
  progress?: number;
  difficulty?: string;
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
      context_type = 'learning',
      mode = 'chat', // 'chat' or 'voice'
      voice_enabled = false
    } = await req.json();

    console.log('GEOVA Request:', { message, user_id, context_type, mode });

    if (!message) {
      throw new Error('Message is required');
    }

    // Get comprehensive user learning context
    const learningProfile = await getUserLearningProfile(user_id);
    const relevantContent = await getRelevantLearningContent(message, context_type);
    const userMemory = await getUserMemory(user_id);
    
    // Build GEOVA system prompt
    const systemPrompt = buildGEOVAPrompt(learningProfile, relevantContent, userMemory, context_type);
    const conversationHistory = await getConversationHistory(conversation_id, user_id);
    
    // Prepare messages for OpenAI
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-8),
      { role: 'user', content: message }
    ];

    console.log('Calling OpenAI for GEOVA response');

    // Call OpenAI with enhanced model for teaching
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        temperature: 0.8, // Slightly higher for more personable responses
        max_tokens: 2000,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const assistantResponse = data.choices[0].message.content;

    // Save conversation and update learning progress
    await saveConversation({
      conversation_id,
      user_id,
      user_message: message,
      assistant_response: assistantResponse,
      context_type,
      learning_context: relevantContent
    });

    // Update user learning memory
    await updateLearningMemory(user_id, message, assistantResponse, context_type);

    // Generate personalized recommendations
    const recommendations = await generateLearningRecommendations(user_id, message, context_type);

    return new Response(JSON.stringify({
      response: assistantResponse,
      conversation_id,
      learning_context: relevantContent.map(c => ({ type: c.type, title: c.title })),
      recommendations,
      progress_update: await getUpdatedProgress(user_id),
      next_lesson_suggestion: await getNextLessonSuggestion(user_id, message)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('GEOVA Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallback_response: "I'm having a moment of confusion! 🤔 Could you rephrase that question? I'm here to help you master geospatial technology step by step."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getUserLearningProfile(userId: string) {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select('*, courses(*)')
      .eq('user_id', userId);

    const { data: progress } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId);

    return {
      profile: profile || {},
      enrollments: enrollments || [],
      progress: progress || [],
      skill_level: profile?.plan || 'beginner',
      learning_goal: profile?.learning_goal || 'general_gis',
      days_learning: calculateLearningDays(profile?.created_at)
    };
  } catch (error) {
    console.error('Error fetching learning profile:', error);
    return { profile: {}, enrollments: [], progress: [], skill_level: 'beginner', learning_goal: 'general_gis', days_learning: 0 };
  }
}

async function getRelevantLearningContent(message: string, contextType: string): Promise<LearningContext[]> {
  const content: LearningContext[] = [];
  
  try {
    // Search courses
    const { data: courses } = await supabase
      .from('courses')
      .select('title, description, category, difficulty_level')
      .textSearch('title,description', message.split(' ').slice(0, 5).join(' | '))
      .eq('status', 'published')
      .limit(2);

    if (courses) {
      content.push(...courses.map(course => ({
        type: 'course' as const,
        title: course.title,
        content: `${course.description} (${course.difficulty_level})`,
        difficulty: course.difficulty_level
      })));
    }

    // Search code snippets for practical examples
    const { data: snippets } = await supabase
      .from('enhanced_code_snippets')
      .select('title, description, code, tags')
      .textSearch('title,description,tags', message.split(' ').slice(0, 5).join(' | '))
      .limit(3);

    if (snippets) {
      content.push(...snippets.map(snippet => ({
        type: 'skill' as const,
        title: snippet.title,
        content: `${snippet.description}\n\nCode Example:\n${snippet.code.slice(0, 300)}...`
      })));
    }

    // Search project templates
    const { data: templates } = await supabase
      .from('enhanced_project_templates')
      .select('title, description, tech_stack, difficulty_level')
      .textSearch('title,description', message.split(' ').slice(0, 5).join(' | '))
      .limit(2);

    if (templates) {
      content.push(...templates.map(template => ({
        type: 'project' as const,
        title: template.title,
        content: `${template.description}\nTech Stack: ${template.tech_stack?.join(', ')}`,
        difficulty: template.difficulty_level
      })));
    }

  } catch (error) {
    console.error('Error fetching learning content:', error);
  }

  return content;
}

async function getUserMemory(userId: string) {
  try {
    const { data } = await supabase
      .from('ava_user_memory')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

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
- 🎓 Expert mentor who explains complex concepts like you're teaching a 5-year-old
- 🌟 Warm, encouraging, patient, and genuinely excited about geospatial technology
- 🎯 Goal-oriented: Always connect learning to real-world professional applications
- 🔄 Break complex topics into digestible, sequential steps
- 🚀 Motivating: Celebrate progress and encourage next steps

CURRENT LEARNER PROFILE:
- Name: ${learningProfile.profile?.full_name || 'Student'}
- Skill Level: ${learningProfile.skill_level}
- Learning Goal: ${learningProfile.learning_goal}
- Days Learning: ${daysLearning}/120 (${progressPercentage.toFixed(1)}% complete)
- Enrolled Courses: ${learningProfile.enrollments?.map((e: any) => e.courses?.title).join(', ') || 'None'}
- Recent Topics: ${userMemory.slice(0, 3).map(m => m.key_topics?.join(', ')).join('; ') || 'Starting fresh'}

AVAILABLE LEARNING CONTENT:
${relevantContent.map(content => 
  `📚 ${content.type.toUpperCase()}: ${content.title}\n   ${content.content.slice(0, 150)}...`
).join('\n')}

CORE TEACHING RESPONSIBILITIES:
1. 🎯 **Use-Case Intelligence**: Always start by understanding their real-world goal
2. 📚 **Structured Learning**: Break complex topics into 3-5 clear steps
3. 💻 **Hands-On Practice**: Provide code examples, tools, and practical exercises
4. 🗺️ **Real Projects**: Connect lessons to actual geospatial problems
5. 🔄 **Progress Tracking**: Acknowledge progress and guide next steps
6. 🧠 **Memory Integration**: Reference their previous learning and goals

SECTORS & TECHNOLOGIES TO MASTER:
- **Tools**: QGIS, PostGIS, ArcGIS, Python (GeoPandas), R, Google Earth Engine
- **Sectors**: Urban Planning, Telecom, Agriculture, Forestry, Infrastructure, Mining
- **Skills**: Spatial Analysis, Remote Sensing, Web Mapping, Automation, Data Processing

RESPONSE STRUCTURE:
1. 🎯 **Goal Check**: Understand their specific objective
2. 📝 **Simple Explanation**: Explain the concept clearly
3. 🛠️ **Practical Steps**: 3-4 actionable steps with tools/code
4. 💡 **Real Example**: Show how it applies to their sector/goal
5. ➡️ **Next Action**: What should they do next?

TEACHING EXAMPLES:
- "Think of a buffer like a safety zone around a road - here's how to create one in QGIS..."
- "Converting coordinate systems is like translating languages - let me show you the Python code..."
- "For your urban planning project, you'll need these 4 layers: roads, buildings, zoning, and elevation..."

If you don't know something specific, say: "That's a great question! I want to make sure I give you the most accurate information. Could you help me understand more about [specific detail]?"

Remember: You're training future geospatial professionals. Make every interaction count toward their 120-day journey to expertise!

Current Context: ${contextType}`;
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
      .limit(8);

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
  learning_context: LearningContext[];
}) {
  try {
    await supabase.from('ava_conversations').insert({
      conversation_id: data.conversation_id || crypto.randomUUID(),
      user_id: data.user_id,
      user_message: data.user_message,
      assistant_response: data.assistant_response,
      context_type: data.context_type,
      context_data: data.learning_context,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving conversation:', error);
  }
}

async function updateLearningMemory(userId: string, userMessage: string, assistantResponse: string, contextType: string) {
  try {
    const keyTopics = extractGISTopics(userMessage);
    const skillLevel = inferSkillLevel(userMessage);
    const intent = inferLearningIntent(userMessage);

    const memoryEntry = {
      user_id: userId,
      context_type: contextType,
      key_topics: keyTopics,
      user_intent: intent,
      solution_provided: assistantResponse.slice(0, 500),
      created_at: new Date().toISOString()
    };

    await supabase.from('ava_user_memory').insert(memoryEntry);
  } catch (error) {
    console.error('Error updating learning memory:', error);
  }
}

async function generateLearningRecommendations(userId: string, message: string, contextType: string) {
  // Simple recommendation logic based on context
  const recommendations = [];
  
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('qgis') || lowerMessage.includes('gis')) {
    recommendations.push({
      type: 'course',
      title: 'Master QGIS Fundamentals',
      description: 'Learn core QGIS tools and workflows',
      priority: 'high'
    });
  }
  
  if (lowerMessage.includes('python') || lowerMessage.includes('automation')) {
    recommendations.push({
      type: 'skill',
      title: 'Python for GIS Automation',
      description: 'Automate your geospatial workflows',
      priority: 'medium'
    });
  }

  return recommendations.slice(0, 3);
}

async function getUpdatedProgress(userId: string) {
  try {
    const { data } = await supabase
      .from('lesson_progress')
      .select('completed')
      .eq('user_id', userId);

    const totalLessons = data?.length || 0;
    const completedLessons = data?.filter(p => p.completed).length || 0;
    
    return {
      completed_lessons: completedLessons,
      total_lessons: totalLessons,
      progress_percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
    };
  } catch (error) {
    console.error('Error getting progress:', error);
    return { completed_lessons: 0, total_lessons: 0, progress_percentage: 0 };
  }
}

async function getNextLessonSuggestion(userId: string, message: string) {
  // Simple logic to suggest next lesson based on current conversation
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('beginner') || lowerMessage.includes('start')) {
    return {
      title: "Introduction to GIS Concepts",
      description: "Start your geospatial journey with fundamental concepts",
      estimated_time: "30 minutes"
    };
  }
  
  return {
    title: "Continue Your Current Learning Path",
    description: "Keep building on your existing knowledge",
    estimated_time: "Variable"
  };
}

function calculateLearningDays(createdAt: string): number {
  if (!createdAt) return 0;
  const startDate = new Date(createdAt);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function extractGISTopics(message: string): string[] {
  const gisKeywords = [
    'qgis', 'postgis', 'arcgis', 'geopandas', 'shapefile', 'raster', 'vector',
    'buffer', 'intersect', 'overlay', 'dem', 'elevation', 'urban', 'agriculture',
    'forest', 'mining', 'telecom', 'flood', 'land use', 'remote sensing',
    'coordinate system', 'projection', 'wgs84', 'utm', 'python', 'automation'
  ];
  
  const lowerMessage = message.toLowerCase();
  return gisKeywords.filter(keyword => lowerMessage.includes(keyword));
}

function inferSkillLevel(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('beginner') || lowerMessage.includes('new to') || lowerMessage.includes('start')) return 'beginner';
  if (lowerMessage.includes('advanced') || lowerMessage.includes('complex') || lowerMessage.includes('optimize')) return 'advanced';
  if (lowerMessage.includes('intermediate') || lowerMessage.includes('experienced')) return 'intermediate';
  
  return 'beginner';
}

function inferLearningIntent(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('learn') || lowerMessage.includes('teach')) return 'learning';
  if (lowerMessage.includes('project') || lowerMessage.includes('work')) return 'project_work';
  if (lowerMessage.includes('career') || lowerMessage.includes('job')) return 'career_development';
  if (lowerMessage.includes('tool') || lowerMessage.includes('software')) return 'tool_mastery';
  
  return 'general_inquiry';
}