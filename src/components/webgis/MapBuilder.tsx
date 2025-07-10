
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Map, 
  Layers, 
  Settings, 
  Share2, 
  Save, 
  Eye, 
  Upload,
  Download,
  Palette,
  Grid,
  MousePointer
} from "lucide-react";

const MapBuilder = () => {
  const [mapConfig, setMapConfig] = useState({
    title: "My Web GIS Dashboard",
    basemap: "osm",
    center: [-95.7129, 37.0902], // US center
    zoom: 4,
    theme: "light"
  });

  const [layers, setLayers] = useState([
    {
      id: "1",
      name: "Sample Data Layer",
      type: "geojson",
      visible: true,
      style: { color: "#3b82f6", weight: 2 }
    }
  ]);

  const [widgets, setWidgets] = useState([
    { id: "1", type: "legend", position: "bottom-left", visible: true },
    { id: "2", type: "scale", position: "bottom-right", visible: true }
  ]);

  const mapRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize map preview
    if (mapRef.current) {
      // In a real implementation, this would initialize a proper map
      mapRef.current.innerHTML = `
        <div class="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center rounded-lg border">
          <div class="text-center p-8">
            <div class="text-lg font-semibold text-gray-700 mb-2">${mapConfig.title}</div>
            <div class="text-sm text-gray-500 mb-4">Basemap: ${mapConfig.basemap.toUpperCase()} | Zoom: ${mapConfig.zoom}</div>
            <div class="text-xs text-gray-400">${layers.length} layer(s) | ${widgets.filter(w => w.visible).length} widget(s)</div>
          </div>
        </div>
      `;
    }
  }, [mapConfig, layers, widgets]);

  const handleSave = () => {
    toast({
      title: "Dashboard Saved",
      description: "Your web GIS dashboard has been saved successfully.",
    });
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/shared-map/${Date.now()}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Share Link Copied",
      description: "Dashboard share link has been copied to clipboard.",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your dashboard is being exported. Download will start shortly.",
    });
  };

  const addLayer = () => {
    const newLayer = {
      id: Date.now().toString(),
      name: `Layer ${layers.length + 1}`,
      type: "geojson",
      visible: true,
      style: { color: "#3b82f6", weight: 2 }
    };
    setLayers([...layers, newLayer]);
  };

  const addWidget = (type: string) => {
    const newWidget = {
      id: Date.now().toString(),
      type,
      position: "top-left",
      visible: true
    };
    setWidgets([...widgets, newWidget]);
  };

  return (
    <div className="h-screen flex">
      {/* Left Panel - Configuration */}
      <div className="w-80 bg-background border-r overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Map Builder
          </h2>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 m-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="layers">Layers</TabsTrigger>
            <TabsTrigger value="widgets">Widgets</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Dashboard Title</Label>
              <Input
                id="title"
                value={mapConfig.title}
                onChange={(e) => setMapConfig({...mapConfig, title: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="basemap">Basemap</Label>
              <Select value={mapConfig.basemap} onValueChange={(value) => setMapConfig({...mapConfig, basemap: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="osm">OpenStreetMap</SelectItem>
                  <SelectItem value="satellite">Satellite</SelectItem>
                  <SelectItem value="terrain">Terrain</SelectItem>
                  <SelectItem value="dark">Dark Theme</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="zoom">Zoom Level</Label>
                <Input
                  id="zoom"
                  type="number"
                  min="1"
                  max="18"
                  value={mapConfig.zoom}
                  onChange={(e) => setMapConfig({...mapConfig, zoom: parseInt(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={mapConfig.theme} onValueChange={(value) => setMapConfig({...mapConfig, theme: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="layers" className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Data Layers</h3>
              <Button size="sm" onClick={addLayer}>
                <Upload className="h-4 w-4 mr-1" />
                Add Layer
              </Button>
            </div>

            <div className="space-y-2">
              {layers.map((layer) => (
                <Card key={layer.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={layer.visible}
                        onChange={(e) => {
                          const updated = layers.map(l => 
                            l.id === layer.id ? {...l, visible: e.target.checked} : l
                          );
                          setLayers(updated);
                        }}
                      />
                      <span className="text-sm font-medium">{layer.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {layer.type.toUpperCase()}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>

            <Button variant="outline" className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Upload Data File
            </Button>
          </TabsContent>

          <TabsContent value="widgets" className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Map Widgets</h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={() => addWidget('legend')}>
                <Grid className="h-4 w-4 mr-1" />
                Legend
              </Button>
              <Button variant="outline" size="sm" onClick={() => addWidget('scale')}>
                <MousePointer className="h-4 w-4 mr-1" />
                Scale Bar
              </Button>
              <Button variant="outline" size="sm" onClick={() => addWidget('coordinates')}>
                <Map className="h-4 w-4 mr-1" />
                Coordinates
              </Button>
              <Button variant="outline" size="sm" onClick={() => addWidget('overview')}>
                <Eye className="h-4 w-4 mr-1" />
                Overview
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Active Widgets</h4>
              {widgets.map((widget) => (
                <div key={widget.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={widget.visible}
                      onChange={(e) => {
                        const updated = widgets.map(w => 
                          w.id === widget.id ? {...w, visible: e.target.checked} : w
                        );
                        setWidgets(updated);
                      }}
                    />
                    <span className="text-sm capitalize">{widget.type}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {widget.position}
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b p-4 flex items-center justify-between bg-background">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Preview Mode</Badge>
            <span className="text-sm text-muted-foreground">{mapConfig.title}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Map Canvas */}
        <div className="flex-1 p-4">
          <div 
            ref={mapRef} 
            className="w-full h-full rounded-lg shadow-md"
          />
        </div>
      </div>
    </div>
  );
};

export default MapBuilder;
