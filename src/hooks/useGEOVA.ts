import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  feedback?: number;
  learning_context?: Array<{ type: string; title: string }>;
  recommendations?: Array<{ type: string; title: string; description: string; priority: string }>;
  progress_update?: { completed_lessons: number; total_lessons: number; progress_percentage: number };
  next_lesson_suggestion?: { title: string; description: string; estimated_time: string };
}

interface UseGEOVAOptions {
  contextType?: string;
  conversationId?: string;
  voiceEnabled?: boolean;
}

interface LearningProgress {
  completed_lessons: number;
  total_lessons: number;
  progress_percentage: number;
  current_skill_level: string;
  days_learning: number;
  learning_streak: number;
}

export const useGEOVA = (options: UseGEOVAOptions = {}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(options.voiceEnabled || false);
  const [learningProgress, setLearningProgress] = useState<LearningProgress | null>(null);
  const [conversationId] = useState(() => options.conversationId || crypto.randomUUID());
  const { user } = useAuth();
  const { toast } = useToast();

  const sendMessage = useCallback(async (messageText: string, mode: 'chat' | 'voice' = 'chat') => {
    if (!messageText.trim() || !user) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('geova-mentor', {
        body: {
          message: messageText.trim(),
          conversation_id: conversationId,
          user_id: user.id,
          context_type: options.contextType || 'learning',
          mode,
          voice_enabled: voiceEnabled
        }
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response || "I'm having a moment of confusion! 🤔 Could you rephrase that question?",
        timestamp: new Date().toISOString(),
        learning_context: data.learning_context || [],
        recommendations: data.recommendations || [],
        progress_update: data.progress_update,
        next_lesson_suggestion: data.next_lesson_suggestion
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update learning progress if provided
      if (data.progress_update) {
        setLearningProgress(data.progress_update);
      }

      return assistantMessage;

    } catch (error) {
      console.error('GEOVA Error:', error);
      
      let errorContent = "I'm experiencing a temporary issue. Please try again in a few seconds.";
      
      // Check for specific error types
      const errorMessage = error?.message || error?.toString() || '';
      if (errorMessage.includes('quota') || errorMessage.includes('429')) {
        errorContent = "I'm currently experiencing high demand due to API limits. Our team has been notified. Please try again later or contact support@haritahive.com for assistance. 💸";
      } else if (errorMessage.includes('timeout')) {
        errorContent = "My response took too long. Please try asking a simpler question or try again. ⏱️";
      } else if (errorMessage.includes('API key')) {
        errorContent = "I'm having configuration issues. Please contact support@haritahive.com. 🔧";
      }
      
      const assistantErrorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantErrorMessage]);
      
      toast({
        title: "Service Issue", 
        description: "GEOVA is temporarily unavailable",
        variant: "destructive"
      });

      return assistantErrorMessage;
    } finally {
      setIsLoading(false);
    }
  }, [user, conversationId, options.contextType, voiceEnabled, toast]);

  const sendVoiceMessage = useCallback(async (messageText: string) => {
    return await sendMessage(messageText, 'voice');
  }, [sendMessage]);

  const provideFeedback = useCallback(async (messageId: string, feedback: number) => {
    try {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, feedback } : msg
        )
      );

      await supabase
        .from('ava_conversations')
        .update({ feedback })
        .eq('conversation_id', conversationId)
        .eq('user_id', user?.id);

      toast({
        title: feedback === 1 ? "Thanks! 👍" : "Noted! 👎",
        description: "Your feedback helps GEOVA learn and improve!",
      });
    } catch (error) {
      console.error('Error saving feedback:', error);
    }
  }, [conversationId, user, toast]);

  const clearConversation = useCallback(() => {
    setMessages([]);
  }, []);

  const getConversationHistory = useCallback(async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('ava_conversations')
        .select('user_message, assistant_response, created_at, feedback, context_data')
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data?.flatMap(conv => [
        {
          id: crypto.randomUUID(),
          role: 'user' as const,
          content: conv.user_message,
          timestamp: conv.created_at
        },
        {
          id: crypto.randomUUID(),
          role: 'assistant' as const,
          content: conv.assistant_response,
          timestamp: conv.created_at,
          feedback: conv.feedback,
          learning_context: conv.context_data || []
        }
      ]) || [];
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      return [];
    }
  }, [conversationId, user]);

  const getLearningProgress = useCallback(async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const totalLessons = data?.length || 0;
      const completedLessons = data?.filter(p => p.completed).length || 0;
      
      const progress: LearningProgress = {
        completed_lessons: completedLessons,
        total_lessons: totalLessons,
        progress_percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        current_skill_level: 'beginner', // This would come from user profile
        days_learning: 0, // Calculate from user creation date
        learning_streak: 0 // Track consecutive days of learning
      };

      setLearningProgress(progress);
      return progress;
    } catch (error) {
      console.error('Error fetching learning progress:', error);
      return null;
    }
  }, [user]);

  const askQuickQuestion = useCallback(async (category: string) => {
    const quickQuestions = {
      'getting-started': "I'm new to GIS and want to know where to start. Can you guide me through the basics?",
      'qgis-help': "I need help with a QGIS task. Can you show me the basic workflow?",
      'python-gis': "Show me some Python code examples for spatial analysis with GeoPandas.",
      'career-advice': "What skills do I need to become a professional in geospatial technology?",
      'project-help': "I'm working on a geospatial project and need guidance on the approach.",
      'tools-comparison': "What are the differences between QGIS, ArcGIS, and other GIS tools?"
    };

    const question = quickQuestions[category as keyof typeof quickQuestions] || quickQuestions['getting-started'];
    return await sendMessage(question);
  }, [sendMessage]);

  const setListeningState = useCallback((listening: boolean) => {
    setIsListening(listening);
  }, []);

  const setSpeakingState = useCallback((speaking: boolean) => {
    setIsSpeaking(speaking);
  }, []);

  const toggleVoice = useCallback(() => {
    setVoiceEnabled(prev => !prev);
  }, []);

  return {
    // State
    messages,
    isLoading,
    isListening,
    isSpeaking,
    voiceEnabled,
    learningProgress,
    conversationId,

    // Actions
    sendMessage,
    sendVoiceMessage,
    provideFeedback,
    clearConversation,
    getConversationHistory,
    getLearningProgress,
    askQuickQuestion,

    // Voice controls
    setListeningState,
    setSpeakingState,
    toggleVoice,
    setVoiceEnabled
  };
};

export type { ChatMessage, LearningProgress, UseGEOVAOptions };