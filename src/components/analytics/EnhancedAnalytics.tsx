import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import GoogleAnalytics from './GoogleAnalytics';

declare global {
  interface Window {
    fbq: (action: string, event: string, params?: any) => void;
    gtag: (command: string, targetId: string, config?: any) => void;
    hj: (event: string, ...params: any[]) => void;
    lintrk: (action: string, params?: any) => void;
  }
}

interface EnhancedAnalyticsProps {
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  linkedinInsightId?: string;
  hotjarId?: string;
  enableScrollTracking?: boolean;
  enableDownloadTracking?: boolean;
}

const EnhancedAnalytics: React.FC<EnhancedAnalyticsProps> = ({
  googleAnalyticsId = 'G-PLACEHOLDER123',
  facebookPixelId,
  linkedinInsightId,
  hotjarId,
  enableScrollTracking = true,
  enableDownloadTracking = true
}) => {
  const location = useLocation();

  // Facebook Pixel
  useEffect(() => {
    if (!facebookPixelId) return;

    // Load Facebook Pixel without inline scripts
    window.fbq = window.fbq || (function(){
      const fbq: any = function(){ (fbq.q = fbq.q || []).push(arguments) };
      fbq.q = fbq.q || [];
      fbq.loaded = true;
      fbq.version = '2.0';
      return fbq;
    })();

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);

    script.onload = () => {
      try {
        window.fbq('init', facebookPixelId);
        window.fbq('track', 'PageView');
      } catch (e) {
        // ignore
      }
    };

    return () => {
      document.head.removeChild(script);
    };
  }, [facebookPixelId]);

  // LinkedIn Insight Tag
  useEffect(() => {
    if (!linkedinInsightId) return;

    // Load LinkedIn Insight without inline scripts
    (window as any)._linkedin_data_partner_ids = (window as any)._linkedin_data_partner_ids || [];
    (window as any)._linkedin_data_partner_ids.push(linkedinInsightId);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
    document.head.appendChild(script);

    script.onload = () => {
      try {
        if (window.lintrk) {
          window.lintrk('track', { conversion_id: linkedinInsightId });
        }
      } catch (e) {
        // ignore
      }
    };

    return () => {
      document.head.removeChild(script);
    };
  }, [linkedinInsightId]);

  // Hotjar
  useEffect(() => {
    if (!hotjarId) return;

    const script = document.createElement('script');
    script.innerHTML = `
      (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:${hotjarId},hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
      })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
    `;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [hotjarId]);

  // Scroll depth tracking
  useEffect(() => {
    if (!enableScrollTracking) return;

    let maxScroll = 0;
    const trackingPoints = [25, 50, 75, 90];
    const tracked = new Set<number>();

    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        
        trackingPoints.forEach(point => {
          if (scrollPercent >= point && !tracked.has(point)) {
            tracked.add(point);
            
            // Track in Google Analytics
            if (window.gtag) {
              window.gtag('event', 'scroll_depth', {
                event_category: 'engagement',
                event_label: `${point}%`,
                value: point
              });
            }
            
            // Track in Facebook Pixel
            if (window.fbq) {
              window.fbq('track', 'ViewContent', {
                content_type: 'scroll_depth',
                value: point
              });
            }
          }
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enableScrollTracking]);

  // Download tracking
  useEffect(() => {
    if (!enableDownloadTracking) return;

    const handleDownloadClick = (event: Event) => {
      const target = event.target as HTMLAnchorElement;
      if (target.href && (target.href.includes('.pdf') || target.href.includes('.zip') || target.href.includes('.qgz'))) {
        const fileName = target.href.split('/').pop() || 'unknown';
        
        // Track in Google Analytics
        if (window.gtag) {
          window.gtag('event', 'file_download', {
            event_category: 'engagement',
            event_label: fileName,
            file_name: fileName
          });
        }
        
        // Track in Facebook Pixel
        if (window.fbq) {
          window.fbq('track', 'Lead', {
            content_name: fileName,
            content_category: 'download'
          });
        }
      }
    };

    document.addEventListener('click', handleDownloadClick);
    return () => document.removeEventListener('click', handleDownloadClick);
  }, [enableDownloadTracking]);

  // Enhanced event tracking functions
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).haritaHiveAnalytics = {
        ...(window as any).haritaHiveAnalytics,
        
        trackConversion: (action: string, value?: number, currency = 'USD') => {
          // Google Analytics
          if (window.gtag) {
            window.gtag('event', 'conversion', {
              event_category: 'conversion',
              event_label: action,
              value: value || 0,
              currency
            });
          }
          
          // Facebook Pixel
          if (window.fbq) {
            window.fbq('track', 'Purchase', {
              value: value || 0,
              currency
            });
          }
          
          // LinkedIn
          if (window.lintrk) {
            window.lintrk('track', { conversion_id: linkedinInsightId });
          }
        },
        
        trackSignup: (method: string) => {
          // Google Analytics
          if (window.gtag) {
            window.gtag('event', 'sign_up', {
              method,
              event_category: 'engagement'
            });
          }
          
          // Facebook Pixel
          if (window.fbq) {
            window.fbq('track', 'CompleteRegistration');
          }
        },
        
        trackCourseEnrollment: (courseName: string, price?: number) => {
          // Google Analytics
          if (window.gtag) {
            window.gtag('event', 'course_enrollment', {
              event_category: 'education',
              event_label: courseName,
              value: price || 0
            });
          }
          
          // Facebook Pixel
          if (window.fbq) {
            window.fbq('track', 'InitiateCheckout', {
              content_name: courseName,
              value: price || 0,
              currency: 'USD'
            });
          }
        },
        
        trackToolDownload: (toolName: string) => {
          // Google Analytics
          if (window.gtag) {
            window.gtag('event', 'tool_download', {
              event_category: 'tools',
              event_label: toolName
            });
          }
          
          // Facebook Pixel
          if (window.fbq) {
            window.fbq('track', 'Lead', {
              content_name: toolName,
              content_category: 'tool'
            });
          }
        }
      };
    }
  }, [linkedinInsightId]);

  return <GoogleAnalytics trackingId={googleAnalyticsId} />;
};

export default EnhancedAnalytics;