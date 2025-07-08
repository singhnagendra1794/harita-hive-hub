
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Thermometer, Play } from 'lucide-react';

const HeatmapTool = () => {
  const [radius, setRadius] = useState<number>(50);
  const [pixelSize, setPixelSize] = useState<number>(10);
  const [kernel, setKernel] = useState<string>('gaussian');
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleGenerateHeatmap = async () => {
    setProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      toast({
        title: "Heatmap Generated",
        description: `Successfully created density heatmap with ${radius}m radius.`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "There was an error generating the heatmap.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Heatmap Generation
          </CardTitle>
          <CardDescription>
            Create density maps to visualize concentrated areas of point data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="radius">Search Radius (m)</Label>
              <Input
                id="radius"
                type="number"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                placeholder="Enter radius"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pixelSize">Pixel Size (m)</Label>
              <Input
                id="pixelSize"
                type="number"
                value={pixelSize}
                onChange={(e) => setPixelSize(Number(e.target.value))}
                placeholder="Enter pixel size"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kernel">Kernel Shape</Label>
            <Select value={kernel} onValueChange={setKernel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gaussian">Gaussian</SelectItem>
                <SelectItem value="uniform">Uniform</SelectItem>
                <SelectItem value="triangular">Triangular</SelectItem>
                <SelectItem value="epanechnikov">Epanechnikov</SelectItem>
                <SelectItem value="quartic">Quartic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleGenerateHeatmap}
            disabled={processing}
            className="w-full"
          >
            <Play className="h-4 w-4 mr-2" />
            {processing ? "Generating..." : "Generate Heatmap"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Heatmap Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Search Radius:</span>
              <span>{radius} meters</span>
            </div>
            <div className="flex justify-between">
              <span>Resolution:</span>
              <span>{pixelSize}m pixels</span>
            </div>
            <div className="flex justify-between">
              <span>Kernel:</span>
              <span className="capitalize">{kernel}</span>
            </div>
            <div className="flex justify-between">
              <span>Output:</span>
              <span>Raster density surface</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HeatmapTool;
