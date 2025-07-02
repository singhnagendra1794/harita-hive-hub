
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Save, Eye, Download, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EbookData {
  title: string;
  description: string;
  author: string;
  file_url: string;
  file_name: string;
  file_size: number;
  tags: string[];
  visibility: 'draft' | 'published';
  course_id?: string;
  module_id?: string;
  is_downloadable: boolean;
  price?: number;
}

export const EbookUpload = () => {
  const [ebookData, setEbookData] = useState<EbookData>({
    title: '',
    description: '',
    author: '',
    file_url: '',
    file_name: '',
    file_size: 0,
    tags: [],
    visibility: 'draft',
    is_downloadable: true
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
      const filePath = `ebooks/${fileName}`;

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

      setEbookData(prev => ({ 
        ...prev, 
        file_url: data.publicUrl,
        file_name: file.name,
        file_size: file.size
      }));

      toast({
        title: "Success",
        description: "E-book uploaded successfully",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload e-book",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleEbookUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/epub+zip', 'application/x-mobipocket-ebook'];
      if (allowedTypes.includes(file.type) || file.name.endsWith('.pdf') || file.name.endsWith('.epub')) {
        handleFileUpload(file);
      } else {
        toast({
          title: "Error",
          description: "Please select a PDF or EPUB file",
          variant: "destructive",
        });
      }
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !ebookData.tags.includes(tagInput.trim())) {
      setEbookData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEbookData(prev => ({
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

  const saveEbook = async () => {
    if (!ebookData.title || !ebookData.file_url) {
      toast({
        title: "Error",
        description: "Please fill in title and upload a file",
        variant: "destructive",
      });
      return;
    }

    try {
      // Here you would save to your database
      console.log('Saving e-book:', ebookData);
      
      toast({
        title: "Success",
        description: "E-book saved successfully",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save e-book",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>E-book & Document Upload</CardTitle>
          <CardDescription>
            Upload PDFs, e-books, and other documents for your courses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Section */}
          <div>
            <Label htmlFor="ebook-file">Upload E-book or Document</Label>
            <div className="mt-2">
              <input
                type="file"
                id="ebook-file"
                accept=".pdf,.epub,.mobi"
                onChange={handleEbookUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('ebook-file')?.click()}
                disabled={uploading}
                className="w-full h-32 border-dashed"
              >
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {uploading ? 'Uploading...' : 'Click to upload e-book'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, EPUB, MOBI up to 50MB
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
            {ebookData.file_url && (
              <div className="mt-2 p-3 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{ebookData.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(ebookData.file_size)}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* E-book Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={ebookData.title}
                onChange={(e) => setEbookData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter the title of your e-book"
              />
            </div>

            <div>
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={ebookData.author}
                onChange={(e) => setEbookData(prev => ({ ...prev, author: e.target.value }))}
                placeholder="Author name"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={ebookData.description}
                onChange={(e) => setEbookData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what readers will learn from this e-book"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tags (e.g., Guide, Reference, Tutorial)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              {ebookData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {ebookData.tags.map((tag) => (
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
                  value={ebookData.visibility}
                  onValueChange={(value: 'draft' | 'published') => 
                    setEbookData(prev => ({ ...prev, visibility: value }))
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

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="downloadable"
                  checked={ebookData.is_downloadable}
                  onChange={(e) => setEbookData(prev => ({ ...prev, is_downloadable: e.target.checked }))}
                />
                <Label htmlFor="downloadable">Allow downloads</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  value={ebookData.price || ''}
                  onChange={(e) => setEbookData(prev => ({ ...prev, price: parseFloat(e.target.value) || undefined }))}
                  placeholder="0 (Free)"
                  className="w-24"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline">Save as Draft</Button>
            <Button onClick={saveEbook}>
              <Save className="h-4 w-4 mr-2" />
              Save E-book
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
