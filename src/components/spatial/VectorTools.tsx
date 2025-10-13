import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Circle, Scissors, Merge, MapPin } from "lucide-react";

interface VectorToolsProps {
  onExecute: (tool: string, params: any) => void;
  selectedLayers: string[];
}

const VectorTools = ({ onExecute, selectedLayers }: VectorToolsProps) => {
  const [selectedTool, setSelectedTool] = useState("");
  const [bufferDistance, setBufferDistance] = useState(1000);
  const [units, setUnits] = useState("meters");
  const [dissolveField, setDissolveField] = useState("");
  const [joinType, setJoinType] = useState("intersects");

  const tools = [
    { id: "buffer", name: "Buffer", icon: Circle, description: "Create buffer zones" },
    { id: "intersect", name: "Intersect", icon: Scissors, description: "Find intersection" },
    { id: "union", name: "Union", icon: Merge, description: "Combine layers" },
    { id: "clip", name: "Clip", icon: Scissors, description: "Clip by boundary" },
    { id: "dissolve", name: "Dissolve", icon: Merge, description: "Merge features" },
    { id: "spatial_join", name: "Spatial Join", icon: MapPin, description: "Join by location" },
  ];

  const handleExecute = () => {
    let params = {};

    switch (selectedTool) {
      case "buffer":
        params = { distance: bufferDistance, units, segments: 8 };
        break;
      case "dissolve":
        params = { field: dissolveField };
        break;
      case "spatial_join":
        params = { join_type: joinType, predicate: joinType };
        break;
      default:
        params = {};
    }

    onExecute(selectedTool, params);
    setSelectedTool("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Vector Analysis Tools</CardTitle>
        <CardDescription className="text-xs">
          Proximity, overlay, and geometry operations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs">Select Tool</Label>
          <Select value={selectedTool} onValueChange={setSelectedTool}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Choose a tool..." />
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

        {selectedTool === "buffer" && (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Distance: {bufferDistance} {units}</Label>
              <Slider
                value={[bufferDistance]}
                onValueChange={([value]) => setBufferDistance(value)}
                min={10}
                max={10000}
                step={10}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-xs">Units</Label>
              <Select value={units} onValueChange={setUnits}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meters">Meters</SelectItem>
                  <SelectItem value="kilometers">Kilometers</SelectItem>
                  <SelectItem value="feet">Feet</SelectItem>
                  <SelectItem value="miles">Miles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {selectedTool === "dissolve" && (
          <div>
            <Label className="text-xs">Dissolve Field (optional)</Label>
            <Input
              placeholder="Field name"
              value={dissolveField}
              onChange={(e) => setDissolveField(e.target.value)}
              className="mt-1"
            />
          </div>
        )}

        {selectedTool === "spatial_join" && (
          <div>
            <Label className="text-xs">Join Type</Label>
            <Select value={joinType} onValueChange={setJoinType}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="intersects">Intersects</SelectItem>
                <SelectItem value="within">Within</SelectItem>
                <SelectItem value="contains">Contains</SelectItem>
                <SelectItem value="touches">Touches</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <Button
          onClick={handleExecute}
          disabled={!selectedTool || selectedLayers.length === 0}
          className="w-full"
        >
          Run Analysis
        </Button>

        {selectedLayers.length === 0 && (
          <p className="text-xs text-muted-foreground text-center">
            Select layers from the Layers tab to begin
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default VectorTools;