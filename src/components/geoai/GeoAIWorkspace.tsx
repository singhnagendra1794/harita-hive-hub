import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import PremiumContentGate from "@/components/premium/PremiumContentGate";
import DataUploadPanel from "./DataUploadPanel";
import VectorAnalysisTools from "./VectorAnalysisTools";
import RasterAnalysisTools from "./RasterAnalysisTools";
import GeoAIMap from "./GeoAIMap";
import { 
  Upload, 
  Database, 
  Brain, 
  Download, 
  History,
  Play,
  FileText,
  Map,
  BarChart3
} from "lucide-react";

const GeoAIWorkspace = () => {
  const { hasAccess } = usePremiumAccess();
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-95.7129, 37.0902]);
  const [mapZoom, setMapZoom] = useState(4);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  // Check if user has access to premium GeoAI features
  if (!hasAccess('premium')) {
    return (
      <div className="container py-8">
        <PremiumContentGate 
          contentType="feature"
          contentId="geoai-lab"
          title="GeoAI Laboratory"
          description="Access cutting-edge AI-powered geospatial analysis tools including object detection, change detection, and automated feature extraction from satellite imagery."
        >
          <div />
        </PremiumContentGate>
      </div>
    );
  }

  const handleDataUpload = (data: any) => {
    setUploadedData(prev => [...prev, data]);
    if (!selectedData) {
      setSelectedData(data);
    }
  };

  const handleDataSelect = (data: any) => {
    setSelectedData(data);
  };

  const handleAnalysisComplete = (result: any) => {
    setAnalysisResults(prev => [...prev, result]);
    // Add result as a new data layer if it has spatial output
    if (result.output) {
      setUploadedData(prev => [...prev, result.output]);
    }
  };

  const runBatchAnalysis = async () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    
    // Simulate batch AI processing
    for (let i = 0; i <= 100; i += 5) {
      setProcessingProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsProcessing(false);
    setProcessingProgress(0);
  };

  const exportResults = () => {
    const exportData = {
      data: uploadedData,
      results: analysisResults,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `geoai-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b p-4 bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              GeoAI Laboratory
            </h1>
            <p className="text-muted-foreground">AI-powered geospatial analysis and processing</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              {uploadedData.length} datasets
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              {analysisResults.length} analyses
            </Badge>
            <Button variant="outline" onClick={exportResults} disabled={analysisResults.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </Button>
          </div>
        </div>

        {/* Processing Progress */}
        {isProcessing && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Processing AI analysis...</span>
              <span>{processingProgress}%</span>
            </div>
            <Progress value={processingProgress} className="w-full" />
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Tools */}
        <div className="w-80 border-r bg-background overflow-y-auto">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-4 m-4">
              <TabsTrigger value="upload" className="text-xs">
                <Upload className="h-3 w-3" />
              </TabsTrigger>
              <TabsTrigger value="vector" className="text-xs">
                <Map className="h-3 w-3" />
              </TabsTrigger>
              <TabsTrigger value="raster" className="text-xs">
                <BarChart3 className="h-3 w-3" />
              </TabsTrigger>
              <TabsTrigger value="results" className="text-xs">
                <History className="h-3 w-3" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="p-4">
              <DataUploadPanel
                onDataUpload={handleDataUpload}
                uploadedData={uploadedData}
                onDataSelect={handleDataSelect}
              />
            </TabsContent>

            <TabsContent value="vector" className="p-4">
              <VectorAnalysisTools
                availableData={uploadedData.filter(d => d.type === 'vector')}
                selectedData={selectedData?.type === 'vector' ? selectedData : null}
                onAnalysisComplete={handleAnalysisComplete}
              />
            </TabsContent>

            <TabsContent value="raster" className="p-4">
              <RasterAnalysisTools
                availableData={uploadedData.filter(d => d.type === 'raster' || d.type === 'satellite')}
                selectedData={selectedData?.type === 'raster' || selectedData?.type === 'satellite' ? selectedData : null}
                onAnalysisComplete={handleAnalysisComplete}
              />
            </TabsContent>

            <TabsContent value="results" className="p-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Analysis History
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysisResults.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No AI analysis results yet
                    </p>
                  ) : (
                    analysisResults.map((result, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium capitalize">
                            {result.tool.replace('_', ' ')}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {result.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Input: {result.input}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(result.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                  
                  {uploadedData.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={runBatchAnalysis}
                      disabled={isProcessing}
                    >
                      <Play className="h-3 w-3 mr-2" />
                      {isProcessing ? 'Processing...' : 'Run Batch AI Analysis'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Content - Map */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4">
            <GeoAIMap
              data={uploadedData}
              center={mapCenter}
              zoom={mapZoom}
              onCenterChange={setMapCenter}
              onZoomChange={setMapZoom}
              selectedData={selectedData}
            />
          </div>
        </div>

        {/* Right Sidebar - Data Info */}
        <div className="w-64 border-l bg-background p-4 overflow-y-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Data Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedData ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Name</label>
                    <p className="text-sm">{selectedData.name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Type</label>
                    <Badge variant="outline" className="text-xs">
                      {selectedData.type}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Format</label>
                    <p className="text-sm">{selectedData.format}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Size</label>
                    <p className="text-sm">{(selectedData.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Uploaded</label>
                    <p className="text-sm">{new Date(selectedData.uploadedAt).toLocaleString()}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Select a dataset to view details
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GeoAIWorkspace;