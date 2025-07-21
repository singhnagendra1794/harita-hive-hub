import React, { Suspense, lazy, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

// Reusable loading component
const RouteLoader = ({ message = "Loading page..." }: { message?: string }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  </div>
);

// Higher-order component for lazy loading routes
export const createLazyRoute = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  loadingMessage?: string
) => {
  const LazyComponent = lazy(importFunc);
  
  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={<RouteLoader message={loadingMessage} />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Preload function for critical routes
export const preloadRoute = (importFunc: () => Promise<{ default: ComponentType<any> }>) => {
  // Preload the component
  importFunc();
};

// Hook for preloading routes on hover or focus
export const useRoutePreloader = () => {
  const preloadOnHover = (importFunc: () => Promise<{ default: ComponentType<any> }>) => ({
    onMouseEnter: () => preloadRoute(importFunc),
    onFocus: () => preloadRoute(importFunc),
  });

  return { preloadOnHover };
};