import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';

interface AIAvatarProps {
  sessionId: string;
  isActive: boolean;
  onAvatarReady?: () => void;
}

export function AIAvatarIntegration({ sessionId, isActive, onAvatarReady }: AIAvatarProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [avatarSettings, setAvatarSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    if (isActive) {
      initializeAvatar();
    }
  }, [isActive]);

  const initializeAvatar = async () => {
    try {
      setIsLoading(true);
      
      // Get avatar settings
      const { data: settings } = await supabase
        .from('geova_avatar_settings')
        .select('*')
        .eq('is_active', true)
        .single();

      setAvatarSettings(settings);
      
      if (settings) {
        await loadAvatar(settings);
      }
    } catch (error) {
      console.error('Failed to initialize avatar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvatar = async (settings: any) => {
    try {
      // Call edge function to create DID session
      const { data, error } = await supabase.functions.invoke('geova-avatar-session', {
        body: {
          action: 'create_session',
          avatarConfig: settings,
          sessionId
        }
      });

      if (error) throw error;

      // Initialize video stream
      if (videoRef.current && data.streamUrl) {
        videoRef.current.src = data.streamUrl;
        videoRef.current.load();
        onAvatarReady?.();
      }
    } catch (error) {
      console.error('Failed to load avatar:', error);
    }
  };

  const speakText = async (text: string) => {
    if (!avatarSettings || isSpeaking) return;

    try {
      setIsSpeaking(true);
      setCurrentMessage(text);

      // Call edge function to make avatar speak
      const { data, error } = await supabase.functions.invoke('geova-avatar-session', {
        body: {
          action: 'speak',
          text,
          sessionId,
          voice: avatarSettings.voice_id,
          accent: avatarSettings.accent
        }
      });

      if (error) throw error;

      // Simulate speaking duration
      setTimeout(() => {
        setIsSpeaking(false);
        setCurrentMessage('');
      }, text.length * 50);

    } catch (error) {
      console.error('Failed to make avatar speak:', error);
      setIsSpeaking(false);
      setCurrentMessage('');
    }
  };

  const startListening = async () => {
    try {
      setIsListening(true);
      
      // Start voice recognition
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        
        // Process voice input through GEOVA
        const { data } = await supabase.functions.invoke('geova-mentor', {
          body: {
            message: transcript,
            sessionId,
            inputType: 'voice'
          }
        });

        if (data?.response) {
          await speakText(data.response);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (error) {
      console.error('Voice recognition not supported:', error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    setIsListening(false);
  };

  if (isLoading) {
    return (
      <Card className="w-full h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Loading GEOVA Avatar...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>GEOVA AI Mentor</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAudioEnabled(!audioEnabled)}
            >
              {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button
              variant={isListening ? "destructive" : "default"}
              size="sm"
              onClick={isListening ? stopListening : startListening}
              disabled={isSpeaking}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full h-64 bg-muted rounded-lg"
            autoPlay
            muted={!audioEnabled}
            playsInline
          />
          
          {isSpeaking && (
            <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3">
              <p className="text-sm font-medium text-foreground">
                GEOVA is speaking...
              </p>
              {currentMessage && (
                <p className="text-xs text-muted-foreground mt-1">
                  "{currentMessage}"
                </p>
              )}
            </div>
          )}

          {isListening && (
            <div className="absolute top-4 right-4 bg-destructive/90 backdrop-blur-sm rounded-full p-2">
              <Mic className="h-4 w-4 text-destructive-foreground animate-pulse" />
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Status: {isSpeaking ? 'Speaking' : isListening ? 'Listening' : 'Ready'}</span>
            <span>Session: {sessionId.slice(0, 8)}...</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Export the speakText function for external use
export const useAvatarSpeech = (sessionId: string) => {
  const [isLoading, setIsLoading] = useState(false);

  const speak = async (text: string) => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('geova-avatar-session', {
        body: {
          action: 'speak',
          text,
          sessionId
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to speak:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { speak, isLoading };
};