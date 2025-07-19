import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Search, 
  Filter, 
  ChevronDown, 
  X,
  Code,
  Database,
  Satellite,
  BarChart3,
  Globe,
  Brain
} from "lucide-react";

interface FilterState {
  search: string;
  categories: string[];
  languages: string[];
  tags: string[];
  difficulty: string[];
  status: string[];
  testing: string[];
}

interface CodeLibraryFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableCategories: Array<{ value: string; label: string; icon: any; count: number }>;
  availableLanguages: Array<{ value: string; label: string; count: number }>;
  availableTags: Array<{ value: string; label: string; count: number }>;
  totalResults: number;
}

export const CodeLibraryFilters = ({
  filters,
  onFiltersChange,
  availableCategories,
  availableLanguages,
  availableTags,
  totalResults
}: CodeLibraryFiltersProps) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const updateFilter = (key: keyof FilterState, value: string | string[]) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const toggleArrayFilter = (key: keyof FilterState, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilter(key, newArray);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      categories: [],
      languages: [],
      tags: [],
      difficulty: [],
      status: [],
      testing: []
    });
  };

  const getActiveFilterCount = () => {
    return (
      filters.categories.length +
      filters.languages.length +
      filters.tags.length +
      filters.difficulty.length +
      filters.status.length +
      filters.testing.length +
      (filters.search ? 1 : 0)
    );
  };

  const difficultyOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' }
  ];

  const statusOptions = [
    { value: 'production_ready', label: 'Production Ready' },
    { value: 'tested', label: 'Tested' },
    { value: 'experimental', label: 'Experimental' }
  ];

  const testingOptions = [
    { value: 'passed', label: 'All Tests Passed' },
    { value: 'warning', label: 'Has Warnings' },
    { value: 'failed', label: 'Has Failures' },
    { value: 'untested', label: 'Not Tested' }
  ];

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search code snippets, use cases, or technologies..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-10 pr-4"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-1">
                {getActiveFilterCount()}
              </Badge>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
          </Button>
          
          {getActiveFilterCount() > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear all
            </Button>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          {totalResults} snippets found
        </div>
      </div>

      {/* Active Filters Display */}
      {getActiveFilterCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{filters.search}"
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => updateFilter('search', '')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {filters.categories.map(category => (
            <Badge key={category} variant="secondary" className="flex items-center gap-1">
              {availableCategories.find(c => c.value === category)?.label || category}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => toggleArrayFilter('categories', category)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}

          {filters.languages.map(language => (
            <Badge key={language} variant="secondary" className="flex items-center gap-1">
              {availableLanguages.find(l => l.value === language)?.label || language}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => toggleArrayFilter('languages', language)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}

          {filters.tags.map(tag => (
            <Badge key={tag} variant="outline" className="flex items-center gap-1">
              {tag}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => toggleArrayFilter('tags', tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Collapsible Filters */}
      <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <CollapsibleContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Categories */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {availableCategories.map(category => {
                  const Icon = category.icon;
                  return (
                    <label key={category.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category.value)}
                        onChange={() => toggleArrayFilter('categories', category.value)}
                        className="rounded"
                      />
                      <Icon className="h-4 w-4" />
                      <span className="text-sm flex-1">{category.label}</span>
                      <span className="text-xs text-muted-foreground">({category.count})</span>
                    </label>
                  );
                })}
              </CardContent>
            </Card>

            {/* Languages */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Languages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {availableLanguages.map(language => (
                  <label key={language.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.languages.includes(language.value)}
                      onChange={() => toggleArrayFilter('languages', language.value)}
                      className="rounded"
                    />
                    <Code className="h-4 w-4" />
                    <span className="text-sm flex-1">{language.label}</span>
                    <span className="text-xs text-muted-foreground">({language.count})</span>
                  </label>
                ))}
              </CardContent>
            </Card>

            {/* Status & Quality */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Status & Quality</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">Production Status</div>
                  {statusOptions.map(status => (
                    <label key={status.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.status.includes(status.value)}
                        onChange={() => toggleArrayFilter('status', status.value)}
                        className="rounded"
                      />
                      <span className="text-sm">{status.label}</span>
                    </label>
                  ))}
                </div>

                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">Testing Status</div>
                  {testingOptions.map(testing => (
                    <label key={testing.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.testing.includes(testing.value)}
                        onChange={() => toggleArrayFilter('testing', testing.value)}
                        className="rounded"
                      />
                      <span className="text-sm">{testing.label}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Popular Tags */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Popular Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {availableTags.slice(0, 20).map(tag => (
                  <Button
                    key={tag.value}
                    variant={filters.tags.includes(tag.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleArrayFilter('tags', tag.value)}
                    className="text-xs"
                  >
                    {tag.label}
                    <span className="ml-1 text-xs opacity-70">({tag.count})</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};