
import { useCallback } from 'react';
import { useChatbot } from '@/components/ai/ChatbotProvider';
import { useToast } from '@/hooks/use-toast';

export const useChatbotIntegration = () => {
  const { openChatbot, closeChatbot, toggleChatbot } = useChatbot();
  const { toast } = useToast();

  const askQuestion = useCallback((question: string) => {
    // Pre-populate the chatbot with a specific question
    openChatbot();
    
    // Store the question in localStorage for the chatbot to pick up
    localStorage.setItem('chatbot_prepopulated_question', question);
    
    toast({
      title: "Ava is ready to help!",
      description: "Your question has been prepared in the chat.",
    });
  }, [openChatbot, toast]);

  const showContextualHelp = useCallback((context: string, topic: string) => {
    const contextualQuestion = `I need help with ${topic} in the ${context} section. Can you guide me?`;
    askQuestion(contextualQuestion);
  }, [askQuestion]);

  return {
    openChatbot,
    closeChatbot,
    toggleChatbot,
    askQuestion,
    showContextualHelp
  };
};
