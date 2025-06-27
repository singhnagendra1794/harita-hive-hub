
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, Trash2, Circle, Square, Ruler, Move } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MapFeature {
  id: string;
  type: 'circle' | 'rectangle' | 'marker';
  coordinates: number[];
  properties: any;
}

const MapPlayground = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'circle' | 'rectangle' | 'measure'>('select');
  const [features, setFeatures] = useState<MapFeature[]>([]);
  const [mapCenter, setMapCenter] = useState([0, 0]);
  const [zoom, setZoom] = useState(2);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          // Process GeoJSON data
          toast({
            title: "File uploaded successfully",
            description: `Loaded ${file.name}`,
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Invalid file format. Please upload a valid GeoJSON file.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const addFeature = (type: 'circle' | 'rectangle' | 'marker') => {
    const newFeature: MapFeature = {
      id: Date.now().toString(),
      type,
      coordinates: [mapCenter[0] + Math.random() * 0.1, mapCenter[1] + Math.random() * 0.1],
      properties: {
        name: `${type} ${features.length + 1}`,
        color: '#3b82f6'
      }
    };
    setFeatures([...features, newFeature]);
    toast({
      title: "Feature added",
      description: `Added ${type} to the map`,
    });
  };

  const clearMap = () => {
    setFeatures([]);
    toast({
      title: "Map cleared",
      description: "All features have been removed",
    });
  };

  const exportData = () => {
    const geojson = {
      type: "FeatureCollection",
      features: features.map(f => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: f.coordinates
        },
        properties: f.properties
      }))
    };
    
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'map-data.geojson';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data exported",
      description: "GeoJSON file downloaded successfully",
    });
  };

  return (
    <div className="space-y-6">
      {/* Map Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Move className="h-5 w-5" />
            Map Tools
          </CardTitle>
          <CardDescription>
            Interactive tools for creating and editing geospatial features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={activeTool === 'select' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTool('select')}
            >
              <Move className="h-4 w-4 mr-2" />
              Select
            </Button>
            <Button
              variant={activeTool === 'circle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setActiveTool('circle');
                addFeature('circle');
              }}
            >
              <Circle className="h-4 w-4 mr-2" />
              Circle
            </Button>
            <Button
              variant={activeTool === 'rectangle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setActiveTool('rectangle');
                addFeature('rectangle');
              }}
            >
              <Square className="h-4 w-4 mr-2" />
              Rectangle
            </Button>
            <Button
              variant={activeTool === 'measure' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTool('measure')}
            >
              <Ruler className="h-4 w-4 mr-2" />
              Measure
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".geojson,.json"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button asChild size="sm" variant="outline">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload GeoJSON
                </label>
              </Button>
            </div>
            <Button size="sm" variant="outline" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button size="sm" variant="outline" onClick={clearMap}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Map
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Map Container */}
      <Card>
        <CardContent className="p-0">
          <div
            ref={mapContainer}
            className="w-full h-96 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center relative overflow-hidden"
          >
            {/* Placeholder Map */}
            <div className="absolute inset-0 bg-blue-50">
              <div className="absolute inset-0 opacity-20">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
            </div>
            
            <div className="text-center z-10">
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">Interactive Map</h3>
              <p className="text-sm text-muted-foreground">
                {features.length === 0 
                  ? "Use the tools above to add features or upload GeoJSON data"
                  : `${features.length} feature${features.length !== 1 ? 's' : ''} on the map`
                }
              </p>
            </div>

            {/* Feature indicators */}
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"
                style={{
                  left: `${20 + (index * 15) % 60}%`,
                  top: `${30 + (index * 10) % 40}%`,
                }}
                title={feature.properties.name}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature List */}
      {features.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Map Features</CardTitle>
            <CardDescription>Features currently on the map</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {features.map((feature) => (
                <div key={feature.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{feature.type}</Badge>
                    <span className="text-sm">{feature.properties.name}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setFeatures(features.filter(f => f.id !== feature.id));
                      toast({
                        title: "Feature removed",
                        description: `Removed ${feature.properties.name}`,
                      });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MapPlayground;
