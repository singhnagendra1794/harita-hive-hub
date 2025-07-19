import React, { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Upload, Settings, Eye, Download, Check, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadedFile {
  id: string;
  name: string;
  type: 'vector' | 'raster';
  size: number;
  format: string;
}

interface WorkflowWizardProps {
  currentStep: 'upload' | 'tool' | 'preview' | 'export';
  onStepChange: (step: 'upload' | 'tool' | 'preview' | 'export') => void;
  uploadedFiles: UploadedFile[];
  selectedTool: string | null;
  onFileUpload: (files: File[]) => void;
}

const WorkflowWizard: React.FC<WorkflowWizardProps> = ({
  currentStep,
  onStepChange,
  uploadedFiles,
  selectedTool,
  onFileUpload
}) => {
  const handleFileInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      onFileUpload(files);
    }
  }, [onFileUpload]);

  const steps = [
    {
      id: 'upload' as const,
      title: 'Upload Data',
      icon: Upload,
      description: 'Upload your geospatial files',
      completed: uploadedFiles.length > 0
    },
    {
      id: 'tool' as const,
      title: 'Select Tool',
      icon: Settings,
      description: 'Choose analysis method',
      completed: selectedTool !== null
    },
    {
      id: 'preview' as const,
      title: 'Preview',
      icon: Eye,
      description: 'Review results',
      completed: false
    },
    {
      id: 'export' as const,
      title: 'Export',
      icon: Download,
      description: 'Save your work',
      completed: false
    }
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg">Workflow Guide</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = step.completed;
            const isClickable = step.completed || (index === 0 || steps[index - 1].completed);
            
            return (
              <div key={step.id} className="space-y-2">
                <div
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                    isActive && "bg-primary/10 border border-primary/20",
                    !isActive && isCompleted && "bg-muted/50",
                    !isClickable && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => isClickable && onStepChange(step.id)}
                >
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2",
                    isCompleted && "bg-primary border-primary text-primary-foreground",
                    isActive && !isCompleted && "border-primary text-primary",
                    !isActive && !isCompleted && "border-muted-foreground text-muted-foreground"
                  )}>
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{step.title}</h4>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                  {isActive && (
                    <ArrowRight className="h-4 w-4 text-primary" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className="ml-4 w-px h-4 bg-border" />
                )}
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Current Step Actions */}
        {currentStep === 'upload' && (
          <div className="space-y-4">
            <h4 className="font-medium">Upload Your Data</h4>
            <div className="space-y-2">
              <input
                type="file"
                multiple
                accept=".shp,.geojson,.kml,.tif,.tiff,.csv,.gpx"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" className="w-full" asChild>
                  <span className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </span>
                </Button>
              </label>
              <p className="text-xs text-muted-foreground">
                Supported: SHP, GeoJSON, KML, TIFF, CSV, GPX
              </p>
            </div>
            
            {/* Try Example Data */}
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                Try Example Dataset
              </Button>
              <p className="text-xs text-muted-foreground">
                Load sample data to explore tools
              </p>
            </div>
          </div>
        )}

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Uploaded Files</h4>
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {file.format}
                      </Badge>
                      <Badge variant={file.type === 'vector' ? 'default' : 'outline'} className="text-xs">
                        {file.type}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">
                    {formatFileSize(file.size)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Tool Info */}
        {selectedTool && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Selected Tool</h4>
            <div className="p-2 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium capitalize">{selectedTool.replace('-', ' ')}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkflowWizard;