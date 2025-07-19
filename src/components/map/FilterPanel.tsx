import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Filter, X, Plus, ChevronDown, ChevronRight 
} from 'lucide-react';

interface MapLayer {
  id: string;
  name: string;
  type: 'vector' | 'raster';
  metadata?: {
    featureCount?: number;
  };
}

interface FilterPanelProps {
  layers: MapLayer[];
  onFilter: (layerId: string, filter: any) => void;
}

interface FilterRule {
  id: string;
  field: string;
  operator: string;
  value: string;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ layers, onFilter }) => {
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(
    layers.length > 0 ? layers[0].id : null
  );
  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Mock field data for demonstration
  const mockFields = [
    { name: 'name', type: 'string' },
    { name: 'population', type: 'number' },
    { name: 'area', type: 'number' },
    { name: 'type', type: 'string' },
    { name: 'elevation', type: 'number' },
    { name: 'status', type: 'string' }
  ];

  const operators = {
    string: [
      { value: 'equals', label: 'Equals' },
      { value: 'contains', label: 'Contains' },
      { value: 'starts_with', label: 'Starts with' },
      { value: 'ends_with', label: 'Ends with' },
      { value: 'not_equals', label: 'Not equals' }
    ],
    number: [
      { value: 'equals', label: 'Equals' },
      { value: 'greater_than', label: 'Greater than' },
      { value: 'less_than', label: 'Less than' },
      { value: 'between', label: 'Between' },
      { value: 'not_equals', label: 'Not equals' }
    ]
  };

  const addFilterRule = () => {
    const newRule: FilterRule = {
      id: crypto.randomUUID(),
      field: mockFields[0].name,
      operator: 'equals',
      value: ''
    };
    setFilterRules(prev => [...prev, newRule]);
  };

  const updateFilterRule = (ruleId: string, updates: Partial<FilterRule>) => {
    setFilterRules(prev => prev.map(rule =>
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
  };

  const removeFilterRule = (ruleId: string) => {
    setFilterRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  const applyFilters = () => {
    if (selectedLayerId && filterRules.length > 0) {
      onFilter(selectedLayerId, filterRules);
    }
  };

  const clearFilters = () => {
    setFilterRules([]);
    if (selectedLayerId) {
      onFilter(selectedLayerId, []);
    }
  };

  const getFieldType = (fieldName: string) => {
    const field = mockFields.find(f => f.name === fieldName);
    return field?.type || 'string';
  };

  if (layers.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Filter className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
          <h3 className="font-medium mb-1">No Vector Layers</h3>
          <p className="text-sm text-muted-foreground">
            Upload vector data to enable filtering
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter Data
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Layer Selection */}
          <div className="space-y-2">
            <Label>Select Layer</Label>
            <Select value={selectedLayerId || ''} onValueChange={setSelectedLayerId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a layer" />
              </SelectTrigger>
              <SelectContent>
                {layers.map((layer) => (
                  <SelectItem key={layer.id} value={layer.id}>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-xs">
                        Vector
                      </Badge>
                      {layer.name}
                      {layer.metadata?.featureCount && (
                        <span className="text-xs text-muted-foreground">
                          ({layer.metadata.featureCount} features)
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filter Rules */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Filter Rules</Label>
              <Button variant="outline" size="sm" onClick={addFilterRule}>
                <Plus className="h-3 w-3 mr-1" />
                Add Rule
              </Button>
            </div>

            {filterRules.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground border border-dashed rounded">
                No filter rules. Click "Add Rule" to create filters.
              </div>
            ) : (
              <div className="space-y-2">
                {filterRules.map((rule) => {
                  const fieldType = getFieldType(rule.field);
                  const availableOperators = operators[fieldType as keyof typeof operators] || operators.string;

                  return (
                    <div key={rule.id} className="flex items-center gap-2 p-2 border rounded">
                      <Select
                        value={rule.field}
                        onValueChange={(value) => updateFilterRule(rule.id, { field: value })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {mockFields.map((field) => (
                            <SelectItem key={field.name} value={field.name}>
                              {field.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={rule.operator}
                        onValueChange={(value) => updateFilterRule(rule.id, { operator: value })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableOperators.map((op) => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Input
                        value={rule.value}
                        onChange={(e) => updateFilterRule(rule.id, { value: e.target.value })}
                        placeholder="Value"
                        className="flex-1"
                        type={fieldType === 'number' ? 'number' : 'text'}
                      />

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFilterRule(rule.id)}
                        className="p-1"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={applyFilters}
              disabled={filterRules.length === 0 || !selectedLayerId}
              size="sm"
              className="flex-1"
            >
              Apply Filters
            </Button>
            <Button
              variant="outline"
              onClick={clearFilters}
              disabled={filterRules.length === 0}
              size="sm"
            >
              Clear
            </Button>
          </div>

          {/* Applied Filters Summary */}
          {filterRules.length > 0 && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Applied Filters</h4>
              <div className="space-y-1">
                {filterRules.map((rule) => (
                  <div key={rule.id} className="text-xs">
                    <Badge variant="secondary" className="mr-1">
                      {rule.field}
                    </Badge>
                    {rule.operator} "{rule.value}"
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="p-3 bg-muted/20 rounded text-xs text-muted-foreground">
            <p className="font-medium mb-1">Examples:</p>
            <p>• Population greater than 10000</p>
            <p>• City name contains "San"</p>
            <p>• Type equals "Urban"</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default FilterPanel;