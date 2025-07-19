import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Download, FileText, Image, Database, Globe, Presentation, Archive, Clock } from 'lucide-react';

interface ExportManagerProps {
  projectId: string;
}

const ExportManager: React.FC<ExportManagerProps> = ({ projectId }) => {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [exportSettings, setExportSettings] = useState({
    includeData: true,
    includeLegend: true,
    includeAttribution: true,
    includeAnalytics: false,
    resolution: 'high',
    paperSize: 'a4',
    orientation: 'landscape'
  });
  const [isExporting, setIsExporting] = useState(false);

  const exportFormats = [
    {
      id: 'pdf',
      name: 'PDF Report',
      description: 'Comprehensive PDF with maps, data, and analysis',
      icon: FileText,
      features: ['High-quality maps', 'Data tables', 'Charts & graphs', 'Executive summary']
    },
    {
      id: 'image',
      name: 'High-Res Images',
      description: 'PNG/JPEG images for presentations',
      icon: Image,
      features: ['Vector quality', 'Multiple resolutions', 'Transparent backgrounds', 'Batch export']
    },
    {
      id: 'data',
      name: 'Data Package',
      description: 'Raw data in various formats',
      icon: Database,
      features: ['GeoJSON', 'Shapefile', 'CSV', 'KML/KMZ']
    },
    {
      id: 'web',
      name: 'Web Export',
      description: 'Standalone HTML application',
      icon: Globe,
      features: ['Interactive map', 'Responsive design', 'Offline capable', 'Custom branding']
    },
    {
      id: 'presentation',
      name: 'Presentation',
      description: 'PowerPoint/Google Slides ready',
      icon: Presentation,
      features: ['Slide templates', 'Animation support', 'Speaker notes', 'Branded layouts']
    }
  ];

  const recentExports = [
    {
      id: '1',
      name: 'Environmental Impact Report',
      format: 'PDF',
      size: '15.2 MB',
      created: '2 hours ago',
      status: 'completed'
    },
    {
      id: '2',
      name: 'Site Analysis Dashboard',
      format: 'Web',
      size: '8.7 MB',
      created: '1 day ago',
      status: 'completed'
    },
    {
      id: '3',
      name: 'Land Use Presentation',
      format: 'PowerPoint',
      size: '23.4 MB',
      created: '3 days ago',
      status: 'completed'
    }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsExporting(false);
  };

  const selectedFormatData = exportFormats.find(f => f.id === selectedFormat);

  return (
    <div className="space-y-6">
      {/* Export Format Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exportFormats.map((format) => {
              const IconComponent = format.icon;
              return (
                <Card 
                  key={format.id}
                  className={`cursor-pointer transition-all ${
                    selectedFormat === format.id 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedFormat(format.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <IconComponent className="h-8 w-8 text-primary mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{format.name}</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {format.description}
                        </p>
                        <div className="space-y-1">
                          {format.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                              <span className="text-xs text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Export Settings */}
      {selectedFormatData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <selectedFormatData.icon className="h-5 w-5" />
              {selectedFormatData.name} Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* General Settings */}
            <div className="space-y-4">
              <h4 className="font-semibold">General Settings</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="filename">File Name</Label>
                  <Input id="filename" placeholder="WebGIS_Export_2024" />
                </div>
                
                {selectedFormat === 'image' && (
                  <div className="space-y-2">
                    <Label htmlFor="resolution">Resolution</Label>
                    <Select value={exportSettings.resolution} onValueChange={(value) => 
                      setExportSettings(prev => ({ ...prev, resolution: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (72 DPI)</SelectItem>
                        <SelectItem value="medium">Medium (150 DPI)</SelectItem>
                        <SelectItem value="high">High (300 DPI)</SelectItem>
                        <SelectItem value="ultra">Ultra (600 DPI)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {selectedFormat === 'pdf' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="paperSize">Paper Size</Label>
                      <Select value={exportSettings.paperSize} onValueChange={(value) => 
                        setExportSettings(prev => ({ ...prev, paperSize: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="a3">A3</SelectItem>
                          <SelectItem value="a4">A4</SelectItem>
                          <SelectItem value="letter">Letter</SelectItem>
                          <SelectItem value="legal">Legal</SelectItem>
                          <SelectItem value="tabloid">Tabloid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="orientation">Orientation</Label>
                      <Select value={exportSettings.orientation} onValueChange={(value) => 
                        setExportSettings(prev => ({ ...prev, orientation: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="portrait">Portrait</SelectItem>
                          <SelectItem value="landscape">Landscape</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            </div>

            <Separator />

            {/* Content Settings */}
            <div className="space-y-4">
              <h4 className="font-semibold">Content Options</h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="includeData">Include Data Tables</Label>
                    <p className="text-sm text-muted-foreground">Add data tables and statistics</p>
                  </div>
                  <Switch
                    id="includeData"
                    checked={exportSettings.includeData}
                    onCheckedChange={(checked) => 
                      setExportSettings(prev => ({ ...prev, includeData: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="includeLegend">Include Legend</Label>
                    <p className="text-sm text-muted-foreground">Add map legend and symbology</p>
                  </div>
                  <Switch
                    id="includeLegend"
                    checked={exportSettings.includeLegend}
                    onCheckedChange={(checked) => 
                      setExportSettings(prev => ({ ...prev, includeLegend: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="includeAttribution">Include Attribution</Label>
                    <p className="text-sm text-muted-foreground">Add data source credits</p>
                  </div>
                  <Switch
                    id="includeAttribution"
                    checked={exportSettings.includeAttribution}
                    onCheckedChange={(checked) => 
                      setExportSettings(prev => ({ ...prev, includeAttribution: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="includeAnalytics">Include Analytics</Label>
                    <p className="text-sm text-muted-foreground">Add usage statistics and insights</p>
                  </div>
                  <Switch
                    id="includeAnalytics"
                    checked={exportSettings.includeAnalytics}
                    onCheckedChange={(checked) => 
                      setExportSettings(prev => ({ ...prev, includeAnalytics: checked }))
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Export Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleExport}
                disabled={isExporting}
                size="lg"
                className="gap-2"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export {selectedFormatData.name}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Exports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Recent Exports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentExports.map((exportItem) => (
              <div key={exportItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h4 className="font-semibold">{exportItem.name}</h4>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{exportItem.format}</span>
                      <span>•</span>
                      <span>{exportItem.size}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {exportItem.created}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{exportItem.status}</Badge>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
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

export default ExportManager;