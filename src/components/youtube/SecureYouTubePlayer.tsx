import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown } from 'lucide-react';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { useAuth } from '@/contexts/AuthContext';

interface SecureYouTubePlayerProps {
  embedUrl: string;
  title: string;
  description?: string;
  accessTier: 'free' | 'professional' | 'enterprise';
  onAccessDenied?: () => void;
}

const SecureYouTubePlayer: React.FC<SecureYouTubePlayerProps> = ({
  embedUrl,
  title,
  description,
  accessTier,
  onAccessDenied
}) => {
  const { user } = useAuth();
  const { hasAccess } = usePremiumAccess();
  const [playerReady, setPlayerReady] = useState(false);

  // Check if user has access based on access tier
  const hasRequiredAccess = () => {
    if (accessTier === 'free') return true;
    if (accessTier === 'professional') return hasAccess('pro');
    if (accessTier === 'enterprise') return hasAccess('enterprise');
    return false;
  };

  useEffect(() => {
    if (!hasRequiredAccess() && onAccessDenied) {
      onAccessDenied();
    }
  }, [hasRequiredAccess, onAccessDenied]);

  const handleUpgrade = () => {
    window.location.href = '/pricing';
  };

  // If user doesn't have access, show upgrade prompt
  if (!user || !hasRequiredAccess()) {
    return (
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Professional Access Required</h3>
              <p className="text-muted-foreground mb-4">
                This premium content is available exclusively for Professional plan members.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Join thousands of GIS professionals advancing their careers with expert-led content.
              </p>
            </div>
            <Button 
              onClick={handleUpgrade}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Professional
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {/* Transparent overlay to prevent YouTube branding clicks */}
        <div 
          className="absolute inset-0 z-10 pointer-events-auto"
          style={{ 
            background: 'transparent',
            userSelect: 'none'
          }}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        />
        
        {/* YouTube iframe with security parameters */}
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{
            pointerEvents: 'auto',
            userSelect: 'none'
          }}
          onLoad={() => setPlayerReady(true)}
          onContextMenu={(e) => e.preventDefault()}
          // Security attributes to prevent external access
          sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
          referrerPolicy="strict-origin-when-cross-origin"
        />
        
        {/* Loading overlay */}
        {!playerReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>
      
      {/* Content info */}
      <div className="mt-4 space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
            <Lock className="h-3 w-3" />
            Professional Content
          </div>
          <div className="text-xs text-muted-foreground">
            Secure • No external links
          </div>
        </div>
      </div>
      
      {/* Custom styles for security */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .secure-youtube-container iframe {
          position: relative;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
          -webkit-tap-highlight-color: transparent;
        }
        
        .secure-youtube-container iframe * {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        `
      }} />
    </div>
  );
};

export default SecureYouTubePlayer;