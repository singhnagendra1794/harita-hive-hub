import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, Video, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface LiveClass {
  id: string;
  title: string;
  description: string;
  video_url: string;
  youtube_video_id: string;
  starts_at: string;
  ends_at: string | null;
  is_live: boolean;
  access_tier: string;
  thumbnail_url: string | null;
  instructor: string;
}

const LiveClassBanner = () => {
  const navigate = useNavigate();
  const { hasAccess } = usePremiumAccess();
  const [upcomingClass, setUpcomingClass] = useState<LiveClass | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingClass();
  }, []);

  const fetchUpcomingClass = async () => {
    try {
      const { data, error } = await supabase
        .from('live_classes')
        .select('*')
        .gte('starts_at', new Date().toISOString())
        .order('starts_at', { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching upcoming class:', error);
        return;
      }

      if (data) {
        setUpcomingClass(data);
      }
    } catch (error) {
      console.error('Error fetching upcoming class:', error);
    } finally {
      setLoading(false);
    }
  };

  const isLive = (startsAt: string, endsAt: string | null, isLiveFlag: boolean) => {
    const now = new Date();
    const start = new Date(startsAt);
    const end = endsAt ? new Date(endsAt) : null;
    
    return isLiveFlag && now >= start && (!end || now <= end);
  };

  const getTimeUntilStart = (startsAt: string) => {
    const now = new Date();
    const start = new Date(startsAt);
    const diff = start.getTime() - now.getTime();
    
    if (diff <= 0) return null;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleJoinClass = () => {
    if (!upcomingClass) return;
    
    const requiredTier = upcomingClass.access_tier as 'free' | 'premium' | 'pro' | 'enterprise';
    
    if (!hasAccess(requiredTier)) {
      toast({
        title: "Upgrade Required",
        description: `Upgrade to ${requiredTier} or Enterprise to access live sessions`,
        variant: "destructive",
      });
      navigate('/premium-upgrade');
      return;
    }

    navigate(`/live-classes/${upcomingClass.id}`);
  };

  if (loading || !upcomingClass) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5 mb-6">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">{upcomingClass.title}</h3>
              {isLive(upcomingClass.starts_at, upcomingClass.ends_at, upcomingClass.is_live) && (
                <Badge variant="destructive" className="animate-pulse">
                  🔴 LIVE NOW
                </Badge>
              )}
              <Badge variant="outline">{upcomingClass.access_tier}</Badge>
            </div>
            
            {upcomingClass.description && (
              <p className="text-muted-foreground mb-3">{upcomingClass.description}</p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(upcomingClass.starts_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {new Date(upcomingClass.starts_at).toLocaleTimeString()}
              </div>
              <div className="flex items-center gap-1">
                <Video className="h-4 w-4" />
                {upcomingClass.instructor}
              </div>
              {getTimeUntilStart(upcomingClass.starts_at) && (
                <div className="flex items-center gap-1 text-primary">
                  <Clock className="h-4 w-4" />
                  Starts in {getTimeUntilStart(upcomingClass.starts_at)}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button onClick={handleJoinClass}>
              {isLive(upcomingClass.starts_at, upcomingClass.ends_at, upcomingClass.is_live) ? 'Join Live' : 'View Class'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/live-classes')}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              All Classes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveClassBanner;