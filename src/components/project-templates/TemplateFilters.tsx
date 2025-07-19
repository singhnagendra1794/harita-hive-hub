import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  RotateCcw
} from "lucide-react";

interface FilterSection {
  id: string;
  label: string;
  options: Array<{
    value: string;
    label: string;
    count?: number;
    icon?: string;
  }>;
}

interface TemplateFiltersProps {
  filters: {
    search: string;
    sectors: string[];
    tools: string[];
    skillLevels: string[];
    tags: string[];
    status: string[];
  };
  onFiltersChange: (filters: any) => void;
  availableSectors: FilterSection['options'];
  availableTools: FilterSection['options'];
  availableSkillLevels: FilterSection['options'];
  availableTags: FilterSection['options'];
  totalResults: number;
}

export function TemplateFilters({
  filters,
  onFiltersChange,
  availableSectors,
  availableTools,
  availableSkillLevels,
  availableTags,
  totalResults
}: TemplateFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['sectors', 'tools', 'skillLevels'])
  );

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const updateFilter = (filterKey: string, value: string, checked: boolean) => {
    const currentValues = filters[filterKey] || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    
    onFiltersChange({
      ...filters,
      [filterKey]: newValues
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      sectors: [],
      tools: [],
      skillLevels: [],
      tags: [],
      status: []
    });
  };

  const hasActiveFilters = 
    filters.search ||
    filters.sectors.length > 0 ||
    filters.tools.length > 0 ||
    filters.skillLevels.length > 0 ||
    filters.tags.length > 0 ||
    filters.status.length > 0;

  const filterSections: FilterSection[] = [
    {
      id: 'sectors',
      label: 'Sectors',
      options: availableSectors
    },
    {
      id: 'tools',
      label: 'Tools & Technologies',
      options: availableTools
    },
    {
      id: 'skillLevels',
      label: 'Skill Level',
      options: availableSkillLevels
    },
    {
      id: 'status',
      label: 'Status',
      options: [
        { value: 'featured', label: 'Featured', count: 0 },
        { value: 'verified', label: 'Verified', count: 0 },
        { value: 'recent', label: 'Recently Added', count: 0 }
      ]
    },
    {
      id: 'tags',
      label: 'Popular Tags',
      options: availableTags.slice(0, 10) // Show top 10 tags
    }
  ];

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-10"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFiltersChange({ ...filters, search: '' })}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          {totalResults} template{totalResults !== 1 ? 's' : ''} found
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Active filters */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Active Filters:</div>
            <div className="flex flex-wrap gap-1">
              {filters.sectors.map(sector => (
                <Badge key={sector} variant="secondary" className="gap-1">
                  {sector.replace('_', ' ')}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => updateFilter('sectors', sector, false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {filters.tools.map(tool => (
                <Badge key={tool} variant="secondary" className="gap-1">
                  {tool.toUpperCase()}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => updateFilter('tools', tool, false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {filters.skillLevels.map(level => (
                <Badge key={level} variant="secondary" className="gap-1">
                  {level}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => updateFilter('skillLevels', level, false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {filters.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  #{tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => updateFilter('tags', tag, false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Filter sections */}
        {filterSections.map((section) => (
          <Collapsible
            key={section.id}
            open={expandedSections.has(section.id)}
            onOpenChange={() => toggleSection(section.id)}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between p-0 h-auto font-medium"
              >
                <span>{section.label}</span>
                {expandedSections.has(section.id) ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-2 space-y-2">
              {section.options.map((option) => {
                const isChecked = filters[section.id]?.includes(option.value) || false;
                
                return (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <Checkbox
                      id={`${section.id}-${option.value}`}
                      checked={isChecked}
                      onCheckedChange={(checked) =>
                        updateFilter(section.id, option.value, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`${section.id}-${option.value}`}
                      className="flex-1 cursor-pointer flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1">
                        {option.icon && <span>{option.icon}</span>}
                        {option.label}
                      </span>
                      {option.count !== undefined && (
                        <span className="text-muted-foreground text-xs">
                          ({option.count})
                        </span>
                      )}
                    </label>
                  </div>
                );
              })}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
}