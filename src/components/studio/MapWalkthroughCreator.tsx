import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MapPin, 
  Play, 
  Pause, 
  Square, 
  Mic, 
  MicOff, 
  Navigation,
  Camera,
  Settings,
  Upload,
  Download,
  Plus,
  Trash2,
  Eye
} from 'lucide-react';

interface MapWalkthroughCreatorProps {
  onComplete: () => void;
}

interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  coordinates: [number, number];
  zoom: number;
  duration: number;
  voiceoverText: string;
}

export const MapWalkthroughCreator: React.FC<MapWalkthroughCreatorProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [walkthroughData, setWalkthroughData] = useState({
    title: '',
    description: '',
    category: 'educational',
    tags: ''
  });

  const [steps, setSteps] = useState<WalkthroughStep[]>([
    {
      id: '1',
      title: 'Introduction',
      description: 'Welcome to the walkthrough',
      coordinates: [0, 0],
      zoom: 2,
      duration: 10,
      voiceoverText: 'Welcome to this interactive map walkthrough...'
    }
  ]);

  const [currentStep, setCurrentStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedMapStyle, setSelectedMapStyle] = useState('satellite');

  const mapStyles = [
    { id: 'satellite', name: 'Satellite', description: 'High-resolution satellite imagery' },
    { id: 'terrain', name: 'Terrain', description: 'Topographic with elevation' },
    { id: 'streets', name: 'Streets', description: 'Detailed street map' },
    { id: 'hybrid', name: 'Hybrid', description: 'Satellite with labels' }
  ];

  const addStep = () => {
    const newStep: WalkthroughStep = {
      id: (steps.length + 1).toString(),
      title: `Step ${steps.length + 1}`,
      description: '',
      coordinates: [0, 0],
      zoom: 5,
      duration: 15,
      voiceoverText: ''
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (stepId: string) => {
    if (steps.length <= 1) {
      toast({
        title: "Cannot Remove",
        description: "A walkthrough must have at least one step.",
        variant: "destructive"
      });
      return;
    }
    setSteps(steps.filter(step => step.id !== stepId));
  };

  const updateStep = (stepId: string, updates: Partial<WalkthroughStep>) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const startRecording = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create walkthroughs.",
        variant: "destructive"
      });
      return;
    }

    setIsRecording(true);
    toast({
      title: "Recording Started",
      description: "Navigate through your map and record your voiceover.",
    });
  };

  const stopRecording = () => {
    setIsRecording(false);
    toast({
      title: "Recording Stopped",
      description: "Your walkthrough has been captured successfully.",
    });
  };

  const playPreview = () => {
    setIsPlaying(true);
    toast({
      title: "Playing Preview",
      description: "Previewing your map walkthrough...",
    });

    // Simulate playback
    setTimeout(() => {
      setIsPlaying(false);
    }, 3000);
  };

  const exportWalkthrough = () => {
    toast({
      title: "Exporting Walkthrough",
      description: "Your interactive map walkthrough is being generated...",
    });

    // Simulate export process
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Your walkthrough is ready for download and sharing!",
      });
    }, 2000);
  };

  const publishToStudio = () => {
    if (!walkthroughData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please provide a title for your walkthrough.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Publishing to Studio",
      description: "Your map walkthrough is being added to your studio...",
    });

    // Simulate publish process
    setTimeout(() => {
      toast({
        title: "Published Successfully",
        description: "Your walkthrough is now available in your studio!",
      });
      onComplete();
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Interactive Map Walkthrough Creator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="walkthrough-title">Walkthrough Title</Label>
              <Input
                id="walkthrough-title"
                value={walkthroughData.title}
                onChange={(e) => setWalkthroughData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="My Interactive Map Story"
              />
            </div>
            <div>
              <Label htmlFor="walkthrough-category">Category</Label>
              <Select value={walkthroughData.category} onValueChange={(value) => setWalkthroughData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="tourism">Tourism</SelectItem>
                  <SelectItem value="analysis">Analysis</SelectItem>
                  <SelectItem value="presentation">Presentation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="walkthrough-description">Description</Label>
            <Textarea
              id="walkthrough-description"
              value={walkthroughData.description}
              onChange={(e) => setWalkthroughData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what your walkthrough covers..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Canvas */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Map Canvas
                </CardTitle>
                <div className="flex gap-2">
                  <Select value={selectedMapStyle} onValueChange={setSelectedMapStyle}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mapStyles.map(style => (
                        <SelectItem key={style.id} value={style.id}>
                          {style.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Map Preview Area */}
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/25">
                <div className="text-center space-y-4">
                  <div className="text-4xl">🗺️</div>
                  <div>
                    <h3 className="font-semibold text-lg">Interactive Map Canvas</h3>
                    <p className="text-muted-foreground">
                      Your map will be embedded here from /map-playground or /webgis-builder
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Badge variant="outline">{selectedMapStyle}</Badge>
                    <Badge variant="outline">Step {currentStep + 1}/{steps.length}</Badge>
                  </div>
                </div>
              </div>

              {/* Recording Controls */}
              <div className="flex items-center justify-center gap-4 mt-4">
                {!isRecording ? (
                  <Button onClick={startRecording} size="lg">
                    <Mic className="h-5 w-5 mr-2" />
                    Start Walkthrough Recording
                  </Button>
                ) : (
                  <Button onClick={stopRecording} size="lg" variant="destructive">
                    <Square className="h-5 w-5 mr-2" />
                    Stop Recording
                  </Button>
                )}

                <Button onClick={playPreview} variant="outline" disabled={isRecording}>
                  {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  Preview
                </Button>
              </div>

              {isRecording && (
                <div className="text-center mt-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-red-600 font-medium">Recording Walkthrough</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Steps Panel */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Walkthrough Steps
                </CardTitle>
                <Button onClick={addStep} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {steps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    currentStep === index ? 'border-primary bg-primary/5' : 'border-muted'
                  }`}
                  onClick={() => setCurrentStep(index)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{step.title}</h4>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentStep(index);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeStep(step.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {step.description || 'No description'}
                  </p>
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>{step.duration}s</span>
                    <span>Zoom: {step.zoom}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Step Details */}
      {steps[currentStep] && (
        <Card>
          <CardHeader>
            <CardTitle>Step {currentStep + 1} Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Step Title</Label>
                <Input
                  value={steps[currentStep].title}
                  onChange={(e) => updateStep(steps[currentStep].id, { title: e.target.value })}
                  placeholder="Step title..."
                />
              </div>
              <div>
                <Label>Duration (seconds)</Label>
                <Input
                  type="number"
                  value={steps[currentStep].duration}
                  onChange={(e) => updateStep(steps[currentStep].id, { duration: parseInt(e.target.value) || 15 })}
                  min="5"
                  max="60"
                />
              </div>
            </div>

            <div>
              <Label>Step Description</Label>
              <Textarea
                value={steps[currentStep].description}
                onChange={(e) => updateStep(steps[currentStep].id, { description: e.target.value })}
                placeholder="Describe what happens in this step..."
                rows={2}
              />
            </div>

            <div>
              <Label>Voiceover Script</Label>
              <Textarea
                value={steps[currentStep].voiceoverText}
                onChange={(e) => updateStep(steps[currentStep].id, { voiceoverText: e.target.value })}
                placeholder="What will you say during this step?"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Latitude</Label>
                <Input
                  type="number"
                  value={steps[currentStep].coordinates[0]}
                  onChange={(e) => updateStep(steps[currentStep].id, { 
                    coordinates: [parseFloat(e.target.value) || 0, steps[currentStep].coordinates[1]]
                  })}
                  placeholder="0.0"
                  step="0.000001"
                />
              </div>
              <div>
                <Label>Longitude</Label>
                <Input
                  type="number"
                  value={steps[currentStep].coordinates[1]}
                  onChange={(e) => updateStep(steps[currentStep].id, { 
                    coordinates: [steps[currentStep].coordinates[0], parseFloat(e.target.value) || 0]
                  })}
                  placeholder="0.0"
                  step="0.000001"
                />
              </div>
              <div>
                <Label>Zoom Level</Label>
                <Input
                  type="number"
                  value={steps[currentStep].zoom}
                  onChange={(e) => updateStep(steps[currentStep].id, { zoom: parseInt(e.target.value) || 5 })}
                  min="1"
                  max="20"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export & Publishing Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={exportWalkthrough} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Export as HTML
            </Button>
            <Button onClick={exportWalkthrough} variant="outline" className="flex-1">
              <Camera className="h-4 w-4 mr-2" />
              Export as Video
            </Button>
            <Button onClick={publishToStudio} className="flex-1">
              <Upload className="h-4 w-4 mr-2" />
              Publish to Studio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};