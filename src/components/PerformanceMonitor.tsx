import { useEffect } from 'react';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

const PerformanceMonitor = () => {
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        // Log performance metrics for monitoring
        console.log(`${entry.entryType}: ${entry.name} - ${entry.duration}ms`);
        
        // Send to analytics service if needed
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime);
        }
        
        if (entry.entryType === 'first-input') {
          const fidEntry = entry as any; // Type assertion for FID entry
          console.log('FID:', fidEntry.processingStart - fidEntry.startTime);
        }
        
        if (entry.entryType === 'layout-shift') {
          const clsEntry = entry as any; // Type assertion for CLS entry
          if (!clsEntry.hadRecentInput) {
            console.log('CLS:', clsEntry.value);
          }
        }
      });
    });

    // Observe relevant performance metrics
    try {
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (e) {
      // Fallback for browsers that don't support all entry types
      console.warn('Some performance metrics not available:', e);
    }

    // Monitor resource loading times
    const measureResourcePerformance = () => {
      const resources = performance.getEntriesByType('resource');
      const slowResources = resources.filter((resource: PerformanceEntry) => 
        resource.duration > 1000 // Resources taking more than 1 second
      );
      
      if (slowResources.length > 0) {
        console.warn('Slow loading resources:', slowResources);
      }
    };

    // Check performance after page load
    window.addEventListener('load', measureResourcePerformance);

    return () => {
      observer.disconnect();
      window.removeEventListener('load', measureResourcePerformance);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default PerformanceMonitor;