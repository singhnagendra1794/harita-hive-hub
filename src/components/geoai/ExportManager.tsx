import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { 
  Download, 
  FileImage, 
  FileText, 
  Database, 
  Cloud, 
  FolderOpen,
  Share2,
  Save,
  CheckCircle,
  Crown
} from "lucide-react";

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  icon: any;
  extension: string;
  supportedTypes: string[];
  requiresPremium: boolean;
}

interface ExportDestination {
  id: string;
  name: string;
  description: string;
  icon: any;
  requiresPremium: boolean;
}

interface ExportManagerProps {
  analysisResults: any[];
  selectedLayers: string[];
  subscription: any;
  onExportComplete: (exportInfo: any) => void;
}

const ExportManager = ({
  analysisResults,
  selectedLayers,
  subscription,
  onExportComplete
}: ExportManagerProps) => {
  const [selectedFormat, setSelectedFormat] = useState<string>("");
  const [selectedDestination, setSelectedDestination] = useState<string>("");
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const [exportName, setExportName] = useState("");
  const [exportDescription, setExportDescription] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const exportFormats: ExportFormat[] = [
    {
      id: "geotiff",
      name: "GeoTIFF",
      description: "Georeferenced raster format",
      icon: FileImage,
      extension: ".tiff",
      supportedTypes: ["raster", "classification"],
      requiresPremium: false
    },
    {
      id: "shapefile",
      name: "Shapefile",
      description: "ESRI vector format",
      icon: Database,
      extension: ".zip",
      supportedTypes: ["vector", "polygons"],
      requiresPremium: false
    },
    {
      id: "geojson",
      name: "GeoJSON",
      description: "Web-friendly vector format",
      icon: FileText,
      extension: ".geojson",
      supportedTypes: ["vector", "points", "polygons"],
      requiresPremium: false
    },
    {
      id: "csv",
      name: "CSV with coordinates",
      description: "Tabular data with spatial coordinates",
      icon: FileText,
      extension: ".csv",
      supportedTypes: ["points", "statistics"],
      requiresPremium: false
    },
    {
      id: "pdf_report",
      name: "PDF Report",
      description: "Analysis report with maps and statistics",
      icon: FileText,
      extension: ".pdf",
      supportedTypes: ["all"],
      requiresPremium: true
    },
    {
      id: "cog",
      name: "Cloud Optimized GeoTIFF",
      description: "Web-optimized raster format",
      icon: Cloud,
      extension: ".tiff",
      supportedTypes: ["raster"],
      requiresPremium: true
    }
  ];

  const exportDestinations: ExportDestination[] = [
    {
      id: "download",
      name: "Direct Download",
      description: "Download files to your computer",
      icon: Download,
      requiresPremium: false
    },
    {
      id: "project_studio",
      name: "Project Studio",
      description: "Save to your project workspace",
      icon: FolderOpen,
      requiresPremium: false
    },
    {
      id: "portfolio",
      name: "Portfolio",
      description: "Add to your public portfolio",
      icon: Share2,
      requiresPremium: false
    },
    {
      id: "google_drive",
      name: "Google Drive",
      description: "Save directly to Google Drive",
      icon: Cloud,
      requiresPremium: true
    },
    {
      id: "supabase_storage",
      name: "Cloud Storage",
      description: "Save to secure cloud storage",
      icon: Database,
      requiresPremium: true
    }
  ];

  const handleResultToggle = (resultId: string) => {
    setSelectedResults(prev => 
      prev.includes(resultId) 
        ? prev.filter(id => id !== resultId)
        : [...prev, resultId]
    );
  };

  const handleSelectAll = () => {
    if (selectedResults.length === analysisResults.length) {
      setSelectedResults([]);
    } else {
      setSelectedResults(analysisResults.map(r => r.id));
    }
  };

  const validateExport = () => {
    if (!selectedFormat) {
      toast({
        title: "No Format Selected",
        description: "Please select an export format.",
        variant: "destructive",
      });
      return false;
    }

    if (!selectedDestination) {
      toast({
        title: "No Destination Selected",
        description: "Please select an export destination.",
        variant: "destructive",
      });
      return false;
    }

    if (selectedResults.length === 0) {
      toast({
        title: "No Results Selected",
        description: "Please select at least one analysis result to export.",
        variant: "destructive",
      });
      return false;
    }

    const format = exportFormats.find(f => f.id === selectedFormat);
    const destination = exportDestinations.find(d => d.id === selectedDestination);

    if ((format?.requiresPremium || destination?.requiresPremium) && subscription?.subscription_tier === 'free') {
      toast({
        title: "Premium Feature",
        description: "This export option requires a Pro or Enterprise subscription.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const startExport = async () => {
    if (!validateExport()) return;

    setIsExporting(true);
    setExportProgress(0);

    const format = exportFormats.find(f => f.id === selectedFormat);
    const destination = exportDestinations.find(d => d.id === selectedDestination);

    // Simulate export process
    const steps = [
      "Preparing data...",
      "Processing results...",
      "Generating export...",
      "Uploading to destination...",
      "Finalizing..."
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      setExportProgress(((i + 1) / steps.length) * 100);
    }

    // Generate mock export info
    const exportInfo = {
      id: `export_${Date.now()}`,
      name: exportName || `AI_Analysis_Export_${Date.now()}`,
      description: exportDescription,
      format: format?.name,
      destination: destination?.name,
      resultCount: selectedResults.length,
      fileSize: `${(Math.random() * 50 + 10).toFixed(1)} MB`,
      exportedAt: new Date().toISOString(),
      downloadUrl: destination?.id === 'download' ? `/exports/download_${Date.now()}.${format?.extension}` : null
    };

    onExportComplete(exportInfo);
    setIsExporting(false);
    setExportProgress(0);

    toast({
      title: "Export Complete",
      description: `Successfully exported ${selectedResults.length} results as ${format?.name}`,
    });

    // Reset form
    setSelectedResults([]);
    setExportName("");
    setExportDescription("");
  };

  const filteredFormats = exportFormats.filter(format => {
    if (analysisResults.length === 0) return true;
    
    // Check if format supports the selected results
    const selectedResultsData = analysisResults.filter(r => selectedResults.includes(r.id));
    return selectedResultsData.some(result => 
      format.supportedTypes.includes('all') || 
      format.supportedTypes.includes(result.type) ||
      format.supportedTypes.some(type => result.modelId?.includes(type))
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {analysisResults.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Download className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Run AI analysis first to export results</p>
          </div>
        ) : (
          <>
            {/* Select Results */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Select Results to Export</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs"
                >
                  {selectedResults.length === analysisResults.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
              
              <div className="space-y-2">
                {analysisResults.map((result) => (
                  <div key={result.id} className="flex items-center space-x-2 p-2 border rounded">
                    <Checkbox
                      id={result.id}
                      checked={selectedResults.includes(result.id)}
                      onCheckedChange={() => handleResultToggle(result.id)}
                    />
                    <div className="flex-1">
                      <label htmlFor={result.id} className="text-sm font-medium cursor-pointer">
                        {result.modelName}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {result.inputData} • {new Date(result.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {result.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Format */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Export Format</Label>
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose export format..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredFormats.map((format) => (
                    <SelectItem key={format.id} value={format.id}>
                      <div className="flex items-center gap-2">
                        <format.icon className="h-4 w-4" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span>{format.name}</span>
                            {format.requiresPremium && (
                              <Crown className="h-3 w-3 text-amber-500" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{format.description}</p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Export Destination */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Export Destination</Label>
              <Select value={selectedDestination} onValueChange={setSelectedDestination}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose destination..." />
                </SelectTrigger>
                <SelectContent>
                  {exportDestinations.map((dest) => (
                    <SelectItem key={dest.id} value={dest.id}>
                      <div className="flex items-center gap-2">
                        <dest.icon className="h-4 w-4" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span>{dest.name}</span>
                            {dest.requiresPremium && (
                              <Crown className="h-3 w-3 text-amber-500" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{dest.description}</p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Export Metadata */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="export-name" className="text-sm font-medium">Export Name</Label>
                <Input
                  id="export-name"
                  value={exportName}
                  onChange={(e) => setExportName(e.target.value)}
                  placeholder="My_GeoAI_Analysis"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="export-description" className="text-sm font-medium">Description (Optional)</Label>
                <Textarea
                  id="export-description"
                  value={exportDescription}
                  onChange={(e) => setExportDescription(e.target.value)}
                  placeholder="Analysis description..."
                  className="mt-1 h-16"
                />
              </div>
            </div>

            {/* Export Button */}
            <Button
              onClick={startExport}
              disabled={isExporting || selectedResults.length === 0}
              className="w-full"
            >
              {isExporting ? (
                <>
                  <Download className="h-4 w-4 mr-2 animate-spin" />
                  Exporting... {Math.round(exportProgress)}%
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Export {selectedResults.length} Result{selectedResults.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>

            {/* Export Progress */}
            {isExporting && (
              <div className="space-y-2">
                <Progress value={exportProgress} className="w-full" />
                <p className="text-xs text-center text-muted-foreground">
                  Processing export...
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ExportManager;