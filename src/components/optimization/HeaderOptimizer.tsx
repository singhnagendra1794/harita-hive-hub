import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// Component to prevent header duplication issues
const HeaderOptimizer = () => {
  const [duplicateHeaders, setDuplicateHeaders] = useState<string[]>([]);
  const location = useLocation();

  useEffect(() => {
    // Check for duplicate headers after route change
    const checkHeaders = () => {
      const navElements = document.querySelectorAll('nav');
      const headerElements = document.querySelectorAll('header');
      const navbarElements = document.querySelectorAll('[class*="navbar"], [class*="navigation"]');
      
      const issues = [];
      
      if (navElements.length > 1) {
        issues.push(`Found ${navElements.length} <nav> elements`);
        // Remove duplicate navs, keep only the first one
        for (let i = 1; i < navElements.length; i++) {
          navElements[i].remove();
        }
      }
      
      if (headerElements.length > 1) {
        issues.push(`Found ${headerElements.length} <header> elements`);
        // Remove duplicate headers, keep only the first one
        for (let i = 1; i < headerElements.length; i++) {
          headerElements[i].remove();
        }
      }
      
      if (navbarElements.length > 1) {
        issues.push(`Found ${navbarElements.length} navbar elements`);
      }
      
      setDuplicateHeaders(issues);
      
      if (issues.length > 0 && process.env.NODE_ENV === 'development') {
        console.warn('Header duplication detected and fixed:', issues);
      }
    };

    // Run check after a short delay to ensure DOM is ready
    const timeout = setTimeout(checkHeaders, 100);
    
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  // Only show in development
  if (process.env.NODE_ENV === 'production') return null;

  return duplicateHeaders.length > 0 ? (
    <div className="fixed bottom-4 right-4 z-[9999] bg-warning text-warning-foreground px-3 py-2 rounded-md text-xs max-w-xs">
      <div className="font-medium">Headers Fixed:</div>
      {duplicateHeaders.map((issue, index) => (
        <div key={index}>{issue}</div>
      ))}
    </div>
  ) : null;
};

export default HeaderOptimizer;
