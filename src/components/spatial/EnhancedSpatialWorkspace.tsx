import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, Layers, Download, Brain, Zap, Clock } from 'lucide-react';

import WorkflowWizard from './WorkflowWizard';
import SpatialToolLibrary from './SpatialToolLibrary';
import MapViewer from './MapViewer';
import ExportManager from './ExportManager';
import AIAssistant from './AIAssistant';
import JobQueue from './JobQueue';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import PremiumAccessGate from '../premium/PremiumAccessGate';

interface UploadedFile {
  id: string;
  name: string;
  type: 'vector' | 'raster';
  size: number;
  format: string;
  crs?: string;
  bounds?: [number, number, number, number];
}

interface AnalysisJob {
  id: string;
  toolName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  inputFiles: string[];
  outputFiles: string[];
  parameters: Record<string, any>;
  createdAt: Date;
  completedAt?: Date;
  errorMessage?: string;
}

const EnhancedSpatialWorkspace = () => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'tool' | 'preview' | 'export'>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [analysisJobs, setAnalysisJobs] = useState<AnalysisJob[]>([]);
  const [mapLayers, setMapLayers] = useState<any[]>([]);
  const { hasAccess, subscription } = usePremiumAccess();

  const dailyUsage = hasAccess() ? 0 : 2; // Track usage for free users
  const dailyLimit = hasAccess() ? -1 : 3; // Free users: 3 tools/day, Premium: unlimited

  const handleFileUpload = useCallback((files: File[]) => {
    const newFiles: UploadedFile[] = files.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      type: file.name.toLowerCase().includes('.tif') || file.name.toLowerCase().includes('.img') ? 'raster' : 'vector',
      size: file.size,
      format: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
      crs: 'EPSG:4326', // Default CRS
      bounds: [-180, -90, 180, 90] // Default bounds
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setCurrentStep('tool');
    
    // Auto-zoom map to uploaded data
    if (newFiles.length > 0) {
      setMapLayers(prev => [...prev, ...newFiles.map(f => ({
        id: f.id,
        name: f.name,
        type: f.type,
        visible: true,
        opacity: 0.8
      }))]);
    }
  }, []);

  const handleToolSelect = useCallback((toolId: string) => {
    setSelectedTool(toolId);
    setCurrentStep('preview');
  }, []);

  const handleJobCreation = useCallback((job: Omit<AnalysisJob, 'id' | 'createdAt'>) => {
    const newJob: AnalysisJob = {
      ...job,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };
    setAnalysisJobs(prev => [...prev, newJob]);
  }, []);

  const renderUsageStatus = () => {
    if (hasAccess()) return null;
    
    return (
      <Card className="mb-6 border-warning bg-warning/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Daily Usage (Free Plan)</span>
            <span className="text-sm text-muted-foreground">{dailyUsage}/{dailyLimit}</span>
          </div>
          <Progress value={(dailyUsage / dailyLimit) * 100} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Upgrade to Premium for unlimited access to all tools and batch processing
          </p>
        </CardContent>
      </Card>
    );
  };

  const workspaceContent = (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Spatial Analysis Lab</h1>
          <p className="text-muted-foreground">Professional no-code geospatial analysis toolkit</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={hasAccess() ? "default" : "secondary"}>
            {subscription?.subscription_tier || 'Free'} Plan
          </Badge>
          {analysisJobs.filter(j => j.status === 'processing').length > 0 && (
            <Badge variant="secondary" className="animate-pulse">
              <Clock className="h-3 w-3 mr-1" />
              Processing
            </Badge>
          )}
        </div>
      </div>

      {renderUsageStatus()}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Workflow Wizard Sidebar */}
        <div className="lg:col-span-1">
          <WorkflowWizard
            currentStep={currentStep}
            onStepChange={setCurrentStep}
            uploadedFiles={uploadedFiles}
            selectedTool={selectedTool}
            onFileUpload={handleFileUpload}
          />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="tools" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tools" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Tools
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Map
              </TabsTrigger>
              <TabsTrigger value="export" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </TabsTrigger>
              <TabsTrigger value="jobs" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Jobs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tools" className="mt-6">
              <SpatialToolLibrary
                uploadedFiles={uploadedFiles}
                onToolSelect={handleToolSelect}
                onJobCreate={handleJobCreation}
                hasAccess={hasAccess()}
                dailyUsage={dailyUsage}
                dailyLimit={dailyLimit}
              />
            </TabsContent>

            <TabsContent value="map" className="mt-6">
              <MapViewer
                layers={mapLayers}
                onLayerToggle={(layerId, visible) => {
                  setMapLayers(prev => prev.map(layer => 
                    layer.id === layerId ? { ...layer, visible } : layer
                  ));
                }}
                onLayerOpacityChange={(layerId, opacity) => {
                  setMapLayers(prev => prev.map(layer => 
                    layer.id === layerId ? { ...layer, opacity } : layer
                  ));
                }}
              />
            </TabsContent>

            <TabsContent value="export" className="mt-6">
              <ExportManager
                uploadedFiles={uploadedFiles}
                analysisResults={analysisJobs.filter(j => j.status === 'completed')}
                hasAccess={hasAccess()}
              />
            </TabsContent>

            <TabsContent value="jobs" className="mt-6">
              <JobQueue
                jobs={analysisJobs}
                onJobUpdate={(jobId, updates) => {
                  setAnalysisJobs(prev => prev.map(job => 
                    job.id === jobId ? { ...job, ...updates } : job
                  ));
                }}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* AI Assistant Sidebar */}
        <div className="lg:col-span-1">
          <AIAssistant
            uploadedFiles={uploadedFiles}
            onToolRecommendation={handleToolSelect}
            analysisJobs={analysisJobs}
          />
        </div>
      </div>
    </div>
  );

  return (
    <PremiumAccessGate
      requiredTier="free"
      featureName="Spatial Analysis Lab"
      featureDescription="Professional geospatial analysis tools with AI assistance and workflow automation."
    >
      {workspaceContent}
    </PremiumAccessGate>
  );
};

export default EnhancedSpatialWorkspace;