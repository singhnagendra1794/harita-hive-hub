import { useEffect } from 'react';

export const usePerformanceOptimization = () => {
  useEffect(() => {
    // Prefetch critical DNS lookups
    const prefetchDNS = () => {
      const domains = [
        'uphgdwrwaizomnyuwfwr.supabase.co',
        'fonts.googleapis.com',
        'cdn.jsdelivr.net'
      ];
      
      domains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = `//${domain}`;
        document.head.appendChild(link);
      });
    };

    // Preload critical resources
    const preloadResources = () => {
      const resources = [
        { href: '/fonts/inter.woff2', as: 'font', type: 'font/woff2' },
        { href: '/favicon.ico', as: 'image' }
      ];
      
      resources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource.href;
        link.as = resource.as;
        if (resource.type) link.type = resource.type;
        if (resource.as === 'font') link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });
    };

    // Optimize images with lazy loading
    const optimizeImages = () => {
      const images = document.querySelectorAll('img:not([loading])');
      images.forEach(img => {
        img.setAttribute('loading', 'lazy');
        img.setAttribute('decoding', 'async');
      });
    };

    // Remove unused CSS (simple approach)
    const removeUnusedCSS = () => {
      // Mark critical CSS as important
      const criticalSelectors = [
        '.container',
        '.btn',
        '.nav',
        '.header',
        '.footer',
        '.card'
      ];
      
      // This is a simplified approach - in a real app you'd use a tool like PurgeCSS
      console.log('Critical CSS selectors preserved:', criticalSelectors);
    };

    // Enable passive event listeners for better scroll performance
    const optimizeEventListeners = () => {
      const events = ['touchstart', 'touchmove', 'wheel'];
      events.forEach(event => {
        document.addEventListener(event, () => {}, { passive: true });
      });
    };

    // Service Worker for caching (if available)
    const enableServiceWorker = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered:', registration);
          })
          .catch(error => {
            console.log('SW registration failed:', error);
          });
      }
    };

    // Apply optimizations
    prefetchDNS();
    preloadResources();
    setTimeout(optimizeImages, 100); // Wait for initial render
    removeUnusedCSS();
    optimizeEventListeners();
    enableServiceWorker();

    // Monitor Core Web Vitals
    const measurePerformance = () => {
      // LCP (Largest Contentful Paint)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // FID (First Input Delay) - polyfill
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          console.log('FID:', entry.startTime);
        });
      }).observe({ entryTypes: ['first-input'] });

      // CLS (Cumulative Layout Shift)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          console.log('CLS shift:', entry.startTime);
        });
      }).observe({ entryTypes: ['layout-shift'] });
    };

    // Run performance measurement
    if (window.PerformanceObserver) {
      measurePerformance();
    }

    // Cleanup function
    return () => {
      // Remove event listeners if needed
    };
  }, []);
};

export default usePerformanceOptimization;