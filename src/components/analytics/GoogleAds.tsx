import React, { useEffect } from 'react';

const GoogleAds: React.FC = () => {
  useEffect(() => {
    // Check if gtag is already initialized to avoid duplicates
    if ((window as any).gtag || document.querySelector('script[src*="gtag/js?id=AW-17391286626"]')) {
      return;
    }

    // Initialize dataLayer immediately
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).gtag = function() { (window as any).dataLayer.push(arguments); };
    (window as any).gtag('js', new Date().toISOString());
    (window as any).gtag('config', 'AW-17391286626');

    // Load Google Tag script
    const gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=AW-17391286626';
    gtagScript.onload = () => {
      console.log('Google Ads tracking loaded successfully');
    };
    gtagScript.onerror = () => {
      console.error('Failed to load Google Ads tracking');
    };
    
    // Insert at the beginning of head for immediate loading
    document.head.insertBefore(gtagScript, document.head.firstChild);

    return () => {
      // Cleanup on unmount
      try {
        if (gtagScript.parentNode) {
          document.head.removeChild(gtagScript);
        }
      } catch (e) {
        // Script may have already been removed
      }
    };
  }, []);

  return null;
};

export default GoogleAds;