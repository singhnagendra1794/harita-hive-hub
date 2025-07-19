import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Upload, 
  Plus, 
  X, 
  FileText, 
  Link as LinkIcon,
  AlertCircle,
  CheckCircle,
  Github
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface TemplateUploadFormProps {
  onUpload: (templateData: any) => void;
  isUploading?: boolean;
}

const sectorOptions = [
  { value: 'agriculture', label: 'Agriculture', icon: '🌾' },
  { value: 'urban_planning', label: 'Urban Planning', icon: '🏙️' },
  { value: 'infrastructure', label: 'Infrastructure', icon: '🏗️' },
  { value: 'risk_mapping', label: 'Risk Mapping', icon: '⚠️' },
  { value: 'forestry', label: 'Forestry', icon: '🌲' },
  { value: 'water_resources', label: 'Water Resources', icon: '💧' },
  { value: 'climate', label: 'Climate', icon: '🌡️' },
  { value: 'remote_sensing', label: 'Remote Sensing', icon: '🛰️' },
  { value: 'health', label: 'Health', icon: '🏥' },
  { value: 'real_estate', label: 'Real Estate', icon: '🏢' },
  { value: 'mining', label: 'Mining', icon: '⛏️' },
  { value: 'transportation', label: 'Transportation', icon: '🚚' },
  { value: 'environmental', label: 'Environmental', icon: '🌍' },
  { value: 'disaster_management', label: 'Disaster Management', icon: '🚨' },
  { value: 'archaeology', label: 'Archaeology', icon: '🏺' },
  { value: 'marine', label: 'Marine', icon: '🌊' },
  { value: 'energy', label: 'Energy', icon: '⚡' }
];

const skillLevelOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' }
];

const toolOptions = [
  { value: 'qgis', label: 'QGIS' },
  { value: 'arcgis', label: 'ArcGIS' },
  { value: 'python', label: 'Python' },
  { value: 'r', label: 'R' },
  { value: 'google_earth_engine', label: 'Google Earth Engine' },
  { value: 'postgis', label: 'PostGIS' },
  { value: 'sql', label: 'SQL' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'leaflet', label: 'Leaflet' },
  { value: 'openlayers', label: 'OpenLayers' },
  { value: 'mapbox', label: 'Mapbox' },
  { value: 'grass_gis', label: 'GRASS GIS' },
  { value: 'gdal', label: 'GDAL' },
  { value: 'fme', label: 'FME' },
  { value: 'autocad_map', label: 'AutoCAD Map' },
  { value: 'microstation', label: 'MicroStation' },
  { value: 'erdas_imagine', label: 'ERDAS IMAGINE' },
  { value: 'envi', label: 'ENVI' },
  { value: 'snap', label: 'SNAP' },
  { value: 'matlab', label: 'MATLAB' }
];

