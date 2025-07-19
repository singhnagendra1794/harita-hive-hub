import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
  Upload, 
  Brain, 
  Eye, 
  Download,
  CheckCircle,
  ArrowRight,
  FileUp,
  Cpu,
  Monitor,
  Save
} from "lucide-react";

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  status: 'pending' | 'active' | 'completed' | 'disabled';
}

interface WorkflowWizardProps {
  currentStep: number;
  uploadedData: any[];
  selectedModel: string;
  analysisResults: any[];
  onStepChange: (step: number) => void;
  onStepComplete: (step: number) => void;
}

const WorkflowWizard = ({ 
  currentStep, 
  uploadedData, 
  selectedModel, 
  analysisResults,
  onStepChange,
  onStepComplete
}: WorkflowWizardProps) => {
  
  const steps: WorkflowStep[] = [
    {
      id: "upload",
      title: "Upload Data",
      description: "Upload your geospatial datasets",
      icon: Upload,
      status: uploadedData.length > 0 ? 'completed' : currentStep === 0 ? 'active' : 'pending'
    },
    {
      id: "select",
      title: "Select AI Task",
      description: "Choose AI model and configure parameters",
      icon: Brain,
      status: selectedModel ? 'completed' : currentStep === 1 ? 'active' : uploadedData.length > 0 ? 'pending' : 'disabled'
    },
    {
      id: "preview",
      title: "Preview & Run",
      description: "Review settings and execute analysis",
      icon: Eye,
      status: analysisResults.length > 0 ? 'completed' : currentStep === 2 ? 'active' : selectedModel ? 'pending' : 'disabled'
    },
    {
      id: "export",
      title: "Export Results",
      description: "Download and share your results",
      icon: Download,
      status: currentStep === 3 ? 'active' : analysisResults.length > 0 ? 'pending' : 'disabled'
    }
  ];

  const getStepProgress = () => {
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    return (completedSteps / steps.length) * 100;
  };

  const handleStepClick = (stepIndex: number) => {
    const step = steps[stepIndex];
    if (step.status !== 'disabled') {
      onStepChange(stepIndex);
    }
  };

  const getStepIcon = (step: WorkflowStep, index: number) => {
    if (step.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <step.icon className={cn(
      "h-5 w-5",
      step.status === 'active' ? "text-primary" : "text-muted-foreground"
    )} />;
  };

  const getQuickActions = () => {
    switch (currentStep) {
      case 0:
        return [
          { label: "Upload Shapefile", icon: FileUp, action: () => onStepComplete(0) },
          { label: "Upload Satellite Image", icon: FileUp, action: () => onStepComplete(0) },
        ];
      case 1:
        return [
          { label: "Land Cover Classification", icon: Cpu, action: () => onStepComplete(1) },
          { label: "Object Detection", icon: Monitor, action: () => onStepComplete(1) },
        ];
      case 2:
        return [
          { label: "Run Analysis", icon: Brain, action: () => onStepComplete(2) },
        ];
      case 3:
        return [
          { label: "Export GeoTIFF", icon: Save, action: () => onStepComplete(3) },
          { label: "Save to Studio", icon: Save, action: () => onStepComplete(3) },
        ];
      default:
        return [];
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <ArrowRight className="h-4 w-4" />
          Workflow Guide
        </CardTitle>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span>Overall Progress</span>
            <span>{Math.round(getStepProgress())}%</span>
          </div>
          <Progress value={getStepProgress()} className="w-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Step Navigation */}
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                step.status === 'active' && "bg-primary/10 border border-primary/20",
                step.status === 'completed' && "bg-green-50 border border-green-200",
                step.status === 'pending' && "bg-muted/50 hover:bg-muted",
                step.status === 'disabled' && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => handleStepClick(index)}
            >
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full",
                step.status === 'active' && "bg-primary text-primary-foreground",
                step.status === 'completed' && "bg-green-500 text-white",
                step.status === 'pending' && "bg-muted-foreground/20",
                step.status === 'disabled' && "bg-muted-foreground/10"
              )}>
                {getStepIcon(step, index)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">{step.title}</h4>
                  <Badge 
                    variant={step.status === 'completed' ? 'default' : 'secondary'} 
                    className="text-xs"
                  >
                    {step.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
              
              {index < steps.length - 1 && step.status === 'completed' && (
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
          <div className="space-y-2">
            {getQuickActions().map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={action.action}
              >
                <action.icon className="h-4 w-4 mr-2" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Current Step Info */}
        <div className="bg-muted/50 rounded-lg p-3">
          <h4 className="text-sm font-medium mb-1">Current Step</h4>
          <p className="text-xs text-muted-foreground">
            {steps[currentStep]?.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowWizard;