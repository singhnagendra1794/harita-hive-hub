import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageCircle, 
  Users, 
  BookOpen,
  Play,
  Pause,
  Radio,
  Send,
  Hand
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface GEOVALiveClassroomProps {
  sessionId?: string;
  onSessionEnd?: () => void;
}

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
  isGEOVA?: boolean;
  isQuestion?: boolean;
}

interface SessionData {
  id: string;
  day_number: number;
  topic_title: string;
  topic_description: string;
  learning_objectives: string[];
  status: string;
  scheduled_time: string;
  viewer_count?: number;
}

export const GEOVALiveClassroom: React.FC<GEOVALiveClassroomProps> = ({
  sessionId,
  onSessionEnd
}) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isSessionLive, setIsSessionLive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [isGEOVASpeaking, setIsGEOVASpeaking] = useState(false);
  const [handRaised, setHandRaised] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<Uint8Array[]>([]);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    initializeSession();
    return () => {
      disconnectFromSession();
    };
  }, [sessionId]);

  const initializeSession = async () => {
    try {
      // Get session status
      const { data, error } = await supabase.functions.invoke('geova-session-manager', {
        body: { action: 'status' }
      });

      if (error) throw error;

      if (data.isLive && data.activeSession) {
        setSessionData(data.todaySchedule);
        setIsSessionLive(true);
        setViewerCount(data.activeSession.viewer_count || 0);
        await connectToGEOVA();
      } else if (data.todaySchedule) {
        setSessionData(data.todaySchedule);
        // Check if it's time to start the session
        const now = new Date();
        const sessionTime = new Date(`${data.todaySchedule.scheduled_date}T${data.todaySchedule.scheduled_time}`);
        
        if (now >= sessionTime && now <= new Date(sessionTime.getTime() + data.todaySchedule.duration_minutes * 60000)) {
          await startSession(data.todaySchedule.id);
        }
      }
    } catch (error) {
      console.error('Failed to initialize session:', error);
      toast({
        title: "Session Error",
        description: "Failed to initialize GEOVA live session",
        variant: "destructive",
      });
    }
  };

  const connectToGEOVA = async () => {
    try {
      const wsUrl = `wss://uphgdwrwaizomnyuwfwr.functions.supabase.co/functions/v1/geova-live-teacher`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Connected to GEOVA live teacher');
        setIsConnected(true);
        
        // Initialize audio context
        audioContextRef.current = new AudioContext();
        
        // Start the session
        wsRef.current?.send(JSON.stringify({
          type: 'geova.start_session'
        }));

        toast({
          title: "Connected to GEOVA",
          description: "Live teaching session is starting!",
        });
      };

      wsRef.current.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        await handleGEOVAMessage(data);
      };

      wsRef.current.onclose = () => {
        console.log('Disconnected from GEOVA');
        setIsConnected(false);
        setIsGEOVASpeaking(false);
      };

      wsRef.current.onerror = (error) => {
        console.error('GEOVA connection error:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to GEOVA live session",
          variant: "destructive",
        });
      };

    } catch (error) {
      console.error('Failed to connect to GEOVA:', error);
    }
  };

  const handleGEOVAMessage = async (data: any) => {
    console.log('GEOVA message:', data.type);

    switch (data.type) {
      case 'response.audio.delta':
        if (data.delta) {
          await playAudioChunk(data.delta);
          setIsGEOVASpeaking(true);
        }
        break;

      case 'response.audio.done':
        setIsGEOVASpeaking(false);
        break;

      case 'response.audio_transcript.delta':
        if (data.delta) {
          // Add GEOVA's response to chat
          addGEOVAMessage(data.delta);
        }
        break;

      case 'input_audio_buffer.speech_started':
        console.log('Student started speaking');
        break;

      case 'input_audio_buffer.speech_stopped':
        console.log('Student stopped speaking');
        break;

      case 'response.function_call_arguments.done':
        console.log('GEOVA called function:', data.name);
        break;
    }
  };

  const playAudioChunk = async (base64Audio: string) => {
    if (!audioContextRef.current) return;

    try {
      // Convert base64 to audio buffer
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Add to queue
      audioQueueRef.current.push(bytes);
      
      if (!isPlayingRef.current) {
        await playNextAudioChunk();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const playNextAudioChunk = async () => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    const chunk = audioQueueRef.current.shift()!;

    try {
      // Create WAV header for PCM16 at 24kHz
      const wavData = createWavFromPCM(chunk);
      // Convert ArrayBufferLike to ArrayBuffer for decodeAudioData
      const arrayBuffer = new Uint8Array(wavData.buffer).buffer as ArrayBuffer;
      const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
      
      const source = audioContextRef.current!.createBufferSource();
      source.buffer = audioBuffer;
      
      const gainNode = audioContextRef.current!.createGain();
      gainNode.gain.value = isMuted ? 0 : volume;
      
      source.connect(gainNode);
      gainNode.connect(audioContextRef.current!.destination);
      
      source.onended = () => playNextAudioChunk();
      source.start(0);
    } catch (error) {
      console.error('Error playing audio chunk:', error);
      playNextAudioChunk(); // Continue with next chunk
    }
  };

  const createWavFromPCM = (pcmData: Uint8Array): Uint8Array => {
    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + pcmData.length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * bitsPerSample / 8, true);
    view.setUint16(32, numChannels * bitsPerSample / 8, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, pcmData.length, true);
    
    const wavArray = new Uint8Array(wavHeader.byteLength + pcmData.length);
    wavArray.set(new Uint8Array(wavHeader), 0);
    wavArray.set(pcmData, wavHeader.byteLength);
    
    return wavArray;
  };

  const addGEOVAMessage = (text: string) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      user: 'GEOVA',
      message: text,
      timestamp: new Date(),
      isGEOVA: true
    };
    setChatMessages(prev => [...prev, message]);
  };

  const startSession = async (scheduleId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('geova-session-manager', {
        body: { action: 'start', scheduleId }
      });

      if (error) throw error;

      setIsSessionLive(true);
      await connectToGEOVA();
      
      toast({
        title: "Session Started",
        description: "GEOVA live teaching session is now active!",
      });
    } catch (error) {
      console.error('Failed to start session:', error);
      toast({
        title: "Start Error",
        description: "Failed to start live session",
        variant: "destructive",
      });
    }
  };

  const endSession = async () => {
    if (!sessionData) return;

    try {
      await supabase.functions.invoke('geova-session-manager', {
        body: { action: 'end', scheduleId: sessionData.id }
      });

      setIsSessionLive(false);
      disconnectFromSession();
      onSessionEnd?.();

      toast({
        title: "Session Ended",
        description: "GEOVA live teaching session has ended",
      });
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const disconnectFromSession = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsConnected(false);
  };

  const sendChatMessage = () => {
    if (!newMessage.trim() || !isConnected) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      user: 'Student',
      message: newMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, message]);

    // Send to GEOVA if it's a question
    if (newMessage.includes('?') || handRaised) {
      wsRef.current?.send(JSON.stringify({
        type: 'geova.student_question',
        question: newMessage
      }));
      message.isQuestion = true;
      setHandRaised(false);
    }

    setNewMessage('');
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(event.target.value));
  };

  if (!sessionData) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Avatar className="h-16 w-16 mx-auto mb-4">
              <AvatarImage src="/geova-avatar.png" alt="GEOVA" />
              <AvatarFallback className="text-lg bg-primary text-primary-foreground">GV</AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-semibold mb-2">GEOVA AI Mentor Ready</h3>
            <p className="text-muted-foreground mb-4">
              Your AI-powered geospatial learning companion is standing by. 
              Live teaching sessions start at the scheduled times.
            </p>
            <div className="text-sm text-muted-foreground">
              Next session: Check the schedule tab for upcoming live AI teaching sessions
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Session Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src="/geova-avatar.png" alt="GEOVA" />
                <AvatarFallback>GV</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="flex items-center gap-2">
                  GEOVA Live Teaching
                  {isSessionLive && (
                    <Badge variant="destructive" className="animate-pulse">
                      <Radio className="h-3 w-3 mr-1" />
                      LIVE
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Day {sessionData.day_number}: {sessionData.topic_title}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">{viewerCount} viewers</span>
              </div>
              {isSessionLive && (
                <Button variant="outline" size="sm" onClick={endSession}>
                  End Session
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Audio Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Audio Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant={isMuted ? "destructive" : "outline"}
                    size="sm"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    {isMuted ? 'Unmute' : 'Mute'}
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Volume:</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-20"
                    />
                  </div>
                </div>

                {isGEOVASpeaking && (
                  <Badge variant="secondary" className="animate-pulse">
                    <Mic className="h-3 w-3 mr-1" />
                    GEOVA is speaking...
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Session Content */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Topic</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{sessionData.topic_title}</h3>
                <p className="text-muted-foreground">{sessionData.topic_description}</p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Learning Objectives:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {sessionData.learning_objectives.map((objective, index) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Sidebar */}
        <div className="space-y-6">
          <Card className="h-96">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Live Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-64 p-4">
                <div className="space-y-3">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.isGEOVA ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[80%] rounded-lg p-2 text-sm ${
                        msg.isGEOVA 
                          ? 'bg-primary text-primary-foreground' 
                          : msg.isQuestion
                          ? 'bg-yellow-100 text-yellow-900 border border-yellow-200'
                          : 'bg-secondary text-secondary-foreground'
                      }`}>
                        <div className="font-medium text-xs opacity-70 mb-1">
                          {msg.user} {msg.isQuestion && '❓'}
                        </div>
                        <div>{msg.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Button
                    variant={handRaised ? "default" : "outline"}
                    size="sm"
                    onClick={() => setHandRaised(!handRaised)}
                  >
                    <Hand className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Ask GEOVA a question..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    disabled={!isConnected}
                  />
                  <Button 
                    size="sm" 
                    onClick={sendChatMessage}
                    disabled={!newMessage.trim() || !isConnected}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {handRaised && (
                  <p className="text-xs text-yellow-600 mt-1">
                    ✋ Hand raised - your next message will be treated as a question
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};