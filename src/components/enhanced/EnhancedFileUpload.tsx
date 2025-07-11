import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, File, X, CheckCircle, AlertCircle, Map, Image, Globe } from 'lucide-react';
import CoordinateSystemSelector from '@/components/map/CoordinateSystemSelector';
import BasemapSwitcher from '@/components/map/BasemapSwitcher';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UploadedFile {
  id: string;
  name: string;
  type: 'vector' | 'raster' | 'satellite';
  format: string;
  size: number;
  url: string;
  storageUrl?: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress?: number;
  error?: string;
  metadata?: {
    crs?: string;
    bounds?: [number, number, number, number];
    features?: number;
    bands?: number;
    projection?: string;
  };
}

interface EnhancedFileUploadProps {
  onFileUploaded: (file: UploadedFile) => void;
  onFileRemoved: (fileId: string) => void;
  uploadedFiles: UploadedFile[];
  selectedCRS?: string;
  selectedBasemap?: string;
  onCRSChange?: (crs: string) => void;
  onBasemapChange?: (basemap: string) => void;
  maxFileSize?: number; // in MB
  allowedFormats?: string[];
}

const EnhancedFileUpload: React.FC<EnhancedFileUploadProps> = ({
  onFileUploaded,
  onFileRemoved,
  uploadedFiles,
  selectedCRS = 'EPSG:4326',
  selectedBasemap = 'osm',
  onCRSChange,
  onBasemapChange,
  maxFileSize = 100,
  allowedFormats = ['.geojson', '.shp', '.tif', '.tiff', '.kml', '.gpx', '.csv', '.zip']
}) => {
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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

  const uploadFileToStorage = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('geo-processing')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from('geo-processing')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
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
    for (let progress = 0; progress <= 100; progress += 20) {
      uploadedFile.progress = progress;
      uploadedFile.status = progress === 100 ? 'processing' : 'uploading';
      
      // Update the file in the parent component
      onFileUploaded({...uploadedFile});
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    try {
      // Upload to Supabase Storage
      const storageUrl = await uploadFileToStorage(file);
      uploadedFile.storageUrl = storageUrl;

      // Simulate processing and metadata extraction
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      uploadedFile.metadata = {
        crs: selectedCRS,
        projection: selectedCRS,
        bounds: [-180, -90, 180, 90],
        features: fileType === 'vector' ? Math.floor(Math.random() * 1000) + 100 : undefined,
        bands: fileType === 'raster' ? Math.floor(Math.random() * 5) + 1 : undefined
      };
      
      uploadedFile.status = 'ready';
      delete uploadedFile.progress;
      
      // Store file metadata in database (commented out until types are updated)
      // const { error: dbError } = await supabase
      //   .from('user_uploads')
      //   .insert({
      //     user_id: user?.id,
      //     file_name: file.name,
      //     file_type: fileType,
      //     file_format: format,
      //     file_size: file.size,
      //     storage_url: storageUrl,
      //     metadata: uploadedFile.metadata,
      //     coordinate_system: selectedCRS,
      //     status: 'ready'
      //   });
      
    } catch (error: any) {
      uploadedFile.status = 'error';
      uploadedFile.error = error.message;
      console.error('File processing error:', error);
    }
    
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
  }, [onFileUploaded, toast, selectedCRS, user]);

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
        return <Image className="h-4 w-4" />;
      case 'vector':
        return <Map className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Configuration</CardTitle>
          <CardDescription>
            Set coordinate system and basemap preferences for your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Coordinate Reference System</Label>
              <CoordinateSystemSelector
                selectedCRS={selectedCRS}
                onCRSChange={onCRSChange || (() => {})}
              />
            </div>
            <div className="space-y-2">
              <Label>Preferred Basemap</Label>
              <BasemapSwitcher
                selectedBasemap={selectedBasemap}
                onBasemapChange={onBasemapChange || (() => {})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Geospatial Data
          </CardTitle>
          <CardDescription>
            Supported formats: {allowedFormats.join(', ')} (max {maxFileSize}MB each)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              dragActive 
                ? 'border-primary bg-primary/5 scale-[1.02]' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  Drag & drop files here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to select files from your computer
                </p>
              </div>
              
              <input
                type="file"
                multiple
                accept={allowedFormats.join(',')}
                onChange={handleFileInput}
                className="hidden"
                id="enhanced-file-upload"
              />
              <Label htmlFor="enhanced-file-upload" className="cursor-pointer">
                <Button variant="outline" size="lg" asChild>
                  <span>Select Files</span>
                </Button>
              </Label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  GeoJSON
                </div>
                <div className="flex items-center gap-1">
                  <Map className="h-3 w-3" />
                  Shapefile
                </div>
                <div className="flex items-center gap-1">
                  <Image className="h-3 w-3" />
                  GeoTIFF
                </div>
                <div className="flex items-center gap-1">
                  <File className="h-3 w-3" />
                  KML/CSV
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Uploaded Files ({uploadedFiles.length})</CardTitle>
            <CardDescription>
              Manage your uploaded geospatial datasets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex items-center gap-1">
                        {getTypeIcon(file.type)}
                        {getStatusIcon(file.status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
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
                          <div className="mt-2 space-y-1">
                            <Progress value={file.progress} className="h-2" />
                            <span className="text-xs text-muted-foreground">
                              Uploading... {file.progress}%
                            </span>
                          </div>
                        )}
                        
                        {file.status === 'processing' && (
                          <div className="mt-1">
                            <span className="text-xs text-blue-600">Processing...</span>
                          </div>
                        )}
                        
                        {file.status === 'ready' && file.metadata && (
                          <div className="text-xs text-muted-foreground mt-2 space-y-1">
                            <div>CRS: {file.metadata.crs}</div>
                            {file.metadata.features && (
                              <div>Features: {file.metadata.features.toLocaleString()}</div>
                            )}
                            {file.metadata.bands && (
                              <div>Bands: {file.metadata.bands}</div>
                            )}
                          </div>
                        )}
                        
                        {file.status === 'error' && file.error && (
                          <div className="text-xs text-red-600 mt-1">{file.error}</div>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFileRemoved(file.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
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

export default EnhancedFileUpload;