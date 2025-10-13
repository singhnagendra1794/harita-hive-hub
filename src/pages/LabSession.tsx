import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ExternalLink, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';

const LabSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (sessionId) {
      launchSession();
    }
  }, [sessionId]);

  useEffect(() => {
    if (session?.expires_at) {
      const interval = setInterval(() => {
        const now = new Date();
        const expires = new Date(session.expires_at);
        const diff = expires.getTime() - now.getTime();

        if (diff <= 0) {
          setTimeRemaining('Session expired');
          clearInterval(interval);
        } else {
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setTimeRemaining(`${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [session]);

  const launchSession = async () => {
    try {
      const { data, error } = await supabase.functions.invoke(`launch-lab-session/${sessionId}`);

      if (error) {
        throw error;
      }

      if (data.error) {
        setError(data.message || data.error);
        toast({
          title: "Session Error",
          description: data.message || data.error,
          variant: "destructive"
        });
        return;
      }

      setSession(data);
      
      // In production, would redirect to actual runtime
      // window.location.href = data.runtimeUrl;
      
      toast({
        title: "✨ Lab Launched",
        description: `${data.lab.name} is ready!`,
      });

    } catch (err: any) {
      console.error('Launch error:', err);
      setError(err.message || 'Failed to launch session');
      toast({
        title: "Launch Failed",
        description: err.message || 'Failed to launch session',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
          <h2 className="text-2xl font-semibold">Launching Your Lab</h2>
          <p className="text-muted-foreground">Setting up your environment... ⏳</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertCircle className="h-5 w-5" />
              <CardTitle>Session Error</CardTitle>
            </div>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/labs')}
              className="w-full"
            >
              Return to Labs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Session Info Bar */}
      <div className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-lg">{session.lab.name}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{timeRemaining}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/labs')}>
              Exit Lab
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Alert className="mb-6">
          <AlertDescription>
            <strong>Demo Mode:</strong> This is a placeholder for the actual lab environment. 
            In production, you would be redirected to the runtime host at{' '}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">{session.runtimeUrl}</code>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Lab Environment Ready</CardTitle>
            <CardDescription>
              Your {session.lab.type} environment is active and ready to use.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Session Details</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Session ID:</dt>
                  <dd className="font-mono text-xs">{session.session.id}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Status:</dt>
                  <dd className="text-primary font-medium capitalize">{session.session.status}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Expires:</dt>
                  <dd>{new Date(session.session.expiresAt).toLocaleString()}</dd>
                </div>
              </dl>
            </div>

            <Button 
              className="w-full" 
              onClick={() => window.open(session.runtimeUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in New Window
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LabSession;