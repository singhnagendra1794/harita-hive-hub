import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Route } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const NetworkAnalysis = () => {
  const [analysisType, setAnalysisType] = useState("route");
  const [networkType, setNetworkType] = useState("roads");
  const [startPoint, setStartPoint] = useState("Point A");
  const [endPoint, setEndPoint] = useState("Point B");
  const [impedance, setImpedance] = useState("time");
  const [showResults, setShowResults] = useState(false);
  
  const handleAnalyze = () => {
    setShowResults(true);
  };
  
  // Sample network visualization - this would be replaced with a real map
  const renderNetworkVisualization = () => {
    return (
      <div className="relative bg-muted/50 h-64 rounded-md overflow-hidden">
        {/* Basic road network visualization */}
        <svg width="100%" height="100%" viewBox="0 0 400 300" className="stroke-muted-foreground">
          {/* Horizontal roads */}
          <line x1="50" y1="50" x2="350" y2="50" strokeWidth="3" />
          <line x1="50" y1="150" x2="350" y2="150" strokeWidth="4" />
          <line x1="50" y1="250" x2="350" y2="250" strokeWidth="3" />
          
          {/* Vertical roads */}
          <line x1="50" y1="50" x2="50" y2="250" strokeWidth="2" />
          <line x1="150" y1="50" x2="150" y2="250" strokeWidth="3" />
          <line x1="250" y1="50" x2="250" y2="250" strokeWidth="3" />
          <line x1="350" y1="50" x2="350" y2="250" strokeWidth="2" />
          
          {/* If showing results, display the optimal route */}
          {showResults && analysisType === "route" && (
            <path 
              d="M70,70 L150,70 L150,150 L250,150 L250,250 L330,250" 
              fill="none" 
              stroke="hsl(var(--primary))" 
              strokeWidth="5" 
              strokeLinecap="round" 
              strokeDasharray="none" 
              strokeOpacity="0.8"
            />
          )}
          
          {/* If showing service area */}
          {showResults && analysisType === "service" && (
            <circle 
              cx="150" 
              cy="150" 
              r="100" 
              fill="hsl(var(--primary)/0.2)" 
              stroke="hsl(var(--primary))" 
              strokeWidth="2" 
            />
          )}
          
          {/* Start and end points */}
          <circle cx="70" cy="70" r="8" fill="hsl(var(--success))" />
          <circle cx="330" cy="250" r="8" fill="hsl(var(--destructive))" />
          
          {/* Other points of interest */}
          <circle cx="150" cy="150" r="6" fill="hsl(var(--primary))" />
          <circle cx="250" cy="70" r="5" fill="hsl(var(--primary)/0.7)" />
          <circle cx="350" cy="150" r="5" fill="hsl(var(--primary)/0.7)" />
          <circle cx="70" cy="250" r="5" fill="hsl(var(--primary)/0.7)" />
        </svg>
        
        {/* Labels */}
        <div className="absolute top-14 left-16 text-sm font-medium text-green-600">A</div>
        <div className="absolute bottom-8 right-20 text-sm font-medium text-red-600">B</div>
        
        {networkType === "roads" && (
          <div className="absolute bottom-2 right-2">
            <Badge variant="outline" className="bg-background/80">Road Network</Badge>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Network Analysis</CardTitle>
        <CardDescription>
          Calculate optimal routes, service areas, and connectivity metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="visualization">Visualization</TabsTrigger>
            <TabsTrigger value="results" disabled={!showResults}>Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="config" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Analysis Type</Label>
              <Select value={analysisType} onValueChange={setAnalysisType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="route">Optimal Route</SelectItem>
                  <SelectItem value="service">Service Area</SelectItem>
                  <SelectItem value="closest">Closest Facility</SelectItem>
                  <SelectItem value="od">Origin-Destination Matrix</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Network Dataset</Label>
              <Select value={networkType} onValueChange={setNetworkType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="roads">Road Network</SelectItem>
                  <SelectItem value="public_transit">Public Transit</SelectItem>
                  <SelectItem value="water">Water Distribution</SelectItem>
                  <SelectItem value="electricity">Electrical Grid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Point</Label>
                <div className="flex gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <Input 
                    value={startPoint} 
                    onChange={(e) => setStartPoint(e.target.value)} 
                    placeholder="Enter start location" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>End Point</Label>
                <div className="flex gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <Input 
                    value={endPoint} 
                    onChange={(e) => setEndPoint(e.target.value)} 
                    placeholder="Enter destination" 
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Impedance Factor</Label>
              <Select value={impedance} onValueChange={setImpedance}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="time">Travel Time</SelectItem>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="cost">Cost</SelectItem>
                  <SelectItem value="custom">Custom Weighting</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="visualization" className="space-y-4 pt-4">
            {renderNetworkVisualization()}
            
            <div className="flex items-center justify-between bg-muted/30 p-3 rounded-md">
              <div>
                <p className="text-sm font-medium">Network Statistics</p>
                <p className="text-xs text-muted-foreground">23 nodes | 42 edges | Average degree: 3.65</p>
              </div>
              <Route className="h-5 w-5 text-muted-foreground" />
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-4 pt-4">
            {showResults && (
              <>
                <div className="bg-muted/30 p-3 rounded-md">
                  <h4 className="font-medium mb-2">{analysisType === "route" ? "Route Summary" : "Analysis Results"}</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="text-muted-foreground">Total Distance:</div>
                    <div>4.7 kilometers</div>
                    <div className="text-muted-foreground">Estimated Time:</div>
                    <div>18 minutes</div>
                    <div className="text-muted-foreground">Turn Count:</div>
                    <div>4 turns</div>
                    <div className="text-muted-foreground">Road Types:</div>
                    <div>Arterial (65%), Local (35%)</div>
                  </div>
                
                </div>
                
                {analysisType === "route" && (
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-muted/50 px-3 py-2 text-sm font-medium">Turn-by-Turn Directions</div>
                    <div className="p-0">
                      <div className="border-b py-2 px-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Start at Point A</span>
                          <span className="text-sm text-muted-foreground">0.0 km</span>
                        </div>
                      </div>
                      <div className="border-b py-2 px-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Continue east on Main St</span>
                          <span className="text-sm text-muted-foreground">1.2 km</span>
                        </div>
                      </div>
                      <div className="border-b py-2 px-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Turn right onto Central Ave</span>
                          <span className="text-sm text-muted-foreground">0.8 km</span>
                        </div>
                      </div>
                      <div className="border-b py-2 px-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Turn right onto Park Rd</span>
                          <span className="text-sm text-muted-foreground">1.5 km</span>
                        </div>
                      </div>
                      <div className="py-2 px-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Arrive at Point B</span>
                          <span className="text-sm text-muted-foreground">4.7 km</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button onClick={handleAnalyze} className="w-full">Analyze Network</Button>
      </CardFooter>
    </Card>
  );
};

export default NetworkAnalysis;
