import { useEffect } from 'react';

const preloadCriticalResources = () => {
  // Preload critical fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = '/fonts/inter-var.woff2';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink);

  // Preload critical images
  const criticalImages = [
    '/lovable-uploads/c5358765-5f6a-4c01-bb00-5f17261ffd2d.png', // Logo
  ];

  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = src;
    link.as = 'image';
    document.head.appendChild(link);
  });

  // Prefetch common routes
  const commonRoutes = [
    '/browse-courses',
    '/live-classes',
    '/toolkits',
    '/pricing'
  ];

  commonRoutes.forEach(route => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    document.head.appendChild(link);
  });
};

const ResourcePreloader = () => {
  useEffect(() => {
    // Preload resources after the page has loaded
    if (document.readyState === 'complete') {
      preloadCriticalResources();
    } else {
      window.addEventListener('load', preloadCriticalResources);
      return () => window.removeEventListener('load', preloadCriticalResources);
    }
  }, []);

  return null;
};

export default ResourcePreloader;