import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, FileText, Image, Map, Database, 
  Share, Link, Code, Printer 
} from 'lucide-react';

interface MapLayer {
  id: string;
  name: string;
  type: 'vector' | 'raster' | 'basemap';
  visible: boolean;
}

interface ExportToolsProps {
  layers: MapLayer[];
  onExport: (format: string) => void;
}

const ExportTools: React.FC<ExportToolsProps> = ({ layers, onExport }) => {
  const [selectedFormat, setSelectedFormat] = useState('png');
  const [selectedLayer, setSelectedLayer] = useState<string>('all');

  const exportFormats = [
    {
      id: 'png',
      name: 'PNG Image',
      description: 'High-quality raster image',
      icon: Image,
      category: 'Image'
    },
    {
      id: 'pdf',
      name: 'PDF Document',
      description: 'Print-ready vector format',
      icon: FileText,
      category: 'Document'
    },
    {
      id: 'geojson',
      name: 'GeoJSON',
      description: 'Geographic data format',
      icon: Database,
      category: 'Data'
    },
    {
      id: 'shapefile',
      name: 'Shapefile',
      description: 'ESRI vector format',
      icon: Map,
      category: 'Data'
    },
    {
      id: 'kml',
      name: 'KML',
      description: 'Google Earth format',
      icon: Map,
      category: 'Data'
    },
    {
      id: 'csv',
      name: 'CSV',
      description: 'Tabular data with coordinates',
      icon: Database,
      category: 'Data'
    }
  ];

  const exportLayers = [
    { id: 'all', name: 'All Visible Layers' },
    { id: 'map', name: 'Map View Only' },
    ...layers.filter(l => l.type !== 'basemap').map(layer => ({
      id: layer.id,
      name: layer.name
    }))
  ];

  const groupedFormats = exportFormats.reduce((acc, format) => {
    if (!acc[format.category]) {
      acc[format.category] = [];
    }
    acc[format.category].push(format);
    return acc;
  }, {} as Record<string, typeof exportFormats>);

  const handleExport = () => {
    onExport(selectedFormat);
  };

  const handleShareLink = () => {
    const shareUrl = `${window.location.origin}/map-playground?share=${crypto.randomUUID()}`;
    navigator.clipboard.writeText(shareUrl);
    // Toast notification would go here
  };

  const handleEmbedCode = () => {
    const embedCode = `<iframe src="${window.location.origin}/map-playground?embed=true" width="100%" height="400"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    // Toast notification would go here
  };

  return (
    <div className="space-y-6">
      {/* Export Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Format Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Export Format</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(groupedFormats).map(([category, formats]) => (
              <div key={category}>
                <h4 className="font-medium text-sm mb-2">{category}</h4>
                <div className="space-y-2">
                  {formats.map((format) => {
                    const Icon = format.icon;
                    const isSelected = selectedFormat === format.id;
                    
                    return (
                      <div
                        key={format.id}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedFormat(format.id)}
                      >
                        <Icon className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{format.name}</p>
                          <p className="text-xs text-muted-foreground">{format.description}</p>
                        </div>
                        {isSelected && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Layer Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Export Layers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Include Layers</label>
              <Select value={selectedLayer} onValueChange={setSelectedLayer}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {exportLayers.map((layer) => (
                    <SelectItem key={layer.id} value={layer.id}>
                      {layer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-muted/30 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Layer Summary</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Visible Layers:</span>
                  <span>{layers.filter(l => l.visible).length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Vector Layers:</span>
                  <span>{layers.filter(l => l.type === 'vector' && l.visible).length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Raster Layers:</span>
                  <span>{layers.filter(l => l.type === 'raster' && l.visible).length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Export Actions */}
      <div className="space-y-4">
        <h3 className="font-medium">Export & Share Options</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export {selectedFormat.toUpperCase()}
          </Button>
          
          <Button variant="outline" onClick={handleShareLink} className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            Share Link
          </Button>
          
          <Button variant="outline" onClick={handleEmbedCode} className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Embed Code
          </Button>
          
          <Button variant="outline" onClick={() => window.print()} className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print Map
          </Button>
        </div>
      </div>

      {/* Export Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Export Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Image className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Export preview will appear here</p>
              <p className="text-xs">Format: {exportFormats.find(f => f.id === selectedFormat)?.name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Exports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { name: 'Urban Analysis Map', format: 'PDF', date: '2 hours ago' },
              { name: 'City Boundaries', format: 'Shapefile', date: 'Yesterday' },
              { name: 'Elevation Data', format: 'GeoTIFF', date: '3 days ago' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.format}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportTools;