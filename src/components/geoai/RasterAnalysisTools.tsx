import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Satellite, Zap, Calculator, TrendingUp, Layers } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GeoData, AnalysisResult } from '../../pages/GeoAILab';

interface RasterAnalysisToolsProps {
  availableData: GeoData[];
  selectedData: GeoData | null;
  onAnalysisComplete: (result: AnalysisResult) => void;
}

const RasterAnalysisTools: React.FC<RasterAnalysisToolsProps> = ({
  availableData,
  selectedData,
  onAnalysisComplete
}) => {
  const [activeTool, setActiveTool] = useState<string>('');
  const [redBand, setRedBand] = useState<string>('4');
  const [nirBand, setNirBand] = useState<string>('5');
  const [greenBand, setGreenBand] = useState<string>('3');
  const [blueBand, setBlueBand] = useState<string>('2');
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const rasterTools = [
    {
      id: 'ndvi',
      name: 'NDVI (Vegetation Index)',
      icon: <TrendingUp className="h-4 w-4" />,
      description: 'Normalized Difference Vegetation Index',
      category: 'vegetation',
      formula: '(NIR - Red) / (NIR + Red)'
    },
    {
      id: 'ndwi',
      name: 'NDWI (Water Index)',
      icon: <Satellite className="h-4 w-4" />,
      description: 'Normalized Difference Water Index',
      category: 'water',
      formula: '(Green - NIR) / (Green + NIR)'
    },
    {
      id: 'evi',
      name: 'EVI (Enhanced Vegetation)',
      icon: <Zap className="h-4 w-4" />,
      description: 'Enhanced Vegetation Index',
      category: 'vegetation',
      formula: '2.5 * (NIR - Red) / (NIR + 6*Red - 7.5*Blue + 1)'
    },
    {
      id: 'band-ratio',
      name: 'Band Ratio Analysis',
      icon: <Calculator className="h-4 w-4" />,
      description: 'Custom band ratio calculations',
      category: 'analysis',
      formula: 'Band A / Band B'
    },
    {
      id: 'classification',
      name: 'Unsupervised Classification',
      icon: <Layers className="h-4 w-4" />,
      description: 'K-means clustering classification',
      category: 'classification',
      formula: 'K-means algorithm'
    },
    {
      id: 'change-detection',
      name: 'Change Detection',
      icon: <TrendingUp className="h-4 w-4" />,
      description: 'Temporal change analysis',
      category: 'temporal',
      formula: 'Image differencing'
    }
  ];

  const runRasterAnalysis = async (toolId: string) => {
    if (!selectedData) {
      toast({
        title: "No raster data selected",
        description: "Please select a raster dataset to analyze.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    const tool = rasterTools.find(t => t.id === toolId);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000));

      const result: AnalysisResult = {
        id: Date.now().toString(),
        tool: tool?.name || toolId,
        input: selectedData.name,
        parameters: getToolParameters(toolId),
        output: {
          id: `raster-result-${Date.now()}`,
          name: `${tool?.name} Result`,
          type: 'raster',
          format: 'GeoTIFF',
          url: '', // Would be generated from actual processing
          visible: true
        },
        timestamp: new Date(),
        status: 'completed'
      };

      onAnalysisComplete(result);
      
      toast({
        title: "Raster Analysis Complete",
        description: `${tool?.name} completed successfully.`,
      });
    } catch (error) {
      console.error('Raster analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "There was an error running the raster analysis.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getToolParameters = (toolId: string) => {
    switch (toolId) {
      case 'ndvi':
        return { redBand, nirBand };
      case 'ndwi':
        return { greenBand, nirBand };
      case 'evi':
        return { redBand, nirBand, greenBand, blueBand };
      case 'band-ratio':
        return { redBand, nirBand };
      default:
        return {};
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Raster Analysis Tools</CardTitle>
          <CardDescription className="text-xs">
            Satellite image processing and analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {rasterTools.map((tool) => (
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
                    <div className="flex gap-1 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {tool.category}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 font-mono">
                      {tool.formula}
                    </div>
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
            <CardTitle className="text-sm">Selected Raster</CardTitle>
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

      {/* NDVI Parameters */}
      {activeTool === 'ndvi' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">NDVI Parameters</CardTitle>
            <CardDescription className="text-xs">
              Configure band numbers for vegetation analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium">Red Band</label>
                  <Input
                    type="number"
                    value={redBand}
                    onChange={(e) => setRedBand(e.target.value)}
                    placeholder="4"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">NIR Band</label>
                  <Input
                    type="number"
                    value={nirBand}
                    onChange={(e) => setNirBand(e.target.value)}
                    placeholder="5"
                  />
                </div>
              </div>
              <Button 
                onClick={() => runRasterAnalysis('ndvi')}
                disabled={!selectedData || processing}
                className="w-full"
              >
                {processing ? "Processing NDVI..." : "Calculate NDVI"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* NDWI Parameters */}
      {activeTool === 'ndwi' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">NDWI Parameters</CardTitle>
            <CardDescription className="text-xs">
              Configure bands for water body detection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium">Green Band</label>
                  <Input
                    type="number"
                    value={greenBand}
                    onChange={(e) => setGreenBand(e.target.value)}
                    placeholder="3"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">NIR Band</label>
                  <Input
                    type="number"
                    value={nirBand}
                    onChange={(e) => setNirBand(e.target.value)}
                    placeholder="5"
                  />
                </div>
              </div>
              <Button 
                onClick={() => runRasterAnalysis('ndwi')}
                disabled={!selectedData || processing}
                className="w-full"
              >
                {processing ? "Processing NDWI..." : "Calculate NDWI"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* EVI Parameters */}
      {activeTool === 'evi' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">EVI Parameters</CardTitle>
            <CardDescription className="text-xs">
              Enhanced vegetation index calculation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium">Red Band</label>
                  <Input
                    type="number"
                    value={redBand}
                    onChange={(e) => setRedBand(e.target.value)}
                    placeholder="4"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">NIR Band</label>
                  <Input
                    type="number"
                    value={nirBand}
                    onChange={(e) => setNirBand(e.target.value)}
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Green Band</label>
                  <Input
                    type="number"
                    value={greenBand}
                    onChange={(e) => setGreenBand(e.target.value)}
                    placeholder="3"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Blue Band</label>
                  <Input
                    type="number"
                    value={blueBand}
                    onChange={(e) => setBlueBand(e.target.value)}
                    placeholder="2"
                  />
                </div>
              </div>
              <Button 
                onClick={() => runRasterAnalysis('evi')}
                disabled={!selectedData || processing}
                className="w-full"
              >
                {processing ? "Processing EVI..." : "Calculate EVI"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other tools */}
      {['band-ratio', 'classification', 'change-detection'].includes(activeTool) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Analysis Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => runRasterAnalysis(activeTool)}
              disabled={!selectedData || processing}
              className="w-full"
            >
              {processing ? "Processing..." : `Run ${rasterTools.find(t => t.id === activeTool)?.name}`}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RasterAnalysisTools;
