import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import FileUploadManager from "../geospatial/FileUploadManager";
import { 
  Merge, 
  Layers, 
  Grid, 
  Combine,
  Play,
  Crown
} from "lucide-react";

interface MergeToolsProps {
  onJobCreated: () => void;
  onResultGenerated: (result: any) => void;
  subscription: any;
}

const MergeTools = ({ onJobCreated, onResultGenerated, subscription }: MergeToolsProps) => {
  const { user } = useAuth();
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [parameters, setParameters] = useState<any>({});
  const [processing, setProcessing] = useState(false);

  const mergeTools = [
    {
      id: "vector_merge",
      name: "Vector Merge",
      description: "Combine multiple vector datasets into single layer",
      icon: Merge,
      minFiles: 2,
      maxFiles: 10,
      supportedFormats: [".shp", ".geojson", ".kml"],
      isPremium: false
    },
    {
      id: "raster_mosaic",
      name: "Raster Mosaic",
      description: "Seamlessly merge raster tiles with blending options",
      icon: Grid,
      minFiles: 2,
      maxFiles: 20,
      supportedFormats: [".tif", ".tiff"],
      isPremium: false
    }
  ];

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
    setUploadedFiles([]);
    setParameters({});
  };

  const handleFileUploaded = (file: any) => {
    setUploadedFiles(prev => [...prev, file]);
  };

  const handleFileRemoved = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Merge className="h-5 w-5" />
            Data Merge & Fusion Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mergeTools.map((tool) => {
              const IconComponent = tool.icon;
              
              return (
                <Card 
                  key={tool.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTool === tool.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleToolSelect(tool.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <IconComponent className="h-5 w-5 text-primary mt-1" />
                      <div className="flex-1">
                        <h3 className="font-medium">{tool.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {tool.description}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {tool.minFiles}-{tool.maxFiles} files
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MergeTools;