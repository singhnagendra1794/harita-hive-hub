
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Map, Satellite, Globe, Layers } from 'lucide-react';

interface BasemapOption {
  id: string;
  name: string;
  type: 'streets' | 'satellite' | 'terrain' | 'hybrid';
  url: string;
  attribution: string;
  icon: React.ReactNode;
}

interface BasemapSwitcherProps {
  onBasemapChange: (basemap: BasemapOption) => void;
  currentBasemap: string;
}

const basemapOptions: BasemapOption[] = [
  {
    id: 'osm',
    name: 'OpenStreetMap',
    type: 'streets',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    icon: <Map className="h-4 w-4" />
  },
  {
    id: 'esri-world-imagery',
    name: 'ESRI World Imagery',
    type: 'satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Powered by Esri',
    icon: <Satellite className="h-4 w-4" />
  },
  {
    id: 'carto-light',
    name: 'Carto Light',
    type: 'streets',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap, © CARTO',
    icon: <Globe className="h-4 w-4" />
  },
  {
    id: 'carto-dark',
    name: 'Carto Dark',
    type: 'streets',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap, © CARTO',
    icon: <Layers className="h-4 w-4" />
  }
];

const BasemapSwitcher: React.FC<BasemapSwitcherProps> = ({ onBasemapChange, currentBasemap }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="absolute top-4 right-4 z-10 w-64">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Layers className="h-4 w-4" />
          Basemaps
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-auto p-1 h-6"
          >
            {isExpanded ? '−' : '+'}
          </Button>
        </CardTitle>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            {basemapOptions.map((basemap) => (
              <Button
                key={basemap.id}
                variant={currentBasemap === basemap.id ? "default" : "outline"}
                size="sm"
                className="w-full justify-start"
                onClick={() => onBasemapChange(basemap)}
              >
                {basemap.icon}
                <span className="ml-2 flex-1 text-left">{basemap.name}</span>
                <Badge variant="secondary" className="ml-2 text-xs">
                  {basemap.type}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default BasemapSwitcher;
export { basemapOptions };
export type { BasemapOption };
