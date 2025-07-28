import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const GIS_SOFTWARE_OPTIONS = [
  'QGIS',
  'ArcGIS',
  'Google Earth Engine',
  'GDAL',
  'PostGIS',
  'GeoServer',
  'MapServer',
  'OpenLayers',
  'Leaflet',
  'Other'
];

const TAG_OPTIONS = [
  'Analysis',
  'Visualization',
  'Data Processing',
  'Remote Sensing',
  'Cartography',
  'Spatial Statistics',
  'Web GIS',
  'Mobile GIS',
  'Python',
  'JavaScript',
  'Plugin',
  'Script',
  'Tool'
];

export const GISToolUploader: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    tool_type: '',
    tech_stack: [] as string[],
    tags: [] as string[],
    demo_url: '',
    github_url: '',
    license_type: '',
    version: ''
  });

  const [newTag, setNewTag] = useState('');
  const [selectedSoftware, setSelectedSoftware] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['.zip', '.plugin', '.py', '.js', '.json'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a .zip, .plugin, .py, .js, or .json file",
          variant: "destructive"
        });
        return;
      }
      
      if (file.size > 100 * 1024 * 1024) { // 100MB
        toast({
          title: "File too large",
          description: "File size must be less than 100MB",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addSoftware = (software: string) => {
    if (software && !formData.tech_stack.includes(software)) {
      setFormData(prev => ({
        ...prev,
        tech_stack: [...prev.tech_stack, software]
      }));
    }
    setSelectedSoftware('');
  };

  const removeSoftware = (softwareToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.filter(software => software !== softwareToRemove)
    }));
  };

  const uploadFile = async () => {
    if (!selectedFile || !user) return null;

    const fileExt = selectedFile.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('marketplace-tools')
      .upload(fileName, selectedFile);

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('marketplace-tools')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedFile) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and select a file",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Upload file
      const fileUrl = await uploadFile();
      
      // Insert tool data
      const { error } = await supabase
        .from('marketplace_tools')
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category || 'Other',
          subcategory: formData.subcategory || 'General',
          tool_type: formData.tool_type || 'Plugin',
          tech_stack: formData.tech_stack,
          tags: formData.tags,
          demo_url: formData.demo_url || null,
          github_url: formData.github_url || null,
          download_url: fileUrl,
          license_type: formData.license_type || 'MIT',
          version: formData.version || '1.0.0',
          author_id: user.id,
          created_by: user.id,
          status: 'pending',
          is_free: true
        });

      if (error) throw error;

      toast({
        title: "Tool uploaded successfully!",
        description: "Your tool is now pending admin approval."
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        subcategory: '',
        tool_type: '',
        tech_stack: [],
        tags: [],
        demo_url: '',
        github_url: '',
        license_type: '',
        version: ''
      });
      setSelectedFile(null);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Your GIS Tool to the Marketplace</CardTitle>
        <CardDescription>
          Share your GIS tools, plugins, and scripts with the community. Your upload will be reviewed before publication.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Tool Title *</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Advanced Buffer Analysis Plugin"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what your tool does, how to use it, and any special features..."
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Upload File *</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              {selectedFile ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".zip,.plugin,.py,.js,.json"
                    onChange={handleFileSelect}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" asChild>
                      <span>Choose File</span>
                    </Button>
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supports: .zip, .plugin, .py, .js, .json (max 100MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Select onValueChange={addTag}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a tag" />
                </SelectTrigger>
                <SelectContent>
                  {TAG_OPTIONS.map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-1">
                <Input
                  placeholder="Custom tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(newTag))}
                />
                <Button type="button" size="sm" onClick={() => addTag(newTag)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* GIS Software */}
          <div className="space-y-2">
            <Label>Compatible GIS Software</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tech_stack.map(software => (
                <Badge key={software} variant="outline" className="gap-1">
                  {software}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeSoftware(software)}
                  />
                </Badge>
              ))}
            </div>
            <Select value={selectedSoftware} onValueChange={addSoftware}>
              <SelectTrigger>
                <SelectValue placeholder="Select compatible software" />
              </SelectTrigger>
              <SelectContent>
                {GIS_SOFTWARE_OPTIONS.map(software => (
                  <SelectItem key={software} value={software}>{software}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Optional URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="demo_url">Demo Video URL (Optional)</Label>
              <Input
                id="demo_url"
                type="url"
                value={formData.demo_url}
                onChange={(e) => setFormData(prev => ({ ...prev, demo_url: e.target.value }))}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="github_url">GitHub Repository (Optional)</Label>
              <Input
                id="github_url"
                type="url"
                value={formData.github_url}
                onChange={(e) => setFormData(prev => ({ ...prev, github_url: e.target.value }))}
                placeholder="https://github.com/username/repo"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={uploading || !selectedFile || !formData.title}
          >
            {uploading ? 'Uploading...' : 'Submit Tool'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};