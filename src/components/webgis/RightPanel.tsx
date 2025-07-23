import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, BarChart3, Save, Share, Download, Code,
  Play, FileText, Image, Globe, Mail, Link,
  TrendingUp, PieChart, Map, Database, Settings
} from 'lucide-react';

interface MapLayer {
  id: string;
  name: string;
  type: 'vector' | 'raster' | 'basemap';
  visible: boolean;
  opacity: number;
  style?: any;
  data?: any;
  metadata?: any;
}

interface RightPanelProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  layers: MapLayer[];
  selectedFeature?: any;
  onExport: (format: string, options?: any) => void;
  onShare: (shareType: 'public' | 'embed' | 'pdf') => void;
}

const aiSuggestions = [
  {
    id: 'vegetation-analysis',
    title: 'Analyze Vegetation Coverage',
    description: 'Calculate NDVI and identify vegetation clusters in your area',
    category: 'Environment'
  },
  {
    id: 'population-density',
    title: 'Population Density Mapping',
    description: 'Create choropleth maps based on demographic data',
    category: 'Demographics'
  },
  {
    id: 'flood-risk',
    title: 'Flood Risk Assessment',
    description: 'Identify flood-prone areas using elevation and rainfall data',
    category: 'Disaster Management'
  },
  {
    id: 'urban-growth',
    title: 'Urban Growth Analysis',
    description: 'Track urban expansion over time using satellite imagery',
    category: 'Urban Planning'
  }
];

const codeTemplates = [
  {
    id: 'ndvi-calculation',
    title: 'NDVI Calculation',
    language: 'Python',
    description: 'Calculate Normalized Difference Vegetation Index',
    code: `import numpy as np
import rasterio

def calculate_ndvi(red_band, nir_band):
    """Calculate NDVI from red and NIR bands"""
    ndvi = (nir_band - red_band) / (nir_band + red_band)
    return ndvi

# Load raster bands
with rasterio.open('red_band.tif') as red:
    red_data = red.read(1)
    
with rasterio.open('nir_band.tif') as nir:
    nir_data = nir.read(1)

# Calculate NDVI
ndvi = calculate_ndvi(red_data, nir_data)
print(f"NDVI range: {ndvi.min():.3f} to {ndvi.max():.3f}")`
  },
  {
    id: 'buffer-analysis',
    title: 'Buffer Analysis',
    language: 'Python',
    description: 'Create buffers around features for proximity analysis',
    code: `import geopandas as gpd
from shapely.geometry import Point

# Load your data
gdf = gpd.read_file('your_data.geojson')

# Create buffer (distance in map units)
buffer_distance = 1000  # 1km buffer
buffered = gdf.buffer(buffer_distance)

# Calculate area within buffers
gdf['buffer_area'] = buffered.area
print(f"Total buffered area: {gdf['buffer_area'].sum():.2f} sq units")`
  }
];

