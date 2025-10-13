import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Mountain, Calculator, Layers } from "lucide-react";

interface RasterToolsProps {
  onExecute: (tool: string, params: any) => void;
  selectedLayers: string[];
}

const RasterTools = ({ onExecute, selectedLayers }: RasterToolsProps) => {
  const [selectedTool, setSelectedTool] = useState("");
  const [redBand, setRedBand] = useState(3);
  const [nirBand, setNirBand] = useState(4);
  const [azimuth, setAzimuth] = useState(315);
  const [altitude, setAltitude] = useState(45);
  const [expression, setExpression] = useState("");

  const tools = [
    { id: "ndvi", name: "NDVI Calculator", icon: Layers, description: "Vegetation index" },
    { id: "slope", name: "Slope Analysis", icon: Mountain, description: "Calculate slope" },
    { id: "hillshade", name: "Hillshade", icon: Mountain, description: "Shaded relief" },
    { id: "raster_calc", name: "Raster Calculator", icon: Calculator, description: "Math operations" },
    { id: "zonal_stats", name: "Zonal Statistics", icon: Layers, description: "Zone summary stats" },
  ];

  const handleExecute = () => {
    let params = {};

    switch (selectedTool) {
      case "ndvi":
        params = { red_band: redBand, nir_band: nirBand };
        break;
      case "hillshade":
        params = { azimuth, altitude };
        break;
      case "raster_calc":
        params = { expression };
        break;
      case "zonal_stats":
        params = { statistics: ["mean", "min", "max", "std"] };
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
        <CardTitle className="text-base">Raster Analysis Tools</CardTitle>
        <CardDescription className="text-xs">
          Satellite imagery and DEM analysis
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

        {selectedTool === "ndvi" && (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Red Band</Label>
              <Input
                type="number"
                value={redBand}
                onChange={(e) => setRedBand(parseInt(e.target.value))}
                min={1}
                max={10}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">NIR Band</Label>
              <Input
                type="number"
                value={nirBand}
                onChange={(e) => setNirBand(parseInt(e.target.value))}
                min={1}
                max={10}
                className="mt-1"
              />
            </div>
          </div>
        )}

        {selectedTool === "hillshade" && (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Azimuth: {azimuth}°</Label>
              <Slider
                value={[azimuth]}
                onValueChange={([value]) => setAzimuth(value)}
                min={0}
                max={360}
                step={1}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-xs">Altitude: {altitude}°</Label>
              <Slider
                value={[altitude]}
                onValueChange={([value]) => setAltitude(value)}
                min={0}
                max={90}
                step={1}
                className="mt-2"
              />
            </div>
          </div>
        )}

        {selectedTool === "raster_calc" && (
          <div>
            <Label className="text-xs">Expression</Label>
            <Input
              placeholder="e.g., (A - B) / (A + B)"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use A, B, C for input rasters
            </p>
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
            Select raster layers to begin
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default RasterTools;