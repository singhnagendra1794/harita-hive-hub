import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Mobile app optimization for Capacitor
declare global {
  interface Window {
    Capacitor?: any;
  }
}

const MobileOptimizations: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 || !!window.Capacitor;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Capacitor-specific optimizations
    if (window.Capacitor) {
      document.body.classList.add('capacitor-app');
      console.log('Running in Capacitor mobile app');
    }

    // Add mobile-specific CSS classes
    if (isMobile) {
      document.body.classList.add('mobile-optimized');
    } else {
      document.body.classList.remove('mobile-optimized');
    }

    // Fix viewport height issues on mobile
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    // Prevent zoom on input focus (iOS)
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (input instanceof HTMLElement) {
        input.style.fontSize = '16px';
      }
    });

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, [isMobile]);

  // Fix toast positioning on mobile
  useEffect(() => {
    if (isMobile) {
      const style = document.createElement('style');
      style.textContent = `
        .mobile-optimized .toast-viewport {
          position: fixed !important;
          top: auto !important;
          bottom: 20px !important;
          left: 20px !important;
          right: 20px !important;
          width: auto !important;
          z-index: 9999;
        }
        
        .mobile-optimized .toast {
          width: 100% !important;
          max-width: none !important;
        }
        
        .mobile-optimized .modal-content {
          max-height: calc(100vh - 40px) !important;
          margin: 20px !important;
          width: calc(100vw - 40px) !important;
        }
        
        .mobile-optimized .scroll-snap {
          scroll-snap-type: y mandatory;
        }
        
        .mobile-optimized .scroll-snap-item {
          scroll-snap-align: start;
        }
        
        .mobile-optimized .mobile-button {
          min-height: 44px !important;
          min-width: 44px !important;
        }
        
        .mobile-optimized .mobile-touch-target {
          padding: 12px !important;
        }
        
        /* Fix for file upload on mobile */
        .mobile-optimized input[type="file"] {
          transform: scale(1.2);
          opacity: 1 !important;
        }
        
        /* Improve modal backdrop on mobile */
        .mobile-optimized .modal-backdrop {
          backdrop-filter: blur(4px);
        }
        
        /* Fix for maps on mobile */
        .mobile-optimized .leaflet-container {
          height: calc(100vh - 200px) !important;
          min-height: 300px !important;
        }
        
        /* Better button spacing on mobile */
        .mobile-optimized .mobile-button-group > * {
          margin: 4px 0 !important;
        }
        
        /* Capacitor-specific optimizations */
        .capacitor-app {
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
          -webkit-tap-highlight-color: transparent;
        }
        
        .capacitor-app .safe-area-top {
          padding-top: env(safe-area-inset-top);
        }
        
        .capacitor-app .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
        
        /* Enhanced touch targets for mobile */
        .mobile-optimized button,
        .mobile-optimized a,
        .mobile-optimized [role="button"] {
          min-height: 44px !important;
          min-width: 44px !important;
        }
        
        /* Prevent zoom on input focus */
        .mobile-optimized input,
        .mobile-optimized select,
        .mobile-optimized textarea {
          font-size: 16px !important;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [isMobile]);

  return null;
};

export default MobileOptimizations;