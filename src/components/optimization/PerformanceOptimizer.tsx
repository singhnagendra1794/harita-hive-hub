import { memo, useMemo, ReactNode, useState, useEffect } from 'react';

interface PerformanceOptimizerProps {
  children: ReactNode;
  dependencies?: any[];
  skipMemo?: boolean;
}

// Memoized wrapper for expensive components
export const PerformanceOptimizer = memo(({ 
  children, 
  dependencies = [], 
  skipMemo = false 
}: PerformanceOptimizerProps) => {
  const memoizedChildren = useMemo(() => {
    if (skipMemo) return children;
    return children;
  }, dependencies);

  return <>{memoizedChildren}</>;
});

PerformanceOptimizer.displayName = 'PerformanceOptimizer';

// Hook for debouncing values
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Component for lazy loading images
export const LazyImage = memo(({ 
  src, 
  alt, 
  className = '', 
  ...props 
}: React.ImgHTMLAttributes<HTMLImageElement>) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded" />
      )}
      <img
        src={src}
        alt={alt}
        className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
        {...props}
      />
      {error && (
        <div className="absolute inset-0 bg-muted rounded flex items-center justify-center text-muted-foreground text-sm">
          Failed to load
        </div>
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export default PerformanceOptimizer;