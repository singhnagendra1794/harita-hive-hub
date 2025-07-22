import { lazy } from 'react';

// Lazy load heavy components for better performance - only include existing components

// Default loading component
export const ComponentLoader = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
};