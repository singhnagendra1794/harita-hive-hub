import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Download, FileType, Database, Cloud, Folder, 
  Image, FileText, Map, Archive, Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  name: string;
  type: 'vector' | 'raster';
  size: number;
  format: string;
}

interface AnalysisResult {
  id: string;
  toolName: string;
  outputFiles: string[];
  parameters: Record<string, any>;
}

interface ExportManagerProps {
  uploadedFiles: UploadedFile[];
  analysisResults: AnalysisResult[];
  hasAccess: boolean;
}

const ExportManager: React.FC<ExportManagerProps> = ({
  uploadedFiles,
  analysisResults,
  hasAccess
}) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<string>('geojson');
  const [exportDestination, setExportDestination] = useState<string>('download');
  const { toast } = useToast();

  const exportFormats = [
    { id: 'geojson', name: 'GeoJSON', icon: FileType, description: 'Web-friendly format' },
    { id: 'shapefile', name: 'Shapefile', icon: Archive, description: 'Industry standard' },
    { id: 'geotiff', name: 'GeoTIFF', icon: Image, description: 'Raster format' },
    { id: 'csv', name: 'CSV', icon: FileText, description: 'Tabular data' },
    { id: 'kml', name: 'KML', icon: Map, description: 'Google Earth format' },
    { id: 'pdf', name: 'PDF Map', icon: FileText, description: 'Print-ready map', premium: true }
  ];

  const exportDestinations = [
    { id: 'download', name: 'Direct Download', icon: Download, description: 'Download to device' },
    { id: 'studio', name: 'Project Studio', icon: Folder, description: 'Save to workspace', premium: true },
    { id: 'portfolio', name: 'Portfolio', icon: Database, description: 'Add to portfolio', premium: true },
    { id: 'gdrive', name: 'Google Drive', icon: Cloud, description: 'Upload to Drive', premium: true },
    { id: 'supabase', name: 'Cloud Storage', icon: Database, description: 'Supabase bucket', premium: true }
  ];

  const allItems = [
    ...uploadedFiles.map(file => ({
      id: file.id,
      name: file.name,
      type: 'source' as const,
      format: file.format,
      size: file.size
    })),
    ...analysisResults.map(result => ({
      id: result.id,
      name: `${result.toolName} Result`,
      type: 'result' as const,
      format: 'Processing Output',
      size: 0
    }))
  ];

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    setSelectedItems(allItems.map(item => item.id));
  };

  const handleClearSelection = () => {
    setSelectedItems([]);
  };

  const handleExport = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select items to export.",
        variant: "destructive"
      });
      return;
    }

    const selectedFormat = exportFormats.find(f => f.id === exportFormat);
    const selectedDest = exportDestinations.find(d => d.id === exportDestination);

    if ((selectedFormat?.premium || selectedDest?.premium) && !hasAccess) {
      toast({
        title: "Premium Feature",
        description: "This export option requires a premium subscription.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Export Started",
      description: `Exporting ${selectedItems.length} items as ${selectedFormat?.name} to ${selectedDest?.name}.`,
    });

    // Simulate export process
    console.log('Exporting:', {
      items: selectedItems,
      format: exportFormat,
      destination: exportDestination
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Export Data</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearSelection}>
            Clear
          </Button>
        </div>
      </div>

      {/* Available Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Items</CardTitle>
          <CardDescription>
            Select data files and analysis results to export
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Download className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No items available for export</p>
              <p className="text-xs">Upload data or run analysis to see exportable items</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => handleItemToggle(item.id)}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={item.type === 'source' ? 'default' : 'secondary'} className="text-xs">
                        {item.type === 'source' ? 'Source Data' : 'Analysis Result'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {item.format}
                      </Badge>
                      {item.size > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(item.size)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Format */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Export Format</CardTitle>
            <CardDescription>Choose output file format</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {exportFormats.map((format) => {
              const Icon = format.icon;
              const isDisabled = format.premium && !hasAccess;
              
              return (
                <div
                  key={format.id}
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    exportFormat === format.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                  } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !isDisabled && setExportFormat(format.id)}
                >
                  <Icon className="h-5 w-5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{format.name}</p>
                      {format.premium && (
                        <Badge variant="secondary" className="text-xs">
                          {hasAccess ? 'Pro' : <Lock className="h-3 w-3" />}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{format.description}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Export Destination */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Export Destination</CardTitle>
            <CardDescription>Choose where to save exported data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {exportDestinations.map((dest) => {
              const Icon = dest.icon;
              const isDisabled = dest.premium && !hasAccess;
              
              return (
                <div
                  key={dest.id}
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    exportDestination === dest.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                  } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !isDisabled && setExportDestination(dest.id)}
                >
                  <Icon className="h-5 w-5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{dest.name}</p>
                      {dest.premium && (
                        <Badge variant="secondary" className="text-xs">
                          {hasAccess ? 'Pro' : <Lock className="h-3 w-3" />}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{dest.description}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Export Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                {selectedItems.length} items selected for export
              </p>
              <p className="text-xs text-muted-foreground">
                Format: {exportFormats.find(f => f.id === exportFormat)?.name} • 
                Destination: {exportDestinations.find(d => d.id === exportDestination)?.name}
              </p>
            </div>
            <Button onClick={handleExport} disabled={selectedItems.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export Selected
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportManager;