import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import {
  Mic, MicOff, Volume2, VolumeX, Send, Sparkles,
  Code, Map, Brain, MessageCircle, RefreshCw
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  gestures?: string[];
  expressions?: string[];
  timestamp: Date;
}

interface GEOVAAvatarMentorProps {
  userContext?: {
    name?: string;
    skillLevel?: string;
    enrolledCourses?: string[];
  };
}

const GEOVAAvatarMentor: React.FC<GEOVAAvatarMentorProps> = ({ userContext }) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi${userContext?.name ? ` ${userContext.name}` : ''}! I'm GEOVA, your AI mentor for Geospatial Technology. I'm here to teach, guide, and help you master GIS, Remote Sensing, and GeoAI. Ask me anything!`,
      expressions: ['smile', 'welcoming'],
      gestures: ['wave'],
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'general' | 'teaching' | 'coding' | 'visualization' | 'mentor'>('general');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [avatarExpression, setAvatarExpression] = useState<string>('neutral');
  const [avatarGesture, setAvatarGesture] = useState<string>('idle');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "Please try speaking again or type your message.",
          variant: "destructive"
        });
      };
    }
  }, [toast]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice Not Supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setAvatarExpression('thinking');
    setAvatarGesture('listening');

    try {
      const { data, error } = await supabase.functions.invoke('geova-realtime-mentor', {
        body: {
          message: input,
          conversationHistory: messages.slice(-6).map(m => ({
            role: m.role,
            content: m.content
          })),
          userContext,
          mode
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        gestures: data.gestures || [],
        expressions: data.expressions || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Animate avatar based on response
      if (data.expressions?.length > 0) {
        setAvatarExpression(data.expressions[0]);
      }
      if (data.gestures?.length > 0) {
        setAvatarGesture(data.gestures[0]);
      }

      // Auto-speak response
      speakResponse(data.response);

      // Reset to neutral after animation
      setTimeout(() => {
        setAvatarExpression('neutral');
        setAvatarGesture('idle');
      }, 3000);

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Connection Error",
        description: "Couldn't reach GEOVA. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const modeIcons = {
    general: <MessageCircle className="w-4 h-4" />,
    teaching: <Brain className="w-4 h-4" />,
    coding: <Code className="w-4 h-4" />,
    visualization: <Map className="w-4 h-4" />,
    mentor: <Sparkles className="w-4 h-4" />
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)]">
      {/* Avatar Display */}
      <Card className="lg:w-2/5 p-6 flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        
        <div className="relative z-10 text-center">
          {/* Avatar Representation */}
          <div className="w-48 h-48 lg:w-64 lg:h-64 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse opacity-20" />
            <div className="absolute inset-2 bg-gradient-to-br from-primary via-purple-500 to-secondary rounded-full flex items-center justify-center">
              <Brain className="w-24 h-24 text-white" />
            </div>
            
            {/* Expression indicator */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
              <Badge className="bg-background/90 backdrop-blur">
                {avatarExpression}
              </Badge>
            </div>
          </div>

          <h3 className="text-2xl font-bold mb-2">GEOVA</h3>
          <p className="text-muted-foreground mb-4">Your AI Geospatial Mentor</p>
          
          {/* Status indicators */}
          <div className="flex gap-3 justify-center">
            <Badge variant={isListening ? "default" : "outline"} className="gap-1">
              {isListening ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
              {isListening ? 'Listening' : 'Idle'}
            </Badge>
            <Badge variant={isSpeaking ? "default" : "outline"} className="gap-1">
              {isSpeaking ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
              {isSpeaking ? 'Speaking' : 'Silent'}
            </Badge>
          </div>

          {/* Gesture animation */}
          {avatarGesture !== 'idle' && (
            <div className="mt-4">
              <Badge variant="secondary" className="animate-fade-in">
                <span className="text-xs">Gesture: {avatarGesture}</span>
              </Badge>
            </div>
          )}
        </div>
      </Card>

      {/* Chat Interface */}
      <Card className="lg:w-3/5 flex flex-col">
        {/* Mode Selector */}
        <div className="p-4 border-b flex gap-2 flex-wrap">
          {(['general', 'teaching', 'coding', 'visualization', 'mentor'] as const).map((m) => (
            <Button
              key={m}
              size="sm"
              variant={mode === m ? "default" : "outline"}
              onClick={() => setMode(m)}
              className="gap-2"
            >
              {modeIcons[m]}
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </Button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                
                {message.expressions && message.expressions.length > 0 && (
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {message.expressions.map((exp, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {exp}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-muted rounded-lg p-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask GEOVA anything about Geospatial Technology..."
              className="min-h-[60px]"
              disabled={isLoading}
            />
            <div className="flex flex-col gap-2">
              <Button
                onClick={toggleListening}
                variant={isListening ? "default" : "outline"}
                size="icon"
                disabled={isLoading}
              >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>
              <Button
                onClick={isSpeaking ? stopSpeaking : sendMessage}
                disabled={isLoading && !isSpeaking}
                size="icon"
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GEOVAAvatarMentor;
