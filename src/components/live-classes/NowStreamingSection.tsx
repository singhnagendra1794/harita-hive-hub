import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Video, Users, MessageCircle, Subtitles } from "lucide-react";
import { LiveVideoPlayer } from '@/components/LiveVideoPlayer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface LiveClass {
  id: string;
  title: string;
  description: string;
  stream_key: string;
  status: 'live' | 'ended' | 'scheduled';
  start_time: string;
  end_time: string | null;
  hls_url?: string;
  hls_manifest_url?: string;
  viewer_count: number;
  is_ai_generated?: boolean;
  instructor?: string;
  recording_s3_key?: string;
}

interface NowStreamingSectionProps {
  currentLive: LiveClass | null;
  onError: (error: any) => void;
  onLoad: () => void;
  playerError: string | null;
  onRefresh: () => void;
}

const NowStreamingSection: React.FC<NowStreamingSectionProps> = ({
  currentLive,
  onError,
  onLoad,
  playerError,
  onRefresh
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [questionOpen, setQuestionOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [userName, setUserName] = useState('');
  
  // Generate fake viewer count between 15-89
  const fakeViewerCount = Math.floor(Math.random() * (89 - 15 + 1)) + 15;

  const handleQuestionSubmit = () => {
    if (!question.trim()) return;
    
    toast({
      title: "Question Submitted",
      description: "Your question has been submitted to the instructor. They'll address it during the session.",
    });
    
    setQuestion('');
    setQuestionOpen(false);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Video className="h-8 w-8 text-primary" />
        🔴 Now Streaming
      </h2>
      
      {currentLive ? (
        <Card className="border-red-200 bg-gradient-to-r from-red-50/50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge 
                    variant={currentLive.status === 'live' ? 'destructive' : 'secondary'} 
                    className={currentLive.status === 'live' ? 'animate-pulse' : ''}
                  >
                    {currentLive.status === 'live' ? '🔴 LIVE' : '⏳ PREPARING'}
                  </Badge>
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    Global Geospatial Leadership
                  </Badge>
                </div>
                <CardTitle className="text-2xl mb-2">{currentLive.title}</CardTitle>
                {currentLive.description && (
                  <p className="text-muted-foreground">{currentLive.description}</p>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  {currentLive.is_ai_generated ? (
                    <span>🤖 {currentLive.instructor || 'GEOVA AI'}</span>
                  ) : (
                    <span>👨‍🏫 {currentLive.instructor || 'Expert Instructor'}</span>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4" />
                  <span className="font-semibold">{fakeViewerCount}</span>
                  <span className="text-muted-foreground">watching</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Started at {formatTime(currentLive.start_time)}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="relative aspect-video bg-black rounded-lg mb-4 overflow-hidden">
              {currentLive.status === 'scheduled' ? (
                <div className="w-full h-full flex items-center justify-center text-white bg-gray-900">
                  <div className="text-center">
                    <Video className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
                    <p className="text-lg mb-2">Stream Preparing...</p>
                    <p className="text-sm text-gray-400">
                      Expert is setting up. Stream will start automatically when ready.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={onRefresh}
                    >
                      Check Again
                    </Button>
                  </div>
                </div>
              ) : playerError ? (
                <div className="w-full h-full flex items-center justify-center text-white bg-gray-900">
                  <div className="text-center">
                    <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">Stream Loading...</p>
                    <p className="text-sm text-gray-400">{playerError}</p>
                     <Button 
                       variant="outline" 
                       size="sm" 
                       className="mt-4"
                       onClick={onRefresh}
                     >
                      Retry
                    </Button>
                  </div>
                </div>
              ) : (
                <LiveVideoPlayer
                  src={currentLive.hls_manifest_url || currentLive.hls_url || `https://stream.haritahive.com/hls/${currentLive.stream_key}.m3u8`}
                  title={currentLive.title}
                  className="w-full h-full"
                  onError={onError}
                  onLoad={onLoad}
                />
              )}
              
              {/* Live captioning toggle */}
              {currentLive.status === 'live' && (
                <div className="absolute top-4 right-4">
                  <Button
                    size="sm"
                    variant={captionsEnabled ? "default" : "secondary"}
                    onClick={() => setCaptionsEnabled(!captionsEnabled)}
                    className="opacity-80 hover:opacity-100"
                  >
                    <Subtitles className="h-4 w-4 mr-1" />
                    CC
                  </Button>
                </div>
              )}
            </div>
            
            {/* Interactive Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  🌍 Global Audience
                </Badge>
                <Badge variant="outline" className="text-xs">
                  📡 Real-time
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Dialog open={questionOpen} onOpenChange={setQuestionOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Ask a Question
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ask the Expert</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {!user && (
                        <Input
                          placeholder="Your name"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                        />
                      )}
                      <Textarea
                        placeholder="What would you like to ask about geospatial technology, trends, or applications?"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        rows={4}
                      />
                      <Button 
                        onClick={handleQuestionSubmit}
                        disabled={!question.trim() || (!user && !userName.trim())}
                        className="w-full"
                      >
                        Submit Question
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Questions are reviewed and may be answered live during the session.
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Video className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Live Stream</h3>
            <p className="text-muted-foreground mb-4">
              No geospatial experts are streaming right now. Check our schedule below for upcoming sessions!
            </p>
            <Button variant="outline" onClick={onRefresh}>
              Check for Live Streams
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NowStreamingSection;