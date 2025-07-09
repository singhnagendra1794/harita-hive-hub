
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calculator, Layers, TrendingUp, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SpatialAnalysisToolsProps {
  availableData: any[];
  selectedData: any;
  onAnalysisComplete: (result: any) => void;
}

const SpatialAnalysisTools = ({ availableData, selectedData, onAnalysisComplete }: SpatialAnalysisToolsProps) => {
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [parameters, setParameters] = useState<any>({});
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const analysisTools = [
    {
      id: "ndvi",
      name: "NDVI Calculator",
      description: "Calculate Normalized Difference Vegetation Index",
      icon: TrendingUp,
      inputTypes: ["raster", "satellite"],
      parameters: [
        { name: "threshold", type: "slider", min: 0, max: 1, step: 0.1, default: 0.3, label: "NDVI Threshold" }
      ]
    },
    {
      id: "buffer",
      name: "Buffer Analysis",
      description: "Create buffer zones around features",
      icon: Layers,
      inputTypes: ["vector"],
      parameters: [
        { name: "distance", type: "slider", min: 10, max: 1000, step: 10, default: 100, label: "Buffer Distance (m)" }
      ]
    },
    {
      id: "lulc",
      name: "Land Use Classification",
      description: "Classify land use from satellite imagery",
      icon: Calculator,
      inputTypes: ["raster", "satellite"],
      parameters: [
        { name: "confidence", type: "slider", min: 0.5, max: 1, step: 0.05, default: 0.8, label: "Confidence Threshold" }
      ]
    },
    {
      id: "change_detection",
      name: "Change Detection",
      description: "Detect changes between two time periods",
      icon: Zap,
      inputTypes: ["raster", "satellite"],
      parameters: [
        { name: "sensitivity", type: "slider", min: 0.1, max: 1, step: 0.1, default: 0.5, label: "Change Sensitivity" }
      ]
    }
  ];

  const compatibleTools = analysisTools.filter(tool => 
    !selectedData || tool.inputTypes.includes(selectedData.type)
  );

  const runAnalysis = async () => {
    if (!selectedTool || !selectedData) {
      toast({
        title: "Missing requirements",
        description: "Please select both a tool and input data.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      // Simulate analysis processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      const result = {
        id: Math.random().toString(36).substr(2, 9),
        tool: selectedTool,
        input: selectedData.name,
        parameters,
        output: {
          id: Math.random().toString(36).substr(2, 9),
          name: `${selectedTool}_result_${Date.now()}`,
          type: selectedData.type,
          format: selectedData.format,
          url: selectedData.url, // In real implementation, this would be the processed result
          visible: true,
        },
        timestamp: new Date(),
        status: 'completed' as const,
      };

      onAnalysisComplete(result);

      toast({
        title: "Analysis completed",
        description: `${selectedTool} analysis has been completed successfully.`,
      });

      // Reset form
      setSelectedTool("");
      setParameters({});
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "There was an error processing your analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const selectedToolConfig = analysisTools.find(tool => tool.id === selectedTool);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">AI Analysis Tools</CardTitle>
        <CardDescription className="text-xs">
          Choose from pre-built spatial analysis tools
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs">Select Analysis Tool</Label>
          <Select value={selectedTool} onValueChange={setSelectedTool}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Choose analysis tool..." />
            </SelectTrigger>
            <SelectContent>
              {compatibleTools.map((tool) => (
                <SelectItem key={tool.id} value={tool.id}>
                  <div className="flex items-center space-x-2">
                    <tool.icon className="h-4 w-4" />
                    <div>
                      <p className="font-medium">{tool.name}</p>
                      <p className="text-xs text-muted-foreground">{tool.description}</p>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedData && (
          <div className="p-3 bg-accent/50 rounded-lg">
            <Label className="text-xs">Input Data</Label>
            <p className="text-sm font-medium">{selectedData.name}</p>
            <p className="text-xs text-muted-foreground">{selectedData.format} • {selectedData.type}</p>
          </div>
        )}

        {selectedToolConfig && (
          <div className="space-y-3">
            <Label className="text-xs">Parameters</Label>
            {selectedToolConfig.parameters.map((param) => (
              <div key={param.name}>
                <Label className="text-xs">{param.label}</Label>
                <div className="mt-1">
                  <Slider
                    value={[parameters[param.name] || param.default]}
                    onValueChange={(value) => setParameters({...parameters, [param.name]: value[0]})}
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{param.min}</span>
                    <span>{parameters[param.name] || param.default}</span>
                    <span>{param.max}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button 
          onClick={runAnalysis} 
          disabled={!selectedTool || !selectedData || processing}
          className="w-full"
        >
          {processing ? "Processing..." : "Run Analysis"}
        </Button>

        {!selectedData && availableData.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            Upload spatial data to begin analysis
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SpatialAnalysisTools;