const RightPanel = ({
  activeTab,
  setActiveTab,
  layers,
  selectedFeature,
  onExport,
  onShare
}: RightPanelProps) => {
  const [aiQuery, setAiQuery] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const visibleLayers = layers.filter(layer => layer.visible && layer.type !== 'basemap');
  const totalFeatures = visibleLayers.reduce((sum, layer) => 
    sum + (layer.metadata?.featureCount || 0), 0
  );

  const handleAiQuery = () => {
    if (!aiQuery.trim()) return;
    
    // Simulate AI response
    console.log('AI Query:', aiQuery);
    setAiQuery('');
  };

  const handleRunCode = (templateId: string) => {
    console.log('Running code template:', templateId);
  };

  const handleSaveProject = () => {
    if (!projectName.trim()) return;
    
    const projectData = {
      name: projectName,
      description: projectDescription,
      layers: visibleLayers,
      timestamp: new Date().toISOString()
    };
    
    console.log('Saving project:', projectData);
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-5 m-4 mb-0">
          <TabsTrigger value="analysis">
            <BarChart3 className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Brain className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="code">
            <Code className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="export">
            <Download className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="projects">
            <Save className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="analysis" className="h-full m-0 p-4">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Map Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Active Layers</div>
                        <div className="text-lg font-bold">{visibleLayers.length}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Total Features</div>
                        <div className="text-lg font-bold">{totalFeatures.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Vector Layers</div>
                        <div className="text-lg font-bold">
                          {visibleLayers.filter(l => l.type === 'vector').length}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Raster Layers</div>
                        <div className="text-lg font-bold">
                          {visibleLayers.filter(l => l.type === 'raster').length}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {selectedFeature && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Selected Feature</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Layer:</span>
                          <span>{selectedFeature.layerName || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <span>{selectedFeature.properties?.type || 'Unknown'}</span>
                        </div>
                        {selectedFeature.properties?.area && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Area:</span>
                            <span>{selectedFeature.properties.area.toLocaleString()} sq units</span>
                          </div>
                        )}
                        {selectedFeature.properties?.name && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Name:</span>
                            <span>{selectedFeature.properties.name}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Quick Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <PieChart className="h-4 w-4 mr-2" />
                        Layer Distribution Chart
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Attribute Statistics
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Map className="h-4 w-4 mr-2" />
                        Spatial Clustering
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Density Analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Data Quality</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Completeness</span>
                        <Badge variant="outline">98%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Validity</span>
                        <Badge variant="outline">95%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Consistency</span>
                        <Badge variant="outline">92%</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="ai" className="h-full m-0 p-4">
            <div className="space-y-4 h-full flex flex-col">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">AI Assistant</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Ask about your map data: 'What land cover type dominates this area?' or 'Suggest analysis for urban planning'"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <Button onClick={handleAiQuery} className="w-full">
                      <Brain className="h-4 w-4 mr-2" />
                      Ask AI
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="flex-1">
                <CardHeader>
                  <CardTitle className="text-sm">AI Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-full">
                    <div className="space-y-3">
                      {aiSuggestions.map((suggestion) => (
                        <div key={suggestion.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-sm font-medium">{suggestion.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {suggestion.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">
                            {suggestion.description}
                          </p>
                          <Button variant="outline" size="sm">
                            Apply Analysis
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="code" className="h-full m-0 p-4">
            <div className="space-y-4 h-full flex flex-col">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Code Editor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-muted/50 p-3 rounded-lg font-mono text-sm">
                      <div className="text-muted-foreground"># Python sandbox - your layers are available as:</div>
                      <div className="text-green-600"># layers = get_active_layers()</div>
                      <div className="text-green-600"># Run spatial analysis, calculations, etc.</div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Run Code
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="flex-1">
                <CardHeader>
                  <CardTitle className="text-sm">Code Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-full">
                    <div className="space-y-3">
                      {codeTemplates.map((template) => (
                        <Card key={template.id} className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-sm font-medium">{template.title}</h4>
                              <p className="text-xs text-muted-foreground">
                                {template.description}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {template.language}
                            </Badge>
                          </div>
                          <div className="bg-muted/50 p-2 rounded text-xs font-mono mb-3 max-h-32 overflow-y-auto">
                            <pre>{template.code}</pre>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRunCode(template.id)}
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Run
                            </Button>
                            <Button variant="outline" size="sm">
                              <Code className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="export" className="h-full m-0 p-4">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Export Map</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={() => onExport('pdf')}>
                        <FileText className="h-4 w-4 mr-2" />
                        PDF Map
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onExport('png')}>
                        <Image className="h-4 w-4 mr-2" />
                        PNG Image
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onExport('svg')}>
                        <FileText className="h-4 w-4 mr-2" />
                        SVG Vector
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onExport('html')}>
                        <Globe className="h-4 w-4 mr-2" />
                        Interactive HTML
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Export Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        GeoJSON
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Shapefile
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        CSV Table
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        GeoPackage
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Share Map</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onShare('public')}>
                        <Link className="h-4 w-4 mr-2" />
                        Public Link
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onShare('embed')}>
                        <Code className="h-4 w-4 mr-2" />
                        Embed Code
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onShare('pdf')}>
                        <Mail className="h-4 w-4 mr-2" />
                        Email Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Metadata Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Layers:</span>
                        <span>{visibleLayers.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">CRS:</span>
                        <span>EPSG:4326</span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-3">
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="projects" className="h-full m-0 p-4">
            <div className="space-y-4 h-full flex flex-col">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Save Project</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Input
                      placeholder="Project name"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                    <Textarea
                      placeholder="Project description"
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      className="min-h-[60px]"
                    />
                    <Button onClick={handleSaveProject} className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      Save Project
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="flex-1">
                <CardHeader>
                  <CardTitle className="text-sm">My Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-full">
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg">
                        <h4 className="text-sm font-medium">Urban Analysis Project</h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          Created 2 days ago • 5 layers
                        </p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Load</Button>
                          <Button variant="outline" size="sm">
                            <Share className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-3 border rounded-lg">
                        <h4 className="text-sm font-medium">Environmental Study</h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          Created 1 week ago • 3 layers
                        </p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Load</Button>
                          <Button variant="outline" size="sm">
                            <Share className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default RightPanel;