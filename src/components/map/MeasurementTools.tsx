import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Ruler, SquareIcon, Trash2, Copy
} from 'lucide-react';

interface MeasurementToolsProps {
  onMeasure: (type: string, value: number) => void;
}

interface Measurement {
  id: string;
  type: 'distance' | 'area';
  value: number;
  unit: string;
  coordinates: number[][];
}

const MeasurementTools: React.FC<MeasurementToolsProps> = ({ onMeasure }) => {
  const [activeTool, setActiveTool] = useState<'distance' | 'area' | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  const tools = [
    {
      id: 'distance',
      name: 'Distance',
      icon: Ruler,
      description: 'Measure distances'
    },
    {
      id: 'area',
      name: 'Area',
      icon: SquareIcon,
      description: 'Measure areas'
    }
  ];

  const handleToolSelect = (toolId: 'distance' | 'area') => {
    setActiveTool(activeTool === toolId ? null : toolId);
  };

  const handleClearMeasurements = () => {
    setMeasurements([]);
  };

  const handleCopyMeasurement = (measurement: Measurement) => {
    const text = `${measurement.type}: ${measurement.value} ${measurement.unit}`;
    navigator.clipboard.writeText(text);
  };

  const formatValue = (value: number, type: string) => {
    if (type === 'distance') {
      if (value > 1000) {
        return `${(value / 1000).toFixed(2)} km`;
      }
      return `${value.toFixed(2)} m`;
    } else {
      if (value > 1000000) {
        return `${(value / 1000000).toFixed(2)} km²`;
      }
      return `${value.toFixed(2)} m²`;
    }
  };

  // Simulate measurements for demo
  const mockMeasurements: Measurement[] = [
    {
      id: '1',
      type: 'distance',
      value: 1250.5,
      unit: 'm',
      coordinates: [[0, 0], [1, 1]]
    },
    {
      id: '2',
      type: 'area',
      value: 15000,
      unit: 'm²',
      coordinates: [[0, 0], [1, 0], [1, 1], [0, 1]]
    }
  ];

  const displayMeasurements = measurements.length > 0 ? measurements : mockMeasurements;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Ruler className="h-4 w-4" />
          Measurements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tool Selection */}
        <div className="grid grid-cols-2 gap-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            
            return (
              <Button
                key={tool.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => handleToolSelect(tool.id as 'distance' | 'area')}
                className="flex flex-col gap-1 h-16"
                title={tool.description}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{tool.name}</span>
              </Button>
            );
          })}
        </div>

        {/* Measurement Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClearMeasurements}
            disabled={displayMeasurements.length === 0}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        </div>

        {/* Measurements List */}
        {displayMeasurements.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Results</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {displayMeasurements.map((measurement, index) => (
                <div key={measurement.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2 flex-1">
                    <Badge 
                      variant={measurement.type === 'distance' ? 'default' : 'secondary'} 
                      className="text-xs"
                    >
                      {measurement.type}
                    </Badge>
                    <span className="text-sm font-medium">
                      {formatValue(measurement.value, measurement.type)}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => handleCopyMeasurement(measurement)}
                      title="Copy measurement"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => setMeasurements(prev => prev.filter(m => m.id !== measurement.id))}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="p-3 bg-muted/30 rounded-lg">
          <h4 className="font-medium text-sm mb-1">Instructions</h4>
          <div className="text-xs text-muted-foreground">
            {activeTool === 'distance' && (
              <p>Click to start measuring distance. Click again to add points. Double-click to finish.</p>
            )}
            {activeTool === 'area' && (
              <p>Click to start measuring area. Click to add vertices. Double-click to close polygon.</p>
            )}
            {!activeTool && (
              <p>Select a measurement tool to start measuring distances or areas on the map.</p>
            )}
          </div>
        </div>

        {/* Units */}
        <div className="p-2 bg-muted/20 rounded text-xs text-muted-foreground">
          <p>Units: Meters (m), Kilometers (km), Square meters (m²), Square kilometers (km²)</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MeasurementTools;