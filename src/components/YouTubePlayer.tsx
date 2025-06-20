
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  description?: string;
}

const YouTubePlayer = ({ videoId, title, description }: YouTubePlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video w-full mb-4">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}?si=IxR_hQRga-TmUfCT`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="rounded-lg"
            onLoad={() => setIsPlaying(true)}
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
