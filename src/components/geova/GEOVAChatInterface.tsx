import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Send, ThumbsUp, ThumbsDown, Brain, BookOpen, Target, Code, Map } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { GEOVAVoiceInterface } from './GEOVAVoiceInterface';

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

interface GEOVAChatInterfaceProps {
  contextType?: string;
  compact?: boolean;
  showVoiceControls?: boolean;
  initialMessage?: string;
}

export const GEOVAChatInterface: React.FC<GEOVAChatInterfaceProps> = ({
  contextType = 'learning',
  compact = false,
  showVoiceControls = true,
  initialMessage
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const [conversationId] = useState(() => crypto.randomUUID());
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakFunction, setSpeakFunction] = useState<((text: string) => void) | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `Hi! I'm GEOVA – your personal AI Geospatial Mentor! 🌍✨

I'm here to guide you through your 120-day journey to becoming a geospatial professional. Whether you're a complete beginner or looking to advance your skills, I'll help you master:

🗺️ **GIS Tools**: QGIS, ArcGIS, PostGIS, Python for GIS
🏙️ **Real Applications**: Urban planning, agriculture, forestry, telecom, mining
🚀 **Career Skills**: Spatial analysis, automation, web mapping
📈 **Your Growth**: Personalized learning path and progress tracking

**What would you like to explore today?**
- "I'm new to GIS - where do I start?"
- "Help me with a specific QGIS task"
- "Show me Python code for spatial analysis"
- "I need help with my current project"

Ready to unlock the power of geospatial technology? Ask me anything! 🎯`,
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);

    // Handle initial message if provided
    if (initialMessage) {
      handleSendMessage(initialMessage);
    }
  }, [initialMessage]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || !user) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('geova-mentor', {
        body: {
          message: textToSend,
          conversation_id: conversationId,
          user_id: user.id,
          context_type: contextType,
          mode: voiceEnabled ? 'voice' : 'chat',
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

      // Speak the response if voice is enabled
      if (voiceEnabled && speakFunction && data.response) {
        speakFunction(data.response);
      }

    } catch (error) {
      console.error('GEOVA Error:', error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "I'm having some technical difficulties right now! 🔧 Could you try rephrasing your question? I'm eager to help you learn! 📚",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection Issue",
        description: "GEOVA is having trouble connecting. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeechToText = (text: string) => {
    setInput(text);
    handleSendMessage(text);
  };

  const handleTextToSpeech = (speakFn: (text: string) => void) => {
    setSpeakFunction(() => speakFn);
  };

  const provideFeedback = async (messageId: string, feedback: number) => {
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
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`flex flex-col ${compact ? 'h-96' : 'h-[600px]'} bg-background border rounded-lg shadow-lg`}>
      {/* Header */}
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-secondary/10 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-primary/20">
              <AvatarImage src="/geova-avatar.png" alt="GEOVA" />
              <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                GV
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-lg">GEOVA</h3>
              <p className="text-sm text-muted-foreground">Your AI Geospatial Mentor</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Brain className="w-3 h-3" />
              {contextType}
            </Badge>
          </div>
        </div>
      </CardHeader>

      {/* Voice Interface */}
      {showVoiceControls && (
        <div className="p-3 border-b">
          <GEOVAVoiceInterface
            onTextToSpeech={handleTextToSpeech}
            onSpeechToText={handleSpeechToText}
            isListening={isListening}
            setIsListening={setIsListening}
            voiceEnabled={voiceEnabled}
            setVoiceEnabled={setVoiceEnabled}
          />
        </div>
      )}

      {/* Messages */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && (
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarImage src="/geova-avatar.png" alt="GEOVA" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      GV
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-[85%] ${message.role === 'user' ? 'order-1' : ''}`}>
                  <div className={`rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground ml-auto' 
                      : 'bg-muted'
                  }`}>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    
                    {/* Learning Context */}
                    {message.learning_context && message.learning_context.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-medium opacity-75">📚 Related Learning:</p>
                        <div className="flex flex-wrap gap-1">
                          {message.learning_context.map((context, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {context.type === 'course' && <BookOpen className="w-3 h-3 mr-1" />}
                              {context.type === 'skill' && <Code className="w-3 h-3 mr-1" />}
                              {context.type === 'project' && <Map className="w-3 h-3 mr-1" />}
                              {context.title}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Progress Update */}
                    {message.progress_update && (
                      <div className="mt-3 p-2 bg-background/50 rounded">
                        <p className="text-xs font-medium mb-1">📈 Your Progress:</p>
                        <Progress value={message.progress_update.progress_percentage} className="h-2" />
                        <p className="text-xs mt-1">
                          {message.progress_update.completed_lessons}/{message.progress_update.total_lessons} lessons completed
                        </p>
                      </div>
                    )}

                    {/* Recommendations */}
                    {message.recommendations && message.recommendations.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-medium opacity-75">💡 Recommended Next:</p>
                        {message.recommendations.map((rec, idx) => (
                          <div key={idx} className="text-xs p-2 bg-background/30 rounded">
                            <span className="font-medium">{rec.title}</span>
                            <p className="opacity-75">{rec.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Next Lesson */}
                    {message.next_lesson_suggestion && (
                      <div className="mt-3 p-2 bg-background/50 rounded">
                        <p className="text-xs font-medium mb-1">🎯 Next Lesson:</p>
                        <p className="text-xs font-medium">{message.next_lesson_suggestion.title}</p>
                        <p className="text-xs opacity-75">{message.next_lesson_suggestion.description}</p>
                        <p className="text-xs opacity-50 mt-1">⏱️ {message.next_lesson_suggestion.estimated_time}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Feedback buttons for assistant messages */}
                  {message.role === 'assistant' && message.id !== 'welcome' && (
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => provideFeedback(message.id, 1)}
                        className={`h-6 px-2 ${message.feedback === 1 ? 'bg-green-100 text-green-700' : ''}`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => provideFeedback(message.id, -1)}
                        className={`h-6 px-2 ${message.feedback === -1 ? 'bg-red-100 text-red-700' : ''}`}
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/geova-avatar.png" alt="GEOVA" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    GV
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-muted-foreground">GEOVA is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Input */}
      <div className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask GEOVA about GIS, career advice, or any geospatial topic..."
            disabled={isLoading || isListening}
            className="flex-1"
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading || isListening}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          💡 Try: "Help me start with QGIS" or "Show me Python code for spatial analysis"
        </p>
      </div>
    </div>
  );
};