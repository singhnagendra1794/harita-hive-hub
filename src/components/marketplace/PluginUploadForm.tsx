
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Plus } from "lucide-react";

const PluginUploadForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    techStack: [] as string[],
    githubUrl: "",
    documentationUrl: "",
    version: "1.0.0",
    license: "MIT"
  });
  
  const [files, setFiles] = useState<File[]>([]);
  const [newTech, setNewTech] = useState("");
  const { toast } = useToast();

  const categories = [
    "QGIS Plugin",
    "Python Script", 
    "JavaScript Widget",
    "ArcGIS Tool",
    "Web Component",
    "Data Processing",
    "Visualization"
  ];

  const techOptions = [
    "Python", "JavaScript", "TypeScript", "QGIS", "ArcGIS", 
    "Leaflet", "OpenLayers", "D3.js", "React", "Vue.js",
    "GDAL", "PostGIS", "PostgreSQL", "NumPy", "Pandas"
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addTechStack = (tech: string) => {
    if (tech && !formData.techStack.includes(tech)) {
      setFormData(prev => ({
        ...prev,
        techStack: [...prev.techStack, tech]
      }));
    }
  };

  const removeTechStack = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== tech)
    }));
  };

  const handleAddNewTech = () => {
    if (newTech.trim()) {
      addTechStack(newTech.trim());
      setNewTech("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please upload at least one file.",
        variant: "destructive",
      });
      return;
    }

    // Simulate upload process
    toast({
      title: "Plugin Submitted",
      description: "Your plugin has been submitted for review. You'll be notified once it's approved.",
    });

    // Reset form
    setFormData({
      title: "",
      description: "",
      category: "",
      techStack: [],
      githubUrl: "",
      documentationUrl: "",
      version: "1.0.0",
      license: "MIT"
    });
    setFiles([]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Plugin Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Plugin Name *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Advanced Buffer Tool"
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
              placeholder="Describe what your plugin does and its key features..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                placeholder="1.0.0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="license">License</Label>
              <Select value={formData.license} onValueChange={(value) => setFormData(prev => ({ ...prev, license: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MIT">MIT</SelectItem>
                  <SelectItem value="GPL-3.0">GPL-3.0</SelectItem>
                  <SelectItem value="Apache-2.0">Apache-2.0</SelectItem>
                  <SelectItem value="BSD-3-Clause">BSD-3-Clause</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Technology Stack</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.techStack.map(tech => (
                <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTechStack(tech)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Select onValueChange={addTechStack}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Add technology" />
                </SelectTrigger>
                <SelectContent>
                  {techOptions.filter(tech => !formData.techStack.includes(tech)).map(tech => (
                    <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-1">
                <Input
                  placeholder="Custom tech"
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  className="w-32"
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddNewTech}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="github">GitHub Repository</Label>
              <Input
                id="github"
                value={formData.githubUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                placeholder="https://github.com/username/plugin"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="docs">Documentation URL</Label>
              <Input
                id="docs"
                value={formData.documentationUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, documentationUrl: e.target.value }))}
                placeholder="https://docs.example.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>File Upload</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag & drop files here, or click to select
            </p>
            <Input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <Label htmlFor="file-upload" className="cursor-pointer">
              <Button variant="outline" size="sm" asChild>
                <span>Choose Files</span>
              </Button>
            </Label>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files</Label>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline">
          Save as Draft
        </Button>
        <Button type="submit">
          Submit for Review
        </Button>
      </div>
    </form>
  );
};

export default PluginUploadForm;
