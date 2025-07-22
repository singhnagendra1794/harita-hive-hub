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
  const [conversationId] = useState(() => options.conversationId || crypto.randomUUID());
  const { user } = useAuth();
  const { toast } = useToast();

  const sendMessage = useCallback(async (messageText: string) => {
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
      const { data, error } = await supabase.functions.invoke('ava-assistant', {
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

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response || data.fallback_response || 'I apologize, but I encountered an issue processing your request.',
        timestamp: new Date().toISOString(),
        context_used: data.context_used || [],
        follow_up_suggestions: data.follow_up_suggestions || []
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AVA Error:', error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "I'm having trouble right now. Could you try rephrasing your question or being more specific about what you're trying to accomplish?",
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
  }, [messages, user, conversationId, options.contextType, toast]);

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

  return {
    messages,
    isLoading,
    conversationId,
    sendMessage,
    provideFeedback,
    clearConversation,
    getConversationHistory
  };
};