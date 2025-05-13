
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Circle } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const BufferAnalysis = () => {
  const [bufferDistance, setBufferDistance] = useState(100);
  const [pointType, setPointType] = useState("single");
  const [resultVisible, setResultVisible] = useState(false);
  
  // Sample data for visualization
  const bufferData = [
    { name: "0m", area: 0 },
    { name: "25m", area: 1963 },
    { name: "50m", area: 7854 },
    { name: "75m", area: 17671 },
    { name: "100m", area: 31416 },
    { name: "125m", area: 49087 },
    { name: "150m", area: 70686 }
  ];
  
  const config = {
    area: {
      label: "Buffer Area (sq meters)",
      theme: {
        light: "hsl(var(--primary))",
        dark: "hsl(var(--primary))"
      }
    }
  };

  const handleCalculate = () => {
    setResultVisible(true);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Buffer Analysis Tool</CardTitle>
        <CardDescription>
          Create buffer zones around points, lines, or polygons to analyze proximity relationships
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Buffer Distance (meters)</Label>
          <div className="flex items-center gap-4">
            <Slider 
              value={[bufferDistance]} 
              min={10} 
              max={500} 
              step={10} 
              onValueChange={(value) => setBufferDistance(value[0])} 
              className="flex-1" 
            />
            <Input 
              type="number" 
              value={bufferDistance} 
              onChange={(e) => setBufferDistance(Number(e.target.value))}
              className="w-20"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Feature Type</Label>
          <Select defaultValue={pointType} onValueChange={setPointType}>
            <SelectTrigger>
              <SelectValue placeholder="Select feature type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single Point</SelectItem>
              <SelectItem value="multi">Multiple Points</SelectItem>
              <SelectItem value="line">Line</SelectItem>
              <SelectItem value="polygon">Polygon</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="bg-muted/50 p-4 rounded-md flex items-center justify-center h-64">
          {pointType === "single" && (
            <div className="relative">
              <MapPin className="h-8 w-8 text-primary" />
              <div 
                className="absolute border-2 border-primary/50 rounded-full bg-primary/20 -translate-x-1/2 -translate-y-1/2"
                style={{
                  width: `${bufferDistance / 2}px`, 
                  height: `${bufferDistance / 2}px`,
                  top: "16px",
                  left: "16px"
                }}
              />
            </div>
          )}
          {pointType === "multi" && (
            <div className="relative w-full h-full">
              {[
                { top: "20%", left: "30%" },
                { top: "50%", left: "50%" },
                { top: "70%", left: "35%" },
              ].map((pos, i) => (
                <div key={i} className="absolute" style={{ top: pos.top, left: pos.left }}>
                  <MapPin className="h-6 w-6 text-primary" />
                  <div 
                    className="absolute border-2 border-primary/50 rounded-full bg-primary/20 -translate-x-1/2 -translate-y-1/2"
                    style={{
                      width: `${bufferDistance / 3}px`, 
                      height: `${bufferDistance / 3}px`,
                      top: "12px",
                      left: "12px"
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {resultVisible && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-lg font-medium">Buffer Analysis Results</h4>
            <div className="h-64">
              <ChartContainer 
                config={config} 
                className="h-full w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={bufferData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area 
                      type="monotone" 
                      dataKey="area" 
                      name="area"
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary)/0.2)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            <div className="bg-muted/30 p-4 rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Buffer Distance</p>
                  <p className="font-medium">{bufferDistance} meters</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Buffer Area</p>
                  <p className="font-medium">{Math.PI * bufferDistance * bufferDistance} sq meters</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Features Affected</p>
                  <p className="font-medium">{Math.floor(Math.random() * 10) + 2} features</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Calculation Method</p>
                  <p className="font-medium">Euclidean Distance</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleCalculate} className="w-full">Calculate Buffer</Button>
      </CardFooter>
    </Card>
  );
};

export default BufferAnalysis;
