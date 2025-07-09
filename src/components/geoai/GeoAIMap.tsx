
import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

interface GeoAIMapProps {
  data: any[];
  center: [number, number];
  zoom: number;
  onCenterChange: (center: [number, number]) => void;
  onZoomChange: (zoom: number) => void;
  selectedData: any;
}

const GeoAIMap = ({ data, center, zoom, onCenterChange, onZoomChange, selectedData }: GeoAIMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // In a real implementation, this would initialize a proper map
    // For now, we'll create a simple placeholder
    if (mapRef.current) {
      // Clear previous content
      mapRef.current.innerHTML = '';
      
      // Create a simple map visualization
      const mapContainer = document.createElement('div');
      mapContainer.className = 'w-full h-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center';
      
      const mapContent = document.createElement('div');
      mapContent.className = 'text-center p-8';
      mapContent.innerHTML = `
        <div class="text-lg font-semibold text-gray-700 mb-2">GeoAI Map View</div>
        <div class="text-sm text-gray-500 mb-4">Center: ${center[0].toFixed(4)}, ${center[1].toFixed(4)} | Zoom: ${zoom}</div>
        <div class="text-xs text-gray-400">
          ${data.length} layer(s) loaded
          ${selectedData ? `| Selected: ${selectedData.name}` : ''}
        </div>
      `;
      
      // Add layer indicators
      if (data.length > 0) {
        const layersList = document.createElement('div');
        layersList.className = 'mt-4 space-y-1';
        
        data.forEach((layer, index) => {
          const layerItem = document.createElement('div');
          layerItem.className = `text-xs px-2 py-1 rounded ${
            layer.visible ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'
          }`;
          layerItem.textContent = `${layer.name} (${layer.type})`;
          layersList.appendChild(layerItem);
        });
        
        mapContent.appendChild(layersList);
      }
      
      mapContainer.appendChild(mapContent);
      mapRef.current.appendChild(mapContainer);
    }
  }, [data, center, zoom, selectedData]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full rounded-lg border" />
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <button
          className="bg-white p-2 rounded shadow hover:bg-gray-50"
          onClick={() => onZoomChange(Math.min(zoom + 1, 18))}
        >
          <span className="text-sm font-bold">+</span>
        </button>
        <button
          className="bg-white p-2 rounded shadow hover:bg-gray-50"
          onClick={() => onZoomChange(Math.max(zoom - 1, 1))}
        >
          <span className="text-sm font-bold">−</span>
        </button>
      </div>
      
      {/* Data Info */}
      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No spatial data loaded</p>
            <p className="text-sm text-muted-foreground mt-1">Upload data to visualize on the map</p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default GeoAIMap;
