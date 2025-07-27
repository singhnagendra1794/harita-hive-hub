import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ScreenProtectionProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export const ScreenProtection: React.FC<ScreenProtectionProps> = ({ 
  children, 
  enabled = true 
}) => {
  const { user } = useAuth();
  useEffect(() => {
    if (!enabled) return;

    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Block common screenshot shortcuts and DevTools
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' || // DevTools
        (e.ctrlKey && e.shiftKey && e.key === 'I') || // DevTools
        (e.ctrlKey && e.shiftKey && e.key === 'J') || // Console
        (e.ctrlKey && e.key === 'U') || // View Source
        (e.metaKey && e.altKey && e.key === 'I') || // Safari DevTools
        e.key === 'PrintScreen' || // Print Screen
        (e.altKey && e.key === 'PrintScreen') || // Alt + Print Screen
        (e.ctrlKey && e.key === 'P') || // Print
        (e.ctrlKey && e.shiftKey && e.key === 'C') || // Inspect Element
        (e.metaKey && e.shiftKey && e.key === 'C') || // Mac Inspect
        (e.ctrlKey && e.key === 'S') || // Save page
        (e.metaKey && e.key === 'S') // Mac Save
      ) {
        e.preventDefault();
        e.stopPropagation();
        
        // Show warning for unauthorized actions
        if (user) {
          console.log(`⚠️ Security: User ${user.email} attempted to use: ${e.key}`);
        }
        
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

    // Disable text selection and drag
    const disableSelection = () => {
      document.body.style.userSelect = 'none';
      (document.body.style as any).webkitUserSelect = 'none';
      (document.body.style as any).mozUserSelect = 'none';
      (document.body.style as any).msUserSelect = 'none';
      (document.body.style as any).webkitTouchCallout = 'none';
      document.body.ondragstart = () => false;
      document.body.onselectstart = () => false;
    };

    // Block video download attempts
    const blockVideoDownload = (event: Event) => {
      event.preventDefault();
      return false;
    };

    // Apply protections
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', blockVideoDownload);
    document.addEventListener('selectstart', blockVideoDownload);
    disableSelection();
    detectScreenRecording();

    // Additional protection: Disable common browser shortcuts
    const preventShortcuts = (e: KeyboardEvent) => {
      // Disable Ctrl+Shift+I, Ctrl+U, F12, etc.
      if ((e.ctrlKey && e.shiftKey && e.keyCode === 73) || 
          (e.ctrlKey && e.keyCode === 85) || 
          e.keyCode === 123) {
        e.preventDefault();
        return false;
      }
    };
    
    document.addEventListener('keydown', preventShortcuts);

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', blockVideoDownload);
      document.removeEventListener('selectstart', blockVideoDownload);
      document.body.style.userSelect = '';
      (document.body.style as any).webkitUserSelect = '';
      (document.body.style as any).mozUserSelect = '';
      (document.body.style as any).msUserSelect = '';
      (document.body.style as any).webkitTouchCallout = '';
      document.body.ondragstart = null;
      document.body.onselectstart = null;
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
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      
    >
      {children}
      {/* Security overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-50"
        style={{ background: 'transparent' }}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
};

export default ScreenProtection;