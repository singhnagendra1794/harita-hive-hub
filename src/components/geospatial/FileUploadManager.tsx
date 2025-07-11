import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, File, X, CheckCircle, AlertCircle, FileImage, Map } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  type: 'vector' | 'raster' | 'satellite';
  format: string;
  size: number;
  url: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress?: number;
  error?: string;
  metadata?: {
    crs?: string;
    bounds?: [number, number, number, number];
    features?: number;
    bands?: number;
  };
}

interface FileUploadManagerProps {
  onFileUploaded: (file: UploadedFile) => void;
  onFileRemoved: (fileId: string) => void;
  uploadedFiles: UploadedFile[];
  maxFileSize?: number; // in MB
  allowedFormats?: string[];
}

const FileUploadManager: React.FC<FileUploadManagerProps> = ({
  onFileUploaded,
  onFileRemoved,
  uploadedFiles,
  maxFileSize = 100,
  allowedFormats = ['.geojson', '.shp', '.tif', '.tiff', '.kml', '.gpx', '.csv']
}) => {
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const getFileType = (filename: string): 'vector' | 'raster' | 'satellite' => {
    const ext = filename.toLowerCase().split('.').pop();
    if (['geojson', 'shp', 'kml', 'gpx', 'csv'].includes(ext!)) return 'vector';
    if (['tif', 'tiff', 'geotiff'].includes(ext!)) return 'raster';
    return 'satellite';
  };

  const validateFile = (file: File): string | null => {
    const ext = `.${file.name.toLowerCase().split('.').pop()}`;
    
    if (!allowedFormats.includes(ext)) {
      return `Unsupported format. Allowed: ${allowedFormats.join(', ')}`;
    }
    
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File too large. Maximum size: ${maxFileSize}MB`;
    }
    
    return null;
  };

  const processFile = async (file: File): Promise<UploadedFile> => {
    const fileType = getFileType(file.name);
    const format = file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN';
    
    const uploadedFile: UploadedFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: fileType,
      format,
      size: file.size,
      url: URL.createObjectURL(file),
      status: 'uploading',
      progress: 0
    };

    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      uploadedFile.progress = progress;
      uploadedFile.status = progress === 100 ? 'processing' : 'uploading';
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate metadata extraction
    uploadedFile.metadata = {
      crs: 'EPSG:4326',
      bounds: [-180, -90, 180, 90],
      features: fileType === 'vector' ? Math.floor(Math.random() * 1000) + 100 : undefined,
      bands: fileType === 'raster' ? Math.floor(Math.random() * 5) + 1 : undefined
    };
    
    uploadedFile.status = 'ready';
    delete uploadedFile.progress;
    
    return uploadedFile;
  };

  const handleFiles = useCallback(async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const error = validateFile(file);
      
      if (error) {
        toast({
          title: "File validation failed",
          description: `${file.name}: ${error}`,
          variant: "destructive",
        });
        continue;
      }

      try {
        const processedFile = await processFile(file);
        onFileUploaded(processedFile);
        
        toast({
          title: "File uploaded successfully",
          description: `${file.name} is ready for analysis`,
        });
      } catch (error) {
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }
  }, [onFileUploaded, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <File className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeIcon = (type: UploadedFile['type']) => {
    switch (type) {
      case 'raster':
      case 'satellite':
        return <FileImage className="h-4 w-4" />;
      case 'vector':
        return <Map className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Upload Geospatial Data</CardTitle>
          <CardDescription className="text-xs">
            Supported formats: {allowedFormats.join(', ')} (max {maxFileSize}MB)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
              dragActive 
                ? 'border-primary bg-primary/5 scale-105' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
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
              accept={allowedFormats.join(',')}
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <Label htmlFor="file-upload" className="cursor-pointer">
              <Button variant="outline" size="sm" asChild>
                <span>Select Files</span>
              </Button>
            </Label>
          </div>
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Uploaded Files ({uploadedFiles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex items-center gap-1">
                        {getTypeIcon(file.type)}
                        {getStatusIcon(file.status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {file.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {file.format}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {(file.size / (1024 * 1024)).toFixed(1)} MB
                          </span>
                        </div>
                        
                        {file.status === 'uploading' && file.progress !== undefined && (
                          <div className="mt-2">
                            <Progress value={file.progress} className="h-1" />
                            <span className="text-xs text-muted-foreground">
                              Uploading... {file.progress}%
                            </span>
                          </div>
                        )}
                        
                        {file.status === 'processing' && (
                          <span className="text-xs text-blue-600">Processing...</span>
                        )}
                        
                        {file.status === 'ready' && file.metadata && (
                          <div className="text-xs text-muted-foreground mt-1">
                            CRS: {file.metadata.crs}
                            {file.metadata.features && ` • ${file.metadata.features} features`}
                            {file.metadata.bands && ` • ${file.metadata.bands} bands`}
                          </div>
                        )}
                        
                        {file.status === 'error' && file.error && (
                          <span className="text-xs text-red-600">{file.error}</span>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFileRemoved(file.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUploadManager;