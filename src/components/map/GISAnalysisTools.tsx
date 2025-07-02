import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Ruler, Calculator, Scissors, Target, Zap, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnalysisResult {
  id: string;
  tool: string;
  result: string;
  timestamp: Date;
}

interface GISAnalysisToolsProps {
  onAnalysisRun: (tool: string, params: any) => void;
}

const GISAnalysisTools: React.FC<GISAnalysisToolsProps> = ({ onAnalysisRun }) => {
  const [activeTool, setActiveTool] = useState<string>('');
  const [bufferDistance, setBufferDistance] = useState<number>(100);
  const [bufferUnit, setBufferUnit] = useState<string>('meters');
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const { toast } = useToast();

  const analysisTools = [
    {
      id: 'measure',
      name: 'Measure Distance/Area',
      icon: <Ruler className="h-4 w-4" />,
      description: 'Measure distances and areas on the map'
    },
    {
      id: 'buffer',
      name: 'Buffer Analysis',
      icon: <Target className="h-4 w-4" />,
      description: 'Create buffer zones around features'
    },
    {
      id: 'intersect',
      name: 'Spatial Intersection',
      icon: <Scissors className="h-4 w-4" />,
      description: 'Find overlapping areas between layers'
    },
    {
      id: 'proximity',
      name: 'Proximity Analysis',
      icon: <Calculator className="h-4 w-4" />,
      description: 'Find nearest features and distances'
    },
    {
      id: 'heatmap',
      name: 'Density Analysis',
      icon: <Zap className="h-4 w-4" />,
      description: 'Create density and heatmap visualizations'
    }
  ];

  const runAnalysis = (toolId: string, params: any = {}) => {
    const tool = analysisTools.find(t => t.id === toolId);
    if (!tool) return;

    // Simulate analysis
    const result: AnalysisResult = {
      id: Date.now().toString(),
      tool: tool.name,
      result: `Analysis completed with ${Math.floor(Math.random() * 100)} features processed`,
      timestamp: new Date()
    };

    setResults([result, ...results]);
    onAnalysisRun(toolId, params);
    
    toast({
      title: "Analysis Complete",
      description: `${tool.name} has been completed successfully.`,
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            GIS Analysis Tools
          </CardTitle>
          <CardDescription>
            Perform spatial analysis operations on your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysisTools.map((tool) => (
              <Button
                key={tool.id}
                variant={activeTool === tool.id ? "default" : "outline"}
                className="h-auto p-3 justify-start"
                onClick={() => setActiveTool(activeTool === tool.id ? '' : tool.id)}
              >
                <div className="flex items-start gap-2">
                  {tool.icon}
                  <div className="text-left">
                    <div className="font-medium text-sm">{tool.name}</div>
                    <div className="text-xs text-muted-foreground">{tool.description}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>

          {/* Buffer Tool Parameters */}
          {activeTool === 'buffer' && (
            <div className="mt-4 p-3 border rounded-lg bg-accent/50">
              <h4 className="font-medium mb-2">Buffer Parameters</h4>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Distance"
                  value={bufferDistance}
                  onChange={(e) => setBufferDistance(Number(e.target.value))}
                  className="flex-1"
                />
                <Select value={bufferUnit} onValueChange={setBufferUnit}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meters">Meters</SelectItem>
                    <SelectItem value="kilometers">Kilometers</SelectItem>
                    <SelectItem value="feet">Feet</SelectItem>
                    <SelectItem value="miles">Miles</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => runAnalysis('buffer', { distance: bufferDistance, unit: bufferUnit })}>
                  Run Buffer
                </Button>
              </div>
            </div>
          )}

          {/* Other tool parameters can be added similarly */}
          {activeTool && activeTool !== 'buffer' && (
            <div className="mt-4 p-3 border rounded-lg bg-accent/50">
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {analysisTools.find(t => t.id === activeTool)?.name}
                </span>
                <Button onClick={() => runAnalysis(activeTool)}>
                  Run Analysis
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {results.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{result.tool}</div>
                    <div className="text-xs text-muted-foreground">{result.result}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {result.timestamp.toLocaleTimeString()}
                    </Badge>
                    <Button size="sm" variant="ghost">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GISAnalysisTools;
