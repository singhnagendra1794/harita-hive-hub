import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const HeaderTest = () => {
  const [headerCount, setHeaderCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    // Count navigation headers on page
    const navElements = document.querySelectorAll('nav');
    const headerElements = document.querySelectorAll('header');
    const navbarElements = document.querySelectorAll('[class*="navbar"]');
    
    const totalHeaders = navElements.length + headerElements.length + navbarElements.length;
    setHeaderCount(totalHeaders);
    
    if (totalHeaders > 1) {
      console.warn(`🚨 Multiple headers detected on ${location.pathname}: ${totalHeaders} headers found`);
      console.warn('Nav elements:', navElements);
      console.warn('Header elements:', headerElements);
      console.warn('Navbar elements:', navbarElements);
    }
  }, [location.pathname]);

  // Only show warning in development
  if (process.env.NODE_ENV === 'production') return null;

  return headerCount > 1 ? (
    <div className="fixed top-0 left-0 z-[9999] bg-red-500 text-white px-4 py-2 text-sm">
      ⚠️ {headerCount} headers detected on {location.pathname}
    </div>
  ) : null;
};

export default HeaderTest;