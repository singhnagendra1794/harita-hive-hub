import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Edit3, Circle, Square, Pentagon, Minus, 
  Trash2, Undo, Redo, MousePointer 
} from 'lucide-react';

interface DrawingToolsProps {
  onToolActivate: (tool: string) => void;
  activeTool: string;
}

const DrawingTools: React.FC<DrawingToolsProps> = ({ onToolActivate, activeTool }) => {
  const [drawings, setDrawings] = useState<any[]>([]);

  const tools = [
    {
      id: 'select',
      name: 'Select',
      icon: MousePointer,
      description: 'Select and edit features'
    },
    {
      id: 'point',
      name: 'Point',
      icon: Circle,
      description: 'Draw points'
    },
    {
      id: 'line',
      name: 'Line',
      icon: Minus,
      description: 'Draw lines'
    },
    {
      id: 'polygon',
      name: 'Polygon',
      icon: Pentagon,
      description: 'Draw polygons'
    },
    {
      id: 'rectangle',
      name: 'Rectangle',
      icon: Square,
      description: 'Draw rectangles'
    }
  ];

  const handleToolSelect = (toolId: string) => {
    onToolActivate(toolId);
  };

  const handleClearAll = () => {
    setDrawings([]);
  };

  const handleUndo = () => {
    if (drawings.length > 0) {
      setDrawings(prev => prev.slice(0, -1));
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Edit3 className="h-4 w-4" />
          Drawing Tools
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
                onClick={() => handleToolSelect(tool.id)}
                className="flex flex-col gap-1 h-16"
                title={tool.description}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{tool.name}</span>
              </Button>
            );
          })}
        </div>

        {/* Drawing Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleUndo} disabled={drawings.length === 0}>
            <Undo className="h-3 w-3 mr-1" />
            Undo
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearAll} disabled={drawings.length === 0}>
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>

        {/* Drawing List */}
        {drawings.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Drawings</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {drawings.map((drawing, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {drawing.type}
                    </Badge>
                    <span>Drawing {index + 1}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="p-3 bg-muted/30 rounded-lg">
          <h4 className="font-medium text-sm mb-1">Instructions</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            {activeTool === 'select' && <p>Click to select features. Drag to move.</p>}
            {activeTool === 'point' && <p>Click to place points on the map.</p>}
            {activeTool === 'line' && <p>Click to start, click to add points, double-click to finish.</p>}
            {activeTool === 'polygon' && <p>Click to start, click to add vertices, double-click to close.</p>}
            {activeTool === 'rectangle' && <p>Click and drag to draw rectangles.</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DrawingTools;