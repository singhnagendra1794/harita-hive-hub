import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Link, Database, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DataImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onLayerAdded: (layer: any) => void;
}

export const DataImportDialog = ({ open, onOpenChange, projectId, onLayerAdded }: DataImportDialogProps) => {
  const [uploading, setUploading] = useState(false);
  const [wmsUrl, setWmsUrl] = useState('');
  const [wmsLayers, setWmsLayers] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${projectId}/${fileName}`;

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('geo-processing')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('geo-processing')
        .getPublicUrl(filePath);

      // Create layer based on file type
      let layerType = 'geojson';
      if (fileExt === 'csv') layerType = 'csv';
      if (fileExt === 'kml') layerType = 'kml';

      const newLayer = {
        project_id: projectId,
        name: file.name.replace(/\.[^/.]+$/, ""),
        layer_type: layerType,
        data_source: publicUrl,
        is_visible: true,
        opacity: 1,
        layer_order: 0,
        style_config: {
          color: '#3b82f6',
          weight: 2,
          fillOpacity: 0.2
        }
      };

      onLayerAdded(newLayer);
      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been added as a layer.`
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleWMSConnection = async () => {
    if (!wmsUrl || !wmsLayers) {
      toast({
        title: "Missing information",
        description: "Please provide both WMS URL and layer names.",
        variant: "destructive"
      });
      return;
    }

    const newLayer = {
      project_id: projectId,
      name: `WMS: ${wmsLayers}`,
      layer_type: 'wms',
      data_source: wmsUrl,
      is_visible: true,
      opacity: 1,
      layer_order: 0,
      style_config: {
        layers: wmsLayers,
        format: 'image/png',
        transparent: true,
        version: '1.1.1'
      }
    };

    onLayerAdded(newLayer);
    toast({
      title: "WMS layer added",
      description: `Connected to ${wmsUrl}`,
    });
    onOpenChange(false);
  };

  const handleAPIConnection = async () => {
    if (!apiUrl) {
      toast({
        title: "Missing API URL",
        description: "Please provide an API endpoint URL.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Test API connection
      const headers: any = { 'Content-Type': 'application/json' };
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

      const response = await fetch(apiUrl, { headers });
      const data = await response.json();

      const newLayer = {
        project_id: projectId,
        name: `API: ${new URL(apiUrl).hostname}`,
        layer_type: 'api',
        data_source: apiUrl,
        is_visible: true,
        opacity: 1,
        layer_order: 0,
        style_config: {
          refreshInterval: 300000, // 5 minutes
          apiKey: apiKey,
          dataPath: '', // User can configure this later
          color: '#10b981',
          weight: 2
        }
      };

      onLayerAdded(newLayer);
      toast({
        title: "API connection established",
        description: `Connected to ${new URL(apiUrl).hostname}`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "API connection failed",
        description: "Could not connect to the provided API endpoint.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Data Sources</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="file" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Files
            </TabsTrigger>
            <TabsTrigger value="wms" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              WMS/WMTS
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              API
            </TabsTrigger>
            <TabsTrigger value="sample" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Samples
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Upload Geospatial Files</h3>
              <p className="text-muted-foreground mb-4">
                Supports: GeoJSON, Shapefile (.zip), CSV with coordinates, KML
              </p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".geojson,.json,.zip,.csv,.kml"
                onChange={handleFileUpload}
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Choose File"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="wms" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="wms-url">WMS/WMTS Service URL</Label>
                <Input
                  id="wms-url"
                  placeholder="https://example.com/wms"
                  value={wmsUrl}
                  onChange={(e) => setWmsUrl(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="wms-layers">Layer Names (comma-separated)</Label>
                <Input
                  id="wms-layers"
                  placeholder="layer1,layer2"
                  value={wmsLayers}
                  onChange={(e) => setWmsLayers(e.target.value)}
                />
              </div>
              <Button onClick={handleWMSConnection} className="w-full">
                Connect WMS Service
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="api-url">API Endpoint URL</Label>
                <Input
                  id="api-url"
                  placeholder="https://api.example.com/data"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="api-key">API Key (optional)</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              <Button onClick={handleAPIConnection} className="w-full">
                Connect API
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="sample" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "World Countries", type: "geojson", desc: "Country boundaries worldwide" },
                { name: "US Cities", type: "csv", desc: "Major US cities with population" },
                { name: "Earthquake Data", type: "api", desc: "Real-time earthquake feed" },
                { name: "Weather Stations", type: "geojson", desc: "Global weather monitoring stations" }
              ].map((sample) => (
                <div key={sample.name} className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                  <h4 className="font-medium">{sample.name}</h4>
                  <p className="text-sm text-muted-foreground">{sample.desc}</p>
                  <span className="text-xs bg-secondary px-2 py-1 rounded mt-2 inline-block">
                    {sample.type.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};