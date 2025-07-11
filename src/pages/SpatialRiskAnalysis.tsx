import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { 
  AlertTriangle, 
  Target, 
  Map, 
  BarChart3, 
  Download, 
  Play,
  Settings,
  Layers,
  Zap,
  FileText
} from 'lucide-react';

const SpatialRiskAnalysis = () => {
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCriteria, setSelectedCriteria] = useState(['elevation', 'landuse', 'distance_water']);

  const riskFactors = [
    { id: 'elevation', name: 'Elevation', weight: 30, icon: Map },
    { id: 'slope', name: 'Slope', weight: 25, icon: Target },
    { id: 'landuse', name: 'Land Use', weight: 20, icon: Layers },
    { id: 'distance_water', name: 'Distance to Water', weight: 15, icon: Zap },
    { id: 'population', name: 'Population Density', weight: 10, icon: BarChart3 },
  ];

  const analysisTemplates = [
    { id: 'flood', name: 'Flood Risk Assessment', factors: ['elevation', 'slope', 'distance_water'], sectors: ['urban', 'agriculture'] },
    { id: 'landslide', name: 'Landslide Susceptibility', factors: ['slope', 'elevation', 'landuse'], sectors: ['infrastructure', 'mining'] },
    { id: 'wildfire', name: 'Wildfire Risk', factors: ['landuse', 'slope', 'climate'], sectors: ['forestry', 'defense'] },
    { id: 'industrial', name: 'Industrial Site Suitability', factors: ['elevation', 'distance_water', 'transportation'], sectors: ['manufacturing', 'energy'] },
  ];

  const runAnalysis = () => {
    setIsRunning(true);
    setAnalysisProgress(0);
    
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Spatial Risk & Suitability Analysis</h1>
          <p className="text-xl text-muted-foreground">
            Advanced multi-criteria analysis for risk assessment and site suitability
          </p>
          <Badge variant="secondary" className="mt-2">Enterprise Only</Badge>
        </div>

        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analysis">Multi-Criteria Analysis</TabsTrigger>
            <TabsTrigger value="templates">Analysis Templates</TabsTrigger>
            <TabsTrigger value="results">Results & Reports</TabsTrigger>
            <TabsTrigger value="hazards">Hazard Mapping</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configure Analysis
                  </CardTitle>
                  <CardDescription>Set up weighted overlay analysis parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Analysis Name</Label>
                    <Input placeholder="Flood Risk Assessment - Urban Areas" />
                  </div>

                  <div className="space-y-4">
                    <Label>Risk Factors & Weights</Label>
                    {riskFactors.map((factor) => (
                      <div key={factor.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={selectedCriteria.includes(factor.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCriteria([...selectedCriteria, factor.id]);
                                } else {
                                  setSelectedCriteria(selectedCriteria.filter(c => c !== factor.id));
                                }
                              }}
                            />
                            <factor.icon className="h-4 w-4" />
                            <span className="font-medium">{factor.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{factor.weight}%</span>
                        </div>
                        {selectedCriteria.includes(factor.id) && (
                          <div className="ml-6">
                            <Slider
                              value={[factor.weight]}
                              max={100}
                              step={5}
                              className="w-full"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label>Output Classification</Label>
                    <select className="w-full p-2 border rounded">
                      <option>Very Low - Low - Medium - High - Very High</option>
                      <option>1-10 Scale</option>
                      <option>0-100 Percentage</option>
                      <option>Custom Classes</option>
                    </select>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={runAnalysis}
                    disabled={isRunning || selectedCriteria.length === 0}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isRunning ? 'Running Analysis...' : 'Run Weighted Overlay Analysis'}
                  </Button>

                  {isRunning && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Processing...</span>
                        <span>{analysisProgress}%</span>
                      </div>
                      <Progress value={analysisProgress} />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Analysis Preview</CardTitle>
                  <CardDescription>Real-time visualization of risk analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-gradient-to-br from-green-100 via-yellow-100 to-red-100 rounded-lg flex items-center justify-center border-2 border-dashed">
                    <div className="text-center">
                      <Map className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Risk map preview will appear here</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Configure analysis parameters and run to see results
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Risk Classes:</span>
                    </div>
                    <div className="flex space-x-2">
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span className="text-xs">Very Low</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                        <span className="text-xs">Low</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-orange-500 rounded"></div>
                        <span className="text-xs">Medium</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span className="text-xs">High</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-red-800 rounded"></div>
                        <span className="text-xs">Very High</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analysisTemplates.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      {template.name}
                    </CardTitle>
                    <CardDescription>
                      Pre-configured analysis for {template.sectors.join(', ')} sectors
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Included Factors:</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {template.factors.map((factor) => (
                          <Badge key={factor} variant="outline" className="text-xs">
                            {riskFactors.find(f => f.id === factor)?.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Suitable For:</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {template.sectors.map((sector) => (
                          <Badge key={sector} variant="secondary" className="text-xs">
                            {sector}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full">Use This Template</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 border rounded">
                      <div className="text-2xl font-bold text-green-600">23%</div>
                      <div className="text-sm text-muted-foreground">Low Risk</div>
                    </div>
                    <div className="text-center p-3 border rounded">
                      <div className="text-2xl font-bold text-yellow-600">45%</div>
                      <div className="text-sm text-muted-foreground">Medium Risk</div>
                    </div>
                    <div className="text-center p-3 border rounded">
                      <div className="text-2xl font-bold text-red-600">32%</div>
                      <div className="text-sm text-muted-foreground">High Risk</div>
                    </div>
                    <div className="text-center p-3 border rounded">
                      <div className="text-2xl font-bold">1,247</div>
                      <div className="text-sm text-muted-foreground">Total km²</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export as GeoTIFF
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export as Shapefile
                  </Button>
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate PDF Report
                  </Button>
                  <Button variant="outline" className="w-full">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Export Statistics
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Client-Ready Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Executive Summary
                  </Button>
                  <Button variant="outline" className="w-full">
                    Technical Report
                  </Button>
                  <Button variant="outline" className="w-full">
                    Risk Mitigation Plan
                  </Button>
                  <Button variant="outline" className="w-full">
                    Compliance Documentation
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="hazards" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Flood Zones', risk: 'High', affected: '12,400 people', color: 'blue' },
                { name: 'Landslide Areas', risk: 'Medium', affected: '8,200 people', color: 'orange' },
                { name: 'Earthquake Zones', risk: 'Low', affected: '45,600 people', color: 'yellow' },
                { name: 'Wildfire Risk', risk: 'High', affected: '6,800 people', color: 'red' },
                { name: 'Coastal Erosion', risk: 'Medium', affected: '3,400 people', color: 'cyan' },
                { name: 'Industrial Hazards', risk: 'Low', affected: '1,200 people', color: 'purple' },
              ].map((hazard, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{hazard.name}</span>
                      <Badge variant={hazard.risk === 'High' ? 'destructive' : hazard.risk === 'Medium' ? 'default' : 'secondary'}>
                        {hazard.risk}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Potentially Affected: <span className="font-medium">{hazard.affected}</span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SpatialRiskAnalysis;