export function TemplateUploadForm({ onUpload, isUploading = false }: TemplateUploadFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    use_case: '',
    sector: '',
    skill_level: 'intermediate',
    overview: '',
    objectives: [''],
    tools_required: [],
    estimated_duration: '',
    prerequisites: [''],
    learning_outcomes: [''],
    tags: [],
    github_url: '',
    documentation_external_url: '',
    video_tutorial_url: '',
    blog_post_url: '',
    license_type: 'MIT',
    organization: '',
    sample_data_description: ''
  });
  const [currentTag, setCurrentTag] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const toggleTool = (tool: string) => {
    setFormData(prev => ({
      ...prev,
      tools_required: prev.tools_required.includes(tool)
        ? prev.tools_required.filter(t => t !== tool)
        : [...prev.tools_required, tool]
    }));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSubmit = () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to upload templates",
        variant: "destructive"
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: "Terms required",
        description: "Please agree to the contribution guidelines",
        variant: "destructive"
      });
      return;
    }

    // Validate required fields
    const requiredFields = ['title', 'description', 'use_case', 'sector', 'overview'];
    const missingFields = requiredFields.filter(field => !formData[field].trim());
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing required fields",
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    if (formData.tools_required.length === 0) {
      toast({
        title: "Tools required",
        description: "Please select at least one tool or technology",
        variant: "destructive"
      });
      return;
    }

    // Clean up form data
    const cleanedData = {
      ...formData,
      slug: generateSlug(formData.title),
      objectives: formData.objectives.filter(obj => obj.trim()),
      prerequisites: formData.prerequisites.filter(prereq => prereq.trim()),
      learning_outcomes: formData.learning_outcomes.filter(outcome => outcome.trim()),
      author_id: user.id,
      contributor_name: user.user_metadata?.full_name || user.email,
      contributor_email: user.email,
      status: 'review'
    };

    onUpload(cleanedData);
    setIsOpen(false);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      use_case: '',
      sector: '',
      skill_level: 'intermediate',
      overview: '',
      objectives: [''],
      tools_required: [],
      estimated_duration: '',
      prerequisites: [''],
      learning_outcomes: [''],
      tags: [],
      github_url: '',
      documentation_external_url: '',
      video_tutorial_url: '',
      blog_post_url: '',
      license_type: 'MIT',
      organization: '',
      sample_data_description: ''
    });
    setAgreedToTerms(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Template
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Project Template
          </DialogTitle>
          <DialogDescription>
            Share your geospatial project template with the community. Templates undergo review before publication.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    placeholder="e.g., Urban Heat Island Analysis with Sentinel-2"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sector *</label>
                  <Select value={formData.sector} onValueChange={(value) => handleInputChange('sector', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectorOptions.map(sector => (
                        <SelectItem key={sector.value} value={sector.value}>
                          <span className="flex items-center gap-2">
                            <span>{sector.icon}</span>
                            {sector.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  placeholder="Brief description of what this template does"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Use Case *</label>
                <Textarea
                  placeholder="Specific use case this template addresses"
                  value={formData.use_case}
                  onChange={(e) => handleInputChange('use_case', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Skill Level</label>
                  <Select value={formData.skill_level} onValueChange={(value) => handleInputChange('skill_level', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {skillLevelOptions.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Estimated Duration</label>
                  <Input
                    placeholder="e.g., 2-3 hours"
                    value={formData.estimated_duration}
                    onChange={(e) => handleInputChange('estimated_duration', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">License</label>
                  <Select value={formData.license_type} onValueChange={(value) => handleInputChange('license_type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MIT">MIT</SelectItem>
                      <SelectItem value="Apache-2.0">Apache 2.0</SelectItem>
                      <SelectItem value="GPL-3.0">GPL 3.0</SelectItem>
                      <SelectItem value="CC-BY-4.0">CC BY 4.0</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tools Required */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tools & Technologies *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {toolOptions.map(tool => (
                  <div key={tool.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={tool.value}
                      checked={formData.tools_required.includes(tool.value)}
                      onCheckedChange={() => toggleTool(tool.value)}
                    />
                    <label htmlFor={tool.value} className="text-sm cursor-pointer">
                      {tool.label}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detailed Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Overview *</label>
                <Textarea
                  placeholder="Detailed overview of the template"
                  value={formData.overview}
                  onChange={(e) => handleInputChange('overview', e.target.value)}
                  rows={4}
                />
              </div>

              {/* Learning Objectives */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Learning Objectives</label>
                {formData.objectives.map((objective, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Objective ${index + 1}`}
                      value={objective}
                      onChange={(e) => handleArrayInputChange('objectives', index, e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('objectives', index)}
                      disabled={formData.objectives.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('objectives')}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Objective
                </Button>
              </div>

              {/* Prerequisites */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Prerequisites</label>
                {formData.prerequisites.map((prereq, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Prerequisite ${index + 1}`}
                      value={prereq}
                      onChange={(e) => handleArrayInputChange('prerequisites', index, e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('prerequisites', index)}
                      disabled={formData.prerequisites.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('prerequisites')}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Prerequisite
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* External Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">External Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    GitHub Repository
                  </label>
                  <Input
                    placeholder="https://github.com/username/repo"
                    value={formData.github_url}
                    onChange={(e) => handleInputChange('github_url', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Documentation URL
                  </label>
                  <Input
                    placeholder="https://docs.example.com"
                    value={formData.documentation_external_url}
                    onChange={(e) => handleInputChange('documentation_external_url', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Video Tutorial</label>
                  <Input
                    placeholder="https://youtube.com/watch?v=..."
                    value={formData.video_tutorial_url}
                    onChange={(e) => handleInputChange('video_tutorial_url', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Blog Post</label>
                  <Input
                    placeholder="https://blog.example.com/post"
                    value={formData.blog_post_url}
                    onChange={(e) => handleInputChange('blog_post_url', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      #{tag}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contribution Guidelines */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Contribution Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-orange-800 space-y-2">
                <p><strong>Before submitting, ensure your template includes:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Working, tested code/scripts</li>
                  <li>Sample input data or clear data source instructions</li>
                  <li>Step-by-step documentation (README, PDF, or Markdown)</li>
                  <li>Clear folder structure and file organization</li>
                  <li>Expected outputs and results</li>
                </ul>
                <p><strong>Review Process:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Templates are reviewed within 3-5 business days</li>
                  <li>We test functionality and verify documentation</li>
                  <li>You'll receive feedback if changes are needed</li>
                  <li>Published templates are featured in our community</li>
                </ul>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                />
                <label htmlFor="terms" className="text-sm text-orange-800 cursor-pointer">
                  I agree to the contribution guidelines and confirm this template is functional and well-documented
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isUploading || !agreedToTerms}
              className="gap-2"
            >
              {isUploading ? (
                <>Uploading...</>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Submit for Review
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}