import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { 
  Brain, 
  Satellite, 
  TreePine, 
  Building, 
  Route, 
  TrendingUp,
  Eye,
  MapPin,
  Zap,
  CheckCircle,
  Crown
} from "lucide-react";

interface AIModel {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  accuracy: number;
  processingTime: string;
  requiresPremium: boolean;
  dataTypes: string[];
  parameters?: {
    [key: string]: {
      type: 'slider' | 'select' | 'text';
      label: string;
      default: any;
      options?: string[];
      min?: number;
      max?: number;
    };
  };
}

interface AIModelLibraryProps {
  selectedData: any;
  onAnalysisStart: (modelId: string, parameters: any) => void;
  subscription: any;
}

const AIModelLibrary = ({ selectedData, onAnalysisStart, subscription }: AIModelLibraryProps) => {
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [parameters, setParameters] = useState<any>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const aiModels: AIModel[] = [
    {
      id: "lulc_classification",
      name: "LULC Classification",
      description: "Land Use Land Cover classification using U-Net and Random Forest models",
      icon: TreePine,
      category: "Classification",
      accuracy: 94.2,
      processingTime: "2-5 minutes",
      requiresPremium: true,
      dataTypes: ["raster", "satellite"],
      parameters: {
        model_type: {
          type: "select",
          label: "Model Type",
          default: "unet",
          options: ["unet", "random_forest", "deep_learning"]
        },
        confidence_threshold: {
          type: "slider",
          label: "Confidence Threshold",
          default: 0.8,
          min: 0.5,
          max: 1.0
        }
      }
    },
    {
      id: "ndvi_analysis",
      name: "NDVI Analysis",
      description: "Normalized Difference Vegetation Index analysis for vegetation health monitoring",
      icon: Satellite,
      category: "Vegetation Analysis",
      accuracy: 96.8,
      processingTime: "1-2 minutes",
      requiresPremium: false,
      dataTypes: ["satellite", "raster"],
      parameters: {
        band_combination: {
          type: "select",
          label: "Band Combination",
          default: "nir_red",
          options: ["nir_red", "custom"]
        },
        threshold: {
          type: "slider",
          label: "Vegetation Threshold",
          default: 0.3,
          min: 0.1,
          max: 0.8
        }
      }
    },
    {
      id: "urban_change_detection",
      name: "Urban Change Detection",
      description: "Detect urban expansion and land use changes over time",
      icon: Building,
      category: "Change Detection",
      accuracy: 91.5,
      processingTime: "3-7 minutes",
      requiresPremium: true,
      dataTypes: ["satellite", "raster"],
      parameters: {
        time_period: {
          type: "select",
          label: "Time Period",
          default: "5_years",
          options: ["1_year", "3_years", "5_years", "10_years"]
        },
        sensitivity: {
          type: "slider",
          label: "Change Sensitivity",
          default: 0.6,
          min: 0.3,
          max: 0.9
        }
      }
    },
    {
      id: "suitability_mapping",
      name: "Suitability Mapping",
      description: "Multi-criteria weighted overlay analysis for site suitability",
      icon: MapPin,
      category: "Spatial Analysis",
      accuracy: 88.7,
      processingTime: "2-4 minutes",
      requiresPremium: true,
      dataTypes: ["vector", "raster"],
      parameters: {
        criteria_weights: {
          type: "text",
          label: "Criteria Weights (JSON)",
          default: '{"slope": 0.3, "distance_roads": 0.2, "land_cover": 0.5}'
        }
      }
    },
    {
      id: "object_detection",
      name: "Object Detection",
      description: "Detect buildings, roads, and infrastructure from high-resolution imagery",
      icon: Eye,
      category: "Object Detection",
      accuracy: 93.1,
      processingTime: "5-10 minutes",
      requiresPremium: true,
      dataTypes: ["satellite", "raster"],
      parameters: {
        object_type: {
          type: "select",
          label: "Object Type",
          default: "buildings",
          options: ["buildings", "roads", "water_bodies", "vehicles", "all"]
        },
        detection_confidence: {
          type: "slider",
          label: "Detection Confidence",
          default: 0.7,
          min: 0.5,
          max: 0.95
        }
      }
    }
  ];

  const getFilteredModels = () => {
    if (!selectedData) return aiModels;
    return aiModels.filter(model => 
      model.dataTypes.includes(selectedData.type)
    );
  };

  const handleParameterChange = (paramName: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const runAnalysis = async () => {
    if (!selectedModel || !selectedData) {
      toast({
        title: "Missing Requirements",
        description: "Please select both a dataset and an AI model.",
        variant: "destructive",
      });
      return;
    }

    const model = aiModels.find(m => m.id === selectedModel);
    if (model?.requiresPremium && subscription?.subscription_tier === 'free') {
      toast({
        title: "Premium Feature",
        description: "This AI model requires a Pro or Enterprise subscription.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    // Simulate AI processing with realistic progress
    const progressSteps = [
      { step: 10, message: "Initializing AI model..." },
      { step: 25, message: "Processing input data..." },
      { step: 50, message: "Running AI inference..." },
      { step: 75, message: "Post-processing results..." },
      { step: 90, message: "Generating outputs..." },
      { step: 100, message: "Analysis complete!" }
    ];

    for (const step of progressSteps) {
      setProgress(step.step);
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
    }

    // Generate mock results
    const analysisResult = {
      id: `analysis_${Date.now()}`,
      modelId: selectedModel,
      modelName: model?.name,
      inputData: selectedData.name,
      parameters: parameters,
      timestamp: new Date().toISOString(),
      status: "completed",
      results: generateMockResults(selectedModel),
      confidence: model?.accuracy,
      processingTime: Math.floor(Math.random() * 300) + 60 // 1-5 minutes
    };

    onAnalysisStart(selectedModel, analysisResult);
    setIsProcessing(false);
    setProgress(0);

    toast({
      title: "Analysis Complete",
      description: `${model?.name} analysis completed successfully!`,
    });
  };

  const generateMockResults = (modelId: string) => {
    switch (modelId) {
      case "lulc_classification":
        return {
          classes_detected: ["Urban", "Forest", "Water", "Agriculture"],
          coverage: { "Urban": 25.3, "Forest": 45.2, "Water": 12.1, "Agriculture": 17.4 },
          total_area: "2,450 hectares"
        };
      case "ndvi_analysis":
        return {
          avg_ndvi: 0.67,
          vegetation_health: "Good",
          healthy_vegetation_percent: 78.5,
          stressed_areas: "15.2 hectares"
        };
      case "urban_change_detection":
        return {
          urban_expansion: "12.3%",
          new_developments: 156,
          lost_green_space: "89 hectares",
          change_hotspots: 23
        };
      case "object_detection":
        return {
          buildings_detected: 1247,
          roads_length: "45.6 km",
          infrastructure_density: "High",
          coverage_accuracy: "93.1%"
        };
      default:
        return { message: "Analysis completed successfully" };
    }
  };

  const selectedModelData = aiModels.find(m => m.id === selectedModel);
  const filteredModels = getFilteredModels();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Model Library
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedData ? (
            <div className="text-center py-6 text-muted-foreground">
              <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Upload data first to access AI models</p>
            </div>
          ) : (
            <>
              <div>
                <Label htmlFor="model-select">Select AI Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an AI model..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex items-center gap-2">
                          <model.icon className="h-4 w-4" />
                          <span>{model.name}</span>
                          {model.requiresPremium && (
                            <Crown className="h-3 w-3 text-amber-500" />
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedModelData && (
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-start gap-3">
                      <selectedModelData.icon className="h-5 w-5 text-primary mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{selectedModelData.name}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {selectedModelData.category}
                          </Badge>
                          {selectedModelData.requiresPremium && (
                            <Crown className="h-3 w-3 text-amber-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {selectedModelData.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {selectedModelData.accuracy}% accuracy
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="h-3 w-3 text-orange-500" />
                            {selectedModelData.processingTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Model Parameters */}
                  {selectedModelData.parameters && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Model Parameters</Label>
                      {Object.entries(selectedModelData.parameters).map(([key, param]) => (
                        <div key={key} className="space-y-2">
                          <Label className="text-xs">{param.label}</Label>
                          {param.type === 'slider' && (
                            <div className="space-y-2">
                              <Slider
                                value={[parameters[key] || param.default]}
                                onValueChange={(value) => handleParameterChange(key, value[0])}
                                min={param.min}
                                max={param.max}
                                step={0.1}
                                className="w-full"
                              />
                              <div className="text-xs text-muted-foreground text-center">
                                {parameters[key] || param.default}
                              </div>
                            </div>
                          )}
                          {param.type === 'select' && (
                            <Select
                              value={parameters[key] || param.default}
                              onValueChange={(value) => handleParameterChange(key, value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {param.options?.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option.replace('_', ' ')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          {param.type === 'text' && (
                            <Textarea
                              value={parameters[key] || param.default}
                              onChange={(e) => handleParameterChange(key, e.target.value)}
                              className="h-20 text-xs"
                              placeholder={param.label}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={runAnalysis}
                    disabled={isProcessing}
                    className="w-full"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    {isProcessing ? "Processing..." : "Run AI Analysis"}
                  </Button>

                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Processing with {selectedModelData.name}</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="w-full" />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIModelLibrary;