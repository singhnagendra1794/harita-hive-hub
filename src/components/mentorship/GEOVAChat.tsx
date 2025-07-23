import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGEOVA } from "@/hooks/useGEOVA";
import { GEOVAVoiceInterface } from "@/components/geova/GEOVAVoiceInterface";
import { Bot, User, Send, Mic, MicOff, X, Minimize2, Maximize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GEOVAChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GEOVAChat = ({ isOpen, onClose }: GEOVAChatProps) => {
  const [inputMessage, setInputMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isLoading,
    voiceEnabled,
    isListening,
    isSpeaking,
    sendMessage,
    toggleVoice,
    setListeningState,
    setSpeakingState
  } = useGEOVA({
    contextType: 'mentorship',
    voiceEnabled: false
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    await sendMessage(inputMessage);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextToSpeech = (text: string) => {
    // This will be called by the voice interface when TTS is ready
    console.log('Speaking text:', text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={`w-96 transition-all duration-300 ${isMinimized ? 'h-16' : 'h-[600px]'} shadow-xl border-primary/20`}>
        {/* Header */}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="relative">
                <Bot className="h-6 w-6 text-primary" />
                {isSpeaking && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                )}
              </div>
              GEOVA AI Mentor
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {voiceEnabled ? 'Voice On' : 'Text Only'}
              </Badge>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="flex flex-col h-[520px] p-4 pt-0">
            {/* Messages */}
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="font-medium mb-2">Hi! I'm GEOVA 👋</h3>
                    <p className="text-sm">
                      I'm your AI mentor for geospatial technology. Ask me anything about:
                    </p>
                    <div className="text-xs mt-2 space-y-1">
                      <div>• GIS workflows & best practices</div>
                      <div>• QGIS, ArcGIS, Python tutorials</div>
                      <div>• Career guidance & learning paths</div>
                      <div>• Spatial analysis & remote sensing</div>
                    </div>
                  </div>
                )}
                
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground ml-auto' 
                        : 'bg-muted'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      
                      {/* Show recommendations if available */}
                      {message.recommendations && message.recommendations.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <h4 className="text-xs font-semibold opacity-75">Recommendations:</h4>
                          {message.recommendations.map((rec, idx) => (
                            <div key={idx} className="text-xs p-2 bg-background/50 rounded border-l-2 border-primary/50">
                              <div className="font-medium">{rec.title}</div>
                              <div className="opacity-75">{rec.description}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Voice Interface */}
            {voiceEnabled && (
              <div className="border-t pt-3">
                <GEOVAVoiceInterface
                  onTextToSpeech={(speakFn) => speakFn("Ready to speak")}
                  onSpeechToText={sendMessage}
                  isListening={isListening}
                  setIsListening={setListeningState}
                  voiceEnabled={voiceEnabled}
                  setVoiceEnabled={toggleVoice}
                />
              </div>
            )}

            {/* Input */}
            <div className="border-t pt-3 space-y-3">
              <div className="flex gap-2">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask GEOVA about GIS, career advice, tools..."
                  className="resize-none"
                  rows={2}
                  disabled={isLoading}
                />
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    onClick={toggleVoice}
                    variant={voiceEnabled ? "default" : "outline"}
                    className="h-8 w-8 p-0"
                  >
                    {voiceEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="h-8 w-8 p-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setInputMessage("How do I get started with QGIS?")}
                  disabled={isLoading}
                  className="text-xs h-7"
                >
                  QGIS Basics
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setInputMessage("What career paths are available in geospatial?")}
                  disabled={isLoading}
                  className="text-xs h-7"
                >
                  Career Advice
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setInputMessage("Show me Python code for spatial analysis")}
                  disabled={isLoading}
                  className="text-xs h-7"
                >
                  Python GIS
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};