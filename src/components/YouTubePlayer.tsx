
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, ExternalLink } from "lucide-react";

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  description?: string;
  embedUrl?: string;
  autoplay?: boolean;
  modestBranding?: boolean;
  controls?: boolean;
}

const YouTubePlayer = ({ 
  videoId, 
  title, 
  description, 
  embedUrl,
  autoplay = false,
  modestBranding = true,
  controls = true 
}: YouTubePlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(autoplay);

  const getEmbedUrl = () => {
    if (embedUrl) return embedUrl;
    
    const params = new URLSearchParams();
    if (autoplay) params.append('autoplay', '1');
    if (modestBranding) params.append('modestbranding', '1');
    if (controls) params.append('controls', '1');
    params.append('rel', '0'); // Don't show related videos
    params.append('fs', '1'); // Enable fullscreen
    
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  };

  const openInYouTube = () => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            {title}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={openInYouTube}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in YouTube
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="aspect-video w-full mb-4 rounded-lg overflow-hidden bg-black">
          <iframe
            width="100%"
            height="100%"
            src={getEmbedUrl()}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="w-full h-full"
            onLoad={() => setIsPlaying(true)}
            style={{ 
              pointerEvents: 'auto',
              userSelect: 'none'
            }}
          />
        </div>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default YouTubePlayer;
