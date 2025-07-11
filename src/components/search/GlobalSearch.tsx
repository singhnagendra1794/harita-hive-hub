
import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, TrendingUp, Filter, FileText, Code, Video, Calendar, Mail } from 'lucide-react';
import { useAISearch } from '@/hooks/useAISearch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { search, searchResults, isSearching, searchHistory, popularSearches } = useAISearch();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (query.trim()) {
        search(query, selectedFilter !== 'all' ? { type: selectedFilter } : undefined);
        setShowSuggestions(false);
      } else {
        setShowSuggestions(true);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [query, selectedFilter, search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'note': return <FileText className="h-4 w-4" />;
      case 'code_snippet': return <Code className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'live_class': return <Calendar className="h-4 w-4" />;
      case 'newsletter': return <Mail className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'note': return 'bg-blue-100 text-blue-800';
      case 'code_snippet': return 'bg-green-100 text-green-800';
      case 'video': return 'bg-purple-100 text-purple-800';
      case 'live_class': return 'bg-orange-100 text-orange-800';
      case 'newsletter': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Content', icon: Search },
    { value: 'note', label: 'Notes', icon: FileText },
    { value: 'code_snippet', label: 'Code', icon: Code },
    { value: 'video', label: 'Videos', icon: Video },
    { value: 'live_class', label: 'Classes', icon: Calendar },
    { value: 'newsletter', label: 'Newsletter', icon: Mail },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="flex items-start justify-center pt-[10vh] px-4">
        <Card 
          className="w-full max-w-3xl mx-auto shadow-2xl border-0"
          onClick={(e) => e.stopPropagation()}
        >
          <CardContent className="p-0">
            {/* Search Header */}
            <div className="flex items-center gap-3 p-6 border-b">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search across notes, code, videos, classes..."
                className="border-0 shadow-none text-lg focus-visible:ring-0 px-0"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 p-4 border-b bg-gray-50/50">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="flex gap-2 overflow-x-auto">
                {filterOptions.map((filter) => {
                  const Icon = filter.icon;
                  return (
                    <Button
                      key={filter.value}
                      variant={selectedFilter === filter.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFilter(filter.value)}
                      className="whitespace-nowrap"
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      {filter.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Content Area */}
            <div className="max-h-[60vh] overflow-y-auto">
              {isSearching && (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                    <span>Searching...</span>
                  </div>
                </div>
              )}

              {!isSearching && query && searchResults.length === 0 && (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-4">
                    We couldn't find any content matching "{query}". Your search has been logged to help us improve our content library.
                  </p>
                  <div className="text-sm text-muted-foreground">
                    <p>Try:</p>
                    <ul className="mt-2 text-left inline-block">
                      <li>• Different or simpler keywords</li>
                      <li>• Adjusting your content filters</li>
                      <li>• Checking spelling</li>
                    </ul>
                  </div>
                </div>
              )}

              {!isSearching && searchResults.length > 0 && (
                <div className="p-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  </div>
                  <div className="space-y-3">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="group p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer"
                        onClick={() => window.location.href = result.url}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn("p-2 rounded-lg", getTypeColor(result.type))}>
                            {getTypeIcon(result.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium group-hover:text-primary transition-colors">
                              {result.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {result.content}
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                              <Badge variant="secondary" className="text-xs">
                                {result.type.replace('_', ' ')}
                              </Badge>
                              {result.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              <span className="text-xs text-muted-foreground ml-auto">
                                {new Date(result.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showSuggestions && (searchHistory.length > 0 || popularSearches.length > 0) && (
                <div className="p-4 space-y-4">
                  {searchHistory.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Recent Searches</span>
                      </div>
                      <div className="space-y-1">
                        {searchHistory.slice(0, 5).map((item, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(item)}
                            className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {popularSearches.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Popular Searches</span>
                        </div>
                        <div className="space-y-1">
                          {popularSearches.map((item, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(item)}
                              className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors"
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GlobalSearch;
