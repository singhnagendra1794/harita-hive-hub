import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void;
  }
}

interface GoogleAnalyticsProps {
  trackingId?: string;
}

const GoogleAnalytics: React.FC<GoogleAnalyticsProps> = ({ trackingId }) => {
  const location = useLocation();

  useEffect(() => {
    // Only load if tracking ID is provided
    if (!trackingId) return;

    // Load Google Analytics script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${trackingId}', {
        page_title: document.title,
        page_location: window.location.href,
        send_page_view: true
      });
    `;
    document.head.appendChild(script2);

    return () => {
      // Cleanup scripts when component unmounts
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, [trackingId]);

  // Track page views on route changes
  useEffect(() => {
    if (!trackingId || !window.gtag) return;

    window.gtag('config', trackingId, {
      page_path: location.pathname + location.search,
      page_title: document.title,
      page_location: window.location.href,
    });
  }, [location, trackingId]);

  // Track custom events
  const trackEvent = (eventName: string, parameters: any = {}) => {
    if (!trackingId || !window.gtag) return;
    
    window.gtag('event', eventName, {
      event_category: 'engagement',
      event_label: parameters.label || '',
      value: parameters.value || 0,
      ...parameters
    });
  };

  // Track conversion events
  const trackConversion = (action: string, value?: number) => {
    if (!trackingId || !window.gtag) return;
    
    window.gtag('event', 'conversion', {
      send_to: trackingId,
      event_category: 'conversion',
      event_label: action,
      value: value || 0
    });
  };

  // Make tracking functions available globally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).haritaHiveAnalytics = {
        trackEvent,
        trackConversion
      };
    }
  }, []);

  return null;
};

export default GoogleAnalytics;