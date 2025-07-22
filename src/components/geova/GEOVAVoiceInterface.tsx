import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface GEOVAVoiceInterfaceProps {
  onTextToSpeech: (speakFn: (text: string) => void) => void;
  onSpeechToText: (text: string) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
}

export const GEOVAVoiceInterface: React.FC<GEOVAVoiceInterfaceProps> = ({
  onTextToSpeech,
  onSpeechToText,
  isListening,
  setIsListening,
  voiceEnabled,
  setVoiceEnabled
}) => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio context for voice visualization
  useEffect(() => {
    if (voiceEnabled && !audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.error('Audio context not supported:', error);
      }
    }
  }, [voiceEnabled]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Set up audio visualization
      if (audioContextRef.current) {
        const source = audioContextRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        source.connect(analyserRef.current);
        
        // Start audio level monitoring
        const updateAudioLevel = () => {
          if (analyserRef.current) {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            setAudioLevel(average / 255);
          }
          if (isRecording) {
            requestAnimationFrame(updateAudioLevel);
          }
        };
        updateAudioLevel();
      }

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudioForSpeech(audioBlob);
        
        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start(250); // Collect data every 250ms
      setIsRecording(true);
      setIsListening(true);

      toast({
        title: "🎤 Listening...",
        description: "GEOVA is ready to hear your question!"
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsListening(false);
      setAudioLevel(0);
    }
  };

  const processAudioForSpeech = async (audioBlob: Blob) => {
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onload = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        // Send to speech-to-text function
        const { data, error } = await supabase.functions.invoke('voice-to-text', {
          body: { audio: base64Audio }
        });

        if (error) throw error;

        if (data.text && data.text.trim()) {
          onSpeechToText(data.text.trim());
          toast({
            title: "🎯 Got it!",
            description: `Heard: "${data.text.slice(0, 50)}${data.text.length > 50 ? '...' : ''}"`
          });
        }
      };
    } catch (error) {
      console.error('Error processing speech:', error);
      toast({
        title: "Speech Processing Error",
        description: "Could not convert speech to text. Please try again.",
        variant: "destructive"
      });
    }
  };

  const speakText = async (text: string) => {
    if (!voiceEnabled || !text.trim()) return;

    try {
      setIsSpeaking(true);
      
      // Stop any currently playing audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: text,
          voice: 'nova' // Female voice for GEOVA
        }
      });

      if (error) throw error;

      if (data.audioContent) {
        // Convert base64 to audio and play
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mp3' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        
        currentAudioRef.current = new Audio(audioUrl);
        currentAudioRef.current.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        currentAudioRef.current.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        await currentAudioRef.current.play();
      }
    } catch (error) {
      console.error('Error with text-to-speech:', error);
      setIsSpeaking(false);
      toast({
        title: "Voice Error",
        description: "Could not convert text to speech.",
        variant: "destructive"
      });
    }
  };

  // Expose speakText to parent component
  useEffect(() => {
    onTextToSpeech(speakText);
  }, [onTextToSpeech, speakText]);

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (voiceEnabled && isSpeaking && currentAudioRef.current) {
      currentAudioRef.current.pause();
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      setIsSpeaking(false);
    }
  };

  return (
    <Card className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">GEOVA Voice Assistant</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={voiceEnabled ? "default" : "outline"}
            size="sm"
            onClick={toggleVoice}
            className="gap-2"
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            {voiceEnabled ? "Voice On" : "Voice Off"}
          </Button>
        </div>
      </div>

      {voiceEnabled && (
        <div className="space-y-4">
          {/* Voice Visualization */}
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-1">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1 bg-primary transition-all duration-150 ${
                    isRecording 
                      ? `h-${Math.max(2, Math.min(12, audioLevel * 20 + Math.random() * 4))}` 
                      : 'h-2'
                  }`}
                  style={{
                    height: isRecording 
                      ? `${Math.max(8, Math.min(48, audioLevel * 100 + Math.random() * 16))}px`
                      : '8px'
                  }}
                ></div>
              ))}
            </div>
          </div>

          {/* Voice Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={isRecording ? "destructive" : "default"}
              size="lg"
              onClick={isRecording ? stopRecording : startRecording}
              className="rounded-full w-16 h-16 p-0"
              disabled={isSpeaking}
            >
              {isRecording ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </Button>

            {isSpeaking && (
              <Button
                variant="outline"
                size="lg"
                onClick={stopSpeaking}
                className="rounded-full w-16 h-16 p-0"
              >
                <Pause className="w-6 h-6" />
              </Button>
            )}
          </div>

          {/* Status */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {isRecording ? (
                "🎤 Listening... Speak your geospatial question!"
              ) : isSpeaking ? (
                "🗣️ GEOVA is speaking..."
              ) : (
                "💬 Click the microphone to ask GEOVA anything!"
              )}
            </p>
          </div>
        </div>
      )}

      {!voiceEnabled && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground mb-2">
            Enable voice to experience GEOVA's full conversational capabilities
          </p>
          <Button onClick={toggleVoice} variant="outline">
            <Volume2 className="w-4 h-4 mr-2" />
            Enable Voice Assistant
          </Button>
        </div>
      )}
    </Card>
  );
};