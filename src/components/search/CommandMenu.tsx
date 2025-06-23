
import React, { useState, useEffect } from 'react';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAISearch } from '@/hooks/useAISearch';
import { FileText, Code, Video, Calendar, Mail, Search } from 'lucide-react';

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CommandMenu: React.FC<CommandMenuProps> = ({ open, onOpenChange }) => {
  const [query, setQuery] = useState('');
  const { search, searchResults, isSearching } = useAISearch();

  useEffect(() => {
    if (query.trim()) {
      search(query);
    }
  }, [query, search]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'note': return <FileText className="h-4 w-4" />;
      case 'code_snippet': return <Code className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'live_class': return <Calendar className="h-4 w-4" />;
      case 'newsletter': return <Mail className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <CommandInput 
            placeholder="Search everything..." 
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>
              {isSearching ? "Searching..." : "No results found."}
            </CommandEmpty>
            {searchResults.length > 0 && (
              <CommandGroup heading="Search Results">
                {searchResults.slice(0, 8).map((result) => (
                  <CommandItem
                    key={result.id}
                    onSelect={() => {
                      window.location.href = result.url;
                      onOpenChange(false);
                    }}
                  >
                    {getIcon(result.type)}
                    <div className="ml-2">
                      <div className="font-medium">{result.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {result.type.replace('_', ' ')}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default CommandMenu;
