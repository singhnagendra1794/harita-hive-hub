import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Upload, 
  File, 
  Video, 
  Image, 
  FileText, 
  Link, 
  Tag, 
  Globe, 
  Users, 
  Eye,
  X,
  Plus,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AIFeatures } from './AIFeatures';

interface EnhancedUploadSystemProps {
  onUploadComplete?: () => void;
}

interface ContentMetadata {
  title: string;
  description: string;
  category: string;
  tools_used: string[];
  sector: string;
  license: string;
  tags: string[];
  is_featured: boolean;
  status: 'draft' | 'published' | 'featured';
  content_type: string;
}

const contentCategories = [
  'Tutorial',
  'Walkthrough', 
  'Analysis',
  'Project',
  'Case Study',
  'Demo',
  'Research',
  'Documentation'
];

const toolsOptions = [
  'QGIS',
  'ArcGIS',
  'Mapbox',
  'Leaflet',
  'PostGIS',
  'Google Earth Engine',
  'Python',
  'R',
  'JavaScript',
  'React',
  'GDAL',
  'FME',
  'AutoCAD',
  'SketchUp'
];

const sectorOptions = [
  'Urban Planning',
  'Environmental',
  'Infrastructure',
  'Disaster Management',
  'Agriculture',
  'Transportation',
  'Energy',
  'Mining',
  'Forestry',
  'Water Resources',
  'Climate Change',
  'Public Health'
];

const licenseOptions = [
  'CC BY 4.0',
  'CC BY-SA 4.0',
  'CC BY-NC 4.0',
  'MIT',
  'GPL-3.0',
  'All Rights Reserved',
  'Creative Commons Zero'
];

