
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Play } from 'lucide-react';

const BufferAnalysis = () => {
  const [distance, setDistance] = useState<number>(100);
  const [unit, setUnit] = useState<string>('meters');
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleRunAnalysis = async () => {
    setProcessing(true);
    
    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Buffer Analysis Complete",
        description: `Created ${distance} ${unit} buffer zones successfully.`,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "There was an error running the buffer analysis.",
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
            <MapPin className="h-5 w-5" />
            Buffer Analysis
          </CardTitle>
          <CardDescription>
            Create buffer zones around points, lines, or polygons to analyze proximity relationships.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="distance">Buffer Distance</Label>
              <Input
                id="distance"
                type="number"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                placeholder="Enter distance"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger>
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
          
          <Button 
            onClick={handleRunAnalysis}
            disabled={processing}
            className="w-full"
          >
            <Play className="h-4 w-4 mr-2" />
            {processing ? "Processing..." : "Run Buffer Analysis"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Analysis Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Distance:</span>
              <span>{distance} {unit}</span>
            </div>
            <div className="flex justify-between">
              <span>Output:</span>
              <span>Polygon buffer zones</span>
            </div>
            <div className="flex justify-between">
              <span>Dissolve overlaps:</span>
              <span>Yes</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BufferAnalysis;
