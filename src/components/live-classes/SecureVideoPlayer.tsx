import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, Maximize, Lock, AlertTriangle } from 'lucide-react';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { useAuth } from '@/contexts/AuthContext';
import { UserWatermark } from '@/components/security/UserWatermark';
import { ScreenProtection } from '@/components/security/ScreenProtection';

interface SecureVideoPlayerProps {
  embedUrl: string;
  title: string;
  isLive?: boolean;
  isPremium?: boolean;
  onUpgrade?: () => void;
}

const SecureVideoPlayer: React.FC<SecureVideoPlayerProps> = ({
  embedUrl,
  title,
  isLive = false,
  isPremium = false,
  onUpgrade,
}) => {
  const { user } = useAuth();
  const { hasAccess, loading } = usePremiumAccess();
  const [playerError, setPlayerError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Check access permissions
  const canWatch = !isPremium || hasAccess;

  // Secure embed URL with additional restrictions
  const getSecureEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // Extract video ID from various YouTube URL formats
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (!videoIdMatch) return url;
    
    const videoId = videoIdMatch[1];
    
    // Create secure embed URL with restrictions
    const params = new URLSearchParams({
      modestbranding: '1',
      rel: '0',
      disablekb: '1',
      controls: '1',
      showinfo: '0',
      iv_load_policy: '3',
      fs: '0', // Disable fullscreen
      cc_load_policy: '0',
      start: '0'
    });

    // Add live streaming parameters if applicable
    if (isLive) {
      params.set('autoplay', '1');
      params.set('mute', '1');
    }

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  };

  const secureUrl = getSecureEmbedUrl(embedUrl);

  // Error handling for iframe load
  const handleIframeError = () => {
    setPlayerError('Failed to load video. Please try again later.');
  };

  if (loading) {
    return (
      <Card className="aspect-video bg-muted animate-pulse flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading player...</p>
        </div>
      </Card>
    );
  }

  if (!canWatch) {
    return (
      <Card className="aspect-video bg-gradient-to-br from-muted to-muted/50 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center p-6">
            <Lock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Premium Content</h3>
            <p className="text-gray-300 mb-4">
              This {isLive ? 'live stream' : 'recording'} requires a Professional Plan subscription
            </p>
            <Button onClick={onUpgrade} className="bg-yellow-500 hover:bg-yellow-600 text-black">
              Upgrade to Professional
            </Button>
          </div>
        </div>
        {/* Blurred preview */}
        <div className="absolute inset-0 opacity-30 blur-lg">
          <iframe
            src={secureUrl}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </Card>
    );
  }

  if (playerError) {
    return (
      <Card className="aspect-video bg-muted flex items-center justify-center">
        <div className="text-center p-6">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Video Unavailable</h3>
          <p className="text-muted-foreground mb-4">{playerError}</p>
          <Button onClick={() => setPlayerError(null)} variant="outline">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative">
      <ScreenProtection enabled={isPremium}>
        <Card className="aspect-video overflow-hidden relative">
          {/* User watermark for premium content */}
          {isPremium && user && (
            <UserWatermark 
              className="absolute top-4 right-4 z-10 text-white/70 text-xs"
            />
          )}
          
          {/* Video player */}
          <iframe
            ref={iframeRef}
            src={secureUrl}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen={false} // Disable fullscreen to prevent escaping watermark
            onError={handleIframeError}
            sandbox="allow-scripts allow-same-origin allow-presentation"
          />
          
          {/* Live indicator */}
          {isLive && (
            <div className="absolute top-4 left-4 z-10">
              <div className="bg-red-500 text-white px-2 py-1 rounded text-sm font-medium flex items-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
            </div>
          )}
          
          {/* Anti-piracy overlay (invisible but prevents some screen recording) */}
          {isPremium && (
            <div 
              className="absolute inset-0 pointer-events-none z-5"
              style={{
                background: 'transparent',
                mixBlendMode: 'difference',
              }}
            />
          )}
        </Card>
      </ScreenProtection>
    </div>
  );
};

export default SecureVideoPlayer;