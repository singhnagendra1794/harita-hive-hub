import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Map, 
  Upload, 
  Layers, 
  Palette,
  Bot,
  Globe,
  Github,
  AlertTriangle,
  TreePine,
  Shield,
  Building,
  Satellite,
  Navigation,
  MousePointer,
  Pencil,
  Circle,
  Square,
  CheckCircle,
  ExternalLink,
  Lightbulb,
  Zap,
  Settings,
  Eye,
  Download,
  Share2,
  Play
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DragDropWebGISCreator = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const { toast } = useToast();

  const baseMaps = [
    {
      id: 'osm',
      name: 'OpenStreetMap',
      description: 'Free, open-source world map',
      icon: Map,
      preview: '/api/placeholder/120/80'
    },
    {
      id: 'satellite',
      name: 'Satellite Imagery',
      description: 'High-resolution satellite view',
      icon: Satellite,
      preview: '/api/placeholder/120/80'
    },
    {
      id: 'terrain',
      name: 'Terrain Map',
      description: 'Topographic terrain view',
      icon: TreePine,
      preview: '/api/placeholder/120/80'
    }
  ];

  const layerTools = [
    {
      id: 'upload-geojson',
      name: 'Upload GeoJSON',
      description: 'Import vector data',
      icon: Upload,
      format: 'GeoJSON, KML'
    },
    {
      id: 'upload-shapefile',
      name: 'Upload Shapefile',
      description: 'Import ESRI Shapefile',
      icon: Upload,
      format: 'SHP, DBF, SHX'
    },
    {
      id: 'upload-csv',
      name: 'Upload CSV',
      description: 'Import coordinate data',
      icon: Upload,
      format: 'CSV with lat/lng'
    }
  ];

  const drawTools = [
    {
      id: 'point',
      name: 'Point Tool',
      description: 'Add point markers',
      icon: MousePointer
    },
    {
      id: 'line',
      name: 'Line Tool',
      description: 'Draw polylines',
      icon: Pencil
    },
    {
      id: 'polygon',
      name: 'Polygon Tool',
      description: 'Draw polygons',
      icon: Square
    },
    {
      id: 'circle',
      name: 'Circle Tool',
      description: 'Draw circles',
      icon: Circle
    }
  ];

  const stylingOptions = [
    {
      id: 'colors',
      name: 'Color Schemes',
      description: 'Apply color palettes',
      icon: Palette
    },
    {
      id: 'opacity',
      name: 'Transparency',
      description: 'Adjust layer opacity',
      icon: Eye
    },
    {
      id: 'classification',
      name: 'Data Classification',
      description: 'Categorize by attributes',
      icon: Layers
    }
  ];

  const geoAppTemplates = [
    {
      id: 'disaster-dashboard',
      title: 'Disaster Response Dashboard',
      description: 'Emergency management and real-time incident tracking',
      thumbnail: '/api/placeholder/300/200',
      features: ['Incident Mapping', 'Resource Tracking', 'Real-time Updates', 'Emergency Contacts'],
      category: 'Emergency Management',
      layers: ['Emergency Incidents', 'Evacuation Routes', 'Emergency Services', 'Population Density']
    },
    {
      id: 'land-rights-map',
      title: 'Land Rights Mapping System',
      description: 'Cadastral mapping and property rights visualization',
      thumbnail: '/api/placeholder/300/200',
      features: ['Property Boundaries', 'Ownership Records', 'Legal Documents', 'Dispute Tracking'],
      category: 'Legal & Administrative',
      layers: ['Land Parcels', 'Ownership Records', 'Legal Boundaries', 'Survey Points']
    },
    {
      id: 'smart-farming',
      title: 'Smart Farming Analytics',
      description: 'Precision agriculture and crop monitoring platform',
      thumbnail: '/api/placeholder/300/200',
      features: ['NDVI Analysis', 'Yield Prediction', 'Irrigation Planning', 'Weather Integration'],
      category: 'Agriculture',
      layers: ['Field Boundaries', 'NDVI Data', 'Soil Samples', 'Weather Stations']
    }
  ];

  const aiCopilotFeatures = [
    {
      id: 'explain-layers',
      title: 'Explain My Map Layers',
      description: 'Get insights about your data layers and their relationships',
      icon: Lightbulb,
      response: 'Your map contains 3 data layers: Population density (choropleth), Transportation networks (lines), and Points of interest (markers). The population layer shows demographic patterns, while the transportation layer reveals connectivity patterns. Consider adding a buffer analysis around transit stops to identify underserved areas.'
    },
    {
      id: 'suggest-symbology',
      title: 'Suggest Better Symbology',
      description: 'Get AI recommendations for better visual representation',
      icon: Palette,
      response: 'For your population density layer, I recommend using a sequential color scheme from light blue to dark blue instead of random colors. This will make it easier to identify high/low density areas. Also consider using graduated symbols for your point data based on importance or size attributes.'
    },
    {
      id: 'fix-crs-errors',
      title: 'Auto-Fix CRS Errors',
      description: 'Automatically detect and resolve coordinate system issues',
      icon: Settings,
      response: 'I detected that your uploaded shapefile is in NAD83 (EPSG:4269) while your base map uses Web Mercator (EPSG:3857). I can automatically reproject your data to match the base map. This will ensure all layers align properly and measurements are accurate.'
    }
  ];

  const handleDragStart = (e: React.DragEvent, toolId: string, toolType: string) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ toolId, toolType }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    toast({
      title: `Added ${data.toolType}`,
      description: `${data.toolId} has been added to your map`,
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleTemplateUse = (template: any) => {
    setSelectedTemplate(template);
    setTemplateDialogOpen(true);
  };

  const handleLoadTemplate = () => {
    toast({
      title: `Loading ${selectedTemplate.title}`,
      description: "Template layers and styling are being applied to your project...",
    });
    setTemplateDialogOpen(false);
  };

  const handleAiFeatureClick = (feature: any) => {
    toast({
      title: feature.title,
      description: feature.response,
      duration: 8000,
    });
  };

  const handlePublish = (platform: string) => {
    toast({
      title: `Publishing to ${platform}`,
      description: "Your Web GIS application is being deployed. You'll receive a notification when it's ready.",
    });
    setPublishDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-4">
            Drag-and-Drop Web GIS Creator
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Build professional web mapping applications without coding. Drag components to your canvas, 
            customize styling, and publish to the web in minutes.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Tools */}
          <div className="lg:col-span-1 space-y-6">
            {/* Base Maps Section */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Map className="h-5 w-5 text-primary" />
                  Base Maps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {baseMaps.map((map) => (
                  <div
                    key={map.id}
                    className="group cursor-move border rounded-lg p-3 hover:border-primary/50 transition-all"
                    draggable
                    onDragStart={(e) => handleDragStart(e, map.id, 'basemap')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-primary/10">
                        <map.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{map.name}</p>
                        <p className="text-xs text-muted-foreground">{map.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Upload Layers Section */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Upload className="h-5 w-5 text-primary" />
                  Upload Layers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {layerTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="group cursor-move border rounded-lg p-3 hover:border-primary/50 transition-all"
                    draggable
                    onDragStart={(e) => handleDragStart(e, tool.id, 'layer')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-primary/10">
                        <tool.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{tool.name}</p>
                        <p className="text-xs text-muted-foreground">{tool.format}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Draw Tools Section */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Pencil className="h-5 w-5 text-primary" />
                  Draw Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {drawTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="group cursor-move border rounded-lg p-3 hover:border-primary/50 transition-all"
                    draggable
                    onDragStart={(e) => handleDragStart(e, tool.id, 'draw')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-primary/10">
                        <tool.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{tool.name}</p>
                        <p className="text-xs text-muted-foreground">{tool.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Styling Section */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Palette className="h-5 w-5 text-primary" />
                  Layer Styling
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stylingOptions.map((option) => (
                  <div
                    key={option.id}
                    className="group cursor-move border rounded-lg p-3 hover:border-primary/50 transition-all"
                    draggable
                    onDragStart={(e) => handleDragStart(e, option.id, 'styling')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-primary/10">
                        <option.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{option.name}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Canvas Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map Canvas */}
            <Card className="min-h-[500px]">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Map Canvas
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAiSidebarOpen(true)}
                    >
                      <Bot className="h-4 w-4 mr-2" />
                      AI Copilot
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPublishDialogOpen(true)}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Publish
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="w-full h-[400px] border-2 border-dashed border-muted rounded-lg flex items-center justify-center bg-muted/20"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <div className="text-center">
                    <Map className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">Drop components here to build your map</p>
                    <p className="text-sm text-muted-foreground">
                      Drag base maps, layers, and tools from the sidebar
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Geo App Templates Section */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Geo App Templates
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Start with pre-built templates for common geospatial applications
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {geoAppTemplates.map((template) => (
                    <Card key={template.id} className="group hover:shadow-lg transition-all duration-300">
                      <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                        <img 
                          src={template.thumbnail} 
                          alt={template.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-sm">{template.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                          </div>
                          
                          <div>
                            <Badge variant="secondary" className="text-xs">
                              {template.category}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <p className="text-xs font-medium">Included Features:</p>
                            <div className="flex flex-wrap gap-1">
                              {template.features.slice(0, 2).map((feature, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                              {template.features.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{template.features.length - 2} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          <Button 
                            size="sm" 
                            className="w-full"
                            onClick={() => handleTemplateUse(template)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Use Template
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - AI Copilot */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bot className="h-5 w-5 text-primary" />
                  AI Copilot
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Get intelligent assistance for your mapping project
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiCopilotFeatures.map((feature) => (
                  <div
                    key={feature.id}
                    className="group cursor-pointer border rounded-lg p-4 hover:border-primary/50 transition-all hover:shadow-md"
                    onClick={() => handleAiFeatureClick(feature)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded bg-primary/10 flex-shrink-0">
                        <feature.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                          {feature.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-3">
                    Coming Soon: Advanced AI Features
                  </p>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3" />
                      Auto-generate legends
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3" />
                      Smart data classification
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3" />
                      Natural language queries
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Template Dialog */}
        <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Load Template: {selectedTemplate?.title}</DialogTitle>
            </DialogHeader>
            
            {selectedTemplate && (
              <div className="space-y-6">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={selectedTemplate.thumbnail} 
                    alt={selectedTemplate.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Template Features</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedTemplate.features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Included Layers</h3>
                    <div className="space-y-2">
                      {selectedTemplate.layers.map((layer: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Layers className="h-4 w-4 text-primary" />
                          {layer}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleLoadTemplate} className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Load Template
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Publish Dialog */}
        <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Publish Your Web GIS Application</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="app-name">Application Name</Label>
                  <Input id="app-name" placeholder="My GIS Application" />
                </div>
                <div>
                  <Label htmlFor="app-description">Description</Label>
                  <Textarea id="app-description" placeholder="Describe your application..." />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Publishing Options</h3>
                
                <div className="space-y-3">
                  <Card className="p-4 cursor-pointer hover:border-primary/50 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Github className="h-5 w-5" />
                        <div>
                          <p className="font-medium">GitHub Pages</p>
                          <p className="text-sm text-muted-foreground">Deploy as static website</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handlePublish('GitHub Pages')}
                      >
                        Deploy
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-4 cursor-pointer hover:border-primary/50 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5" />
                        <div>
                          <p className="font-medium">HaritaHive Subdomain</p>
                          <p className="text-sm text-muted-foreground">username.haritahive.com/project</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handlePublish('HaritaHive Subdomain')}
                      >
                        Deploy
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setPublishDialogOpen(false)}>
                  Cancel
                </Button>
                <Button disabled className="flex-1">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Advanced Publishing (Coming Soon)
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DragDropWebGISCreator;