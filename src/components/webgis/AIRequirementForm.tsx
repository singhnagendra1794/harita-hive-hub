import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Brain, Sparkles, Globe, Database, MapPin, Target, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AIRequirementFormProps {
  onRequirementSubmit: (data: any) => void;
  onSkip: () => void;
}

export const AIRequirementForm: React.FC<AIRequirementFormProps> = ({
  onRequirementSubmit,
  onSkip
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    goal: '',
    region: '',
    dataTypes: [] as string[],
    skillLevel: '',
    preferredTools: [] as string[],
    includeRealData: true,
    analysisType: ''
  });

  const handleDataTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      dataTypes: prev.dataTypes.includes(type)
        ? prev.dataTypes.filter(t => t !== type)
        : [...prev.dataTypes, type]
    }));
  };

  const handleToolToggle = (tool: string) => {
    setFormData(prev => ({
      ...prev,
      preferredTools: prev.preferredTools.includes(tool)
        ? prev.preferredTools.filter(t => t !== tool)
        : [...prev.preferredTools, tool]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.goal || !formData.region) {
      toast({
        title: "Required fields missing",
        description: "Please provide your analysis goal and region",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('webgis-ai-analysis', {
        body: {
          action: 'generate_toolkit',
          requirement: formData
        }
      });

      if (error) throw error;

      // Create toolkit session record
      const sessionId = crypto.randomUUID();

      onRequirementSubmit({
        ...data,
        sessionId,
        formData
      });

      toast({
        title: "Toolkit Generated!",
        description: "Your personalized geospatial toolkit is ready",
      });
    } catch (error: any) {
      console.error('Toolkit generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Could not generate toolkit",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const dataTypeOptions = [
    { value: 'raster', label: 'Raster (Satellite Imagery)', icon: Globe },
    { value: 'vector', label: 'Vector (Points, Lines, Polygons)', icon: MapPin },
    { value: 'dem', label: 'DEM (Elevation Data)', icon: Target },
    { value: 'climate', label: 'Climate Data', icon: Database }
  ];

  const toolOptions = ['QGIS', 'Google Earth Engine', 'ArcGIS', 'Python', 'R', 'PostGIS'];

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader className="text-center border-b">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="h-8 w-8 text-primary" />
            <Sparkles className="h-5 w-5 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl">AI-Powered Toolkit Generator</CardTitle>
          <CardDescription>
            Tell us what you want to achieve, and we'll build your perfect geospatial workspace
          </CardDescription>
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant={step >= 1 ? "default" : "outline"}>1. Goal</Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant={step >= 2 ? "default" : "outline"}>2. Data</Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant={step >= 3 ? "default" : "outline"}>3. Tools</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">What do you want to analyze or build?</Label>
                <Textarea
                  placeholder="Example: I want to assess flood risk in Kerala, India using satellite data"
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="mt-2 min-h-24"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">Which country or region?</Label>
                <Input
                  placeholder="Example: Kerala, India or Global"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">What type of analysis?</Label>
                <Select value={formData.analysisType} onValueChange={(value) => setFormData({ ...formData, analysisType: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select analysis type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visualization">Visualization & Mapping</SelectItem>
                    <SelectItem value="spatial_analysis">Spatial Analysis</SelectItem>
                    <SelectItem value="change_detection">Change Detection</SelectItem>
                    <SelectItem value="modeling">Predictive Modeling</SelectItem>
                    <SelectItem value="monitoring">Environmental Monitoring</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={() => setStep(2)} className="w-full" size="lg">
                Next: Select Data Types
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold mb-3 block">What kind of data do you need?</Label>
                <div className="grid grid-cols-2 gap-3">
                  {dataTypeOptions.map(({ value, label, icon: Icon }) => (
                    <Card
                      key={value}
                      className={`cursor-pointer transition-all ${
                        formData.dataTypes.includes(value)
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => handleDataTypeToggle(value)}
                    >
                      <CardContent className="p-4 flex items-start gap-3">
                        <Checkbox
                          checked={formData.dataTypes.includes(value)}
                          onCheckedChange={() => handleDataTypeToggle(value)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="h-4 w-4" />
                            <span className="font-medium text-sm">{label}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold">Your skill level?</Label>
                <Select value={formData.skillLevel} onValueChange={(value) => setFormData({ ...formData, skillLevel: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner - New to GIS</SelectItem>
                    <SelectItem value="intermediate">Intermediate - Some GIS experience</SelectItem>
                    <SelectItem value="advanced">Advanced - Professional GIS user</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  Next: Tools & Settings
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold mb-3 block">Preferred software/platforms (optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {toolOptions.map((tool) => (
                    <Badge
                      key={tool}
                      variant={formData.preferredTools.includes(tool) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleToolToggle(tool)}
                    >
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                <Checkbox
                  id="includeRealData"
                  checked={formData.includeRealData}
                  onCheckedChange={(checked) => setFormData({ ...formData, includeRealData: !!checked })}
                />
                <label htmlFor="includeRealData" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Include real data samples from global open datasets
                </label>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">What happens next?</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>✓ AI analyzes your requirements</li>
                  <li>✓ Recommends relevant open datasets</li>
                  <li>✓ Suggests analysis tools and workflows</li>
                  <li>✓ Auto-loads data into your workspace</li>
                  <li>✓ GEOVA guides you through the process</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="flex-1"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                      Generating Toolkit...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate My Toolkit
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              onClick={onSkip}
              className="w-full text-muted-foreground"
              disabled={loading}
            >
              Skip for now and explore manually
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};