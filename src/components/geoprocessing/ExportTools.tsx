import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { 
  Download, 
  FileText, 
  Map, 
  Image, 
  Database,
  Package,
  CheckCircle
} from 'lucide-react';

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  fileExtension: string;
  supportedTypes: string[];
}

interface ExportToolsProps {
  data?: any;
  dataType: 'vector' | 'raster' | 'map';
  fileName: string;
  metadata?: Record<string, any>;
}

const exportFormats: ExportFormat[] = [
  {
    id: 'geojson',
    name: 'GeoJSON',
    description: 'Web-friendly vector format',
    icon: Database,
    fileExtension: '.geojson',
    supportedTypes: ['vector']
  },
  {
    id: 'shapefile',
    name: 'Shapefile',
    description: 'Industry standard vector format',
    icon: Package,
    fileExtension: '.zip',
    supportedTypes: ['vector']
  },
  {
    id: 'kml',
    name: 'KML',
    description: 'Google Earth compatible format',
    icon: Map,
    fileExtension: '.kml',
    supportedTypes: ['vector']
  },
  {
    id: 'geotiff',
    name: 'GeoTIFF',
    description: 'Georeferenced raster format',
    icon: Image,
    fileExtension: '.tif',
    supportedTypes: ['raster']
  },
  {
    id: 'png',
    name: 'PNG',
    description: 'Portable image format',
    icon: Image,
    fileExtension: '.png',
    supportedTypes: ['raster', 'map']
  },
  {
    id: 'pdf',
    name: 'PDF Report',
    description: 'Analysis report with map',
    icon: FileText,
    fileExtension: '.pdf',
    supportedTypes: ['vector', 'raster', 'map']
  },
  {
    id: 'geopackage',
    name: 'GeoPackage',
    description: 'SQLite-based spatial format',
    icon: Package,
    fileExtension: '.gpkg',
    supportedTypes: ['vector', 'raster']
  }
];

const ExportTools: React.FC<ExportToolsProps> = ({
  data,
  dataType,
  fileName,
  metadata = {}
}) => {
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);

  const availableFormats = exportFormats.filter(format => 
    format.supportedTypes.includes(dataType)
  );

  const handleExport = async () => {
    if (!selectedFormat || !data) {
      toast({
        title: "Missing Information",
        description: "Please select a format and ensure data is available",
        variant: "destructive",
      });
      return;
    }

    setExporting(true);
    setExportProgress(0);
    setExportComplete(false);

    try {
      const format = exportFormats.find(f => f.id === selectedFormat);
      if (!format) throw new Error('Invalid format selected');

      // Simulate export progress
      for (let i = 0; i <= 100; i += 10) {
        setExportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      let exportedData: Blob;
      let mimeType: string;

      switch (selectedFormat) {
        case 'geojson':
          exportedData = await exportAsGeoJSON(data);
          mimeType = 'application/geo+json';
          break;
        case 'shapefile':
          exportedData = await exportAsShapefile(data);
          mimeType = 'application/zip';
          break;
        case 'kml':
          exportedData = await exportAsKML(data);
          mimeType = 'application/vnd.google-earth.kml+xml';
          break;
        case 'geotiff':
          exportedData = await exportAsGeoTIFF(data);
          mimeType = 'image/tiff';
          break;
        case 'png':
          exportedData = await exportAsPNG(data);
          mimeType = 'image/png';
          break;
        case 'pdf':
          exportedData = await exportAsPDF(data, metadata);
          mimeType = 'application/pdf';
          break;
        case 'geopackage':
          exportedData = await exportAsGeoPackage(data);
          mimeType = 'application/geopackage+sqlite3';
          break;
        default:
          throw new Error('Unsupported export format');
      }

      // Download the file
      const url = URL.createObjectURL(exportedData);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}_export${format.fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportComplete(true);
      toast({
        title: "Export Complete",
        description: `Successfully exported as ${format.name}`,
      });

    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Export Format</Label>
          <Select value={selectedFormat} onValueChange={setSelectedFormat}>
            <SelectTrigger>
              <SelectValue placeholder="Select export format" />
            </SelectTrigger>
            <SelectContent>
              {availableFormats.map(format => {
                const IconComponent = format.icon;
                return (
                  <SelectItem key={format.id} value={format.id}>
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{format.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {format.description}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {selectedFormat && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Export Details</span>
              <Badge variant="outline">
                {exportFormats.find(f => f.id === selectedFormat)?.fileExtension}
              </Badge>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div>Format: {exportFormats.find(f => f.id === selectedFormat)?.name}</div>
              <div>Type: {dataType}</div>
              {metadata.featureCount && (
                <div>Features: {metadata.featureCount}</div>
              )}
              {metadata.size && (
                <div>Size: {(metadata.size / 1024).toFixed(1)} KB</div>
              )}
            </div>
          </div>
        )}

        {exporting && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Exporting...</span>
              <span>{exportProgress}%</span>
            </div>
            <Progress value={exportProgress} className="w-full" />
          </div>
        )}

        {exportComplete && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800">Export completed successfully!</span>
          </div>
        )}

        <Button
          onClick={handleExport}
          disabled={!selectedFormat || !data || exporting}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          {exporting ? 'Exporting...' : 'Export Data'}
        </Button>
      </CardContent>
    </Card>
  );
};

// Export helper functions (mock implementations)
async function exportAsGeoJSON(data: any): Promise<Blob> {
  const geoJson = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  return new Blob([geoJson], { type: 'application/geo+json' });
}

async function exportAsShapefile(data: any): Promise<Blob> {
  // Mock shapefile export - in real implementation, use a library like shapefile-js
  const mockShpContent = new ArrayBuffer(1024);
  return new Blob([mockShpContent], { type: 'application/zip' });
}

async function exportAsKML(data: any): Promise<Blob> {
  // Mock KML export
  const kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Exported Data</name>
    <description>Exported from Harita Hive</description>
  </Document>
</kml>`;
  return new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
}

async function exportAsGeoTIFF(data: any): Promise<Blob> {
  // Mock GeoTIFF export - return the original blob if it's already a raster
  if (data instanceof Blob) {
    return data;
  }
  return new Blob([new ArrayBuffer(1024)], { type: 'image/tiff' });
}

async function exportAsPNG(data: any): Promise<Blob> {
  // Mock PNG export - create a simple canvas
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 800, 600);
    ctx.fillStyle = '#333';
    ctx.font = '20px Arial';
    ctx.fillText('Exported from Harita Hive', 50, 50);
  }
  
  return new Promise(resolve => {
    canvas.toBlob((blob) => {
      resolve(blob || new Blob());
    }, 'image/png');
  });
}

async function exportAsPDF(data: any, metadata: any): Promise<Blob> {
  // Mock PDF export - in real implementation, use a library like jsPDF
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
>>
endobj

xref
0 4
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000120 00000 n 
trailer
<<
/Size 4
/Root 1 0 R
>>
startxref
200
%%EOF`;
  
  return new Blob([pdfContent], { type: 'application/pdf' });
}

async function exportAsGeoPackage(data: any): Promise<Blob> {
  // Mock GeoPackage export
  const mockGpkgContent = new ArrayBuffer(2048);
  return new Blob([mockGpkgContent], { type: 'application/geopackage+sqlite3' });
}

export default ExportTools;