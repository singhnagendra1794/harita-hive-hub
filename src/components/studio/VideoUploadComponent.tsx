import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, Video, X, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VideoUploadProps {
  onUploadComplete: () => void;
}

const SKILL_DOMAINS = [
  'Urban Planning', 'Environmental Analysis', 'Remote Sensing', 'GIS Analysis',
  'Climate Change', 'Agriculture', 'Transportation', 'Water Resources',
  'Emergency Management', 'Conservation', 'Mining', 'Energy'
];

const GIS_TOOLS = [
  'QGIS', 'ArcGIS', 'Google Earth Engine', 'Python', 'R', 'PostGIS',
  'GDAL', 'Leaflet', 'OpenLayers', 'Mapbox', 'FME', 'ENVI'
];

const REGIONS = [
  'North America', 'South America', 'Europe', 'Africa', 'Asia', 
  'Australia/Oceania', 'Global', 'Local/Regional'
];

export const VideoUploadComponent: React.FC<VideoUploadProps> = ({ onUploadComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skill_domain: '',
    region: '',
    goal: '',
    outcome: '',
    embed_url: '',
    tools_used: [] as string[],
    tags: [] as string[],
    newTag: ''
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const validTypes = ['video/mp4', 'video/mov', 'video/webm', 'video/avi', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload MP4, MOV, WebM, AVI, or GIF files only.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload files smaller than 100MB.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('studio-content')
        .upload(fileName, file, {
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100);
          }
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('studio-content')
        .getPublicUrl(uploadData.path);

      // Save to database
      const { error: dbError } = await supabase
        .from('studio_content')
        .insert({
          user_id: user.id,
          title: formData.title || file.name,
          description: formData.description,
          content_type: file.type.startsWith('image/') ? 'image' : 'video',
          file_url: publicUrl,
          file_size: file.size,
          tools_used: formData.tools_used,
          skill_domain: formData.skill_domain,
          region: formData.region,
          goal: formData.goal,
          outcome: formData.outcome,
          tags: formData.tags
        });

      if (dbError) throw dbError;

      toast({
        title: "Upload successful!",
        description: "Your content has been uploaded and published."
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        skill_domain: '',
        region: '',
        goal: '',
        outcome: '',
        embed_url: '',
        tools_used: [],
        tags: [],
        newTag: ''
      });

      onUploadComplete();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleEmbedUpload = async () => {
    if (!user || !formData.embed_url || !formData.title) {
      toast({
        title: "Missing information",
        description: "Please provide at least a title and embed URL.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const { error } = await supabase
        .from('studio_content')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          content_type: 'embed',
          embed_url: formData.embed_url,
          tools_used: formData.tools_used,
          skill_domain: formData.skill_domain,
          region: formData.region,
          goal: formData.goal,
          outcome: formData.outcome,
          tags: formData.tags
        });

      if (error) throw error;

      toast({
        title: "Content added!",
        description: "Your embedded content has been published."
      });

      setFormData({
        title: '',
        description: '',
        skill_domain: '',
        region: '',
        goal: '',
        outcome: '',
        embed_url: '',
        tools_used: [],
        tags: [],
        newTag: ''
      });

      onUploadComplete();
    } catch (error) {
      console.error('Embed error:', error);
      toast({
        title: "Failed to add content",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const toggleTool = (tool: string) => {
    setFormData(prev => ({
      ...prev,
      tools_used: prev.tools_used.includes(tool)
        ? prev.tools_used.filter(t => t !== tool)
        : [...prev.tools_used, tool]
    }));
  };

  const addTag = () => {
    if (formData.newTag.trim() && !formData.tags.includes(formData.newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ''
      }));
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Video Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-semibold mb-2">Drop your video files here</p>
              <p className="text-muted-foreground mb-4">
                Supports MP4, MOV, WebM, AVI, GIF. Max file size: 100MB
              </p>
              <div className="flex justify-center">
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <Button asChild disabled={uploading}>
                    <span>{uploading ? 'Uploading...' : 'Choose Files'}</span>
                  </Button>
                  <Input
                    id="file-upload"
                    type="file"
                    accept="video/*,.gif"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </Label>
              </div>
            </div>

            {/* Upload Progress */}
            {uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Embed URL Section */}
      <Card>
        <CardHeader>
          <CardTitle>Or Add YouTube/Vimeo Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="embed_url">Video URL</Label>
              <Input
                id="embed_url"
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                value={formData.embed_url}
                onChange={(e) => setFormData(prev => ({ ...prev, embed_url: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Details */}
      <Card>
        <CardHeader>
          <CardTitle>Content Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter content title..."
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="skill_domain">Skill Domain</Label>
              <Select value={formData.skill_domain} onValueChange={(value) => setFormData(prev => ({ ...prev, skill_domain: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_DOMAINS.map(domain => (
                    <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your content, methodology, and key insights..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Tools Used */}
          <div>
            <Label>Tools Used</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-md">
              {GIS_TOOLS.map(tool => (
                <Badge
                  key={tool}
                  variant={formData.tools_used.includes(tool) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTool(tool)}
                >
                  {tool}
                  {formData.tools_used.includes(tool) && <X className="h-3 w-3 ml-1" />}
                </Badge>
              ))}
            </div>
          </div>

          {/* Region and Project Context */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="region">Region</Label>
              <Select value={formData.region} onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Goal and Outcome */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="goal">Project Goal</Label>
              <Textarea
                id="goal"
                placeholder="What was the objective of this work?"
                value={formData.goal}
                onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="outcome">Outcome/Results</Label>
              <Textarea
                id="outcome"
                placeholder="What were the key findings or results?"
                value={formData.outcome}
                onChange={(e) => setFormData(prev => ({ ...prev, outcome: e.target.value }))}
                rows={2}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={formData.newTag}
                  onChange={(e) => setFormData(prev => ({ ...prev, newTag: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button type="button" onClick={addTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          {formData.embed_url ? (
            <Button onClick={handleEmbedUpload} disabled={uploading} className="w-full">
              {uploading ? 'Publishing...' : 'Publish Embedded Content'}
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};