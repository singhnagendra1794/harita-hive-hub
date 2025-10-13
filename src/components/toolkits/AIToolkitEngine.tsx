import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Sparkles, 
  Globe, 
  Database, 
  Code, 
  Download,
  ExternalLink,
  Layers,
  TrendingUp,
  CheckCircle2,
  Loader2
} from "lucide-react";

interface ToolkitRecommendation {
  requirement_summary: string;
  recommended_tools: Array<{
    tool_name: string;
    description: string;
    sector: string;
    difficulty: string;
    type: string;
    link: string;
    guide_link?: string;
  }>;
  recommended_datasets: Array<{
    dataset_name: string;
    type: string;
    source: string;
    coverage: string;
    download_link: string;
    format: string;
    resolution?: string;
    temporal_range?: string;
  }>;
  recommended_workflow: string[];
  example_output: string;
  code_snippet?: string;
  starter_project_available: boolean;
}

const dataTypeOptions = [
  { id: 'raster', label: 'Raster (Satellite/Aerial)' },
  { id: 'vector', label: 'Vector (Boundaries/Features)' },
  { id: 'satellite', label: 'Satellite Imagery' },
  { id: 'drone', label: 'Drone/UAV Data' },
  { id: 'lidar', label: 'LiDAR/Point Cloud' },
  { id: 'dem', label: 'Elevation/DEM' }
];

const toolOptions = [
  'QGIS', 'ArcGIS', 'Python', 'R', 'Google Earth Engine',
  'SNAP', 'ENVI', 'PostGIS', 'Mapbox', 'Leaflet'
];

export default function AIToolkitEngine() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [recommendation, setRecommendation] = useState<ToolkitRecommendation | null>(null);

  // Form state
  const [requirement, setRequirement] = useState('');
  const [region, setRegion] = useState('');
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState('intermediate');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [includeSamples, setIncludeSamples] = useState(true);

  const handleDataTypeToggle = (typeId: string) => {
    setSelectedDataTypes(prev =>
      prev.includes(typeId) ? prev.filter(t => t !== typeId) : [...prev, typeId]
    );
  };

  const handleToolToggle = (tool: string) => {
    setSelectedTools(prev =>
      prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]
    );
  };

  const handleGenerateToolkit = async () => {
    if (!requirement.trim()) {
      toast({
        title: "Requirement needed",
        description: "Please describe what you want to achieve",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('toolkit-ai-engine', {
        body: {
          requirement,
          region,
          dataTypes: selectedDataTypes,
          skillLevel,
          preferredTools: selectedTools,
          includeSamples
        }
      });

      if (error) throw error;

      setRecommendation(data);
      setShowForm(false);

      toast({
        title: "✨ Toolkit Generated!",
        description: "Your personalized geospatial toolkit is ready",
      });

    } catch (error) {
      console.error('Error generating toolkit:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setShowForm(true);
    setRecommendation(null);
    setRequirement('');
    setRegion('');
    setSelectedDataTypes([]);
    setSelectedTools([]);
  };

  if (!showForm && recommendation) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-500" />
              Your Personalized Toolkit
            </h3>
            <p className="text-muted-foreground">{recommendation.requirement_summary}</p>
          </div>
          <Button variant="outline" onClick={handleReset}>
            Create New Toolkit
          </Button>
        </div>

        {/* Recommended Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recommended Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {recommendation.recommended_tools.map((tool, idx) => (
                <Card key={idx} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{tool.tool_name}</CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary">{tool.type}</Badge>
                          <Badge className={
                            tool.difficulty === 'beginner' ? 'bg-green-500' :
                            tool.difficulty === 'intermediate' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }>{tool.difficulty}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{tool.description}</p>
                    <div className="flex gap-2">
                      <Button size="sm" asChild>
                        <a href={tool.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open Tool
                        </a>
                      </Button>
                      {tool.guide_link && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={tool.guide_link} target="_blank" rel="noopener noreferrer">
                            Guide
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommended Datasets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Recommended Datasets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendation.recommended_datasets.map((dataset, idx) => (
                <Card key={idx} className="border">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{dataset.dataset_name}</h4>
                        <div className="flex gap-2 mt-2 mb-3">
                          <Badge variant="outline">{dataset.type}</Badge>
                          <Badge variant="outline">{dataset.source}</Badge>
                          <Badge variant="outline">{dataset.format}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p><strong>Coverage:</strong> {dataset.coverage}</p>
                          {dataset.resolution && <p><strong>Resolution:</strong> {dataset.resolution}</p>}
                          {dataset.temporal_range && <p><strong>Temporal Range:</strong> {dataset.temporal_range}</p>}
                        </div>
                      </div>
                      <Button size="sm" asChild>
                        <a href={dataset.download_link} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Workflow */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Recommended Workflow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {recommendation.recommended_workflow.map((step, idx) => (
                <li key={idx} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    {idx + 1}
                  </div>
                  <p className="text-sm pt-0.5">{step}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Code Snippet */}
        {recommendation.code_snippet && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Example Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{recommendation.code_snippet}</code>
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Expected Output */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Expected Output
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{recommendation.example_output}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="border-2 border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-yellow-500" />
          AI-Powered Toolkit Generator
        </CardTitle>
        <CardDescription>
          Tell us what you want to achieve, and we'll recommend the perfect tools and datasets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Requirement */}
        <div className="space-y-2">
          <Label htmlFor="requirement">What do you want to analyze or build? *</Label>
          <Textarea
            id="requirement"
            placeholder="E.g., I want to assess flood risk in Kerala using satellite data"
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
            rows={3}
          />
        </div>

        {/* Region */}
        <div className="space-y-2">
          <Label htmlFor="region">
            <Globe className="h-4 w-4 inline mr-1" />
            Which region are you focusing on?
          </Label>
          <Input
            id="region"
            placeholder="E.g., Kerala, India or Global"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />
        </div>

        {/* Data Types */}
        <div className="space-y-3">
          <Label>What kind of data do you need?</Label>
          <div className="grid grid-cols-2 gap-3">
            {dataTypeOptions.map(option => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={selectedDataTypes.includes(option.id)}
                  onCheckedChange={() => handleDataTypeToggle(option.id)}
                />
                <label htmlFor={option.id} className="text-sm cursor-pointer">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Level */}
        <div className="space-y-2">
          <Label htmlFor="skill-level">Your skill level</Label>
          <Select value={skillLevel} onValueChange={setSkillLevel}>
            <SelectTrigger id="skill-level">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Preferred Tools */}
        <div className="space-y-3">
          <Label>Preferred tools/platforms (optional)</Label>
          <div className="flex flex-wrap gap-2">
            {toolOptions.map(tool => (
              <Badge
                key={tool}
                variant={selectedTools.includes(tool) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleToolToggle(tool)}
              >
                {tool}
              </Badge>
            ))}
          </div>
        </div>

        {/* Include Samples */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="samples"
            checked={includeSamples}
            onCheckedChange={(checked) => setIncludeSamples(checked as boolean)}
          />
          <label htmlFor="samples" className="text-sm cursor-pointer">
            Include real data samples and download links
          </label>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateToolkit}
          disabled={isLoading}
          size="lg"
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Generating Your Toolkit...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Generate Personalized Toolkit
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
