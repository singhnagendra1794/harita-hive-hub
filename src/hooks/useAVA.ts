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
  context_used?: Array<{ type: string; title: string }>;
  follow_up_suggestions?: string[];
}

interface UseAVAOptions {
  contextType?: string;
  conversationId?: string;
}

export const useAVA = (options: UseAVAOptions = {}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHealthy, setIsHealthy] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [conversationId] = useState(() => options.conversationId || crypto.randomUUID());
  const { user } = useAuth();
  const { toast } = useToast();

  // Initialize with welcome message
  useState(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "Hi! I'm AVA — your Geospatial Copilot. I can help you with GIS workflows, spatial analysis, QGIS tutorials, code examples, and more. Ask me anything about mapping or geospatial technology! 🗺️\n\nTry asking: 'How do I create a buffer in QGIS?' or 'Show me Python code for reading shapefiles'",
        timestamp: new Date().toISOString(),
        follow_up_suggestions: [
          "How do I get started with QGIS?",
          "Show me Python code for spatial analysis",
          "Help me with PostGIS queries",
          "What's the best way to style maps?"
        ]
      };
      setMessages([welcomeMessage]);
    }
  });

  const sendMessage = useCallback(async (messageText: string, isRetry = false) => {
    if (!messageText.trim() || !user) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date().toISOString()
    };

    if (!isRetry) {
      setMessages(prev => [...prev, userMessage]);
    }
    setIsLoading(true);

    try {
      // Add timeout wrapper
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );

      const responsePromise = supabase.functions.invoke('ava-assistant', {
        body: {
          message: messageText.trim(),
          conversation_id: conversationId,
          user_id: user.id,
          context_type: options.contextType || 'general',
          previous_messages: messages.slice(-5).map(m => ({
            role: m.role,
            content: m.content
          }))
        }
      });

      const { data, error } = await Promise.race([responsePromise, timeoutPromise]) as any;

      if (error) {
        console.error('AVA Edge Function Error:', error);
        throw new Error(error.message || 'Failed to get response from AVA');
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response || data.fallback_response || 'I apologize, but I encountered an issue processing your request.',
        timestamp: new Date().toISOString(),
        context_used: data.context_used || [],
        follow_up_suggestions: data.follow_up_suggestions || []
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsHealthy(true);
      setRetryCount(0);
      return assistantMessage;

    } catch (error) {
      console.error('AVA Error:', error);
      
      // Retry logic for mild failures
      if (retryCount < 2 && !isRetry) {
        console.log(`Retrying AVA request... Attempt ${retryCount + 1}`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => sendMessage(messageText, true), 1000);
        return;
      }

      setIsHealthy(false);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: retryCount >= 2 
          ? "I'm temporarily unavailable after multiple attempts. Please check your connection and try again later, or email support@haritahive.com for assistance. 🚧"
          : "I'm having trouble right now. Could you try rephrasing your question or being more specific about what you're trying to accomplish? 🔧",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection Issue",
        description: "AVA is having trouble connecting. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, conversationId, options.contextType, toast, retryCount, messages]);

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
        title: "Feedback Saved",
        description: "Thank you for helping improve AVA!",
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
        .select('user_message, assistant_response, created_at, feedback')
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
          feedback: conv.feedback
        }
      ]) || [];
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      return [];
    }
  }, [conversationId, user]);

  // Health check function
  const testConnection = useCallback(async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('ava-assistant', {
        body: {
          message: "Hello AVA, can you hear me?",
          conversation_id: "health-check",
          user_id: user?.id || "test",
          context_type: "health_check"
        }
      });
      
      const isConnected = !error;
      setIsHealthy(isConnected);
      
      toast({
        title: isConnected ? "✅ AVA is Online" : "❌ AVA is Offline",
        description: isConnected 
          ? "AVA is responding properly!" 
          : "AVA is having connection issues.",
        variant: isConnected ? "default" : "destructive"
      });
      
      return isConnected;
    } catch (error) {
      setIsHealthy(false);
      toast({
        title: "❌ Connection Test Failed",
        description: "Could not reach AVA. Please try again later.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  return {
    messages,
    isLoading,
    isHealthy,
    conversationId,
    sendMessage,
    provideFeedback,
    clearConversation,
    getConversationHistory,
    testConnection
  };
};