import { Suspense, ReactNode } from 'react';

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  minHeight?: string;
}

const LazyWrapper = ({ 
  children, 
  fallback = (
    <div className="animate-pulse bg-muted rounded-lg" style={{ minHeight: '200px' }}>
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  ),
  minHeight = '200px'
}: LazyWrapperProps) => {
  return (
    <Suspense fallback={
      <div style={{ minHeight }} className="w-full">
        {fallback}
      </div>
    }>
      {children}
    </Suspense>
  );
};

export default LazyWrapper;