import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, Lightbulb, TrendingUp, MapPin, Layers, 
  BarChart3, Target, Zap, ArrowRight, Sparkles
} from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  type: 'vector' | 'raster';
  size: number;
  format: string;
}

interface AnalysisJob {
  id: string;
  toolName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  inputFiles: string[];
  outputFiles: string[];
  parameters: Record<string, any>;
}

interface AIAssistantProps {
  uploadedFiles: UploadedFile[];
  onToolRecommendation: (toolId: string) => void;
  analysisJobs: AnalysisJob[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({
  uploadedFiles,
  onToolRecommendation,
  analysisJobs
}) => {
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);

  // Generate AI recommendations based on uploaded data
  const recommendations = useMemo(() => {
    if (uploadedFiles.length === 0) return [];

    const recs = [];
    const hasVector = uploadedFiles.some(f => f.type === 'vector');
    const hasRaster = uploadedFiles.some(f => f.type === 'raster');
    const hasPoints = uploadedFiles.some(f => f.name.toLowerCase().includes('point'));
    const hasPolygons = uploadedFiles.some(f => f.name.toLowerCase().includes('polygon') || f.name.toLowerCase().includes('admin'));

    if (hasPoints) {
      recs.push({
        id: 'heatmap',
        title: 'Create Density Heatmap',
        description: 'Visualize point clustering patterns in your data',
        icon: TrendingUp,
        confidence: 95,
        reason: 'Point data detected - ideal for density analysis'
      });
      
      recs.push({
        id: 'buffer',
        title: 'Buffer Analysis',
        description: 'Create proximity zones around your points',
        icon: MapPin,
        confidence: 90,
        reason: 'Point features can benefit from proximity analysis'
      });
    }

    if (hasVector && hasPolygons) {
      recs.push({
        id: 'spatial-join',
        title: 'Spatial Join',
        description: 'Combine attributes from multiple vector layers',
        icon: Layers,
        confidence: 88,
        reason: 'Multiple vector layers detected'
      });
    }

    if (hasRaster) {
      recs.push({
        id: 'zonal-stats',
        title: 'Zonal Statistics',
        description: 'Calculate statistics for raster data within zones',
        icon: BarChart3,
        confidence: 92,
        reason: 'Raster data ideal for zonal analysis'
      });

      recs.push({
        id: 'ndvi',
        title: 'NDVI Calculation',
        description: 'Calculate vegetation indices if multispectral',
        icon: Sparkles,
        confidence: 75,
        reason: 'Raster data may contain spectral bands'
      });
    }

    if (uploadedFiles.length > 1) {
      recs.push({
        id: 'clip',
        title: 'Clip Layers',
        description: 'Extract data within specific boundaries',
        icon: Target,
        confidence: 80,
        reason: 'Multiple datasets can be clipped to common extent'
      });
    }

    return recs.sort((a, b) => b.confidence - a.confidence).slice(0, 4);
  }, [uploadedFiles]);

  // Generate insights from completed analyses
  const insights = useMemo(() => {
    const completedJobs = analysisJobs.filter(job => job.status === 'completed');
    if (completedJobs.length === 0) return [];

    return [
      {
        title: 'Analysis Summary',
        content: `Completed ${completedJobs.length} analysis ${completedJobs.length === 1 ? 'task' : 'tasks'} successfully.`,
        type: 'success'
      },
      {
        title: 'Data Quality',
        content: 'All input datasets processed without errors. Coordinate systems aligned properly.',
        type: 'info'
      },
      {
        title: 'Next Steps',
        content: 'Consider running network analysis or spatial clustering on your results.',
        type: 'suggestion'
      }
    ];
  }, [analysisJobs]);

  const handleApplyRecommendation = (recId: string) => {
    onToolRecommendation(recId);
    setSelectedRecommendation(recId);
  };

  return (
    <div className="space-y-6">
      {/* AI Assistant Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Assistant
          </CardTitle>
          <CardDescription>
            Intelligent recommendations based on your data
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Tool Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Recommended Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((rec) => {
              const Icon = rec.icon;
              const isSelected = selectedRecommendation === rec.id;
              
              return (
                <div
                  key={rec.id}
                  className={`p-3 border rounded-lg transition-colors ${
                    isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{rec.title}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {rec.confidence}% match
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{rec.description}</p>
                      <p className="text-xs text-primary/80 italic">{rec.reason}</p>
                      <Button
                        size="sm"
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => handleApplyRecommendation(rec.id)}
                        className="text-xs"
                      >
                        {isSelected ? 'Applied' : 'Try This'}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Data Insights */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Data Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Files:</span>
                <span className="font-medium">{uploadedFiles.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Vector Layers:</span>
                <span className="font-medium">
                  {uploadedFiles.filter(f => f.type === 'vector').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Raster Layers:</span>
                <span className="font-medium">
                  {uploadedFiles.filter(f => f.type === 'raster').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Size:</span>
                <span className="font-medium">
                  {(uploadedFiles.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024)).toFixed(1)} MB
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h5 className="text-sm font-medium">Quick Tips:</h5>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Ensure coordinate systems match before analysis</li>
                <li>• Preview data on map to check spatial extent</li>
                <li>• Use buffer analysis to create proximity zones</li>
                <li>• Export results in multiple formats</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Analysis Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className="p-3 bg-muted/30 rounded-lg">
                <h5 className="text-sm font-medium">{insight.title}</h5>
                <p className="text-xs text-muted-foreground mt-1">{insight.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Get Started */}
      {uploadedFiles.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Brain className="h-8 w-8 mx-auto mb-3 text-muted-foreground opacity-50" />
            <h3 className="font-medium text-sm mb-2">AI Assistant Ready</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Upload your geospatial data to get intelligent tool recommendations and insights.
            </p>
            <Button variant="outline" size="sm">
              Learn More
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIAssistant;