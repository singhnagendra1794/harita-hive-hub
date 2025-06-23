
import React, { useState } from 'react';
import { Search, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlobalSearch from './GlobalSearch';

const SearchTrigger: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Handle keyboard shortcut (Cmd/Ctrl + K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className="relative w-full max-w-sm justify-start text-muted-foreground"
        onClick={() => setIsSearchOpen(true)}
      >
        <Search className="h-4 w-4 mr-2" />
        <span className="flex-1 text-left">Search everything...</span>
        <div className="hidden sm:flex items-center gap-1 ml-2 text-xs">
          <Command className="h-3 w-3" />
          <span>K</span>
        </div>
      </Button>
      
      <GlobalSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
};

export default SearchTrigger;
