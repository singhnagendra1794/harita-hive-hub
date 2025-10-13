import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageCircle, 
  Users, 
  Radio,
  Play,
  Pause,
  Send,
  Hand,
  Settings,
  Eye,
  EyeOff,
  Youtube,
  Tv
} from 'lucide-react';

interface GEOVALiveMentorProps {
  sessionType?: 'private' | 'group';
  onSessionEnd?: () => void;
  contextPage?: string;
}

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
  isGEOVA?: boolean;
  isQuestion?: boolean;
  avatarUrl?: string;
}

interface SessionConfig {
  sessionType: 'private' | 'group';
  voiceEnabled: boolean;
  avatarEnabled: boolean;
  whiteboardEnabled: boolean;
  recordingEnabled: boolean;
  youtubeStreamEnabled: boolean;
}

interface LiveSession {
  id: string;
  title: string;
  description: string;
  sessionType: 'private' | 'group';
  status: 'starting' | 'live' | 'ended';
  participants: number;
  rtmpKey?: string;
  hlsUrl?: string;
  youtubeUrl?: string;
}

export const GEOVALiveMentor: React.FC<GEOVALiveMentorProps> = ({
  sessionType = 'private',
  onSessionEnd,
  contextPage = 'unknown'
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Session State
  const [session, setSession] = useState<LiveSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSessionLive, setIsSessionLive] = useState(false);
  const [sessionConfig, setSessionConfig] = useState<SessionConfig>({
    sessionType,
    voiceEnabled: true,
    avatarEnabled: true,
    whiteboardEnabled: true,
    recordingEnabled: true,
    youtubeStreamEnabled: false
  });

  // Audio/Video State
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isGEOVASpeaking, setIsGEOVASpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [handRaised, setHandRaised] = useState(false);

  // Participants State
  const [participants, setParticipants] = useState<{ id: string; name: string; avatar?: string }[]>([]);
  const [viewerCount, setViewerCount] = useState(0);

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const avatarVideoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<Uint8Array[]>([]);
  const isPlayingRef = useRef(false);
  const whiteboardRef = useRef<HTMLCanvasElement>(null);

  // Initialize session on mount
  useEffect(() => {
    initializeSession();
    return () => {
      endSession();
    };
  }, []);

  const initializeSession = useCallback(async () => {
    try {
      // Create new live session
      const { data, error } = await supabase.functions.invoke('geova-live-session', {
        body: {
          action: 'create',
          sessionType: sessionConfig.sessionType,
          contextPage,
          config: sessionConfig
        }
      });

      if (error) throw error;

      setSession(data.session);
      
      // Connect to GEOVA live mentor
      await connectToGEOVA(data.session.id);

      toast({
        title: "Session Created",
        description: `GEOVA ${sessionConfig.sessionType} mentor session is starting!`,
      });

    } catch (error) {
      console.error('Failed to initialize session:', error);
      toast({
        title: "Session Error",
        description: "Failed to create GEOVA mentor session",
        variant: "destructive",
      });
    }
  }, [sessionConfig, contextPage]);

  const connectToGEOVA = async (sessionId: string) => {
    try {
      const wsUrl = `wss://uphgdwrwaizomnyuwfwr.functions.supabase.co/functions/v1/geova-live-mentor`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Connected to GEOVA live mentor');
        setIsConnected(true);
        
        // Initialize WebRTC audio context
        audioContextRef.current = new AudioContext();
        
        // Join session
        wsRef.current?.send(JSON.stringify({
          type: 'geova.join_session',
          sessionId,
          userId: user?.id,
          config: sessionConfig
        }));

        setIsSessionLive(true);

        toast({
          title: "Connected to GEOVA",
          description: "Live AI mentor is ready to help you learn!",
        });
      };

      wsRef.current.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        await handleGEOVAMessage(data);
      };

      wsRef.current.onclose = () => {
        console.log('Disconnected from GEOVA mentor');
        setIsConnected(false);
        setIsSessionLive(false);
        setIsGEOVASpeaking(false);
      };

      wsRef.current.onerror = (error) => {
        console.error('GEOVA connection error:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to GEOVA live mentor",
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
      case 'avatar.video_frame':
        // Update AI avatar video frame
        if (data.frame && avatarVideoRef.current) {
          const blob = new Blob([atob(data.frame)], { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          avatarVideoRef.current.src = url;
        }
        break;

      case 'response.audio.delta':
        if (data.delta) {
          await playAudioChunk(data.delta);
          setIsGEOVASpeaking(true);
        }
        break;

      case 'response.audio.done':
        setIsGEOVASpeaking(false);
        break;

      case 'response.text.delta':
        if (data.delta) {
          addGEOVAMessage(data.delta);
        }
        break;

      case 'whiteboard.annotation':
        if (data.annotation && whiteboardRef.current) {
          drawWhiteboardAnnotation(data.annotation);
        }
        break;

      case 'session.participant_joined':
        setParticipants(prev => [...prev, data.participant]);
        setViewerCount(prev => prev + 1);
        break;

      case 'session.participant_left':
        setParticipants(prev => prev.filter(p => p.id !== data.participantId));
        setViewerCount(prev => Math.max(0, prev - 1));
        break;

      case 'youtube.stream_started':
        if (data.streamUrl) {
          setSession(prev => prev ? { ...prev, youtubeUrl: data.streamUrl } : null);
          toast({
            title: "Live on YouTube",
            description: "This session is now streaming live!",
          });
        }
        break;
    }
  };

  const playAudioChunk = async (base64Audio: string) => {
    if (!audioContextRef.current) return;

    try {
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

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
      playNextAudioChunk();
    }
  };

  const createWavFromPCM = (pcmData: Uint8Array): Uint8Array => {
    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
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
      user: 'GEOVA AI Mentor',
      message: text,
      timestamp: new Date(),
      isGEOVA: true,
      avatarUrl: '/geova-avatar.png'
    };
    setChatMessages(prev => [...prev, message]);
  };

  const drawWhiteboardAnnotation = (annotation: any) => {
    const canvas = whiteboardRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = annotation.color || '#2563eb';
    ctx.lineWidth = annotation.width || 2;
    ctx.lineCap = 'round';

    if (annotation.type === 'draw') {
      ctx.beginPath();
      ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
      annotation.points.forEach((point: any) => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    } else if (annotation.type === 'pointer') {
      // Draw pointer/arrow
      ctx.fillStyle = annotation.color || '#ef4444';
      ctx.beginPath();
      ctx.arc(annotation.x, annotation.y, 8, 0, 2 * Math.PI);
      ctx.fill();
    }
  };

  const sendChatMessage = () => {
    if (!newMessage.trim() || !isConnected) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      user: user?.email?.split('@')[0] || 'Student',
      message: newMessage,
      timestamp: new Date(),
      avatarUrl: user?.user_metadata?.avatar_url
    };

    setChatMessages(prev => [...prev, message]);

    // Send to GEOVA
    wsRef.current?.send(JSON.stringify({
      type: 'student.message',
      message: newMessage,
      isQuestion: newMessage.includes('?') || handRaised,
      handRaised
    }));

    if (handRaised) {
      setHandRaised(false);
    }

    setNewMessage('');
  };

  const toggleVoice = () => {
    if (!sessionConfig.voiceEnabled) return;
    
    if (isListening) {
      // Stop listening
      setIsListening(false);
      wsRef.current?.send(JSON.stringify({
        type: 'student.stop_speaking'
      }));
    } else {
      // Start listening
      setIsListening(true);
      wsRef.current?.send(JSON.stringify({
        type: 'student.start_speaking'
      }));
    }
  };

  const toggleAvatar = () => {
    setSessionConfig(prev => ({
      ...prev,
      avatarEnabled: !prev.avatarEnabled
    }));
  };

  const startYouTubeStream = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('geova-youtube-stream', {
        body: {
          action: 'start',
          sessionId: session?.id,
          title: `GEOVA Live Mentor - ${sessionConfig.sessionType === 'private' ? 'Private Session' : 'Group Learning'}`,
          description: `Live AI-powered geospatial technology mentoring session with GEOVA`
        }
      });

      if (error) throw error;

      setSessionConfig(prev => ({ ...prev, youtubeStreamEnabled: true }));
      
      toast({
        title: "YouTube Stream Started",
        description: "This session is now live on YouTube!",
      });

    } catch (error) {
      console.error('Failed to start YouTube stream:', error);
      toast({
        title: "Stream Error",
        description: "Failed to start YouTube stream",
        variant: "destructive",
      });
    }
  };

  const endSession = async () => {
    try {
      if (session) {
        await supabase.functions.invoke('geova-live-session', {
          body: {
            action: 'end',
            sessionId: session.id
          }
        });
      }

      // Cleanup WebSocket
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      // Cleanup audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      setIsConnected(false);
      setIsSessionLive(false);
      onSessionEnd?.();

      toast({
        title: "Session Ended",
        description: "GEOVA mentor session has ended successfully",
      });

    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Starting GEOVA Session...</h3>
          <p className="text-muted-foreground">Preparing your AI mentor experience</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4">
      {/* Session Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12 border-2 border-primary">
                <AvatarImage src="/geova-avatar.png" alt="GEOVA" />
                <AvatarFallback>GV</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="flex items-center gap-2">
                  GEOVA Live Mentor
                  {isSessionLive && (
                    <Badge variant="destructive" className="animate-pulse">
                      <Radio className="h-3 w-3 mr-1" />
                      LIVE
                    </Badge>
                  )}
                  <Badge variant="secondary">
                    {sessionConfig.sessionType}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  AI-powered geospatial technology mentoring • {contextPage}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">{viewerCount + 1} participants</span>
              </div>
              {session.youtubeUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={session.youtubeUrl} target="_blank" rel="noopener noreferrer">
                    <Youtube className="h-4 w-4 mr-2" />
                    Watch on YouTube
                  </a>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={endSession}>
                End Session
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Video Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* AI Avatar & Whiteboard */}
          <Card>
            <CardContent className="p-0 relative">
              <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden relative">
                {sessionConfig.avatarEnabled ? (
                  <video
                    ref={avatarVideoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted={isMuted}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-white">
                      <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-white/20">
                        <AvatarImage src="/geova-avatar.png" alt="GEOVA" />
                        <AvatarFallback className="text-2xl">GV</AvatarFallback>
                      </Avatar>
                      <h3 className="text-xl font-semibold">GEOVA AI Mentor</h3>
                      <p className="text-white/70">Audio-only mode</p>
                    </div>
                  </div>
                )}

                {/* Whiteboard Overlay */}
                {sessionConfig.whiteboardEnabled && (
                  <canvas
                    ref={whiteboardRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    width={1920}
                    height={1080}
                  />
                )}

                {/* Speaking Indicator */}
                {isGEOVASpeaking && (
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="secondary" className="animate-pulse bg-green-500/20 text-green-300 border-green-500/30">
                      <Mic className="h-3 w-3 mr-1" />
                      GEOVA is speaking...
                    </Badge>
                  </div>
                )}

                {/* Controls Overlay */}
                <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMuted(!isMuted)}
                    className="bg-black/50 border-white/20 text-white hover:bg-black/70"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAvatar}
                    className="bg-black/50 border-white/20 text-white hover:bg-black/70"
                  >
                    {sessionConfig.avatarEnabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voice & YouTube Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant={isListening ? "destructive" : "default"}
                    size="lg"
                    onClick={toggleVoice}
                    disabled={!sessionConfig.voiceEnabled}
                    className="rounded-full"
                  >
                    {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    {isListening ? 'Stop Talking' : 'Ask Question'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setHandRaised(!handRaised)}
                    className={handRaised ? "bg-yellow-500/20 border-yellow-500 text-yellow-600" : ""}
                  >
                    <Hand className="h-4 w-4 mr-2" />
                    {handRaised ? 'Hand Raised' : 'Raise Hand'}
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  {!sessionConfig.youtubeStreamEnabled && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={startYouTubeStream}
                    >
                      <Youtube className="h-4 w-4 mr-2" />
                      Go Live on YouTube
                    </Button>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Volume:</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-20"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Participants */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-4 w-4" />
                Participants ({participants.length + 1})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* GEOVA */}
              <div className="flex items-center space-x-2 p-2 bg-primary/10 rounded">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/geova-avatar.png" alt="GEOVA" />
                  <AvatarFallback>GV</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">GEOVA AI Mentor</p>
                  <p className="text-xs text-muted-foreground">Teaching</p>
                </div>
                {isGEOVASpeaking && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>

              {/* Current User */}
              <div className="flex items-center space-x-2 p-2 bg-secondary/10 rounded">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt="You" />
                  <AvatarFallback>{user?.email?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">You</p>
                  <p className="text-xs text-muted-foreground">Student</p>
                </div>
                {isListening && (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                )}
                {handRaised && (
                  <Hand className="h-3 w-3 text-yellow-600" />
                )}
              </div>

              {/* Other Participants */}
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center space-x-2 p-2 rounded">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={participant.avatar} alt={participant.name} />
                    <AvatarFallback>{participant.name[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{participant.name}</p>
                    <p className="text-xs text-muted-foreground">Student</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Chat */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Live Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-64 p-4">
                <div className="space-y-3">
                  {chatMessages.map((message) => (
                    <div key={message.id} className="flex space-x-2">
                      <Avatar className="h-6 w-6 mt-1">
                        <AvatarImage src={message.avatarUrl} alt={message.user} />
                        <AvatarFallback className="text-xs">
                          {message.user[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            {message.user}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                          {message.isQuestion && (
                            <Badge variant="outline" className="text-xs">?</Badge>
                          )}
                        </div>
                        <p className="text-sm mt-1 break-words">{message.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Ask GEOVA anything..."
                    className="flex-1"
                  />
                  <Button
                    onClick={sendChatMessage}
                    disabled={!newMessage.trim() || !isConnected}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  💡 Ask specific questions for best learning experience
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
