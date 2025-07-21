import { useEffect } from 'react';

const useResourcePreloader = () => {
  useEffect(() => {
    // Preload critical resources
    const preloadResources = [
      '/fonts/inter.woff2',
      // Add other critical resources here
    ];

    preloadResources.forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      link.as = url.includes('font') ? 'font' : 'fetch';
      if (url.includes('font')) {
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    });

    // Cleanup function
    return () => {
      preloadResources.forEach((url) => {
        const link = document.querySelector(`link[href="${url}"]`);
        if (link) {
          document.head.removeChild(link);
        }
      });
    };
  }, []);
};

export default useResourcePreloader;