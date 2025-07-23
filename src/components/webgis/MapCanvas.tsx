import React, { forwardRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, ZoomIn, ZoomOut, Navigation, RotateCcw,
  MousePointer, Circle, Square, Minus, Target
} from 'lucide-react';

interface MapLayer {
  id: string;
  name: string;
  type: 'vector' | 'raster' | 'basemap';
  visible: boolean;
  opacity: number;
  style?: any;
  data?: any;
  metadata?: {
    featureCount?: number;
    crs?: string;
    bounds?: [number, number, number, number];
    bands?: number;
    geometry?: string;
    provider?: string;
    source?: string;
  };
}

interface Basemap {
  id: string;
  name: string;
  url: string;
  attribution: string;
  type: 'osm' | 'carto' | 'stamen' | 'esri' | 'nasa' | 'opentopo';
  variant?: string;
}

interface MapCanvasProps {
  layers: MapLayer[];
  selectedBasemap: Basemap;
  center: [number, number];
  zoom: number;
  activeTool: string;
  onFeatureSelect?: (feature: any) => void;
  selectedFeature?: any;
}

const MapCanvas = forwardRef<HTMLDivElement, MapCanvasProps>(({
  layers,
  selectedBasemap,
  center,
  zoom,
  activeTool,
  onFeatureSelect,
  selectedFeature
}, ref) => {
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [currentCenter, setCurrentCenter] = useState(center);
  const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnFeatures, setDrawnFeatures] = useState<any[]>([]);

  const handleZoomIn = () => {
    setCurrentZoom(prev => Math.min(prev + 1, 18));
  };

  const handleZoomOut = () => {
    setCurrentZoom(prev => Math.max(prev - 1, 1));
  };

  const handleResetView = () => {
    setCurrentZoom(2);
    setCurrentCenter([0, 0]);
  };

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 360 - 180;
    const y = 90 - ((event.clientY - rect.top) / rect.height) * 180;
    
    setCoordinates({ lat: y, lng: x });

    // Handle different tool actions
    if (activeTool === 'draw-point') {
      const newFeature = {
        id: crypto.randomUUID(),
        type: 'point',
        coordinates: [x, y],
        style: { fill: '#3b82f6', stroke: '#1e40af' }
      };
      setDrawnFeatures(prev => [...prev, newFeature]);
      onFeatureSelect?.(newFeature);
    } else if (activeTool === 'select') {
      // Simulate feature selection
      const nearbyFeature = layers.find(layer => 
        layer.visible && layer.type === 'vector' && Math.random() > 0.7
      );
      if (nearbyFeature) {
        const mockFeature = {
          id: crypto.randomUUID(),
          layerId: nearbyFeature.id,
          properties: {
            name: `Feature ${Math.floor(Math.random() * 100)}`,
            type: nearbyFeature.metadata?.geometry || 'Unknown',
            area: Math.floor(Math.random() * 10000),
            population: Math.floor(Math.random() * 50000)
          },
          coordinates: [x, y]
        };
        onFeatureSelect?.(mockFeature);
      }
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 360 - 180;
    const y = 90 - ((event.clientY - rect.top) / rect.height) * 180;
    
    setCoordinates({ lat: Number(y.toFixed(4)), lng: Number(x.toFixed(4)) });
  };

  const getCursorStyle = () => {
    switch (activeTool) {
      case 'draw-point':
      case 'draw-line':
      case 'draw-polygon':
        return 'crosshair';
      case 'measure':
        return 'crosshair';
      case 'select':
        return 'pointer';
      default:
        return 'grab';
    }
  };

  const getToolIcon = (tool: string) => {
    switch (tool) {
      case 'select':
        return MousePointer;
      case 'draw-point':
        return Circle;
      case 'draw-polygon':
        return Square;
      case 'draw-line':
        return Minus;
      case 'measure':
        return Target;
      default:
        return MousePointer;
    }
  };

  const renderMapBackground = () => {
    // Generate different backgrounds based on basemap type
    switch (selectedBasemap.type) {
      case 'esri':
        return 'bg-gradient-to-br from-green-50 via-yellow-50 to-brown-50';
      case 'carto':
        return selectedBasemap.variant === 'dark' 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100';
      case 'stamen':
        return 'bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50';
      case 'nasa':
        return 'bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900';
      case 'opentopo':
        return 'bg-gradient-to-br from-green-100 via-yellow-100 to-orange-100';
      default:
        return 'bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50';
    }
  };

  const renderFeatures = () => {
    const visibleLayers = layers.filter(layer => layer.visible && layer.type !== 'basemap');
    
    return (
      <>
        {/* Simulated layer features */}
        {visibleLayers.map((layer, layerIndex) => (
          <div key={layer.id} style={{ opacity: layer.opacity }}>
            {/* Generate mock features for each layer */}
            {Array.from({ length: layer.metadata?.featureCount ? Math.min(layer.metadata.featureCount, 20) : 5 }).map((_, featureIndex) => {
              const x = 20 + (layerIndex * 15 + featureIndex * 8) % 60;
              const y = 25 + (layerIndex * 10 + featureIndex * 12) % 50;
              
              return (
                <div
                  key={`${layer.id}-${featureIndex}`}
                  className={`absolute w-3 h-3 rounded border-2 border-white shadow-md cursor-pointer hover:scale-150 transition-transform ${
                    layer.metadata?.geometry === 'Polygon' ? 'rounded-none' :
                    layer.metadata?.geometry === 'LineString' ? 'rounded-full border-4' :
                    'rounded-full'
                  }`}
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    backgroundColor: layer.type === 'vector' ? '#3b82f6' : '#f59e0b',
                    zIndex: 10
                  }}
                  title={`${layer.name} - Feature ${featureIndex + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onFeatureSelect?.({
                      id: `${layer.id}-${featureIndex}`,
                      layerId: layer.id,
                      layerName: layer.name,
                      properties: {
                        id: featureIndex + 1,
                        type: layer.metadata?.geometry || 'Point',
                        area: Math.floor(Math.random() * 10000),
                        name: `Feature ${featureIndex + 1}`
                      }
                    });
                  }}
                />
              );
            })}
          </div>
        ))}

        {/* User-drawn features */}
        {drawnFeatures.map((feature) => (
          <div
            key={feature.id}
            className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg"
            style={{
              left: `${((feature.coordinates[0] + 180) / 360) * 100}%`,
              top: `${((90 - feature.coordinates[1]) / 180) * 100}%`,
              backgroundColor: feature.style?.fill || '#ef4444',
              zIndex: 20
            }}
          />
        ))}
      </>
    );
  };

  const ToolIcon = getToolIcon(activeTool);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Map Container */}
      <div
        ref={ref}
        className={`w-full h-full relative ${renderMapBackground()} transition-all duration-300`}
        style={{ cursor: getCursorStyle() }}
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
      >
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Geographic Features Simulation */}
        <div className="absolute inset-0 opacity-30">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            {selectedBasemap.type === 'esri' && (
              <>
                <rect x="15%" y="20%" width="70%" height="60%" fill="#22c55e" opacity="0.4" rx="10" />
                <circle cx="30%" cy="40%" r="8%" fill="#3b82f6" opacity="0.6" />
                <circle cx="70%" cy="60%" r="5%" fill="#ef4444" opacity="0.6" />
              </>
            )}
            
            {selectedBasemap.type === 'osm' && (
              <>
                <path d="M 10% 70% Q 50% 30% 90% 60%" stroke="#374151" strokeWidth="6" fill="none" opacity="0.5" />
                <path d="M 40% 10% L 45% 90%" stroke="#6b7280" strokeWidth="3" fill="none" opacity="0.4" />
                <circle cx="25%" cy="35%" r="20" fill="#3b82f6" opacity="0.3" />
                <circle cx="75%" cy="65%" r="25" fill="#ef4444" opacity="0.3" />
              </>
            )}
          </svg>
        </div>

        {/* Map Features */}
        {renderFeatures()}

        {/* Selected Feature Highlight */}
        {selectedFeature && (
          <div
            className="absolute w-6 h-6 border-4 border-yellow-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 60 + 20}%`,
              zIndex: 30
            }}
          />
        )}
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-20 space-y-2">
        <Card className="bg-background/95 backdrop-blur">
          <div className="p-2 space-y-1">
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetView}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Active Tool Indicator */}
      <div className="absolute top-4 right-4 z-20">
        <Card className="bg-background/95 backdrop-blur">
          <div className="p-3 flex items-center gap-2">
            <ToolIcon className="h-4 w-4" />
            <span className="text-sm font-medium capitalize">
              {activeTool.replace('-', ' ')}
            </span>
          </div>
        </Card>
      </div>

      {/* Coordinates Display */}
      <div className="absolute bottom-4 left-4 z-20">
        <Card className="bg-background/95 backdrop-blur">
          <div className="p-2 text-xs font-mono">
            <div>Lat: {coordinates.lat}°</div>
            <div>Lng: {coordinates.lng}°</div>
            <div>Zoom: {currentZoom}</div>
          </div>
        </Card>
      </div>

      {/* Scale Bar */}
      <div className="absolute bottom-4 right-4 z-20">
        <Card className="bg-background/95 backdrop-blur">
          <div className="p-2">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-16 h-1 bg-foreground"></div>
              <span>{Math.floor(1000 / Math.pow(2, currentZoom - 1))} km</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Attribution */}
      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 z-20">
        <div className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
          {selectedBasemap.attribution}
        </div>
      </div>

      {/* Loading Overlay (when processing) */}
      {isDrawing && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-40">
          <Card>
            <div className="p-4 flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
              <span className="text-sm">Processing...</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
});

MapCanvas.displayName = 'MapCanvas';

export default MapCanvas;