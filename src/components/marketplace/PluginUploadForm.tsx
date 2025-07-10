
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PluginUploadForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tech_stack: [] as string[],
    github_url: '',
    download_url: ''
  });
  const [newTech, setNewTech] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'QGIS Plugin',
    'Python Script',
    'JavaScript Widget',
    'ArcGIS Tool',
    'Web Component',
    'Data Processing',
    'Visualization',
    'Analysis Tool'
  ];

  const commonTechStack = [
    'Python', 'JavaScript', 'TypeScript', 'QGIS', 'ArcGIS', 
    'PostGIS', 'GDAL', 'React', 'Vue', 'Leaflet', 'OpenLayers'
  ];

  const addTechStack = (tech: string) => {
    if (tech && !formData.tech_stack.includes(tech)) {
      setFormData(prev => ({
        ...prev,
        tech_stack: [...prev.tech_stack, tech]
      }));
      setNewTech('');
    }
  };

  const removeTechStack = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.filter(t => t !== tech)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here you would submit to your backend
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      toast({
        title: "Plugin submitted successfully!",
        description: "Your plugin is now under review and will be published soon.",
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        tech_stack: [],
        github_url: '',
        download_url: ''
      });
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "There was an error submitting your plugin. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Submit Your Plugin</CardTitle>
        <CardDescription>
          Share your GIS tools with the community. All submissions are reviewed before publishing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Plugin Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="My Awesome GIS Tool"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what your plugin does and how it helps GIS professionals..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tech Stack</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                placeholder="Add technology..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechStack(newTech))}
              />
              <Button type="button" onClick={() => addTechStack(newTech)} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-2">
              {commonTechStack.map(tech => (
                <Button
                  key={tech}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addTechStack(tech)}
                  disabled={formData.tech_stack.includes(tech)}
                >
                  {tech}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.tech_stack.map(tech => (
                <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                  {tech}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeTechStack(tech)} />
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="github_url">GitHub URL</Label>
              <Input
                id="github_url"
                value={formData.github_url}
                onChange={(e) => setFormData(prev => ({ ...prev, github_url: e.target.value }))}
                placeholder="https://github.com/username/repo"
                type="url"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="download_url">Download URL</Label>
              <Input
                id="download_url"
                value={formData.download_url}
                onChange={(e) => setFormData(prev => ({ ...prev, download_url: e.target.value }))}
                placeholder="https://example.com/download/plugin.zip"
                type="url"
              />
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Submit Plugin
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PluginUploadForm;
