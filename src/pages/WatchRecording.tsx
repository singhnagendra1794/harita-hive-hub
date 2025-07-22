import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ScreenProtection from '@/components/security/ScreenProtection';

const WatchRecording = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const videoUrl = searchParams.get('url');
  const title = searchParams.get('title') || 'Class Recording';

  useEffect(() => {
    if (!videoUrl) {
      setError('No video URL provided');
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [videoUrl]);

  const handleVideoError = () => {
    setError('Recording not available yet. It may still be processing after the stream ended.');
  };

  const handleVideoLoad = () => {
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !videoUrl) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center gap-2 justify-center">
              <Video className="h-5 w-5" />
              Recording Unavailable
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              {error || 'No recording URL provided'}
            </p>
            <Button onClick={() => navigate('/live-classes')} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Live Classes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/live-classes')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Live Classes
          </Button>
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>

        <ScreenProtection enabled={true}>
          <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
            <video
              className="w-full h-full"
              controls
              preload="metadata"
              onError={handleVideoError}
              onLoadedMetadata={handleVideoLoad}
              controlsList="nodownload"
              onContextMenu={(e) => e.preventDefault()}
            >
              <source src={videoUrl} type="video/mp4" />
              <p className="text-white p-4">
                Your browser does not support the video tag or the recording is not available yet.
              </p>
            </video>
          </div>
        </ScreenProtection>

        {error && (
          <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20">
            <CardContent className="pt-6">
              <p className="text-yellow-800 dark:text-yellow-200">{error}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WatchRecording;