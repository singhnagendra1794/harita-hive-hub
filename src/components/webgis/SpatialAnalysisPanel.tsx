import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Circle, 
  Scissors, 
  Layers, 
  Palette, 
  Clock, 
  Calculator,
  Download,
  Play
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SpatialAnalysisPanelProps {
  layers: any[];
  onAnalysisComplete: (result: any) => void;
}

export const SpatialAnalysisPanel = ({ layers, onAnalysisComplete }: SpatialAnalysisPanelProps) => {
  const [bufferDistance, setBufferDistance] = useState(1000);
  const [selectedLayer1, setSelectedLayer1] = useState('');
  const [selectedLayer2, setSelectedLayer2] = useState('');
  const [thematicField, setThematicField] = useState('');
  const [colorScheme, setColorScheme] = useState('Blues');
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleBufferAnalysis = async () => {
    if (!selectedLayer1) {
      toast({
        title: "Layer required",
        description: "Please select a layer for buffer analysis.",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);
    try {
      // Simulate buffer analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = {
        type: 'buffer',
        layerId: selectedLayer1,
        distance: bufferDistance,
        name: `Buffer ${bufferDistance}m`,
        style: {
          color: '#ff6b6b',
          fillOpacity: 0.3,
          weight: 2
        }
      };

      onAnalysisComplete(result);
      toast({
        title: "Buffer analysis complete",
        description: `Created ${bufferDistance}m buffer zone.`
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Buffer analysis could not be completed.",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleIntersectionAnalysis = async () => {
    if (!selectedLayer1 || !selectedLayer2) {
      toast({
        title: "Two layers required",
        description: "Please select two layers for intersection analysis.",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const result = {
        type: 'intersection',
        layer1Id: selectedLayer1,
        layer2Id: selectedLayer2,
        name: 'Intersection Result',
        style: {
          color: '#4ecdc4',
          fillOpacity: 0.5,
          weight: 2
        }
      };

      onAnalysisComplete(result);
      toast({
        title: "Intersection analysis complete",
        description: "Found overlapping areas between layers."
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "Intersection analysis could not be completed.",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleThematicStyling = async () => {
    if (!selectedLayer1 || !thematicField) {
      toast({
        title: "Layer and field required",
        description: "Please select a layer and field for thematic styling.",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result = {
        type: 'thematic',
        layerId: selectedLayer1,
        field: thematicField,
        colorScheme: colorScheme,
        name: `Thematic: ${thematicField}`,
        style: {
          type: 'choropleth',
          field: thematicField,
          scheme: colorScheme,
          classes: 5
        }
      };

      onAnalysisComplete(result);
      toast({
        title: "Thematic styling applied",
        description: `Applied ${colorScheme} color scheme to ${thematicField}.`
      });
    } catch (error) {
      toast({
        title: "Styling failed",
        description: "Thematic styling could not be applied.",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const visibleLayers = layers.filter(layer => layer.is_visible);

  return (
    <div className="h-full overflow-auto">
      <Tabs defaultValue="buffer" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="buffer">
            <Circle className="h-4 w-4 mr-1" />
            Buffer
          </TabsTrigger>
          <TabsTrigger value="intersection">
            <Scissors className="h-4 w-4 mr-1" />
            Intersect
          </TabsTrigger>
          <TabsTrigger value="thematic">
            <Palette className="h-4 w-4 mr-1" />
            Style
          </TabsTrigger>
          <TabsTrigger value="temporal">
            <Clock className="h-4 w-4 mr-1" />
            Temporal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buffer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Circle className="h-5 w-5" />
                Buffer Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Select Layer</Label>
                <Select value={selectedLayer1} onValueChange={setSelectedLayer1}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a layer" />
                  </SelectTrigger>
                  <SelectContent>
                    {visibleLayers.map((layer) => (
                      <SelectItem key={layer.id} value={layer.id}>
                        {layer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Buffer Distance (meters)</Label>
                <div className="space-y-2">
                  <Slider
                    value={[bufferDistance]}
                    onValueChange={([value]) => setBufferDistance(value)}
                    max={5000}
                    min={100}
                    step={100}
                    className="w-full"
                  />
                  <Input
                    type="number"
                    value={bufferDistance}
                    onChange={(e) => setBufferDistance(Number(e.target.value))}
                    min={100}
                    max={5000}
                  />
                </div>
              </div>

              <Button 
                onClick={handleBufferAnalysis} 
                disabled={analyzing || !selectedLayer1}
                className="w-full"
              >
                {analyzing ? (
                  <>
                    <Calculator className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Create Buffer
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intersection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Scissors className="h-5 w-5" />
                Intersection Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>First Layer</Label>
                <Select value={selectedLayer1} onValueChange={setSelectedLayer1}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose first layer" />
                  </SelectTrigger>
                  <SelectContent>
                    {visibleLayers.map((layer) => (
                      <SelectItem key={layer.id} value={layer.id}>
                        {layer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Second Layer</Label>
                <Select value={selectedLayer2} onValueChange={setSelectedLayer2}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose second layer" />
                  </SelectTrigger>
                  <SelectContent>
                    {visibleLayers.filter(layer => layer.id !== selectedLayer1).map((layer) => (
                      <SelectItem key={layer.id} value={layer.id}>
                        {layer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleIntersectionAnalysis} 
                disabled={analyzing || !selectedLayer1 || !selectedLayer2}
                className="w-full"
              >
                {analyzing ? (
                  <>
                    <Calculator className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Find Intersection
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="thematic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Thematic Styling
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Select Layer</Label>
                <Select value={selectedLayer1} onValueChange={setSelectedLayer1}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a layer" />
                  </SelectTrigger>
                  <SelectContent>
                    {visibleLayers.map((layer) => (
                      <SelectItem key={layer.id} value={layer.id}>
                        {layer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Data Field</Label>
                <Select value={thematicField} onValueChange={setThematicField}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="population">Population</SelectItem>
                    <SelectItem value="area">Area</SelectItem>
                    <SelectItem value="density">Density</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="elevation">Elevation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Color Scheme</Label>
                <Select value={colorScheme} onValueChange={setColorScheme}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose colors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Blues">Blues</SelectItem>
                    <SelectItem value="Reds">Reds</SelectItem>
                    <SelectItem value="Greens">Greens</SelectItem>
                    <SelectItem value="Viridis">Viridis</SelectItem>
                    <SelectItem value="Plasma">Plasma</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleThematicStyling} 
                disabled={analyzing || !selectedLayer1 || !thematicField}
                className="w-full"
              >
                {analyzing ? (
                  <>
                    <Calculator className="h-4 w-4 mr-2 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <Palette className="h-4 w-4 mr-2" />
                    Apply Styling
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="temporal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Temporal Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Temporal Analysis</h3>
                <p className="text-sm">
                  Time-based analysis tools including before/after sliders and temporal filtering will be available in the next update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};