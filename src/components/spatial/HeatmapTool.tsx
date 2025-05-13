
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const HeatmapTool = () => {
  const [radius, setRadius] = useState(25);
  const [intensity, setIntensity] = useState(0.6);
  const [opacity, setOpacity] = useState(0.8);
  const [dataSource, setDataSource] = useState("population");
  const [showResult, setShowResult] = useState(false);

  const generateHeatmapPoints = () => {
    const points = [];
    const centerX = 150;
    const centerY = 100;
    
    // Generate some random points with clustering based on dataSource
    for (let i = 0; i < 80; i++) {
      let x, y;
      
      if (dataSource === "population") {
        // Cluster around center
        x = centerX + (Math.random() - 0.5) * 200;
        y = centerY + (Math.random() - 0.5) * 150;
      } else if (dataSource === "incidents") {
        // Two clusters
        if (Math.random() > 0.5) {
          x = centerX - 70 + Math.random() * 60;
          y = centerY - 40 + Math.random() * 60;
        } else {
          x = centerX + 40 + Math.random() * 60;
          y = centerY + 20 + Math.random() * 60;
        }
      } else {
        // Random distribution
        x = Math.random() * 300;
        y = Math.random() * 200;
      }
      
      points.push({ x, y });
    }
    
    return points;
  };

  const points = generateHeatmapPoints();
  
  // Calculate gradient colors based on intensity
  const calculateGradient = () => {
    const intensityAdjusted = intensity * 1.5;
    return {
      background: `radial-gradient(
        circle at center,
        rgba(255, 0, 0, ${opacity}) 0%,
        rgba(255, 127, 0, ${opacity * 0.8}) ${30 * intensityAdjusted}%,
        rgba(255, 255, 0, ${opacity * 0.6}) ${60 * intensityAdjusted}%,
        rgba(0, 255, 0, ${opacity * 0.4}) ${80 * intensityAdjusted}%,
        rgba(0, 0, 255, ${opacity * 0.1}) 100%
      )`
    };
  };

  const handleGenerate = () => {
    setShowResult(true);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Heatmap Generation</CardTitle>
        <CardDescription>
          Create density maps to visualize concentrated areas of point data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Data Source</Label>
          <Select defaultValue={dataSource} onValueChange={setDataSource}>
            <SelectTrigger>
              <SelectValue placeholder="Select data source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="population">Population Density</SelectItem>
              <SelectItem value="incidents">Incident Reports</SelectItem>
              <SelectItem value="custom">Custom Data Points</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Radius</Label>
            <span className="text-sm text-muted-foreground">{radius}px</span>
          </div>
          <Slider 
            value={[radius]} 
            min={5} 
            max={50} 
            step={1} 
            onValueChange={(value) => setRadius(value[0])} 
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Intensity</Label>
            <span className="text-sm text-muted-foreground">{intensity.toFixed(1)}</span>
          </div>
          <Slider 
            value={[intensity * 10]} 
            min={1} 
            max={10} 
            step={1} 
            onValueChange={(value) => setIntensity(value[0] / 10)} 
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Opacity</Label>
            <span className="text-sm text-muted-foreground">{opacity.toFixed(1)}</span>
          </div>
          <Slider 
            value={[opacity * 10]} 
            min={1} 
            max={10} 
            step={1} 
            onValueChange={(value) => setOpacity(value[0] / 10)} 
          />
        </div>

        <div className="relative bg-muted/50 rounded-md h-56 overflow-hidden">
          {showResult && (
            <>
              <div 
                className="absolute inset-0 blur-md" 
                style={calculateGradient()}
              ></div>
              
              {points.map((point, index) => (
                <div 
                  key={index} 
                  className="absolute rounded-full"
                  style={{
                    left: `${point.x}px`,
                    top: `${point.y}px`,
                    width: `${radius * 2}px`,
                    height: `${radius * 2}px`,
                    transform: 'translate(-50%, -50%)',
                    background: `radial-gradient(
                      circle at center,
                      rgba(255, 0, 0, ${opacity}) 0%,
                      rgba(255, 0, 0, 0) 100%
                    )`,
                    mixBlendMode: 'screen',
                    opacity: 0.7
                  }}
                ></div>
              ))}
            </>
          )}
          
          {!showResult && (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Configure settings and generate heatmap</p>
            </div>
          )}
        </div>
        
        {showResult && (
          <div className="p-2 bg-muted/30 rounded-md">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full flex justify-between items-center">
                  <span>View Analysis Summary</span> 
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full">
                <div className="space-y-2">
                  <h4 className="font-semibold">Heatmap Analysis</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Hotspot Count:</div>
                    <div>{dataSource === 'incidents' ? '2 major hotspots' : '1 major hotspot'}</div>
                    <div className="text-muted-foreground">Data Points:</div>
                    <div>{points.length} points</div>
                    <div className="text-muted-foreground">Density Method:</div>
                    <div>Kernel Density Estimation</div>
                    <div className="text-muted-foreground">Concentration:</div>
                    <div>{intensity < 0.4 ? 'Low' : intensity < 0.7 ? 'Medium' : 'High'}</div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerate} className="w-full">Generate Heatmap</Button>
      </CardFooter>
    </Card>
  );
};

export default HeatmapTool;
