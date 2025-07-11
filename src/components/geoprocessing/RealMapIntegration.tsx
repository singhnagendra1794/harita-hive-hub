import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Map as MapIcon, 
  Layers, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react';

// Dynamically import Leaflet to handle SSR
let L: any = null;
if (typeof window !== 'undefined') {
  import('leaflet').then((leaflet) => {
    L = leaflet.default;
    
    // Fix for default markers
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
  });
}

interface MapLayer {
  id: string;
  name: string;
  type: 'basemap' | 'user' | 'result';
  visible: boolean;
  opacity: number;
  data?: any;
  layer?: any;
}

interface RealMapIntegrationProps {
  layers: MapLayer[];
  onLayerVisibilityChange: (layerId: string, visible: boolean) => void;
  onLayerOpacityChange: (layerId: string, opacity: number) => void;
  onExportMap: () => void;
  center?: [number, number];
  zoom?: number;
}

const basemapOptions = [
  {
    id: 'osm',
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors'
  },
  {
    id: 'carto-light',
    name: 'Carto Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap, © CARTO'
  },
  {
    id: 'carto-dark',
    name: 'Carto Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap, © CARTO'
  },
  {
    id: 'esri-satellite',
    name: 'ESRI Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Powered by Esri'
  }
];

const RealMapIntegration: React.FC<RealMapIntegrationProps> = ({
  layers,
  onLayerVisibilityChange,
  onLayerOpacityChange,
  onExportMap,
  center = [20.5937, 78.9629], // India center
  zoom = 5
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);
  const [selectedBasemap, setSelectedBasemap] = useState('osm');
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapRef.current || !L || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: false
    });

    mapInstanceRef.current = map;
    layerGroupRef.current = L.layerGroup().addTo(map);

    // Add initial basemap
    const basemap = basemapOptions.find(b => b.id === selectedBasemap);
    if (basemap) {
      L.tileLayer(basemap.url, {
        attribution: basemap.attribution,
        maxZoom: 18
      }).addTo(map);
    }

    // Add custom zoom control
    L.control.zoom({
      position: 'topright'
    }).addTo(map);

    setMapLoaded(true);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    // Clear existing layers
    layerGroupRef.current.clearLayers();

    // Add user and result layers
    layers.forEach(layer => {
      if (layer.type !== 'basemap' && layer.visible && layer.data) {
        try {
          let leafletLayer;

          if (layer.data.type === 'FeatureCollection') {
            // GeoJSON data
            leafletLayer = L.geoJSON(layer.data, {
              style: {
                color: layer.type === 'result' ? '#ef4444' : '#3b82f6',
                weight: 2,
                opacity: layer.opacity,
                fillOpacity: layer.opacity * 0.3
              },
              onEachFeature: (feature: any, layer: any) => {
                if (feature.properties) {
                  const popupContent = Object.entries(feature.properties)
                    .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
                    .join('<br>');
                  layer.bindPopup(popupContent);
                }
              }
            });
          } else if (layer.data instanceof Blob) {
            // Raster data (simplified visualization)
            const url = URL.createObjectURL(layer.data);
            const bounds = L.latLngBounds([
              [center[0] - 1, center[1] - 1],
              [center[0] + 1, center[1] + 1]
            ]);
            leafletLayer = L.imageOverlay(url, bounds, {
              opacity: layer.opacity
            });
          }

          if (leafletLayer) {
            layerGroupRef.current.addLayer(leafletLayer);
            layer.layer = leafletLayer;
          }
        } catch (error) {
          console.error('Error adding layer to map:', error);
        }
      }
    });
  }, [layers]);

  const handleBasemapChange = (basemapId: string) => {
    if (!mapInstanceRef.current) return;

    setSelectedBasemap(basemapId);

    // Remove current basemap
    mapInstanceRef.current.eachLayer((layer: any) => {
      if (layer instanceof L.TileLayer) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

    // Add new basemap
    const basemap = basemapOptions.find(b => b.id === basemapId);
    if (basemap) {
      L.tileLayer(basemap.url, {
        attribution: basemap.attribution,
        maxZoom: 18
      }).addTo(mapInstanceRef.current);
    }
  };

  const handleZoomToExtent = () => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    try {
      const group = layerGroupRef.current;
      if (group.getLayers().length > 0) {
        mapInstanceRef.current.fitBounds(group.getBounds());
      }
    } catch (error) {
      console.error('Error zooming to extent:', error);
    }
  };

  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(center, zoom);
  };

  if (!mapLoaded) {
    return (
      <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map Controls */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MapIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Basemap:</span>
              <Select value={selectedBasemap} onValueChange={handleBasemapChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {basemapOptions.map(basemap => (
                    <SelectItem key={basemap.id} value={basemap.id}>
                      {basemap.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomToExtent}
              disabled={layers.filter(l => l.visible && l.type !== 'basemap').length === 0}
            >
              <ZoomIn className="h-4 w-4" />
              Zoom to Layers
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetView}>
              <RotateCcw className="h-4 w-4" />
              Reset View
            </Button>
            <Button variant="outline" size="sm" onClick={onExportMap}>
              <Download className="h-4 w-4" />
              Export Map
            </Button>
          </div>
        </div>
      </Card>

      {/* Map Container */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full h-96 rounded-lg border"
          style={{ minHeight: '400px' }}
        />
        
        {/* Layer Control Panel */}
        <Card className="absolute top-4 left-4 w-64 max-h-80 overflow-y-auto">
          <div className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="h-4 w-4" />
              <span className="text-sm font-medium">Layers</span>
            </div>
            
            <div className="space-y-2">
              {layers.map(layer => (
                <div key={layer.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-6 w-6"
                      onClick={() => onLayerVisibilityChange(layer.id, !layer.visible)}
                    >
                      {layer.visible ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3" />
                      )}
                    </Button>
                    <span className="text-xs truncate flex-1">{layer.name}</span>
                    <Badge 
                      variant={layer.type === 'result' ? 'default' : 'outline'} 
                      className="text-xs px-1 py-0"
                    >
                      {layer.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RealMapIntegration;