
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: 'note' | 'code_snippet' | 'video' | 'tutorial' | 'live_class' | 'newsletter';
  url: string;
  relevanceScore: number;
  tags: string[];
  created_at: string;
}

interface SearchFilters {
  type?: string;
  tags?: string[];
  dateRange?: { start: string; end: string };
}

export const useAISearch = () => {
  const { user } = useAuth();
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('search_history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Fuzzy matching function for typo tolerance
  const fuzzyMatch = (query: string, text: string): number => {
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    
    // Exact match gets highest score
    if (textLower.includes(queryLower)) {
      return 1.0;
    }
    
    // Character-by-character fuzzy matching
    let score = 0;
    let queryIndex = 0;
    
    for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
      if (textLower[i] === queryLower[queryIndex]) {
        score++;
        queryIndex++;
      }
    }
    
    return queryIndex === queryLower.length ? score / query.length : 0;
  };

  // Keyword-based search with fuzzy matching
  const keywordSearch = async (query: string, filters?: SearchFilters): Promise<SearchResult[]> => {
    const results: SearchResult[] = [];
    
    // Search in notes (from CodeSnippets page data)
    const noteResults = mockSearchData.notes
      .map(note => ({
        ...note,
        relevanceScore: Math.max(
          fuzzyMatch(query, note.title),
          fuzzyMatch(query, note.content) * 0.8,
          note.tags.some(tag => fuzzyMatch(query, tag) > 0.5) ? 0.7 : 0
        )
      }))
      .filter(note => note.relevanceScore > 0.3);
    
    // Search in code snippets
    const codeResults = mockSearchData.codeSnippets
      .map(snippet => ({
        ...snippet,
        relevanceScore: Math.max(
          fuzzyMatch(query, snippet.title),
          fuzzyMatch(query, snippet.content) * 0.8,
          snippet.tags.some(tag => fuzzyMatch(query, tag) > 0.5) ? 0.7 : 0
        )
      }))
      .filter(snippet => snippet.relevanceScore > 0.3);
    
    // Search in live classes
    const classResults = mockSearchData.liveClasses
      .map(liveClass => ({
        ...liveClass,
        relevanceScore: Math.max(
          fuzzyMatch(query, liveClass.title),
          fuzzyMatch(query, liveClass.content) * 0.8
        )
      }))
      .filter(liveClass => liveClass.relevanceScore > 0.3);
    
    results.push(...noteResults, ...codeResults, ...classResults);
    
    // Apply filters
    let filteredResults = results;
    if (filters?.type) {
      filteredResults = filteredResults.filter(r => r.type === filters.type);
    }
    
    // Sort by relevance score
    return filteredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
  };

  // Main search function
  const search = async (query: string, filters?: SearchFilters) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      // Track search analytics
      if (user) {
        await supabase.from('user_analytics').insert({
          user_id: user.id,
          event_type: 'search',
          event_data: { query, filters: filters || {} } as any
        });
      }
      
      // Perform keyword search with fuzzy matching
      const results = await keywordSearch(query, filters);
      
      setSearchResults(results);
      
      // Update search history
      const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('search_history', JSON.stringify(newHistory));
      
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Get popular searches
  const fetchPopularSearches = async () => {
    try {
      const { data } = await supabase
        .from('user_analytics')
        .select('event_data')
        .eq('event_type', 'search')
        .limit(100);
      
      if (data) {
        const searches = data
          .map(d => {
            try {
              const eventData = d.event_data as any;
              return eventData?.query;
            } catch {
              return null;
            }
          })
          .filter(Boolean)
          .reduce((acc: Record<string, number>, query: string) => {
            acc[query] = (acc[query] || 0) + 1;
            return acc;
          }, {});
        
        const popular = Object.entries(searches)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 5)
          .map(([query]) => query);
        
        setPopularSearches(popular);
      }
    } catch (error) {
      console.error('Error fetching popular searches:', error);
    }
  };

  useEffect(() => {
    fetchPopularSearches();
  }, []);

  return {
    search,
    searchResults,
    isSearching,
    searchHistory,
    popularSearches,
  };
};

// Mock data for demonstration - in production this would come from your actual data sources
const mockSearchData = {
  notes: [
    {
      id: '1',
      title: 'QGIS Advanced Techniques',
      content: 'Learn advanced spatial analysis and buffer creation techniques in QGIS',
      type: 'note' as const,
      url: '/notes/1',
      tags: ['qgis', 'spatial-analysis', 'buffer'],
      created_at: '2024-06-20T10:00:00Z',
      relevanceScore: 0
    },
    {
      id: '2',
      title: 'Python for GIS Automation',
      content: 'Automate GIS workflows using Python scripting and PyQGIS',
      type: 'note' as const,
      url: '/notes/2',
      tags: ['python', 'automation', 'pyqgis'],
      created_at: '2024-06-19T14:30:00Z',
      relevanceScore: 0
    }
  ],
  codeSnippets: [
    {
      id: '3',
      title: 'Buffer Creation Script',
      content: 'from qgis.core import * // Create buffer zones around features',
      type: 'code_snippet' as const,
      url: '/code-snippets#3',
      tags: ['qgis', 'buffer', 'python'],
      created_at: '2024-06-18T09:15:00Z',
      relevanceScore: 0
    },
    {
      id: '4',
      title: 'Coordinate Transformation',
      content: 'const proj4 = require("proj4"); // Transform coordinates between CRS',
      type: 'code_snippet' as const,
      url: '/code-snippets#4',
      tags: ['javascript', 'coordinates', 'transformation'],
      created_at: '2024-06-17T16:45:00Z',
      relevanceScore: 0
    }
  ],
  liveClasses: [
    {
      id: '5',
      title: 'Advanced QGIS Techniques',
      content: 'Learn advanced spatial analysis and automation in QGIS with expert instructor',
      type: 'live_class' as const,
      url: '/live-classes#5',
      tags: ['qgis', 'advanced', 'live'],
      created_at: '2024-06-25T10:00:00Z',
      relevanceScore: 0
    },
    {
      id: '6',
      title: 'Python for GIS Automation',
      content: 'Automate GIS workflows using Python and ArcPy in this interactive session',
      type: 'live_class' as const,
      url: '/live-classes#6',
      tags: ['python', 'automation', 'arcpy'],
      created_at: '2024-06-27T14:00:00Z',
      relevanceScore: 0
    }
  ]
};
