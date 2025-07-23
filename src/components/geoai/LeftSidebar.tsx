import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { 
  Upload, 
  Layers, 
  Settings, 
  FileImage, 
  Database, 
  Activity,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  X,
  Plus,
  Folder,
  File
} from 'lucide-react';

interface LeftSidebarProps {
  uploadedLayers: any[];
  currentWorkflow: any;
  onLayerUpload: (layer: any) => void;
  runningJobs: any[];
}

const LeftSidebar = ({ uploadedLayers, currentWorkflow, onLayerUpload, runningJobs }: LeftSidebarProps) => {
  const [activeTab, setActiveTab] = useState('layers');
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['uploaded', 'ai-outputs']);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    files.forEach(file => {
      const layer = {
        name: file.name,
        type: getFileType(file),
        size: file.size,
        uploadedAt: new Date().toISOString()
      };
      onLayerUpload(layer);
    });
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(event.dataTransfer.files);
    files.forEach(file => {
      const layer = {
        name: file.name,
        type: getFileType(file),
        size: file.size,
        uploadedAt: new Date().toISOString()
      };
      onLayerUpload(layer);
    });
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const getFileType = (file: File): 'vector' | 'raster' => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const rasterExtensions = ['tif', 'tiff', 'jpg', 'jpeg', 'png', 'img'];
    return rasterExtensions.includes(extension || '') ? 'raster' : 'vector';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const sampleDatasets = [
    { id: 'sentinel-2', name: 'Sentinel-2 Imagery', type: 'raster', category: 'Satellite' },
    { id: 'landsat-8', name: 'Landsat 8 Collection', type: 'raster', category: 'Satellite' },
    { id: 'osm-roads', name: 'OpenStreetMap Roads', type: 'vector', category: 'Infrastructure' },
    { id: 'dem-global', name: 'Global DEM (30m)', type: 'raster', category: 'Elevation' },
    { id: 'modis-ndvi', name: 'MODIS NDVI Time Series', type: 'raster', category: 'Vegetation' }
  ];

  return (
    <div className="w-80 bg-[#1B263B] border-r border-[#43AA8B]/20 flex flex-col text-[#F9F9F9]">
      {/* Header */}
      <div className="p-4 border-b border-[#43AA8B]/20">
        <h3 className="text-lg font-semibold text-white mb-1">Tools & Layers</h3>
        <p className="text-xs text-[#F9F9F9]/70">Manage data and workflow tools</p>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="bg-[#0D1B2A] border-b border-[#43AA8B]/20 rounded-none justify-start">
          <TabsTrigger value="layers" className="data-[state=active]:bg-[#F4D35E] data-[state=active]:text-[#0D1B2A]">
            <Layers className="h-4 w-4 mr-2" />
            Layers
          </TabsTrigger>
          <TabsTrigger value="tools" className="data-[state=active]:bg-[#F4D35E] data-[state=active]:text-[#0D1B2A]">
            <Settings className="h-4 w-4 mr-2" />
            Tools
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="layers" className="m-0 h-full">
            <div className="p-4 space-y-4">
              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragOver 
                    ? 'border-[#F4D35E] bg-[#F4D35E]/10' 
                    : 'border-[#43AA8B]/30 hover:border-[#43AA8B]/50'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Upload className="h-8 w-8 text-[#43AA8B] mx-auto mb-2" />
                <p className="text-sm text-[#F9F9F9]/70 mb-2">
                  Drag & drop files or
                </p>
                <label className="cursor-pointer">
                  <Button size="sm" className="bg-[#43AA8B] hover:bg-[#43AA8B]/90">
                    Browse Files
                  </Button>
                  <Input
                    type="file"
                    multiple
                    accept=".shp,.geojson,.kml,.csv,.tif,.tiff,.jpg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-[#F9F9F9]/50 mt-2">
                  Supported: SHP, GeoJSON, KML, CSV, TIFF, JPG, PNG
                </p>
              </div>

              {/* Layer Groups */}
              <div className="space-y-3">
                {/* Uploaded Layers */}
                <div>
                  <div 
                    className="flex items-center justify-between py-2 cursor-pointer hover:bg-[#0D1B2A]/50 rounded px-2"
                    onClick={() => toggleGroup('uploaded')}
                  >
                    <div className="flex items-center gap-2">
                      {expandedGroups.includes('uploaded') ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                      <Folder className="h-4 w-4 text-[#43AA8B]" />
                      <span className="text-sm font-medium">Uploaded Data</span>
                    </div>
                    <Badge variant="outline" className="border-[#43AA8B]/50 text-[#43AA8B] text-xs">
                      {uploadedLayers.length}
                    </Badge>
                  </div>
                  
                  {expandedGroups.includes('uploaded') && (
                    <div className="ml-6 space-y-2">
                      {uploadedLayers.length === 0 ? (
                        <p className="text-xs text-[#F9F9F9]/50 py-2">No layers uploaded</p>
                      ) : (
                        uploadedLayers.map((layer, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-[#0D1B2A] rounded-lg">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <FileImage className="h-4 w-4 text-[#F4D35E] flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-white truncate">{layer.name}</p>
                                <p className="text-xs text-[#F9F9F9]/50">
                                  {layer.type} • {formatFileSize(layer.size || 0)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button size="sm" variant="ghost" className="p-1 text-[#F9F9F9]/70">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="p-1 text-[#F9F9F9]/70">
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Sample Datasets */}
                <div>
                  <div 
                    className="flex items-center justify-between py-2 cursor-pointer hover:bg-[#0D1B2A]/50 rounded px-2"
                    onClick={() => toggleGroup('sample')}
                  >
                    <div className="flex items-center gap-2">
                      {expandedGroups.includes('sample') ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                      <Database className="h-4 w-4 text-[#F4D35E]" />
                      <span className="text-sm font-medium">Sample Datasets</span>
                    </div>
                    <Badge variant="outline" className="border-[#F4D35E]/50 text-[#F4D35E] text-xs">
                      {sampleDatasets.length}
                    </Badge>
                  </div>
                  
                  {expandedGroups.includes('sample') && (
                    <div className="ml-6 space-y-2">
                      {sampleDatasets.map((dataset) => (
                        <div key={dataset.id} className="flex items-center justify-between p-2 bg-[#0D1B2A] rounded-lg hover:bg-[#0D1B2A]/70 cursor-pointer">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <File className="h-4 w-4 text-[#43AA8B] flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-white truncate">{dataset.name}</p>
                              <p className="text-xs text-[#F9F9F9]/50">
                                {dataset.category} • {dataset.type}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" className="p-1 text-[#43AA8B]">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Outputs */}
                {runningJobs.length > 0 && (
                  <div>
                    <div 
                      className="flex items-center justify-between py-2 cursor-pointer hover:bg-[#0D1B2A]/50 rounded px-2"
                      onClick={() => toggleGroup('ai-outputs')}
                    >
                      <div className="flex items-center gap-2">
                        {expandedGroups.includes('ai-outputs') ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                        <Activity className="h-4 w-4 text-[#F4D35E]" />
                        <span className="text-sm font-medium">AI Outputs</span>
                      </div>
                      <Badge variant="outline" className="border-[#F4D35E]/50 text-[#F4D35E] text-xs">
                        {runningJobs.length}
                      </Badge>
                    </div>
                    
                    {expandedGroups.includes('ai-outputs') && (
                      <div className="ml-6 space-y-2">
                        {runningJobs.map((job) => (
                          <div key={job.id} className="p-2 bg-[#0D1B2A] rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-medium text-white truncate">{job.workflowName}</p>
                              <span className="text-xs text-[#F4D35E]">{job.progress}%</span>
                            </div>
                            <Progress value={job.progress} className="h-1" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tools" className="m-0 h-full">
            <div className="p-4 space-y-4">
              {/* Current Workflow */}
              {currentWorkflow && (
                <Card className="bg-[#0D1B2A] border-[#43AA8B]/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-white">Active Workflow</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-[#F4D35E]/10 rounded text-[#F4D35E]">
                        {currentWorkflow.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{currentWorkflow.title}</p>
                        <p className="text-xs text-[#F9F9F9]/50">Running...</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Workflow Manager */}
              <Card className="bg-[#0D1B2A] border-[#43AA8B]/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white">Workflow Manager</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button size="sm" variant="outline" className="w-full justify-start border-[#43AA8B]/50 text-[#43AA8B]">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Workflow
                  </Button>
                  <Button size="sm" variant="outline" className="w-full justify-start border-[#43AA8B]/50 text-[#43AA8B]">
                    <Folder className="h-4 w-4 mr-2" />
                    Load Workflow
                  </Button>
                  <Button size="sm" variant="outline" className="w-full justify-start border-[#43AA8B]/50 text-[#43AA8B]">
                    <Settings className="h-4 w-4 mr-2" />
                    Workflow Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-[#0D1B2A] border-[#43AA8B]/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button size="sm" variant="outline" className="w-full justify-start border-[#F4D35E]/50 text-[#F4D35E]">
                    Export Results
                  </Button>
                  <Button size="sm" variant="outline" className="w-full justify-start border-[#F4D35E]/50 text-[#F4D35E]">
                    Share Project
                  </Button>
                  <Button size="sm" variant="outline" className="w-full justify-start border-[#F4D35E]/50 text-[#F4D35E]">
                    Save to Portfolio
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default LeftSidebar;