export const EnhancedUploadSystem: React.FC<EnhancedUploadSystemProps> = ({ onUploadComplete }) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showAIFeatures, setShowAIFeatures] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const [metadata, setMetadata] = useState<ContentMetadata>({
    title: '',
    description: '',
    category: '',
    tools_used: [],
    sector: '',
    license: 'CC BY 4.0',
    tags: [],
    is_featured: false,
    status: 'draft',
    content_type: ''
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
    
    // Auto-detect content type from first file
    if (files.length > 0) {
      const firstFile = files[0];
      let contentType = 'file';
      
      if (firstFile.type.startsWith('video/')) contentType = 'video';
      else if (firstFile.type.startsWith('image/')) contentType = 'image';
      else if (firstFile.type === 'application/pdf') contentType = 'document';
      else if (firstFile.name.endsWith('.qgz') || firstFile.name.endsWith('.geojson')) contentType = 'gis_project';
      
      setMetadata(prev => ({ ...prev, content_type: contentType }));
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !metadata.tags.includes(currentTag.trim())) {
      setMetadata(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addTool = (tool: string) => {
    if (!metadata.tools_used.includes(tool)) {
      setMetadata(prev => ({
        ...prev,
        tools_used: [...prev.tools_used, tool]
      }));
    }
  };

  const removeTool = (toolToRemove: string) => {
    setMetadata(prev => ({
      ...prev,
      tools_used: prev.tools_used.filter(tool => tool !== toolToRemove)
    }));
  };

  const uploadFiles = async () => {
    if (!user || selectedFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }

    if (!metadata.title.trim()) {
      toast.error('Please provide a title');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = selectedFiles.map(async (file, index) => {
        const fileName = `${user.id}/${Date.now()}-${file.name}`;
        
        // Upload file to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('studio-content')
          .upload(fileName, file);
          
        // Update progress manually
        const fileProgress = ((index + 1) / selectedFiles.length) * 100;
        setUploadProgress(fileProgress);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('studio-content')
          .getPublicUrl(fileName);

        // Save content metadata to database
        const { data: contentData, error: dbError } = await supabase
          .from('studio_content')
          .insert({
            user_id: user.id,
            title: selectedFiles.length === 1 ? metadata.title : `${metadata.title} - ${file.name}`,
            description: metadata.description,
            content_type: metadata.content_type,
            file_url: publicUrl,
            file_size: file.size,
            file_name: file.name,
            category: metadata.category,
            tools_used: metadata.tools_used,
            sector: metadata.sector,
            license: metadata.license,
            tags: metadata.tags,
            is_featured: metadata.is_featured,
            status: metadata.status,
            is_published: metadata.status === 'published'
          })
          .select()
          .single();

        if (dbError) throw dbError;
        return contentData;
      });

      await Promise.all(uploadPromises);
      
      toast.success(`Successfully uploaded ${selectedFiles.length} file(s)!`);
      
      // Reset form
      setSelectedFiles([]);
      setMetadata({
        title: '',
        description: '',
        category: '',
        tools_used: [],
        sector: '',
        license: 'CC BY 4.0',
        tags: [],
        is_featured: false,
        status: 'draft',
        content_type: ''
      });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      onUploadComplete?.();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload content');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('video/')) return Video;
    if (file.type.startsWith('image/')) return Image;
    if (file.type === 'application/pdf') return FileText;
    return File;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Upload System</h2>
          <p className="text-muted-foreground">Upload and manage your geospatial content with AI-powered enhancements</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowAIFeatures(!showAIFeatures)}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {showAIFeatures ? 'Hide' : 'Show'} AI Features
        </Button>
      </div>

      {showAIFeatures && (
        <AIFeatures onUpdate={onUploadComplete} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              File Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Drop files here or click to browse</p>
              <p className="text-sm text-muted-foreground">
                Supported: MP4, PNG, JPG, PDF, QGIS (.qgz), GeoJSON, Shapefiles
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Max file size: 1.5GB per file
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept=".mp4,.mov,.avi,.png,.jpg,.jpeg,.pdf,.qgz,.geojson,.shp,.kml,.gpx"
            />

            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Selected Files:</h4>
                {selectedFiles.map((file, index) => {
                  const IconComponent = getFileIcon(file);
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <IconComponent className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Content Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={metadata.title}
                onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter content title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={metadata.description}
                onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your content"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={metadata.category} onValueChange={(value) => setMetadata(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {contentCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sector</Label>
                <Select value={metadata.sector} onValueChange={(value) => setMetadata(prev => ({ ...prev, sector: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectorOptions.map(sector => (
                      <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tools Used</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {metadata.tools_used.map(tool => (
                  <Badge key={tool} variant="secondary" className="cursor-pointer" onClick={() => removeTool(tool)}>
                    {tool} <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
              <Select onValueChange={addTool}>
                <SelectTrigger>
                  <SelectValue placeholder="Add tools" />
                </SelectTrigger>
                <SelectContent>
                  {toolsOptions.filter(tool => !metadata.tools_used.includes(tool)).map(tool => (
                    <SelectItem key={tool} value={tool}>{tool}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {metadata.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="Add tag"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button type="button" onClick={addTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>License</Label>
              <Select value={metadata.license} onValueChange={(value) => setMetadata(prev => ({ ...prev, license: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {licenseOptions.map(license => (
                    <SelectItem key={license} value={license}>{license}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="status">Publication Status</Label>
              <Select value={metadata.status} onValueChange={(value: 'draft' | 'published' | 'featured') => setMetadata(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => {
          setSelectedFiles([]);
          setMetadata({
            title: '',
            description: '',
            category: '',
            tools_used: [],
            sector: '',
            license: 'CC BY 4.0',
            tags: [],
            is_featured: false,
            status: 'draft',
            content_type: ''
          });
        }}>
          Clear All
        </Button>
        
        <Button 
          onClick={uploadFiles} 
          disabled={isUploading || selectedFiles.length === 0 || !metadata.title.trim()}
          className="min-w-32"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Upload Content
            </>
          )}
        </Button>
      </div>
    </div>
  );
};