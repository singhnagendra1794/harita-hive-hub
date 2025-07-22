import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, Play } from 'lucide-react';
import LazyImage from '@/components/ui/lazy-image';
import { useLazyLoad } from '@/hooks/useIntersectionObserver';

interface LiveClassCardProps {
  liveClass: {
    id: string;
    title: string;
    description?: string;
    thumbnail_url?: string;
    start_time: string;
    duration_minutes?: number;
    stream_key: string;
  };
  onWatchRecording?: (streamKey: string) => void;
}

const LiveClassCard = memo(({ liveClass, onWatchRecording }: LiveClassCardProps) => {
  const { ref, shouldLoad } = useLazyLoad({ rootMargin: '100px' });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card ref={ref} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="aspect-video bg-gray-900 rounded-lg mb-3 overflow-hidden relative">
          {shouldLoad && liveClass.thumbnail_url ? (
            <LazyImage 
              src={liveClass.thumbnail_url} 
              alt={liveClass.title}
              className="w-full h-full object-cover"
              width={640}
              height={360}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="h-8 w-8 text-gray-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Play className="h-8 w-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-lg">{liveClass.title}</CardTitle>
        {liveClass.description && (
          <p className="text-sm text-muted-foreground">{liveClass.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(liveClass.start_time)}
          </div>
          {liveClass.duration_minutes && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {liveClass.duration_minutes}m
            </div>
          )}
        </div>
        <Button 
          className="w-full" 
          onClick={() => onWatchRecording?.(liveClass.stream_key)}
        >
          <Play className="h-4 w-4 mr-2" />
          Watch Recording
        </Button>
      </CardContent>
    </Card>
  );
});

LiveClassCard.displayName = 'LiveClassCard';

export default LiveClassCard;