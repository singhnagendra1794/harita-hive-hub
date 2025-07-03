
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ZoomIn, ZoomOut, Home, Layers, Download } from 'lucide-react';
import { GeoData } from '../../pages/GeoAILab';

interface GeoAIMapProps {
  data: GeoData[];
  center: [number, number];
  zoom: number;
  onCenterChange: (center: [number, number]) => void;
  onZoomChange: (zoom: number) => void;
  selectedData: GeoData | null;
}

const GeoAIMap: React.FC<GeoAIMapProps> = ({
  data,
  center,
  zoom,
  onCenterChange,
  onZoomChange,
  selectedData
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => {
    onZoomChange(Math.min(zoom + 1, 18));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(zoom - 1, 1));
  };

  const handleZoomToExtent = () => {
    onCenterChange([40.7128, -74.0060]);
    onZoomChange(10);
  };

  const getLayerVisualization = (layer: GeoData, index: number) => {
    const colors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];
    const color = colors[index % colors.length];
    
    return (
      <div
        key={layer.id}
        className="absolute rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-125 transition-transform"
        style={{
          width: layer.type === 'raster' ? '20px' : '12px',
          height: layer.type === 'raster' ? '20px' : '12px',
          backgroundColor: color,
          left: `${20 + (index * 15) % 60}%`,
          top: `${30 + (index * 10) % 40}%`,
          opacity: 0.8
        }}
        title={`${layer.name} (${layer.type})`}
      />
    );
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-green-50">
      {/* Map Container */}
      <div
        ref={mapContainer}
        className="w-full h-full relative overflow-hidden"
      >
        {/* Enhanced Map Visualization */}
        <div className="absolute inset-0 bg-slate-100">
          <div className="absolute inset-0 opacity-30">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="geoai-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#cbd5e1" strokeWidth="1"/>
                </pattern>
                <linearGradient id="elevation" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:"#10b981", stopOpacity:0.3}} />
                  <stop offset="50%" style={{stopColor:"#f59e0b", stopOpacity:0.3}} />
                  <stop offset="100%" style={{stopColor:"#ef4444", stopOpacity:0.3}} />
                </linearGradient>
              </defs>
              
              <rect width="100%" height="100%" fill="url(#geoai-grid)" />
              
              {/* Terrain simulation */}
              <path d="M 0 300 Q 200 250 400 280 T 800 260 L 800 400 L 0 400 Z" fill="url(#elevation)" />
              
              {/* Water bodies */}
              <ellipse cx="200" cy="180" rx="60" ry="30" fill="#3b82f6" opacity="0.4" />
              <ellipse cx="600" cy="320" rx="80" ry="40" fill="#06b6d4" opacity="0.4" />
              
              {/* Road network */}
              <path d="M 0 200 Q 200 180 400 200 T 800 190" stroke="#64748b" strokeWidth="4" fill="none" opacity="0.6" />
              <path d="M 300 0 L 320 500" stroke="#64748b" strokeWidth="3" fill="none" opacity="0.6" />
              <path d="M 0 350 L 800 380" stroke="#64748b" strokeWidth="2" fill="none" opacity="0.5" />
            </svg>
          </div>
        </div>

        {/* Data Layers Visualization */}
        {data.filter(d => d.visible).map((layer, index) => getLayerVisualization(layer, index))}

        {/* Selected Data Highlight */}
        {selectedData && (
          <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium shadow-lg">
            Selected: {selectedData.name}
          </div>
        )}

        {/* Coordinate Display */}
        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur px-3 py-1 rounded text-sm font-mono">
          {center[1].toFixed(4)}°, {center[0].toFixed(4)}° • Zoom: {zoom}
        </div>

        {/* Scale Bar */}
        <div className="absolute bottom-4 right-20 bg-background/90 backdrop-blur px-3 py-1 rounded text-sm">
          Scale: 1:{Math.round(591659527.591555 / Math.pow(2, zoom))}
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Card className="p-1">
          <div className="flex flex-col gap-1">
            <Button size="sm" variant="outline" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleZoomToExtent}>
              <Home className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Layer Count Indicator */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-background/90 backdrop-blur px-4 py-2 rounded-full text-sm font-medium shadow-lg">
        <Layers className="h-4 w-4 inline mr-2" />
        {data.filter(d => d.visible).length} Active Layers
      </div>

      {/* Analysis Status */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center">
        <div className="bg-background/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg">
          <h3 className="font-semibold text-lg mb-1">GeoAI Analysis Environment</h3>
          <p className="text-sm text-muted-foreground">
            Upload data and run spatial analysis tools
          </p>
        </div>
      </div>
    </div>
  );
};

export default GeoAIMap;
