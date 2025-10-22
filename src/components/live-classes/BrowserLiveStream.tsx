import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Video, VideoOff, Mic, MicOff, Radio, Square, MonitorUp } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface BrowserLiveStreamProps {
  onStreamStart?: () => void;
  onStreamEnd?: () => void;
}

export const BrowserLiveStream: React.FC<BrowserLiveStreamProps> = ({
  onStreamStart,
  onStreamEnd
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isScreenShare, setIsScreenShare] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopAllTracks();
    };
  }, []);

  const stopAllTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleCamera = async () => {
    try {
      if (isCameraOn) {
        stopAllTracks();
        setIsCameraOn(false);
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          },
          audio: isMicOn
        });
        
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraOn(true);
      }
    } catch (error) {
      toast.error('Failed to access camera');
      console.error('Camera error:', error);
    }
  };

  const toggleMic = async () => {
    try {
      if (!streamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false
        });
        streamRef.current = stream;
      }
      
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !isMicOn;
      });
      
      setIsMicOn(!isMicOn);
    } catch (error) {
      toast.error('Failed to access microphone');
      console.error('Microphone error:', error);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenShare) {
        stopAllTracks();
        setIsScreenShare(false);
      } else {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          },
          audio: true
        });
        
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsScreenShare(true);
        
        // Handle when user stops sharing via browser UI
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenShare(false);
          stopAllTracks();
        };
      }
    } catch (error) {
      toast.error('Failed to access screen share');
      console.error('Screen share error:', error);
    }
  };

  const startLiveStream = async () => {
    if (!title.trim()) {
      toast.error('Please enter a stream title');
      return;
    }

    if (!user) {
      toast.error('Please sign in to go live');
      return;
    }

    if (!streamRef.current) {
      toast.error('Please enable camera or screen share first');
      return;
    }

    try {
      // Create stream session
      const { data: sessionData, error: sessionError } = await supabase.functions.invoke('create-stream', {
        body: { title, description }
      });

      if (sessionError) throw sessionError;

      // Create live class entry
      const { data: liveClass, error: classError } = await supabase
        .from('live_classes')
        .insert({
          title,
          description,
          status: 'live',
          starts_at: new Date().toISOString(),
          created_by: user.id,
          instructor: user.email?.split('@')[0] || 'Instructor',
          access_tier: 'free',
          stream_key: sessionData.stream_key
        })
        .select()
        .single();

      if (classError) throw classError;

      setSessionId(liveClass.id);
      setIsLive(true);
      toast.success('🔴 You are now live!');
      onStreamStart?.();
    } catch (error) {
      console.error('Error starting live stream:', error);
      toast.error('Failed to start live stream');
    }
  };

  const endLiveStream = async () => {
    if (!sessionId) return;

    try {
      // Update live class status
      await supabase
        .from('live_classes')
        .update({
          status: 'ended',
          end_time: new Date().toISOString()
        })
        .eq('id', sessionId);

      stopAllTracks();
      setIsLive(false);
      setIsCameraOn(false);
      setIsMicOn(false);
      setIsScreenShare(false);
      setSessionId(null);
      toast.success('Stream ended successfully');
      onStreamEnd?.();
    } catch (error) {
      console.error('Error ending stream:', error);
      toast.error('Failed to end stream');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="h-5 w-5" />
          Go Live from Browser
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isLive ? (
          <>
            <div className="space-y-2">
              <Input
                placeholder="Stream title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLive}
              />
              <Textarea
                placeholder="Stream description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLive}
                rows={3}
              />
            </div>

            <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!isCameraOn && !isScreenShare && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-muted-foreground">Preview will appear here</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                variant={isCameraOn ? "default" : "outline"}
                onClick={toggleCamera}
                className="flex-1"
              >
                {isCameraOn ? <Video className="h-4 w-4 mr-2" /> : <VideoOff className="h-4 w-4 mr-2" />}
                {isCameraOn ? 'Camera On' : 'Camera Off'}
              </Button>
              
              <Button
                variant={isMicOn ? "default" : "outline"}
                onClick={toggleMic}
                className="flex-1"
              >
                {isMicOn ? <Mic className="h-4 w-4 mr-2" /> : <MicOff className="h-4 w-4 mr-2" />}
                {isMicOn ? 'Mic On' : 'Mic Off'}
              </Button>
              
              <Button
                variant={isScreenShare ? "default" : "outline"}
                onClick={toggleScreenShare}
                className="flex-1"
              >
                <MonitorUp className="h-4 w-4 mr-2" />
                {isScreenShare ? 'Sharing Screen' : 'Share Screen'}
              </Button>
            </div>

            <Button 
              onClick={startLiveStream} 
              className="w-full"
              size="lg"
              disabled={!title.trim() || (!isCameraOn && !isScreenShare)}
            >
              <Radio className="h-4 w-4 mr-2" />
              Start Live Stream
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <div className="flex items-center gap-2 bg-destructive text-destructive-foreground px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-sm font-medium">LIVE</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={toggleMic}
                className="flex-1"
              >
                {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="destructive"
                onClick={endLiveStream}
                className="flex-1"
              >
                <Square className="h-4 w-4 mr-2" />
                End Stream
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
