
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Layers, Play } from 'lucide-react';

const SpatialJoinTool = () => {
  const [joinType, setJoinType] = useState<string>('intersects');
  const [targetLayer, setTargetLayer] = useState<string>('');
  const [joinLayer, setJoinLayer] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const mockLayers = [
    { id: 'layer1', name: 'Administrative Boundaries' },
    { id: 'layer2', name: 'Population Points' },
    { id: 'layer3', name: 'Roads Network' },
    { id: 'layer4', name: 'Land Use Polygons' }
  ];

  const handleRunAnalysis = async () => {
    if (!targetLayer || !joinLayer) {
      toast({
        title: "Missing Layers",
        description: "Please select both target and join layers.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Spatial Join Complete",
        description: `Successfully joined attributes based on ${joinType} relationship.`,
      });
    } catch (error) {
      toast({
        title: "Join Failed",
        description: "There was an error performing the spatial join.",
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
            <Layers className="h-5 w-5" />
            Spatial Join
          </CardTitle>
          <CardDescription>
            Combine attributes from multiple datasets based on their spatial relationships.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="target">Target Layer</Label>
            <Select value={targetLayer} onValueChange={setTargetLayer}>
              <SelectTrigger>
                <SelectValue placeholder="Select target layer" />
              </SelectTrigger>
              <SelectContent>
                {mockLayers.map((layer) => (
                  <SelectItem key={layer.id} value={layer.id}>
                    {layer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="join">Join Layer</Label>
            <Select value={joinLayer} onValueChange={setJoinLayer}>
              <SelectTrigger>
                <SelectValue placeholder="Select join layer" />
              </SelectTrigger>
              <SelectContent>
                {mockLayers.filter(l => l.id !== targetLayer).map((layer) => (
                  <SelectItem key={layer.id} value={layer.id}>
                    {layer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="joinType">Join Type</Label>
            <Select value={joinType} onValueChange={setJoinType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="intersects">Intersects</SelectItem>
                <SelectItem value="contains">Contains</SelectItem>
                <SelectItem value="within">Within</SelectItem>
                <SelectItem value="touches">Touches</SelectItem>
                <SelectItem value="crosses">Crosses</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleRunAnalysis}
            disabled={processing || !targetLayer || !joinLayer}
            className="w-full"
          >
            <Play className="h-4 w-4 mr-2" />
            {processing ? "Processing..." : "Run Spatial Join"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Join Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Target:</span>
              <span>{targetLayer ? mockLayers.find(l => l.id === targetLayer)?.name : 'None'}</span>
            </div>
            <div className="flex justify-between">
              <span>Join:</span>
              <span>{joinLayer ? mockLayers.find(l => l.id === joinLayer)?.name : 'None'}</span>
            </div>
            <div className="flex justify-between">
              <span>Relationship:</span>
              <span className="capitalize">{joinType}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpatialJoinTool;
