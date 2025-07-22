import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Send, 
  ThumbsUp, 
  ThumbsDown, 
  Sparkles, 
  Brain, 
  Loader2,
  Copy,
  MessageSquare,
  Lightbulb
} from 'lucide-react';
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

interface AVAChatInterfaceProps {
  contextType?: string;
  className?: string;
  initialMessage?: string;
  compact?: boolean;
}

export const AVAChatInterface: React.FC<AVAChatInterfaceProps> = ({
  contextType = 'general',
  className = '',
  initialMessage = '',
  compact = false
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(initialMessage);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      handleSendMessage(initialMessage);
    }
  }, [initialMessage]);

  const handleSendMessage = async (messageText: string = input) => {
    if (!messageText.trim() || !user) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ava-assistant', {
        body: {
          message: messageText.trim(),
          conversation_id: conversationId,
          user_id: user.id,
          context_type: contextType,
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
  };

  const handleFeedback = async (messageId: string, feedback: number) => {
    try {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, feedback } : msg
        )
      );

      // Save feedback to database
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
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Response copied successfully!"
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  if (compact) {
    return (
      <div className={`bg-background border rounded-lg ${className}`}>
        <div className="p-3 border-b flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <span className="font-medium">AVA Assistant</span>
          <Badge variant="secondary" className="text-xs">
            {contextType}
          </Badge>
        </div>
        
        <ScrollArea className="h-64 p-3">
          <div className="space-y-3">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onFeedback={handleFeedback}
                onCopy={copyToClipboard}
                compact
              />
            ))}
            {isLoading && <LoadingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-3 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AVA anything..."
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button 
              onClick={() => handleSendMessage()} 
              disabled={!input.trim() || isLoading}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <span>AVA - Your Geospatial AI Assistant</span>
          </div>
          <Badge variant="outline" className="ml-auto">
            {contextType}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Ask me about GIS workflows, tools, spatial analysis, and more!
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <ScrollArea className="h-96 pr-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-3 text-primary/50" />
                <p className="text-lg font-medium mb-2">Hi! I'm AVA 👋</p>
                <p>I'm here to help you with geospatial workflows, GIS tools, and spatial analysis.</p>
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Try asking me:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      "How to convert shapefile to WGS84?",
                      "Best practices for flood modeling",
                      "QGIS vs PostGIS for analysis"
                    ].map((suggestion, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onFeedback={handleFeedback}
                onCopy={copyToClipboard}
              />
            ))}
            
            {isLoading && <LoadingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AVA about GIS workflows, tools, analysis..."
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button 
              onClick={() => handleSendMessage()} 
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MessageBubble: React.FC<{
  message: ChatMessage;
  onFeedback: (messageId: string, feedback: number) => void;
  onCopy: (text: string) => void;
  compact?: boolean;
}> = ({ message, onFeedback, onCopy, compact = false }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <Avatar className={compact ? 'w-6 h-6' : 'w-8 h-8'}>
          <AvatarImage src="/ava-avatar.png" alt="AVA" />
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Brain className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[80%] ${isUser ? 'text-right' : 'text-left'}`}>
        <div
          className={`inline-block p-3 rounded-lg ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          } ${compact ? 'text-sm' : ''}`}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>
          
          {message.context_used && message.context_used.length > 0 && (
            <div className="mt-2 pt-2 border-t border-muted-foreground/20">
              <p className="text-xs opacity-70 mb-1">Sources used:</p>
              <div className="flex flex-wrap gap-1">
                {message.context_used.map((ctx, idx) => (
                  <Badge 
                    key={idx} 
                    variant="secondary" 
                    className="text-xs"
                  >
                    {ctx.type}: {ctx.title.slice(0, 20)}...
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {!isUser && (
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFeedback(message.id, 1)}
              className={`h-6 px-2 ${message.feedback === 1 ? 'text-green-600' : ''}`}
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFeedback(message.id, -1)}
              className={`h-6 px-2 ${message.feedback === -1 ? 'text-red-600' : ''}`}
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopy(message.content)}
              className="h-6 px-2"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        )}

        {message.follow_up_suggestions && message.follow_up_suggestions.length > 0 && (
          <div className="mt-2 space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Lightbulb className="h-3 w-3" />
              Follow-up suggestions:
            </p>
            {message.follow_up_suggestions.map((suggestion, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="text-xs mr-1 mb-1"
                onClick={() => {/* Would need to pass up to parent */}}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}
        
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

const LoadingIndicator: React.FC = () => (
  <div className="flex gap-3 justify-start">
    <Avatar className="w-8 h-8">
      <AvatarFallback className="bg-primary text-primary-foreground">
        <Brain className="h-4 w-4" />
      </AvatarFallback>
    </Avatar>
    <div className="bg-muted p-3 rounded-lg flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm">AVA is thinking...</span>
    </div>
  </div>
);