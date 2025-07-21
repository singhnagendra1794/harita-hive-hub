import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface LiveVideoPlayerProps {
  src: string;
  title?: string;
  className?: string;
  onError?: (error: any) => void;
  onLoad?: () => void;
}

export const LiveVideoPlayer = ({ src, title, className = "", onError, onLoad }: LiveVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: false,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(console.error);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);
      });

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS support
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(console.error);
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full rounded-lg bg-black"
        controls
        muted
        playsInline
        poster="/placeholder.svg"
      />
      {title && (
        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-md">
          <span className="text-sm font-medium">{title}</span>
        </div>
      )}
    </div>
  );
};