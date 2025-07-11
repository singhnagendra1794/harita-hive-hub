import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Upload, 
  File, 
  Database, 
  Trash2, 
  Eye, 
  Download,
  Map,
  Image,
  FileText
} from 'lucide-react';

interface UserDataFile {
  id: string;
  name: string;
  type: 'vector' | 'raster' | 'table';
  format: string;
  size: number;
  uploadedAt: string;
  metadata?: Record<string, any>;
  path: string;
  preview?: any;
}

const UserDataManager: React.FC = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<UserDataFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const supportedFormats = {
    vector: ['.shp', '.geojson', '.json', '.kml', '.gpx', '.csv'],
    raster: ['.tif', '.tiff', '.geotiff', '.jpg', '.jpeg', '.png'],
    table: ['.csv', '.xlsx', '.xls', '.json']
  };

  useEffect(() => {
    fetchUserFiles();
  }, [user]);

  const fetchUserFiles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .storage
        .from('geo-processing')
        .list(`users/${user.id}`, {
          limit: 100,
          offset: 0
        });

      if (error) throw error;

      const fileList: UserDataFile[] = data?.map(file => ({
        id: file.id || file.name,
        name: file.name,
        type: determineFileType(file.name),
        format: getFileExtension(file.name),
        size: file.metadata?.size || 0,
        uploadedAt: file.created_at || new Date().toISOString(),
        path: `users/${user.id}/${file.name}`,
        metadata: file.metadata
      })) || [];

      setFiles(fileList);
    } catch (error: any) {
      console.error('Error fetching files:', error);
      toast({
        title: "Error Loading Files",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
  };

  const handleUpload = async () => {
    if (!selectedFiles || !user) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const totalFiles = selectedFiles.length;
      let uploadedCount = 0;

      for (const file of Array.from(selectedFiles)) {
        // Validate file type
        const fileType = determineFileType(file.name);
        const extension = getFileExtension(file.name).toLowerCase();
        
        if (!isValidFileFormat(extension, fileType)) {
          toast({
            title: "Invalid File Format",
            description: `${file.name} is not a supported format`,
            variant: "destructive",
          });
          continue;
        }

        // Validate file size (max 100MB)
        if (file.size > 100 * 1024 * 1024) {
          toast({
            title: "File Too Large",
            description: `${file.name} exceeds 100MB limit`,
            variant: "destructive",
          });
          continue;
        }

        const filePath = `users/${user.id}/${Date.now()}_${file.name}`;

        const { error } = await supabase.storage
          .from('geo-processing')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        uploadedCount++;
        setUploadProgress((uploadedCount / totalFiles) * 100);
      }

      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${uploadedCount} file(s)`,
      });

      // Refresh file list
      await fetchUserFiles();
      setSelectedFiles(null);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteFile = async (filePath: string) => {
    try {
      const { error } = await supabase.storage
        .from('geo-processing')
        .remove([filePath]);

      if (error) throw error;

      toast({
        title: "File Deleted",
        description: "File has been successfully deleted",
      });

      await fetchUserFiles();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDownloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('geo-processing')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const determineFileType = (fileName: string): 'vector' | 'raster' | 'table' => {
    const extension = getFileExtension(fileName).toLowerCase();
    
    if (supportedFormats.vector.includes(extension)) return 'vector';
    if (supportedFormats.raster.includes(extension)) return 'raster';
    return 'table';
  };

  const getFileExtension = (fileName: string): string => {
    return '.' + fileName.split('.').pop()?.toLowerCase() || '';
  };

  const isValidFileFormat = (extension: string, type: string): boolean => {
    return supportedFormats[type as keyof typeof supportedFormats]?.includes(extension) || false;
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'vector': return Map;
      case 'raster': return Image;
      case 'table': return FileText;
      default: return File;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Select Files</Label>
            <Input
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileSelect}
              accept=".shp,.geojson,.json,.kml,.gpx,.csv,.tif,.tiff,.geotiff,.jpg,.jpeg,.png,.xlsx,.xls"
            />
            <div className="text-xs text-muted-foreground">
              Supported formats: Vector (.shp, .geojson, .kml, .gpx), Raster (.tif, .jpg, .png), Tables (.csv, .xlsx)
            </div>
          </div>

          {selectedFiles && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Selected Files:</div>
              {Array.from(selectedFiles).map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{file.name}</span>
                  <Badge variant="outline">{formatFileSize(file.size)}</Badge>
                </div>
              ))}
            </div>
          )}

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress.toFixed(0)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!selectedFiles || uploading}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Files'}
          </Button>
        </CardContent>
      </Card>

      {/* File Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            My Data Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-sm text-muted-foreground">Loading files...</div>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">No files uploaded yet</div>
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">All ({files.length})</TabsTrigger>
                <TabsTrigger value="vector">Vector ({files.filter(f => f.type === 'vector').length})</TabsTrigger>
                <TabsTrigger value="raster">Raster ({files.filter(f => f.type === 'raster').length})</TabsTrigger>
                <TabsTrigger value="table">Tables ({files.filter(f => f.type === 'table').length})</TabsTrigger>
              </TabsList>

              {['all', 'vector', 'raster', 'table'].map(tab => (
                <TabsContent key={tab} value={tab}>
                  <div className="space-y-2">
                    {files
                      .filter(file => tab === 'all' || file.type === tab)
                      .map(file => {
                        const IconComponent = getFileIcon(file.type);
                        return (
                          <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <IconComponent className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{file.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {file.format}
                              </Badge>
                              <Badge variant={file.type === 'vector' ? 'default' : file.type === 'raster' ? 'secondary' : 'outline'} className="text-xs">
                                {file.type}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadFile(file.path, file.name)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteFile(file.path)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDataManager;