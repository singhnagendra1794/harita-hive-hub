import { lazy, Suspense, ComponentType, ReactNode } from 'react';

interface LazyLoadProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const defaultFallback = (
  <div className="animate-pulse bg-muted rounded-lg h-32 w-full flex items-center justify-center">
    <div className="text-muted-foreground">Loading...</div>
  </div>
);

export const LazyLoad = ({ children, fallback = defaultFallback }: LazyLoadProps) => (
  <Suspense fallback={fallback}>
    {children}
  </Suspense>
);

export const createLazyComponent = <T extends Record<string, any>>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  fallback?: ReactNode
) => {
  const LazyComponent = lazy(importFn);
  
  return (props: T) => (
    <LazyLoad fallback={fallback}>
      <LazyComponent {...(props as any)} />
    </LazyLoad>
  );
};

export default LazyLoad;