import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { RealGeoProcessingEngine, ProcessingOptions } from './RealGeoProcessingEngine';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import PremiumContentGate from '@/components/premium/PremiumContentGate';
import ExportTools from './ExportTools';
import { 
  Merge, 
  Upload, 
  Play, 
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

interface SelectedFile {
  file: File;
  type: 'vector' | 'raster';
  format: string;
  size: number;
  valid: boolean;
  error?: string;
}

const MergeTools: React.FC = () => {
  const { hasAccess } = usePremiumAccess();
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [mergeType, setMergeType] = useState<'vector' | 'raster'>('vector');
  const [mergeOptions, setMergeOptions] = useState({
    method: 'mosaic',
    resampling: 'nearest',
    preserveAttributes: true,
    outputName: 'merged_data'
  });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [cancelController, setCancelController] = useState<AbortController | null>(null);

  const vectorFormats = ['.geojson', '.json', '.kml', '.gpx', '.shp'];
  const rasterFormats = ['.tif', '.tiff', '.geotiff', '.jpg', '.jpeg', '.png'];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    const processedFiles: SelectedFile[] = files.map(file => {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      const isVector = vectorFormats.includes(extension);
      const isRaster = rasterFormats.includes(extension);
      
      let valid = true;
      let error = '';
      let type: 'vector' | 'raster' = mergeType;
      
      if (mergeType === 'vector' && !isVector) {
        valid = false;
        error = 'Not a supported vector format';
      } else if (mergeType === 'raster' && !isRaster) {
        valid = false;
        error = 'Not a supported raster format';
      } else if (!isVector && !isRaster) {
        valid = false;
        error = 'Unsupported file format';
      }
      
      // Detect type if not set
      if (isVector) type = 'vector';
      if (isRaster) type = 'raster';
      
      // Check file size (max 500MB per file for merge operations)
      if (file.size > 500 * 1024 * 1024) {
        valid = false;
        error = 'File too large (max 500MB)';
      }
      
      return {
        file,
        type,
        format: extension,
        size: file.size,
        valid,
        error
      };
    });
    
    setSelectedFiles(prev => [...prev, ...processedFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
  };

  const validateMerge = (): string | null => {
    if (selectedFiles.length < 2) {
      return 'At least 2 files are required for merging';
    }
    
    const validFiles = selectedFiles.filter(f => f.valid);
    if (validFiles.length < 2) {
      return 'At least 2 valid files are required';
    }
    
    // Check if all files are the same type
    const types = [...new Set(validFiles.map(f => f.type))];
    if (types.length > 1) {
      return 'All files must be the same type (all vector or all raster)';
    }
    
    // Check total size for memory management
    const totalSize = validFiles.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > 2 * 1024 * 1024 * 1024) { // 2GB limit
      return 'Total file size exceeds 2GB limit';
    }
    
    return null;
  };

  const handleMerge = async () => {
    const validationError = validateMerge();
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    const validFiles = selectedFiles.filter(f => f.valid);
    const files = validFiles.map(f => f.file);
    
    setProcessing(true);
    setProgress(0);
    setResult(null);
    
    const controller = new AbortController();
    setCancelController(controller);
    
    const processingOptions: ProcessingOptions = {
      progressCallback: setProgress,
      cancelToken: controller
    };

    try {
      let result;
      
      if (mergeType === 'raster') {
        result = await RealGeoProcessingEngine.mergeRasters(
          files, 
          {
            method: mergeOptions.method,
            resampling: mergeOptions.resampling
          },
          processingOptions
        );
      } else {
        // For vector merge, we'll use intersection as a merge operation
        if (files.length === 2) {
          result = await RealGeoProcessingEngine.intersectVectors(
            files,
            {
              intersect_type: 'union',
              keep_attributes: mergeOptions.preserveAttributes ? 'both' : 'first'
            },
            processingOptions
          );
        } else {
          throw new Error('Vector merge currently supports only 2 files');
        }
      }
      
      if (result.success) {
        setResult(result);
        toast({
          title: "Merge Complete",
          description: `Successfully merged ${files.length} files`,
        });
      } else {
        throw new Error(result.error || 'Merge operation failed');
      }
      
    } catch (error: any) {
      if (error.message !== 'Operation cancelled') {
        console.error('Merge error:', error);
        toast({
          title: "Merge Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setProcessing(false);
      setCancelController(null);
    }
  };

  const handleCancel = () => {
    if (cancelController) {
      cancelController.abort();
      setProcessing(false);
      toast({
        title: "Operation Cancelled",
        description: "Merge operation has been cancelled",
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!hasAccess('pro')) {
    return (
      <div className="container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-primary/10 rounded-full">
                <Merge className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Merge Tools - Professional Feature
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              Combine multiple geospatial datasets into unified files. Merge vector layers or raster datasets while preserving data integrity and spatial properties.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm justify-center">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Merge multiple raster files (TIF, GeoTIFF)</span>
              </div>
              <div className="flex items-center gap-2 text-sm justify-center">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Combine vector datasets (Shapefile, GeoJSON, KML)</span>
              </div>
              <div className="flex items-center gap-2 text-sm justify-center">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Memory-efficient processing for large files</span>
              </div>
            </div>
            <Button size="lg" className="mt-6" asChild>
              <a href="/premium-upgrade">Upgrade to Pro Plan</a>
            </Button>
            <Badge variant="secondary">Pro or Enterprise Plan Required</Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tool Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Merge className="h-5 w-5" />
            Data Merge Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Type</Label>
              <Select value={mergeType} onValueChange={(value: 'vector' | 'raster') => {
                setMergeType(value);
                setSelectedFiles([]); // Clear files when type changes
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vector">Vector Data</SelectItem>
                  <SelectItem value="raster">Raster Data</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mergeType === 'raster' && (
              <>
                <div className="space-y-2">
                  <Label>Merge Method</Label>
                  <Select value={mergeOptions.method} onValueChange={(value) => 
                    setMergeOptions(prev => ({ ...prev, method: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mosaic">Mosaic (overlay)</SelectItem>
                      <SelectItem value="blend">Blend edges</SelectItem>
                      <SelectItem value="first">First pixel wins</SelectItem>
                      <SelectItem value="last">Last pixel wins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Resampling</Label>
                  <Select value={mergeOptions.resampling} onValueChange={(value) => 
                    setMergeOptions(prev => ({ ...prev, resampling: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nearest">Nearest Neighbor</SelectItem>
                      <SelectItem value="bilinear">Bilinear</SelectItem>
                      <SelectItem value="cubic">Cubic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {mergeType === 'vector' && (
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="preserve-attributes"
                  checked={mergeOptions.preserveAttributes}
                  onCheckedChange={(checked) => 
                    setMergeOptions(prev => ({ ...prev, preserveAttributes: !!checked }))
                  }
                />
                <Label htmlFor="preserve-attributes">Preserve all attributes</Label>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Select Files to Merge
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Upload Files</Label>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              accept={mergeType === 'vector' ? vectorFormats.join(',') : rasterFormats.join(',')}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <div className="text-xs text-muted-foreground">
              Supported formats: {mergeType === 'vector' ? vectorFormats.join(', ') : rasterFormats.join(', ')}
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Selected Files ({selectedFiles.length})</span>
                <Button variant="outline" size="sm" onClick={clearAllFiles}>
                  Clear All
                </Button>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {file.valid ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <div className="font-medium">{file.file.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)} • {file.format}
                          {file.error && <span className="text-red-500 ml-2">{file.error}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={file.valid ? 'default' : 'destructive'}>
                        {file.type}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm">
                  Total size: {formatFileSize(selectedFiles.reduce((sum, f) => sum + f.size, 0))}
                  {' • '}
                  Valid files: {selectedFiles.filter(f => f.valid).length} of {selectedFiles.length}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing Controls */}
      <Card>
        <CardContent className="pt-6">
          {processing && (
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span>Merging files...</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              <Button variant="outline" onClick={handleCancel} className="w-full">
                Cancel Operation
              </Button>
            </div>
          )}

          {!processing && (
            <Button
              onClick={handleMerge}
              disabled={selectedFiles.filter(f => f.valid).length < 2}
              className="w-full"
            >
              <Play className="h-4 w-4 mr-2" />
              Merge {selectedFiles.filter(f => f.valid).length} Files
            </Button>
          )}

          {validateMerge() && !processing && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              {validateMerge()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results and Export */}
      {result && result.success && (
        <ExportTools
          data={result.output}
          dataType={mergeType}
          fileName={mergeOptions.outputName}
          metadata={result.metadata}
        />
      )}
    </div>
  );
};

export default MergeTools;