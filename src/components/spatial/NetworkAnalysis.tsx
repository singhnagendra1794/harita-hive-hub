
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Route, Play, MapPin } from 'lucide-react';

const NetworkAnalysis = () => {
  const [analysisType, setAnalysisType] = useState<string>('shortest_path');
  const [startPoint, setStartPoint] = useState<string>('');
  const [endPoint, setEndPoint] = useState<string>('');
  const [serviceArea, setServiceArea] = useState<number>(1000);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const mockPoints = [
    { id: 'point1', name: 'City Center' },
    { id: 'point2', name: 'Airport' },
    { id: 'point3', name: 'Hospital' },
    { id: 'point4', name: 'University' },
    { id: 'point5', name: 'Shopping Mall' }
  ];

  const handleRunAnalysis = async () => {
    if (analysisType === 'shortest_path' && (!startPoint || !endPoint)) {
      toast({
        title: "Missing Points",
        description: "Please select both start and end points for routing.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3500));
      
      const message = analysisType === 'shortest_path' 
        ? `Calculated optimal route from ${mockPoints.find(p => p.id === startPoint)?.name} to ${mockPoints.find(p => p.id === endPoint)?.name}.`
        : `Generated ${serviceArea}m service area analysis.`;
      
      toast({
        title: "Network Analysis Complete",
        description: message,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "There was an error running the network analysis.",
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
            <Route className="h-5 w-5" />
            Network Analysis
          </CardTitle>
          <CardDescription>
            Calculate optimal routes, service areas, and connectivity metrics using road networks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="analysisType">Analysis Type</Label>
            <Select value={analysisType} onValueChange={setAnalysisType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shortest_path">Shortest Path</SelectItem>
                <SelectItem value="service_area">Service Area</SelectItem>
                <SelectItem value="closest_facility">Closest Facility</SelectItem>
                <SelectItem value="od_matrix">Origin-Destination Matrix</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {analysisType === 'shortest_path' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="start">Start Point</Label>
                <Select value={startPoint} onValueChange={setStartPoint}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select start point" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockPoints.map((point) => (
                      <SelectItem key={point.id} value={point.id}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {point.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="end">End Point</Label>
                <Select value={endPoint} onValueChange={setEndPoint}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select end point" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockPoints.filter(p => p.id !== startPoint).map((point) => (
                      <SelectItem key={point.id} value={point.id}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {point.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {analysisType === 'service_area' && (
            <div className="space-y-2">
              <Label htmlFor="serviceArea">Service Area Distance (m)</Label>
              <Input
                id="serviceArea"
                type="number"
                value={serviceArea}
                onChange={(e) => setServiceArea(Number(e.target.value))}
                placeholder="Enter distance"
              />
            </div>
          )}
          
          <Button 
            onClick={handleRunAnalysis}
            disabled={processing}
            className="w-full"
          >
            <Play className="h-4 w-4 mr-2" />
            {processing ? "Analyzing..." : "Run Network Analysis"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Analysis Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Type:</span>
              <span className="capitalize">{analysisType.replace('_', ' ')}</span>
            </div>
            {analysisType === 'shortest_path' && (
              <>
                <div className="flex justify-between">
                  <span>From:</span>
                  <span>{startPoint ? mockPoints.find(p => p.id === startPoint)?.name : 'Not selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span>To:</span>
                  <span>{endPoint ? mockPoints.find(p => p.id === endPoint)?.name : 'Not selected'}</span>
                </div>
              </>
            )}
            {analysisType === 'service_area' && (
              <div className="flex justify-between">
                <span>Distance:</span>
                <span>{serviceArea} meters</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Network:</span>
              <span>Road network</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkAnalysis;
