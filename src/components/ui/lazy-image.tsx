import React, { Suspense, memo } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
  width?: number;
  height?: number;
  onLoad?: () => void;
  onError?: () => void;
}

const LazyImage = memo(({ 
  src, 
  alt, 
  className = '', 
  loading = 'lazy',
  decoding = 'async',
  width,
  height,
  onLoad,
  onError
}: LazyImageProps) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      width={width}
      height={height}
      onLoad={onLoad}
      onError={onError}
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: width && height ? `${width}px ${height}px` : '300px 200px'
      }}
    />
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;