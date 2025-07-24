import React, { useEffect } from 'react';

const GoogleAds: React.FC = () => {
  useEffect(() => {
    // Check if scripts are already loaded to avoid duplicates
    const existingGtagScript = document.querySelector('script[src*="gtag/js?id=AW-17391286626"]');
    if (existingGtagScript) return;

    // Load Google Tag script
    const gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=AW-17391286626';
    document.head.appendChild(gtagScript);

    // Initialize gtag
    const initScript = document.createElement('script');
    initScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'AW-17391286626');
    `;
    document.head.appendChild(initScript);

    return () => {
      // Cleanup on unmount
      try {
        document.head.removeChild(gtagScript);
        document.head.removeChild(initScript);
      } catch (e) {
        // Scripts may have already been removed
      }
    };
  }, []);

  return null;
};

export default GoogleAds;