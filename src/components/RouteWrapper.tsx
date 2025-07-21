import { Suspense, ReactNode } from 'react';

interface RouteWrapperProps {
  children: ReactNode;
}

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const RouteWrapper = ({ children }: RouteWrapperProps) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
);

export default RouteWrapper;