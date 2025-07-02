
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, Link, Archive, Save, Eye, Download, Github, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PluginData {
  title: string;
  description: string;
  file_url: string;
  file_name: string;
  file_size: number;
  plugin_type: 'qgis' | 'arcgis' | 'web' | 'desktop' | 'mobile';
  github_url?: string;
  demo_url?: string;
  documentation_url?: string;
  tags: string[];
  visibility: 'draft' | 'published';
  course_id?: string;
  module_id?: string;
  version: string;
  requirements?: string;
  installation_notes?: string;
}

const pluginTypes = [
  { value: 'qgis', label: 'QGIS Plugin' },
  { value: 'arcgis', label: 'ArcGIS Tool' },
  { value: 'web', label: 'Web Tool' },
  { value: 'desktop', label: 'Desktop Application' },
  { value: 'mobile', label: 'Mobile App' }
];

export const PluginToolsUpload = () => {
  const [pluginData, setPluginData] = useState<PluginData>({
    title: '',
    description: '',
    file_url: '',
    file_name: '',
    file_size: 0,
    plugin_type: 'qgis',
    tags: [],
    visibility: 'draft',
    version: '1.0.0'
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tagInput, setTagInput] = useState('');
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `plugins/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('course-content')
        .upload(filePath, file, {
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100);
          }
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('course-content')
        .getPublicUrl(filePath);

      setPluginData(prev => ({ 
        ...prev, 
        file_url: data.publicUrl,
        file_name: file.name,
        file_size: file.size
      }));

      toast({
        title: "Success",
        description: "Plugin uploaded successfully",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload plugin",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handlePluginUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'application/zip', 
        'application/x-zip-compressed',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        'application/octet-stream'
      ];
      if (allowedTypes.includes(file.type) || 
          file.name.endsWith('.zip') || 
          file.name.endsWith('.rar') || 
          file.name.endsWith('.7z') ||
          file.name.endsWith('.exe') ||
          file.name.endsWith('.dmg') ||
          file.name.endsWith('.deb') ||
          file.name.endsWith('.rpm')) {
        handleFileUpload(file);
      } else {
        toast({
          title: "Error",
          description: "Please select a valid plugin file (ZIP, RAR, 7Z, EXE, etc.)",
          variant: "destructive",
        });
      }
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !pluginData.tags.includes(tagInput.trim())) {
      setPluginData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setPluginData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const savePlugin = async () => {
    if (!pluginData.title || (!pluginData.file_url && !pluginData.github_url)) {
      toast({
        title: "Error",
        description: "Please fill in title and upload a file or provide a GitHub URL",
        variant: "destructive",
      });
      return;
    }

    try {
      // Here you would save to your database
      console.log('Saving plugin:', pluginData);
      
      toast({
        title: "Success",
        description: "Plugin saved successfully",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save plugin",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Plugin & Tools Upload</CardTitle>
          <CardDescription>
            Upload GIS plugins, tools, and applications for your learners
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plugin Type and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="plugin-type">Plugin Type</Label>
              <Select
                value={pluginData.plugin_type}
                onValueChange={(value: any) => setPluginData(prev => ({ ...prev, plugin_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pluginTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={pluginData.version}
                onChange={(e) => setPluginData(prev => ({ ...prev, version: e.target.value }))}
                placeholder="1.0.0"
              />
            </div>
          </div>

          {/* File Upload Section */}
          <div>
            <Label htmlFor="plugin-file">Upload Plugin File</Label>
            <div className="mt-2">
              <input
                type="file"
                id="plugin-file"
                accept=".zip,.rar,.7z,.exe,.dmg,.deb,.rpm"
                onChange={handlePluginUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('plugin-file')?.click()}
                disabled={uploading}
                className="w-full h-32 border-dashed"
              >
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {uploading ? 'Uploading...' : 'Click to upload plugin'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ZIP, RAR, 7Z, EXE, DMG up to 100MB
                  </p>
                </div>
              </Button>
            </div>
            {uploading && (
              <div className="mt-2">
                <Progress value={uploadProgress} />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round(uploadProgress)}% uploaded
                </p>
              </div>
            )}
            {pluginData.file_url && (
              <div className="mt-2 p-3 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Archive className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{pluginData.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(pluginData.file_size)}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* URLs Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="github-url">GitHub Repository (Optional)</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="github-url"
                  value={pluginData.github_url || ''}
                  onChange={(e) => setPluginData(prev => ({ ...prev, github_url: e.target.value }))}
                  placeholder="https://github.com/username/plugin-name"
                />
                <Button variant="outline" size="icon">
                  <Github className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="demo-url">Demo URL (Optional)</Label>
                <Input
                  id="demo-url"
                  value={pluginData.demo_url || ''}
                  onChange={(e) => setPluginData(prev => ({ ...prev, demo_url: e.target.value }))}
                  placeholder="https://example.com/demo"
                />
              </div>

              <div>
                <Label htmlFor="docs-url">Documentation URL (Optional)</Label>
                <Input
                  id="docs-url"
                  value={pluginData.documentation_url || ''}
                  onChange={(e) => setPluginData(prev => ({ ...prev, documentation_url: e.target.value }))}
                  placeholder="https://docs.example.com"
                />
              </div>
            </div>
          </div>

          {/* Plugin Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Plugin Title</Label>
              <Input
                id="title"
                value={pluginData.title}
                onChange={(e) => setPluginData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a descriptive name for your plugin"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={pluginData.description}
                onChange={(e) => setPluginData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this plugin does and its key features"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="requirements">System Requirements (Optional)</Label>
              <Textarea
                id="requirements"
                value={pluginData.requirements || ''}
                onChange={(e) => setPluginData(prev => ({ ...prev, requirements: e.target.value }))}
                placeholder="List system requirements, dependencies, etc."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="installation">Installation Notes (Optional)</Label>
              <Textarea
                id="installation"
                value={pluginData.installation_notes || ''}
                onChange={(e) => setPluginData(prev => ({ ...prev, installation_notes: e.target.value }))}
                placeholder="Provide installation instructions and setup notes"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tags (e.g., QGIS, Analysis, Automation)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              {pluginData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {pluginData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="visibility">Visibility</Label>
                <Select
                  value={pluginData.visibility}
                  onValueChange={(value: 'draft' | 'published') => 
                    setPluginData(prev => ({ ...prev, visibility: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="course">Associate with Course</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gis-basics">GIS Basics</SelectItem>
                    <SelectItem value="remote-sensing">Remote Sensing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline">Save as Draft</Button>
            <Button onClick={savePlugin}>
              <Save className="h-4 w-4 mr-2" />
              Save Plugin
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
