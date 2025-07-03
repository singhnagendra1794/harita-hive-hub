
import Layout from "../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import SpatialAnalysisTools from "../components/geoai/SpatialAnalysisTools";
import RasterAnalysisTools from "../components/geoai/RasterAnalysisTools";
import DataUploadPanel from "../components/geoai/DataUploadPanel";
import GeoAIMap from "../components/geoai/GeoAIMap";
import ResultsPanel from "../components/geoai/ResultsPanel";
import { Satellite, Calculator, Brain, Upload } from "lucide-react";

export interface GeoData {
  id: string;
  name: string;
  type: 'vector' | 'raster' | 'satellite';
  format: string;
  url: string;
  properties?: any;
  visible: boolean;
}

export interface AnalysisResult {
  id: string;
  tool: string;
  input: string;
  parameters: any;
  output: GeoData;
  timestamp: Date;
  status: 'processing' | 'completed' | 'error';
}

const GeoAILab = () => {
  const [uploadedData, setUploadedData] = useState<GeoData[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [selectedData, setSelectedData] = useState<GeoData | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]);
  const [mapZoom, setMapZoom] = useState(10);

  const handleDataUpload = (data: GeoData) => {
    setUploadedData([...uploadedData, data]);
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResults([...analysisResults, result]);
    setUploadedData([...uploadedData, result.output]);
  };

  const handleDataSelect = (data: GeoData) => {
    setSelectedData(data);
  };

  const visibleData = [...uploadedData, ...analysisResults.map(r => r.output)].filter(d => d.visible);

  return (
    <Layout>
      <div className="relative h-screen bg-background">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Brain className="h-8 w-8 text-primary" />
                  GeoAI Lab
                </h1>
                <p className="text-lg text-muted-foreground">
                  Advanced Spatial Analysis & Satellite Image Processing
                </p>
              </div>
              <div className="flex gap-2">
                <Card className="px-3 py-1">
                  <span className="text-sm font-medium">{uploadedData.length} Datasets</span>
                </Card>
                <Card className="px-3 py-1">
                  <span className="text-sm font-medium">{analysisResults.length} Results</span>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="pt-24 h-full flex">
          {/* Left Sidebar - Tools & Upload */}
          <div className="w-80 h-full overflow-y-auto border-r bg-background">
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-4 m-2">
                <TabsTrigger value="upload" className="text-xs">
                  <Upload className="h-3 w-3 mr-1" />
                  Data
                </TabsTrigger>
                <TabsTrigger value="spatial" className="text-xs">
                  <Calculator className="h-3 w-3 mr-1" />
                  Spatial
                </TabsTrigger>
                <TabsTrigger value="raster" className="text-xs">
                  <Satellite className="h-3 w-3 mr-1" />
                  Raster
                </TabsTrigger>
                <TabsTrigger value="ai" className="text-xs">
                  <Brain className="h-3 w-3 mr-1" />
                  AI
                </TabsTrigger>
              </TabsList>

              <div className="p-2">
                <TabsContent value="upload" className="mt-0">
                  <DataUploadPanel 
                    onDataUpload={handleDataUpload}
                    uploadedData={uploadedData}
                    onDataSelect={handleDataSelect}
                  />
                </TabsContent>

                <TabsContent value="spatial" className="mt-0">
                  <SpatialAnalysisTools
                    availableData={uploadedData}
                    selectedData={selectedData}
                    onAnalysisComplete={handleAnalysisComplete}
                  />
                </TabsContent>

                <TabsContent value="raster" className="mt-0">
                  <RasterAnalysisTools
                    availableData={uploadedData.filter(d => d.type === 'raster' || d.type === 'satellite')}
                    selectedData={selectedData}
                    onAnalysisComplete={handleAnalysisComplete}
                  />
                </TabsContent>

                <TabsContent value="ai" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">AI-Powered Analysis</CardTitle>
                      <CardDescription className="text-xs">
                        Coming soon: Machine learning and AI-driven spatial analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Advanced ML features in development
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Center - Map View */}
          <div className="flex-1 relative">
            <GeoAIMap
              data={visibleData}
              center={mapCenter}
              zoom={mapZoom}
              onCenterChange={setMapCenter}
              onZoomChange={setMapZoom}
              selectedData={selectedData}
            />
          </div>

          {/* Right Sidebar - Results & Analysis */}
          <div className="w-80 h-full overflow-y-auto border-l bg-background">
            <ResultsPanel
              results={analysisResults}
              uploadedData={uploadedData}
              onDataToggle={(id) => {
                setUploadedData(uploadedData.map(d => 
                  d.id === id ? { ...d, visible: !d.visible } : d
                ));
              }}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GeoAILab;
