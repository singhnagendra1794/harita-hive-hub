import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { 
  GraduationCap, 
  Users, 
  Video, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2,
  UserPlus,
  Crown
} from 'lucide-react';
import { AIAvatarIntegration } from './AIAvatarIntegration';
import { GEOVALiveMentor } from './GEOVALiveMentor';

interface GEOVAGlobalAccessProps {
  isVisible: boolean;
  onToggle: () => void;
}

export function GEOVAGlobalAccess({ isVisible, onToggle }: GEOVAGlobalAccessProps) {
  const [sessionType, setSessionType] = useState<'private' | 'group'>('private');
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [participants, setParticipants] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);

  useEffect(() => {
    checkPremiumAccess();
  }, []);

  const checkPremiumAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.rpc('user_has_premium_access', {
          p_user_id: user.id
        });
        setHasPremiumAccess(data);
      }
    } catch (error) {
      console.error('Error checking premium access:', error);
    }
  };

  const startSession = async (type: 'private' | 'group') => {
    if (!hasPremiumAccess) {
      // Show upgrade prompt
      return;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('geova-live-session', {
        body: {
          action: 'create',
          sessionType: type,
          contextPage: window.location.pathname,
          config: {
            avatarEnabled: true,
            youtubeStreamEnabled: type === 'group',
            maxParticipants: type === 'private' ? 1 : 50
          }
        }
      });

      if (error) throw error;

      setCurrentSession(data.session);
      setSessionType(type);
      
      // Join the session
      await joinSession(data.session.id);
      
    } catch (error) {
      console.error('Failed to start session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const joinSession = async (sessionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('geova_session_participants')
        .insert({
          session_id: sessionId,
          user_id: user.id
        });

      if (error && !error.message.includes('duplicate key')) {
        throw error;
      }
    } catch (error) {
      console.error('Failed to join session:', error);
    }
  };

  const endSession = async () => {
    if (!currentSession) return;

    try {
      const { error } = await supabase.functions.invoke('geova-live-session', {
        body: {
          action: 'end',
          sessionId: currentSession.id
        }
      });

      if (error) throw error;
      
      setCurrentSession(null);
      setParticipants(0);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onToggle}
          className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90"
        >
          <GraduationCap className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={isVisible} onOpenChange={onToggle}>
      <DialogContent className={`max-w-4xl ${isFullscreen ? 'h-screen max-h-screen' : 'max-h-[90vh]'} overflow-hidden`}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              GEOVA AI Mentor
              {currentSession && (
                <Badge variant="outline" className="ml-2">
                  {sessionType === 'private' ? 'Private Session' : 'Group Session'}
                </Badge>
              )}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {currentSession && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {participants} participant{participants !== 1 ? 's' : ''}
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {!currentSession ? (
            <div className="space-y-6">
              {!hasPremiumAccess && (
                <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Crown className="h-5 w-5 text-orange-600" />
                      <div>
                        <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                          Professional Plan Required
                        </h3>
                        <p className="text-sm text-orange-700 dark:text-orange-300">
                          Upgrade to access GEOVA live mentoring sessions
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card 
                  className={`cursor-pointer transition-colors ${!hasPremiumAccess ? 'opacity-50' : 'hover:bg-muted/50'}`}
                  onClick={() => hasPremiumAccess && startSession('private')}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5" />
                      Private Mentoring
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      One-on-one AI mentoring with personalized guidance and career advice.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        Personalized learning pace
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        AI Avatar with voice interaction
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        Real-time career guidance
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-colors ${!hasPremiumAccess ? 'opacity-50' : 'hover:bg-muted/50'}`}
                  onClick={() => hasPremiumAccess && startSession('group')}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Group Learning
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Collaborative learning sessions with AI moderation and peer interaction.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        Up to 50 participants
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        Live YouTube streaming
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        Discussion moderation
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {!hasPremiumAccess && (
                <div className="text-center">
                  <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                    Upgrade to Professional Plan
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="flex-1">
                <GEOVALiveMentor />
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Session ID: {currentSession.id.slice(0, 8)}...
                </div>
                <Button 
                  variant="destructive" 
                  onClick={endSession}
                >
                  End Session
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Global floating button component
export function GEOVAFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <GEOVAGlobalAccess 
      isVisible={isOpen} 
      onToggle={() => setIsOpen(!isOpen)} 
    />
  );
}