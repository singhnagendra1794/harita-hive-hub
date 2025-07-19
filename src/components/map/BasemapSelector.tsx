import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Mountain, Satellite, Map as MapIcon } from 'lucide-react';

interface Basemap {
  id: string;
  name: string;
  url: string;
  attribution: string;
  type: 'osm' | 'carto' | 'stamen' | 'esri' | 'nasa' | 'opentopo';
  variant?: string;
}

interface BasemapSelectorProps {
  basemaps: Basemap[];
  selectedBasemap: Basemap;
  onBasemapChange: (basemap: Basemap) => void;
}

const BasemapSelector: React.FC<BasemapSelectorProps> = ({
  basemaps,
  selectedBasemap,
  onBasemapChange
}) => {
  const getBasemapIcon = (type: string, variant?: string) => {
    switch (type) {
      case 'esri':
        return variant === 'satellite' ? Satellite : MapIcon;
      case 'stamen':
        return variant === 'terrain' ? Mountain : MapIcon;
      case 'opentopo':
        return Mountain;
      default:
        return Globe;
    }
  };

  const getBasemapPreview = (basemap: Basemap) => {
    const baseColors = {
      osm: 'from-blue-100 to-green-100',
      carto: basemap.variant === 'dark' ? 'from-gray-800 to-gray-900' : 'from-gray-50 to-gray-100',
      stamen: 'from-amber-100 to-orange-100',
      esri: basemap.variant === 'satellite' ? 'from-green-800 to-blue-900' : 'from-blue-100 to-green-100',
      nasa: 'from-purple-900 to-black',
      opentopo: 'from-green-200 to-amber-100'
    };

    return baseColors[basemap.type] || 'from-gray-100 to-gray-200';
  };

  return (
    <Card className="w-64">
      <CardContent className="p-4">
        <div className="space-y-3">
          <h3 className="font-medium text-sm">Basemap</h3>
          <div className="grid grid-cols-2 gap-2">
            {basemaps.map((basemap) => {
              const Icon = getBasemapIcon(basemap.type, basemap.variant);
              const isSelected = selectedBasemap.id === basemap.id;
              
              return (
                <div
                  key={basemap.id}
                  className={`relative cursor-pointer rounded-lg border-2 transition-all ${
                    isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => onBasemapChange(basemap)}
                >
                  <div className={`h-16 rounded-t-md bg-gradient-to-br ${getBasemapPreview(basemap)} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${basemap.variant === 'dark' ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{basemap.name}</p>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {basemap.type.toUpperCase()}
                    </Badge>
                  </div>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background" />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">Current: {selectedBasemap.name}</p>
            <p>{selectedBasemap.attribution}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasemapSelector;