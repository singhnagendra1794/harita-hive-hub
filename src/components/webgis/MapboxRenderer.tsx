import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Layers, Globe, Satellite, Map as MapIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MapboxRendererProps {
  layers: any[];
  widgets: any[];
  onMapReady?: (map: mapboxgl.Map) => void;
  mapStyle?: string;
  center?: [number, number];
  zoom?: number;
}

export const MapboxRenderer = ({ 
  layers, 
  widgets, 
  onMapReady, 
  mapStyle = 'mapbox://styles/mapbox/satellite-streets-v12',
  center = [0, 0],
  zoom = 2 
}: MapboxRendererProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check for Mapbox token in Supabase secrets
  useEffect(() => {
    const checkMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (data?.token) {
          setMapboxToken(data.token);
        } else {
          setShowTokenInput(true);
        }
      } catch (error) {
        console.log('No Mapbox token found in secrets, showing input');
        setShowTokenInput(true);
      }
    };
    
    checkMapboxToken();
  }, []);

  const initializeMap = (token: string) => {
    if (!mapContainer.current || !token) return;

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: center,
      zoom: zoom,
      projection: 'globe' as any,
      antialias: true
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
    map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-right');

    // Add terrain and atmosphere
    map.current.on('style.load', () => {
      if (!map.current) return;

      // Add terrain
      map.current.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14
      });
      
      map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

      // Add atmosphere
      map.current.setFog({
        color: 'rgb(186, 210, 235)',
        'high-color': 'rgb(36, 92, 223)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 0.6
      });

      // Add layers from props
      addDataLayers();
    });

    // Add widgets
    addMapWidgets();

    setIsInitialized(true);
    onMapReady?.(map.current);
  };

  const addDataLayers = () => {
    if (!map.current) return;

    layers.forEach((layer, index) => {
      if (!layer.is_visible) return;

      const layerId = `layer-${layer.id}`;

      try {
        if (layer.type === 'geojson') {
          const data = typeof layer.source_data === 'string' 
            ? JSON.parse(layer.source_data) 
            : layer.source_data;

          map.current!.addSource(layerId, {
            type: 'geojson',
            data: data
          });

          // Add fill layer
          map.current!.addLayer({
            id: `${layerId}-fill`,
            type: 'fill',
            source: layerId,
            paint: {
              'fill-color': layer.style_config?.color || '#3b82f6',
              'fill-opacity': layer.style_config?.fillOpacity || 0.3
            }
          });

          // Add stroke layer
          map.current!.addLayer({
            id: `${layerId}-stroke`,
            type: 'line',
            source: layerId,
            paint: {
              'line-color': layer.style_config?.color || '#3b82f6',
              'line-width': layer.style_config?.weight || 2
            }
          });
        }
      } catch (error) {
        console.error(`Error adding layer ${layer.name}:`, error);
      }
    });
  };

  const addMapWidgets = () => {
    if (!map.current) return;

    widgets.forEach(widget => {
      if (!widget.is_visible) return;

      const widgetEl = document.createElement('div');
      widgetEl.className = 'mapbox-widget bg-background/90 backdrop-blur-sm rounded border shadow-sm p-2';
      widgetEl.innerHTML = `
        <div class="text-xs font-medium capitalize">${widget.type}</div>
        <div class="text-xs text-muted-foreground">
          ${widget.type === 'coordinates' ? 'Lat: 0.000, Lng: 0.000' :
            widget.type === 'scale' ? '1:100,000' :
            widget.type === 'legend' ? 'Map Legend' :
            'Widget Data'}
        </div>
      `;

      const control = new mapboxgl.Marker(widgetEl)
        .setLngLat([0, 0])
        .addTo(map.current!);
    });
  };

  useEffect(() => {
    if (mapboxToken && !isInitialized) {
      initializeMap(mapboxToken);
    }

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, isInitialized]);

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      setShowTokenInput(false);
      initializeMap(mapboxToken);
    }
  };

  if (showTokenInput) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/20">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Mapbox Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                To use advanced mapping features, you need a Mapbox public token.
                Get yours from{' '}
                <a 
                  href="https://mapbox.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  mapbox.com
                </a>
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
              <Input
                id="mapbox-token"
                type="password"
                placeholder="pk.eyJ1IjoieW91ciIsInR5cCI6IkpXVCJ9..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
              />
            </div>
            
            <Button onClick={handleTokenSubmit} className="w-full">
              Initialize Map
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Map Style Switcher */}
      <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-sm rounded border shadow-sm p-2">
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => map.current?.setStyle('mapbox://styles/mapbox/satellite-streets-v12')}
            className="p-1"
          >
            <Satellite className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => map.current?.setStyle('mapbox://styles/mapbox/streets-v12')}
            className="p-1"
          >
            <MapIcon className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => map.current?.setStyle('mapbox://styles/mapbox/outdoors-v12')}
            className="p-1"
          >
            <Layers className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
};