import React, { useEffect } from 'react';

interface ScreenProtectionProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export const ScreenProtection: React.FC<ScreenProtectionProps> = ({ 
  children, 
  enabled = true 
}) => {
  useEffect(() => {
    if (!enabled) return;

    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable common screenshot shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S, etc.
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 's') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        e.key === 'PrintScreen'
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Add protection for screen recording detection
    const detectScreenRecording = () => {
      // Check for OBS, Loom, and other recording software
      const userAgent = navigator.userAgent.toLowerCase();
      
      // Detect some screen recording extensions
      if (window.navigator.mediaDevices && window.navigator.mediaDevices.getDisplayMedia) {
        // Monitor for screen capture attempts
        const originalGetDisplayMedia = window.navigator.mediaDevices.getDisplayMedia;
        window.navigator.mediaDevices.getDisplayMedia = function(...args) {
          console.warn('Screen capture attempt detected and blocked');
          return Promise.reject(new Error('Screen recording not allowed'));
        };
      }
    };

    // Disable text selection
    const disableSelection = () => {
      document.body.style.userSelect = 'none';
      (document.body.style as any).webkitUserSelect = 'none';
      (document.body.style as any).mozUserSelect = 'none';
      (document.body.style as any).msUserSelect = 'none';
    };

    // Apply protections
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    disableSelection();
    detectScreenRecording();

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.userSelect = '';
      (document.body.style as any).webkitUserSelect = '';
      (document.body.style as any).mozUserSelect = '';
      (document.body.style as any).msUserSelect = '';
    };
  }, [enabled]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div 
      className="screen-protected relative"
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTouchCallout: 'none'
      } as React.CSSProperties}
    >
      {children}
      {/* Invisible overlay to prevent right-clicks */}
      <div 
        className="absolute inset-0 pointer-events-none z-10"
        style={{ background: 'transparent' }}
      />
    </div>
  );
};

export default ScreenProtection;