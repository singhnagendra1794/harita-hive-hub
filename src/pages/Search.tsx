
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAISearch } from '@/hooks/useAISearch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, FileText, Code, Video, Calendar, Mail, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedFilter, setSelectedFilter] = useState(searchParams.get('type') || 'all');
  const { search, searchResults, isSearching, searchHistory } = useAISearch();

  useEffect(() => {
    if (query) {
      search(query, selectedFilter !== 'all' ? { type: selectedFilter } : undefined);
    }
  }, [query, selectedFilter, search]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selectedFilter !== 'all') params.set('type', selectedFilter);
    setSearchParams(params);
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
    { value: 'all', label: 'All Content' },
    { value: 'note', label: 'Notes' },
    { value: 'code_snippet', label: 'Code Snippets' },
    { value: 'video', label: 'Videos' },
    { value: 'live_class', label: 'Live Classes' },
    { value: 'newsletter', label: 'Newsletter' },
  ];

  return (
    <div className="container py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Search</h1>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search across all content..."
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-2 flex-wrap">
              {filterOptions.map((filter) => (
                <Button
                  key={filter.value}
                  variant={selectedFilter === filter.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Results */}
          <div className="lg:col-span-3">
            {isSearching && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                  <span>Searching...</span>
                </div>
              </div>
            )}

            {!isSearching && query && searchResults.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
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
                </CardContent>
              </Card>
            )}

            {!isSearching && searchResults.length > 0 && (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{query}"
                </div>
                
                {searchResults.map((result) => (
                  <Card key={result.id} className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => window.location.href = result.url}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={cn("p-3 rounded-lg", getTypeColor(result.type))}>
                          {getTypeIcon(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors">
                            {result.title}
                          </h3>
                          <p className="text-muted-foreground mb-4 line-clamp-3">
                            {result.content}
                          </p>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className={getTypeColor(result.type)}>
                              {result.type.replace('_', ' ')}
                            </Badge>
                            {result.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {result.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{result.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Relevance: {Math.round(result.relevanceScore * 100)}%</span>
                            <span>{new Date(result.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {searchHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    Recent Searches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {searchHistory.slice(0, 8).map((item, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(item)}
                        className="w-full text-left text-sm p-2 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
  );
};

export default SearchPage;
