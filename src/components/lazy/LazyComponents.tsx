import { lazy } from 'react';

// Lazy load heavy components for better performance
export const LiveVideoPlayer = lazy(() => import('@/components/LiveVideoPlayer'));
export const EnhancedSpatialWorkspace = lazy(() => import('@/components/spatial/EnhancedSpatialWorkspace'));
export const EnhancedCodeSnippets = lazy(() => import('@/components/code-snippets/EnhancedCodeSnippets'));
export const QGISIntegration = lazy(() => import('@/components/qgis/QGISIntegration'));
export const MapboxMap = lazy(() => import('@/components/maps/MapboxMap'));

// Default loading component
export const ComponentLoader = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
};