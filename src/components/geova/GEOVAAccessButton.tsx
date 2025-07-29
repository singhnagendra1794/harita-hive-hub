import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Brain, 
  Users, 
  User, 
  Sparkles, 
  Video,
  BookOpen
} from 'lucide-react';
import { GEOVALiveMentor } from './GEOVALiveMentor';
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';

interface GEOVAAccessButtonProps {
  contextPage?: string;
  compact?: boolean;
  position?: 'fixed' | 'inline';
}

export const GEOVAAccessButton: React.FC<GEOVAAccessButtonProps> = ({
  contextPage = 'unknown',
  compact = false,
  position = 'fixed'
}) => {
  const { user } = useAuth();
  const { hasAccess } = usePremiumAccess();
  const [showGEOVA, setShowGEOVA] = useState(false);
  const [sessionType, setSessionType] = useState<'private' | 'group'>('private');

  const handleStartSession = (type: 'private' | 'group') => {
    if (!user) {
      // Redirect to auth or show login modal
      window.location.href = '/auth';
      return;
    }

    if (!hasAccess) {
      // Show upgrade prompt
      window.location.href = '/subscription';
      return;
    }

    setSessionType(type);
    setShowGEOVA(true);
  };

  if (showGEOVA) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">GEOVA Live Mentor</h2>
                  <p className="text-sm text-muted-foreground">
                    {sessionType === 'private' ? '1-on-1 AI Mentoring' : 'Group Learning Session'}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowGEOVA(false)}
              >
                End Session
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <GEOVALiveMentor
              sessionType={sessionType}
              contextPage={contextPage}
              onSessionEnd={() => setShowGEOVA(false)}
            />
          </div>
        </div>
      </div>
    );
  }

  if (position === 'fixed') {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <Card className="w-80 shadow-xl border-primary/20 bg-gradient-to-br from-background via-background to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">GEOVA AI Mentor</h3>
                <p className="text-xs text-muted-foreground">Available 24/7</p>
              </div>
              <Badge variant="secondary" className="ml-auto">
                <Sparkles className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground mb-4">
              Get instant help with GIS, remote sensing, coding, and career guidance from your AI mentor.
            </p>

            <div className="space-y-2">
              <Button
                onClick={() => handleStartSession('private')}
                className="w-full text-sm h-9 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                disabled={!user || !hasAccess}
              >
                <User className="w-4 h-4 mr-2" />
                Start 1-on-1 Session
              </Button>
              
              <Button
                onClick={() => handleStartSession('group')}
                variant="outline"
                className="w-full text-sm h-9"
                disabled={!user || !hasAccess}
              >
                <Users className="w-4 h-4 mr-2" />
                Join Group Session
              </Button>
            </div>

            {!user && (
              <p className="text-xs text-center text-muted-foreground mt-3">
                <Button variant="link" className="p-0 h-auto text-xs" onClick={() => window.location.href = '/auth'}>
                  Sign in
                </Button> to access GEOVA
              </p>
            )}

            {user && !hasAccess && (
              <p className="text-xs text-center text-muted-foreground mt-3">
                <Button variant="link" className="p-0 h-auto text-xs" onClick={() => window.location.href = '/subscription'}>
                  Upgrade to Professional
                </Button> for full access
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Inline version
  return (
    <div className={`w-full ${compact ? 'max-w-md' : 'max-w-2xl'} mx-auto`}>
      <Card className="border-primary/20 bg-gradient-to-br from-background via-background to-primary/5">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto">
              <Brain className="w-8 h-8 text-white" />
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-2">Learn with GEOVA AI Mentor</h2>
              <p className="text-muted-foreground">
                Experience the most advanced AI mentor in geospatial technology with live avatar, voice interaction, and personalized guidance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={() => handleStartSession('private')}
                className="h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                disabled={!user || !hasAccess}
              >
                <User className="w-5 h-5 mr-2" />
                <div className="text-left">
                  <div className="font-medium">1-on-1 Mentoring</div>
                  <div className="text-xs opacity-90">Personalized learning</div>
                </div>
              </Button>
              
              <Button
                onClick={() => handleStartSession('group')}
                variant="outline"
                className="h-12"
                disabled={!user || !hasAccess}
              >
                <Users className="w-5 h-5 mr-2" />
                <div className="text-left">
                  <div className="font-medium">Group Session</div>
                  <div className="text-xs opacity-70">Collaborative learning</div>
                </div>
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
              <div className="flex items-center">
                <Video className="w-4 h-4 mr-1" />
                Live Avatar
              </div>
              <div className="flex items-center">
                <Sparkles className="w-4 h-4 mr-1" />
                Voice AI
              </div>
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1" />
                Real-time Help
              </div>
            </div>

            {!user && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  Sign in to access GEOVA's advanced AI mentoring
                </p>
                <Button onClick={() => window.location.href = '/auth'} variant="outline" className="w-full">
                  Sign In to Start Learning
                </Button>
              </div>
            )}

            {user && !hasAccess && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  Upgrade to Professional Plan for full GEOVA access
                </p>
                <Button onClick={() => window.location.href = '/subscription'} className="w-full">
                  Upgrade to Professional
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};