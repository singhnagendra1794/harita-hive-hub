import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface HLSPlayerProps {
  src: string;
  autoPlay?: boolean;
  controls?: boolean;
  className?: string;
  poster?: string;
}

const HLSPlayer = ({ src, autoPlay = true, controls = true, className = "", poster }: HLSPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: false,
      });
      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) {
          video.play().catch(console.error);
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS Error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Fatal network error encountered, try to recover');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Fatal media error encountered, try to recover');
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS support
      video.src = src;
      if (autoPlay) {
        video.play().catch(console.error);
      }
    }
  }, [src, autoPlay]);

  return (
    <video
      ref={videoRef}
      controls={controls}
      className={className}
      poster={poster}
      playsInline
      muted={autoPlay} // Auto-play requires muted
    />
  );
};

export default HLSPlayer;