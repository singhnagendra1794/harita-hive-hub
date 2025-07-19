import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { 
  Download, 
  Cloud, 
  Database, 
  FileImage, 
  FileText,
  Crown
} from "lucide-react";

interface ExportToolsProps {
  subscription: any;
  mapLayers: any[];
}

const ExportTools = ({ subscription, mapLayers }: ExportToolsProps) => {
  const [selectedFormat, setSelectedFormat] = useState<string>("");
  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);

  const exportFormats = [
    {
      id: "geotiff",
      name: "GeoTIFF",
      description: "High-quality raster format with geospatial metadata",
      icon: FileImage,
      extension: ".tif",
      isPremium: false
    },
    {
      id: "geojson",
      name: "GeoJSON",
      description: "Web-standard vector format with full attribute support",
      icon: FileText,
      extension: ".geojson",
      isPremium: false
    },
    {
      id: "shapefile",
      name: "Shapefile",
      description: "Industry-standard vector format for GIS applications",
      icon: Database,
      extension: ".shp",
      isPremium: false
    }
  ];

  const handleExport = async () => {
    if (!selectedFormat) {
      toast({
        title: "Missing Selection",
        description: "Please select an export format.",
        variant: "destructive",
      });
      return;
    }

    setExporting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Export Started",
        description: "Your export is being processed.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error during export.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Formats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {exportFormats.map((format) => {
              const IconComponent = format.icon;
              
              return (
                <Card 
                  key={format.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedFormat === format.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedFormat(format.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <IconComponent className="h-4 w-4 text-primary mt-1" />
                      <div className="flex-1">
                        <h3 className="font-medium text-xs">{format.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {format.description}
                        </p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {format.extension}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <Button 
              onClick={handleExport}
              disabled={exporting || !selectedFormat}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {exporting ? "Exporting..." : "Export Data"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportTools;