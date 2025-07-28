import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Upload, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const TARGET_PAGES = [
  { value: '/studio', label: 'Studio' },
  { value: '/project-studio', label: 'Project Studio' },
  { value: '/skill-roadmap', label: 'Skill Roadmap' },
  { value: '/live-classes', label: 'Live Classes' },
  { value: '/plugin-marketplace', label: 'Plugin Marketplace' },
  { value: '/portfolio', label: 'Portfolio' },
  { value: '/gis-marketplace', label: 'GIS Marketplace' },
  { value: '/dashboard', label: 'Dashboard' },
  { value: '/learn', label: 'Learn' }
];

const CONTENT_CATEGORIES = [
  'Tool',
  'Data',
  'Video',
  'Guide',
  'Template',
  'Script',
  'Plugin',
  'Course',
  'Tutorial',
  'Other'
];

export const SuperAdminUploader: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_page: '',
    category: '',
    tags: '',
    related_course: '',
    level: '',
    is_featured: false
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 2GB)
      if (file.size > 2 * 1024 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "File size must be less than 2GB",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile || !user) return null;

    const fileExt = selectedFile.name.split('.').pop();
    const fileName = `${formData.assigned_page.replace('/', '')}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('admin-uploads')
      .upload(fileName, selectedFile);

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('admin-uploads')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedFile || !formData.title || !formData.assigned_page) {
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
      
      // Create metadata object
      const metadata = {
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        related_course: formData.related_course,
        level: formData.level,
        file_type: selectedFile.type,
        file_size: selectedFile.size,
        original_name: selectedFile.name
      };
      
      // Insert upload data
      const { error } = await supabase
        .from('admin_uploads')
        .insert({
          title: formData.title,
          description: formData.description,
          file_url: fileUrl,
          assigned_page: formData.assigned_page,
          metadata,
          is_featured: formData.is_featured,
          created_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Content uploaded successfully!",
        description: `Content has been added to ${TARGET_PAGES.find(p => p.value === formData.assigned_page)?.label}`
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        assigned_page: '',
        category: '',
        tags: '',
        related_course: '',
        level: '',
        is_featured: false
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
        <CardTitle>Admin Upload Panel</CardTitle>
        <CardDescription>
          Upload content, tools, or resources to any page in the application.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Content Title *</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Advanced GIS Analysis Tutorial"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Short Description *</Label>
            <Textarea
              id="description"
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the content..."
            />
          </div>

          {/* Target Page */}
          <div className="space-y-2">
            <Label>Target Page *</Label>
            <Select value={formData.assigned_page} onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_page: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select target page" />
              </SelectTrigger>
              <SelectContent>
                {TARGET_PAGES.map(page => (
                  <SelectItem key={page.value} value={page.value}>{page.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Upload File *</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              {selectedFile ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({Math.round(selectedFile.size / 1024 / 1024 * 100) / 100} MB)
                  </span>
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
                    accept=".zip,.pdf,.geojson,.mp4,.shp,.py,.js,.json,.csv,.xlsx,.docx,.pptx"
                    onChange={handleFileSelect}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" asChild>
                      <span>Choose File</span>
                    </Button>
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supports: .zip, .pdf, .geojson, .mp4, .shp, scripts, and more (max 2GB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Select value={formData.level} onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Metadata Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="gis, analysis, tutorial"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="related_course">Related Course (optional)</Label>
              <Input
                id="related_course"
                value={formData.related_course}
                onChange={(e) => setFormData(prev => ({ ...prev, related_course: e.target.value }))}
                placeholder="GIS Fundamentals"
              />
            </div>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
            />
            <Label htmlFor="featured">Show as Featured</Label>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={uploading || !selectedFile || !formData.title || !formData.assigned_page}
          >
            {uploading ? 'Uploading...' : 'Upload to Page'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};