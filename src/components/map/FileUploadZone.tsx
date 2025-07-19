import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, FileText, AlertCircle, CheckCircle, 
  Image, Map, Database, X 
} from 'lucide-react';

interface FileUploadZoneProps {
  onFileUpload: (files: File[]) => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({ onFileUpload }) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const supportedFormats = [
    { ext: 'shp', type: 'Shapefile', icon: Map, description: 'ESRI Shapefile (with .zip)' },
    { ext: 'geojson', type: 'GeoJSON', icon: FileText, description: 'Geographic JSON format' },
    { ext: 'csv', type: 'CSV', icon: Database, description: 'Comma-separated values with lat/lon' },
    { ext: 'gpkg', type: 'GeoPackage', icon: Database, description: 'SQLite-based format' },
    { ext: 'kml', type: 'KML', icon: Map, description: 'Keyhole Markup Language' },
    { ext: 'tif', type: 'GeoTIFF', icon: Image, description: 'Tagged Image File Format' }
  ];

  const simulateUpload = useCallback(async (file: File) => {
    const uploadFile: UploadingFile = {
      file,
      progress: 0,
      status: 'uploading'
    };

    setUploadingFiles(prev => [...prev, uploadFile]);

    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadingFiles(prev => prev.map(f => 
        f.file === file ? { ...f, progress } : f
      ));
    }

    // Mark as completed
    setUploadingFiles(prev => prev.map(f => 
      f.file === file ? { ...f, status: 'completed' } : f
    ));

    // Remove from list after 2 seconds
    setTimeout(() => {
      setUploadingFiles(prev => prev.filter(f => f.file !== file));
    }, 2000);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/zip': ['.zip'],
      'application/json': ['.geojson'],
      'text/csv': ['.csv'],
      'application/geopackage+sqlite3': ['.gpkg'],
      'application/vnd.google-earth.kml+xml': ['.kml'],
      'application/vnd.google-earth.kmz': ['.kmz'],
      'image/tiff': ['.tif', '.tiff'],
      'application/octet-stream': ['.img', '.jp2']
    },
    onDrop: useCallback((acceptedFiles: File[]) => {
      acceptedFiles.forEach(simulateUpload);
      onFileUpload(acceptedFiles);
    }, [onFileUpload, simulateUpload])
  });

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['tif', 'tiff', 'img', 'jp2'].includes(ext || '')) return Image;
    if (['shp', 'kml', 'kmz'].includes(ext || '')) return Map;
    if (['csv', 'gpkg'].includes(ext || '')) return Database;
    return FileText;
  };

  const removeUploadingFile = (file: File) => {
    setUploadingFiles(prev => prev.filter(f => f.file !== file));
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-primary bg-primary/10' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        {isDragActive ? (
          <div>
            <p className="text-lg font-medium text-primary">Drop files here</p>
            <p className="text-sm text-muted-foreground">Release to upload</p>
          </div>
        ) : (
          <div>
            <p className="text-lg font-medium mb-2">Upload Geospatial Files</p>
            <p className="text-sm text-muted-foreground mb-4">
              Drag & drop files here, or click to browse
            </p>
            <Button variant="outline">
              Choose Files
            </Button>
          </div>
        )}
      </div>

      {/* Supported Formats */}
      <div>
        <h4 className="font-medium text-sm mb-3">Supported Formats</h4>
        <div className="grid grid-cols-2 gap-2">
          {supportedFormats.map((format) => {
            const Icon = format.icon;
            return (
              <div key={format.ext} className="flex items-center gap-2 p-2 border rounded text-sm">
                <Icon className="h-4 w-4 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">{format.type}</p>
                  <p className="text-xs text-muted-foreground">.{format.ext}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Uploading Files</h4>
          {uploadingFiles.map((uploadFile) => {
            const Icon = getFileIcon(uploadFile.file.name);
            return (
              <Card key={uploadFile.file.name}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={uploadFile.progress} className="flex-1 h-2" />
                        <span className="text-xs text-muted-foreground w-8">
                          {uploadFile.progress}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {uploadFile.status === 'completed' && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      {uploadFile.status === 'error' && (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUploadingFile(uploadFile.file)}
                        className="p-1"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Sample Data */}
      <div className="p-4 bg-muted/30 rounded-lg">
        <h4 className="font-medium text-sm mb-2">Try Sample Data</h4>
        <p className="text-xs text-muted-foreground mb-3">
          Load example datasets to explore the viewer features
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            World Cities
          </Button>
          <Button variant="outline" size="sm">
            Country Borders
          </Button>
          <Button variant="outline" size="sm">
            Elevation DEM
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadZone;