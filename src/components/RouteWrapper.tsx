import { Suspense, ReactNode } from 'react';

interface RouteWrapperProps {
  children: ReactNode;
}

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const RouteErrorFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="flex flex-col items-center space-y-4 text-center">
      <div className="text-destructive text-6xl">⚠️</div>
      <h2 className="text-2xl font-bold">Loading Error</h2>
      <p className="text-muted-foreground max-w-md">
        This page is temporarily unavailable. Please refresh or try again later.
      </p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Refresh Page
      </button>
    </div>
  </div>
);

const RouteWrapper = ({ children }: RouteWrapperProps) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
);

export default RouteWrapper;