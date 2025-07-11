import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, Users, Play, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface LiveClassProps {
  id: string;
  title: string;
  description: string;
  youtube_video_id: string;
  starts_at: string;
  ends_at?: string | null;
  is_live: boolean;
  access_tier: 'free' | 'premium' | 'pro' | 'enterprise';
  instructor: string;
  thumbnail_url?: string | null;
}

const LiveClass: React.FC<LiveClassProps> = ({
  id,
  title,
  description,
  youtube_video_id,
  starts_at,
  ends_at,
  is_live,
  access_tier,
  instructor,
  thumbnail_url
}) => {
  const { hasAccess } = usePremiumAccess();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [timeUntilStart, setTimeUntilStart] = useState<string>('');

  const isLive = () => {
    const now = new Date();
    const start = new Date(starts_at);
    const end = ends_at ? new Date(ends_at) : null;
    
    return is_live && now >= start && (!end || now <= end);
  };

  const isUpcoming = () => {
    return new Date(starts_at) > new Date();
  };

  const updateTimeUntilStart = () => {
    const now = new Date();
    const start = new Date(starts_at);
    const diff = start.getTime() - now.getTime();
    
    if (diff <= 0) {
      setTimeUntilStart('');
      return;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      setTimeUntilStart(`${days}d ${hours % 24}h`);
    } else if (hours > 0) {
      setTimeUntilStart(`${hours}h ${minutes}m`);
    } else {
      setTimeUntilStart(`${minutes}m`);
    }
  };

  useEffect(() => {
    updateTimeUntilStart();
    const interval = setInterval(updateTimeUntilStart, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [starts_at]);

  const handleJoinClass = () => {
    if (!hasAccess(access_tier)) {
      toast({
        title: "Upgrade Required",
        description: `Upgrade to ${access_tier} or higher to access this live class`,
        variant: "destructive",
      });
      navigate('/premium-upgrade');
      return;
    }

    navigate(`/live-classes/${id}`);
  };

  const getYouTubeEmbedUrl = () => {
    return `https://www.youtube.com/embed/${youtube_video_id}?autoplay=0&modestbranding=1&rel=0`;
  };

  const getYouTubeWatchUrl = () => {
    return `https://www.youtube.com/watch?v=${youtube_video_id}`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Thumbnail/Video Preview */}
      <div className="aspect-video bg-muted relative overflow-hidden">
        {thumbnail_url ? (
          <img 
            src={thumbnail_url} 
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Video className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Live indicator */}
        {isLive() && (
          <div className="absolute top-2 left-2">
            <Badge variant="destructive" className="animate-pulse">
              🔴 LIVE
            </Badge>
          </div>
        )}
        
        {/* Time until start */}
        {timeUntilStart && (
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-background/80">
              {timeUntilStart}
            </Badge>
          </div>
        )}
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
          <Button
            size="lg"
            className="rounded-full w-16 h-16 p-0"
            onClick={handleJoinClass}
          >
            <Play className="h-8 w-8" />
          </Button>
        </div>
      </div>

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{title}</CardTitle>
            <CardDescription className="mt-2 line-clamp-2">
              {description}
            </CardDescription>
          </div>
          <Badge variant="outline" className="ml-2">
            {access_tier}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Class details */}
        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(starts_at).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {new Date(starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="flex items-center gap-1">
            <Video className="h-4 w-4" />
            {instructor}
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Interactive
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button 
            className="flex-1" 
            onClick={handleJoinClass}
            disabled={!hasAccess(access_tier)}
          >
            {isLive() ? 'Join Live' : isUpcoming() ? 'Register' : 'Watch Recording'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(getYouTubeWatchUrl(), '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        {/* Access requirement notice */}
        {!hasAccess(access_tier) && (
          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            Requires {access_tier} plan or higher
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveClass;