import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart3,
  Calendar,
  MapPin,
  Satellite,
  Download,
  Upload,
  Play,
  Settings,
  Layers,
  Maximize,
  RotateCcw,
  Zap,
  Eye
} from 'lucide-react';

interface BeforeAfterAnalyzerProps {
  onComplete: () => void;
}

interface AnalysisData {
  title: string;
  description: string;
  category: string;
  tags: string;
  beforeDate: string;
  afterDate: string;
  coordinates: {
    lat: number;
    lng: number;
    zoom: number;
  };
  analysisType: string;
}

export const BeforeAfterAnalyzer: React.FC<BeforeAfterAnalyzerProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [analysisData, setAnalysisData] = useState<AnalysisData>({
    title: '',
    description: '',
    category: 'environmental',
    tags: '',
    beforeDate: '2020-01-01',
    afterDate: '2024-01-01',
    coordinates: {
      lat: 0,
      lng: 0,
      zoom: 10
    },
    analysisType: 'ndvi'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [hasResults, setHasResults] = useState(false);
  const [selectedSatellite, setSelectedSatellite] = useState('sentinel-2');

  const satelliteOptions = [
    { id: 'sentinel-2', name: 'Sentinel-2', description: 'High resolution (10m), 5-day revisit' },
    { id: 'landsat-8', name: 'Landsat 8', description: 'Medium resolution (30m), 16-day revisit' },
    { id: 'modis', name: 'MODIS', description: 'Low resolution (250m), daily revisit' },
    { id: 'planet', name: 'Planet Labs', description: 'Very high resolution (3m), daily revisit' }
  ];

  const analysisTypes = [
    { id: 'ndvi', name: 'NDVI Analysis', description: 'Vegetation health and changes' },
    { id: 'land-cover', name: 'Land Cover Change', description: 'Urban expansion, deforestation' },
    { id: 'water-bodies', name: 'Water Body Changes', description: 'Lake levels, river courses' },
    { id: 'urban-growth', name: 'Urban Growth', description: 'City expansion and development' },
    { id: 'forest-loss', name: 'Forest Loss', description: 'Deforestation and degradation' },
    { id: 'agriculture', name: 'Agricultural Changes', description: 'Crop patterns and yields' }
  ];

  const categories = [
    { id: 'environmental', name: 'Environmental' },
    { id: 'urban-planning', name: 'Urban Planning' },
    { id: 'disaster', name: 'Disaster Assessment' },
    { id: 'agriculture', name: 'Agriculture' },
    { id: 'climate', name: 'Climate Change' },
    { id: 'research', name: 'Research' }
  ];

  const generateAnalysis = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create analyses.",
        variant: "destructive"
      });
      return;
    }

    if (!analysisData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please provide a title for your analysis.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    toast({
      title: "Generating Analysis",
      description: "Fetching satellite imagery and processing changes...",
    });

    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    // Simulate completion
    setTimeout(() => {
      clearInterval(progressInterval);
      setGenerationProgress(100);
      setIsGenerating(false);
      setHasResults(true);
      
      toast({
        title: "Analysis Complete",
        description: "Your before/after analysis has been generated successfully!",
      });
    }, 8000);
  };

  const publishToStudio = () => {
    toast({
      title: "Publishing to Studio",
      description: "Your before/after analysis is being added to your studio...",
    });

    setTimeout(() => {
      toast({
        title: "Published Successfully",
        description: "Your analysis is now available in your studio!",
      });
      onComplete();
    }, 1500);
  };

  const exportAnalysis = (format: string) => {
    toast({
      title: `Exporting as ${format.toUpperCase()}`,
      description: "Your analysis is being prepared for download...",
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Analysis Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Before/After Satellite Analysis Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="analysis-title">Analysis Title</Label>
              <Input
                id="analysis-title"
                value={analysisData.title}
                onChange={(e) => setAnalysisData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Amazon Deforestation 2020-2024"
              />
            </div>
            <div>
              <Label htmlFor="analysis-category">Category</Label>
              <Select value={analysisData.category} onValueChange={(value) => setAnalysisData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="analysis-description">Description</Label>
            <Textarea
              id="analysis-description"
              value={analysisData.description}
              onChange={(e) => setAnalysisData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the purpose and expected outcomes of this analysis..."
              rows={3}
            />
          </div>

          {/* Temporal Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="before-date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Before Date
              </Label>
              <Input
                id="before-date"
                type="date"
                value={analysisData.beforeDate}
                onChange={(e) => setAnalysisData(prev => ({ ...prev, beforeDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="after-date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                After Date
              </Label>
              <Input
                id="after-date"
                type="date"
                value={analysisData.afterDate}
                onChange={(e) => setAnalysisData(prev => ({ ...prev, afterDate: e.target.value }))}
              />
            </div>
          </div>

          {/* Analysis Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Satellite Data Source</Label>
              <Select value={selectedSatellite} onValueChange={setSelectedSatellite}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {satelliteOptions.map(satellite => (
                    <SelectItem key={satellite.id} value={satellite.id}>
                      <div>
                        <div className="font-medium">{satellite.name}</div>
                        <div className="text-xs text-muted-foreground">{satellite.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Analysis Type</Label>
              <Select value={analysisData.analysisType} onValueChange={(value) => setAnalysisData(prev => ({ ...prev, analysisType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {analysisTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      <div>
                        <div className="font-medium">{type.name}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Latitude</Label>
              <Input
                type="number"
                value={analysisData.coordinates.lat}
                onChange={(e) => setAnalysisData(prev => ({ 
                  ...prev, 
                  coordinates: { ...prev.coordinates, lat: parseFloat(e.target.value) || 0 }
                }))}
                placeholder="0.0"
                step="0.000001"
              />
            </div>
            <div>
              <Label>Longitude</Label>
              <Input
                type="number"
                value={analysisData.coordinates.lng}
                onChange={(e) => setAnalysisData(prev => ({ 
                  ...prev, 
                  coordinates: { ...prev.coordinates, lng: parseFloat(e.target.value) || 0 }
                }))}
                placeholder="0.0"
                step="0.000001"
              />
            </div>
            <div>
              <Label>Zoom Level</Label>
              <Input
                type="number"
                value={analysisData.coordinates.zoom}
                onChange={(e) => setAnalysisData(prev => ({ 
                  ...prev, 
                  coordinates: { ...prev.coordinates, zoom: parseInt(e.target.value) || 10 }
                }))}
                min="1"
                max="20"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Area of Interest
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-square bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/25">
              <div className="text-center space-y-4">
                <Satellite className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="font-semibold">Interactive Map</h3>
                  <p className="text-sm text-muted-foreground">Click to select analysis area</p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Badge variant="outline">Lat: {analysisData.coordinates.lat}</Badge>
                  <Badge variant="outline">Lng: {analysisData.coordinates.lng}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Analysis Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Satellite Source:</span>
                <Badge>{satelliteOptions.find(s => s.id === selectedSatellite)?.name}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Analysis Type:</span>
                <Badge>{analysisTypes.find(t => t.id === analysisData.analysisType)?.name}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Time Range:</span>
                <Badge variant="outline">{analysisData.beforeDate} to {analysisData.afterDate}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Duration:</span>
                <Badge variant="outline">
                  {Math.ceil((new Date(analysisData.afterDate).getTime() - new Date(analysisData.beforeDate).getTime()) / (1000 * 60 * 60 * 24 * 365))} years
                </Badge>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={generateAnalysis} 
                className="w-full" 
                size="lg"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RotateCcw className="h-5 w-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    Generate Analysis
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generation Progress */}
      {isGenerating && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Generating before/after comparison...</span>
                <span>{Math.round(generationProgress)}%</span>
              </div>
              <Progress value={generationProgress} />
            </div>
            <div className="text-sm text-muted-foreground">
              {generationProgress < 25 && "Fetching satellite imagery..."}
              {generationProgress >= 25 && generationProgress < 50 && "Processing image data..."}
              {generationProgress >= 50 && generationProgress < 75 && "Performing change detection..."}
              {generationProgress >= 75 && generationProgress < 95 && "Generating comparison interface..."}
              {generationProgress >= 95 && "Finalizing analysis..."}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {hasResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Before/After Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Before ({analysisData.beforeDate})</Label>
                <div className="aspect-video bg-green-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Layers className="h-8 w-8 mx-auto text-green-600 mb-2" />
                    <p className="text-sm text-green-700">Satellite Image</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">After ({analysisData.afterDate})</Label>
                <div className="aspect-video bg-red-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Layers className="h-8 w-8 mx-auto text-red-600 mb-2" />
                    <p className="text-sm text-red-700">Satellite Image</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Slider Preview */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Interactive Comparison</Label>
              <div className="aspect-video bg-gradient-to-r from-green-100 to-red-100 rounded-lg flex items-center justify-center border">
                <div className="text-center space-y-2">
                  <div className="text-2xl">🔄</div>
                  <h3 className="font-semibold">Interactive Slider Interface</h3>
                  <p className="text-sm text-muted-foreground">Drag to compare before and after</p>
                  <Badge variant="outline">Change Detection: 23% Modified</Badge>
                </div>
              </div>
            </div>

            {/* Export and Publish Options */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button onClick={() => exportAnalysis('html')} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                HTML
              </Button>
              <Button onClick={() => exportAnalysis('mp4')} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                MP4
              </Button>
              <Button onClick={() => exportAnalysis('images')} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Images
              </Button>
              <Button onClick={publishToStudio}>
                <Upload className="h-4 w-4 mr-2" />
                Publish
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};