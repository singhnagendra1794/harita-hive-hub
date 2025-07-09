
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, File, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DataUploadPanelProps {
  onDataUpload: (data: any) => void;
  uploadedData: any[];
  onDataSelect: (data: any) => void;
}

const DataUploadPanel = ({ onDataUpload, uploadedData, onDataSelect }: DataUploadPanelProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileType = getFileType(file.name);
        
        if (!fileType) {
          toast({
            title: "Unsupported file format",
            description: `${file.name} is not supported. Please upload GeoTIFF, Shapefile, or GeoJSON files.`,
            variant: "destructive",
          });
          continue;
        }

        // Simulate file processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const uploadedFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: fileType,
          format: file.name.split('.').pop()?.toUpperCase(),
          url: URL.createObjectURL(file),
          size: file.size,
          uploadedAt: new Date(),
          visible: true,
        };

        onDataUpload(uploadedFile);
        
        toast({
          title: "File uploaded successfully",
          description: `${file.name} has been uploaded and is ready for analysis.`,
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getFileType = (filename: string): 'vector' | 'raster' | 'satellite' | null => {
    const ext = filename.toLowerCase().split('.').pop();
    if (['geojson', 'shp', 'kml', 'gpx'].includes(ext!)) return 'vector';
    if (['tif', 'tiff', 'geotiff'].includes(ext!)) return 'raster';
    if (['jpg', 'jpeg', 'png'].includes(ext!)) return 'satellite';
    return null;
  };

  const removeFile = (id: string) => {
    // Implementation would depend on parent component state management
    toast({
      title: "File removed",
      description: "File has been removed from the workspace.",
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Upload Spatial Data</CardTitle>
          <CardDescription className="text-xs">
            Support: GeoTIFF, Shapefile, GeoJSON, KML
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag & drop files here, or click to select
            </p>
            <Input
              type="file"
              multiple
              accept=".geojson,.shp,.tif,.tiff,.kml,.gpx"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <Label htmlFor="file-upload" className="cursor-pointer">
              <Button variant="outline" size="sm" disabled={uploading}>
                {uploading ? "Uploading..." : "Select Files"}
              </Button>
            </Label>
          </div>
        </CardContent>
      </Card>

      {uploadedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Uploaded Data ({uploadedData.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uploadedData.map((data) => (
                <div
                  key={data.id}
                  className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-accent"
                  onClick={() => onDataSelect(data)}
                >
                  <div className="flex items-center space-x-2">
                    <File className="h-4 w-4" />
                    <div>
                      <p className="text-sm font-medium">{data.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {data.format} • {(data.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(data.id);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataUploadPanel;
