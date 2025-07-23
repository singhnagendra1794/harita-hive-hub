import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Database, 
  Layers, 
  Satellite, 
  Workflow, 
  Globe, 
  BarChart3, 
  Code, 
  PieChart,
  FileSpreadsheet,
  Map,
  Star,
  TrendingUp
} from "lucide-react";

interface CategoryMenuProps {
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  snippetCounts: Record<string, number>;
}

const categories = [
  {
    id: 'data-extraction',
    title: 'Data Extraction & Preparation',
    icon: Database,
    description: 'Download, clean, and prepare geospatial data',
    subcategories: ['API Integration', 'Data Cleaning', 'Format Conversion']
  },
  {
    id: 'spatial-analysis',
    title: 'Spatial Analysis',
    icon: Layers,
    description: 'Buffers, joins, intersections, and geometric operations',
    subcategories: ['Proximity Analysis', 'Overlay Operations', 'Network Analysis']
  },
  {
    id: 'raster-analysis',
    title: 'Raster Analysis',
    icon: Satellite,
    description: 'NDVI, classification, and raster processing',
    subcategories: ['Vegetation Indices', 'Classification', 'Change Detection']
  },
  {
    id: 'automation',
    title: 'Automation & Batch Processing',
    icon: Workflow,
    description: 'Process multiple files and automate workflows',
    subcategories: ['Batch Processing', 'Task Scheduling', 'Pipeline Creation']
  },
  {
    id: 'remote-sensing',
    title: 'Remote Sensing & GEE',
    icon: Satellite,
    description: 'Google Earth Engine and satellite imagery processing',
    subcategories: ['Sentinel', 'Landsat', 'MODIS', 'Planet']
  },
  {
    id: 'sql-postgis',
    title: 'SQL & PostGIS',
    icon: Database,
    description: 'Spatial databases and PostGIS operations',
    subcategories: ['Spatial Queries', 'Database Design', 'Performance Optimization']
  },
  {
    id: 'web-mapping',
    title: 'Web Mapping',
    icon: Globe,
    description: 'Leaflet, Mapbox, and interactive maps',
    subcategories: ['Interactive Maps', 'Custom Controls', 'Data Visualization']
  },
  {
    id: 'qgis-python',
    title: 'QGIS Python Scripting',
    icon: Code,
    description: 'PyQGIS automation and plugin development',
    subcategories: ['Processing Scripts', 'Plugin Development', 'UI Creation']
  },
  {
    id: 'r-spatial',
    title: 'R Spatial Workflows',
    icon: PieChart,
    description: 'Spatial analysis and visualization in R',
    subcategories: ['Statistical Analysis', 'Geostatistics', 'Visualization']
  },
  {
    id: 'visualization',
    title: 'Visualization & Reporting',
    icon: BarChart3,
    description: 'Create maps, charts, and automated reports',
    subcategories: ['Map Production', 'Chart Creation', 'Report Generation']
  }
];

export const SnippetCategoryMenu = ({ 
  selectedCategories, 
  onCategoryChange, 
  snippetCounts 
}: CategoryMenuProps) => {
  const [showPopular, setShowPopular] = useState(true);

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoryChange(selectedCategories.filter(id => id !== categoryId));
    } else {
      onCategoryChange([...selectedCategories, categoryId]);
    }
  };

  const clearAll = () => {
    onCategoryChange([]);
  };

  const popularCategories = categories
    .map(cat => ({ ...cat, count: snippetCounts[cat.id] || 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return (
    <div className="w-80 space-y-4">
      {/* Popular Categories */}
      {showPopular && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <CardTitle className="text-sm">Most Used</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {popularCategories.map(category => {
              const Icon = category.icon;
              const isSelected = selectedCategories.includes(category.id);
              return (
                <Button
                  key={category.id}
                  variant={isSelected ? "default" : "ghost"}
                  className="w-full justify-start h-auto p-3"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium truncate">{category.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {category.count} snippets
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* All Categories */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">All Categories</CardTitle>
            {selectedCategories.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Clear all
              </Button>
            )}
          </div>
          {selectedCategories.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{selectedCategories.length} selected</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-1">
              {categories.map(category => {
                const Icon = category.icon;
                const isSelected = selectedCategories.includes(category.id);
                const count = snippetCounts[category.id] || 0;
                
                return (
                  <Button
                    key={category.id}
                    variant={isSelected ? "default" : "ghost"}
                    className="w-full justify-start h-auto p-3 mb-1"
                    onClick={() => toggleCategory(category.id)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{category.title}</span>
                          <Badge variant="secondary" className="text-xs">
                            {count}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {category.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {category.subcategories.slice(0, 2).map(sub => (
                            <Badge key={sub} variant="outline" className="text-xs py-0 px-1">
                              {sub}
                            </Badge>
                          ))}
                          {category.subcategories.length > 2 && (
                            <Badge variant="outline" className="text-xs py-0 px-1">
                              +{category.subcategories.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <CardTitle className="text-sm">Library Stats</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Snippets</span>
            <span className="font-medium">{Object.values(snippetCounts).reduce((a, b) => a + b, 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Categories</span>
            <span className="font-medium">{categories.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Production Ready</span>
            <span className="font-medium text-green-600">85%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};