
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calculator, Target, Scissors, Layers, Plus, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GeoData, AnalysisResult } from '../../pages/GeoAILab';

interface SpatialAnalysisToolsProps {
  availableData: GeoData[];
  selectedData: GeoData | null;
  onAnalysisComplete: (result: AnalysisResult) => void;
}

const SpatialAnalysisTools: React.FC<SpatialAnalysisToolsProps> = ({
  availableData,
  selectedData,
  onAnalysisComplete
}) => {
  const [activeTool, setActiveTool] = useState<string>('');
  const [bufferDistance, setBufferDistance] = useState<number>(100);
  const [bufferUnit, setBufferUnit] = useState<string>('meters');
  const [overlayLayer, setOverlayLayer] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const spatialTools = [
    {
      id: 'buffer',
      name: 'Buffer Analysis',
      icon: <Target className="h-4 w-4" />,
      description: 'Create buffer zones around features',
      category: 'proximity'
    },
    {
      id: 'intersect',
      name: 'Spatial Intersection',
      icon: <Scissors className="h-4 w-4" />,
      description: 'Find overlapping areas between layers',
      category: 'overlay'
    },
    {
      id: 'union',
      name: 'Union Analysis',
      icon: <Plus className="h-4 w-4" />,
      description: 'Combine all features from multiple layers',
      category: 'overlay'
    },
    {
      id: 'clip',
      name: 'Clip/Extract',
      icon: <Layers className="h-4 w-4" />,
      description: 'Extract features within boundary',
      category: 'overlay'
    },
    {
      id: 'dissolve',
      name: 'Dissolve Features',
      icon: <Zap className="h-4 w-4" />,
      description: 'Merge adjacent features with same attributes',
      category: 'generalization'
    },
    {
      id: 'point-in-polygon',
      name: 'Point in Polygon',
      icon: <Calculator className="h-4 w-4" />,
      description: 'Count points within polygons',
      category: 'analysis'
    }
  ];

  const runSpatialAnalysis = async (toolId: string) => {
    if (!selectedData) {
      toast({
        title: "No data selected",
        description: "Please select a dataset to analyze.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    const tool = spatialTools.find(t => t.id === toolId);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result: AnalysisResult = {
        id: Date.now().toString(),
        tool: tool?.name || toolId,
        input: selectedData.name,
        parameters: getToolParameters(toolId),
        output: {
          id: `result-${Date.now()}`,
          name: `${tool?.name || toolId} Result`,
          type: selectedData.type,
          format: 'Analysis Result',
          url: '', // Would be generated from actual processing
          visible: true
        },
        timestamp: new Date(),
        status: 'completed'
      };

      onAnalysisComplete(result);
      
      toast({
        title: "Analysis Complete",
        description: `${tool?.name} completed successfully.`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "There was an error running the QGIS processing analysis.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getToolParameters = (toolId: string) => {
    switch (toolId) {
      case 'buffer':
        return { distance: bufferDistance, unit: bufferUnit };
      case 'intersect':
      case 'union':
      case 'clip':
        return { overlayLayer };
      default:
        return {};
    }
  };

  const vectorData = availableData.filter(d => d.type === 'vector');

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">QGIS Processing Tools</CardTitle>
          <CardDescription className="text-xs">
            Advanced vector processing operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {spatialTools.map((tool) => (
              <Button
                key={tool.id}
                variant={activeTool === tool.id ? "default" : "outline"}
                className="w-full h-auto p-2 justify-start text-left"
                onClick={() => setActiveTool(activeTool === tool.id ? '' : tool.id)}
                disabled={processing}
              >
                <div className="flex items-start gap-2 w-full">
                  {tool.icon}
                  <div className="flex-1">
                    <div className="font-medium text-xs">{tool.name}</div>
                    <div className="text-xs text-muted-foreground">{tool.description}</div>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {tool.category}
                    </Badge>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Selected Dataset</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-2 bg-accent/50 rounded border">
              <div className="font-medium text-sm">{selectedData.name}</div>
              <div className="text-xs text-muted-foreground">
                {selectedData.format} • {selectedData.type}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tool Parameters */}
      {activeTool === 'buffer' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Buffer Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Distance"
                  value={bufferDistance}
                  onChange={(e) => setBufferDistance(Number(e.target.value))}
                  className="flex-1"
                />
                <Select value={bufferUnit} onValueChange={setBufferUnit}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meters">m</SelectItem>
                    <SelectItem value="kilometers">km</SelectItem>
                    <SelectItem value="feet">ft</SelectItem>
                    <SelectItem value="miles">mi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={() => runSpatialAnalysis('buffer')}
                disabled={!selectedData || processing}
                className="w-full"
              >
                {processing ? "Processing..." : "Run Buffer Analysis"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {['intersect', 'union', 'clip'].includes(activeTool) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Overlay Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Select value={overlayLayer} onValueChange={setOverlayLayer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select overlay layer" />
                </SelectTrigger>
                <SelectContent>
                  {vectorData.filter(d => d.id !== selectedData?.id).map((data) => (
                    <SelectItem key={data.id} value={data.id}>
                      {data.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={() => runSpatialAnalysis(activeTool)}
                disabled={!selectedData || !overlayLayer || processing}
                className="w-full"
              >
                {processing ? "Processing..." : `Run ${spatialTools.find(t => t.id === activeTool)?.name}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {['dissolve', 'point-in-polygon'].includes(activeTool) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Analysis Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => runSpatialAnalysis(activeTool)}
              disabled={!selectedData || processing}
              className="w-full"
            >
              {processing ? "Processing..." : `Run ${spatialTools.find(t => t.id === activeTool)?.name}`}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SpatialAnalysisTools;
