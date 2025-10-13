import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Brain, Sparkles } from "lucide-react";

interface AIAnalysisToolsProps {
  onExecute: (tool: string, params: any) => void;
  selectedLayers: string[];
}

const AIAnalysisTools = ({ onExecute, selectedLayers }: AIAnalysisToolsProps) => {
  const [selectedTool, setSelectedTool] = useState("");
  const [classificationModel, setClassificationModel] = useState("random_forest");

  const tools = [
    { 
      id: "land_cover_classify", 
      name: "Land Cover Classification", 
      icon: Brain, 
      description: "AI-powered classification",
      tier: "pro"
    },
    { 
      id: "change_detection_ai", 
      name: "Change Detection AI", 
      icon: Sparkles, 
      description: "Detect changes over time",
      tier: "pro"
    },
  ];

  const handleExecute = () => {
    const params = {
      model: classificationModel,
      classes: ["urban", "vegetation", "water", "barren"]
    };

    onExecute(selectedTool, params);
    setSelectedTool("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-4 w-4" />
          AI Analysis Tools
        </CardTitle>
        <CardDescription className="text-xs">
          Machine learning powered analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs">Select AI Tool</Label>
          <Select value={selectedTool} onValueChange={setSelectedTool}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Choose AI tool..." />
            </SelectTrigger>
            <SelectContent>
              {tools.map((tool) => (
                <SelectItem key={tool.id} value={tool.id}>
                  <div className="flex items-center gap-2">
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

        {selectedTool === "land_cover_classify" && (
          <div>
            <Label className="text-xs">Classification Model</Label>
            <Select value={classificationModel} onValueChange={setClassificationModel}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="random_forest">Random Forest</SelectItem>
                <SelectItem value="svm">Support Vector Machine</SelectItem>
                <SelectItem value="cnn">Convolutional Neural Network</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <Button
          onClick={handleExecute}
          disabled={!selectedTool || selectedLayers.length === 0}
          className="w-full"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Run AI Analysis
        </Button>

        <div className="p-3 bg-primary/10 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <Brain className="h-3 w-3 inline mr-1" />
            AI tools require Pro subscription
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAnalysisTools;