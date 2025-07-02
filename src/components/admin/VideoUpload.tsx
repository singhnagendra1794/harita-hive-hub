
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, Link, Play, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VideoData {
  title: string;
  description: string;
  video_url: string;
  video_type: 'upload' | 'youtube' | 'vimeo';
  tags: string[];
  visibility: 'draft' | 'published';
  course_id?: string;
  module_id?: string;
  duration?: number;
}

export const VideoUpload = () => {
  const [videoData, setVideoData] = useState<VideoData>({
    title: '',
    description: '',
    video_url: '',
    video_type: 'upload',
    tags: [],
    visibility: 'draft'
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
      const filePath = `videos/${fileName}`;

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

      setVideoData(prev => ({ 
        ...prev, 
        video_url: data.publicUrl,
        video_type: 'upload'
      }));

      toast({
        title: "Success",
        description: "Video uploaded successfully",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload video",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        handleFileUpload(file);
      } else {
        toast({
          title: "Error",
          description: "Please select a video file",
          variant: "destructive",
        });
      }
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !videoData.tags.includes(tagInput.trim())) {
      setVideoData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setVideoData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const extractVideoId = (url: string) => {
    // YouTube URL patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return { type: 'youtube', id: youtubeMatch[1] };
    }

    // Vimeo URL patterns
    const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return { type: 'vimeo', id: vimeoMatch[1] };
    }

    return null;
  };

  const handleUrlChange = (url: string) => {
    setVideoData(prev => ({ ...prev, video_url: url }));
    
    const videoInfo = extractVideoId(url);
    if (videoInfo) {
      setVideoData(prev => ({ 
        ...prev, 
        video_type: videoInfo.type as 'youtube' | 'vimeo'
      }));
    }
  };

  const saveVideo = async () => {
    if (!videoData.title || !videoData.video_url) {
      toast({
        title: "Error",
        description: "Please fill in title and video URL",
        variant: "destructive",
      });
      return;
    }

    try {
      // Here you would save to your database
      console.log('Saving video:', videoData);
      
      toast({
        title: "Success",
        description: "Video saved successfully",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save video",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Video Content</CardTitle>
          <CardDescription>
            Upload video files or add links from YouTube, Vimeo, or other platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Video Upload Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="video-file">Upload Video File</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    id="video-file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('video-file')?.click()}
                    disabled={uploading}
                    className="w-full h-32 border-dashed"
                  >
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {uploading ? 'Uploading...' : 'Click to upload video'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        MP4, WebM, AVI up to 500MB
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
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="video-url">Or paste video URL</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="video-url"
                    type="url"
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                    value={videoData.video_url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                  />
                  <Button variant="outline" size="icon">
                    <Link className="h-4 w-4" />
                  </Button>
                </div>
                {videoData.video_type !== 'upload' && videoData.video_url && (
                  <Badge variant="outline" className="mt-2">
                    {videoData.video_type === 'youtube' ? 'YouTube' : 'Vimeo'} video detected
                  </Badge>
                )}
              </div>

              {videoData.video_url && (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Play className="h-4 w-4" />
                    <span className="text-sm font-medium">Video Preview</span>
                  </div>
                  <div className="aspect-video bg-black rounded-md flex items-center justify-center">
                    <Play className="h-12 w-12 text-white opacity-50" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Video Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Video Title</Label>
              <Input
                id="title"
                value={videoData.title}
                onChange={(e) => setVideoData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a descriptive title for your video"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={videoData.description}
                onChange={(e) => setVideoData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what viewers will learn from this video"
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
                  placeholder="Add tags (e.g., GIS, Tutorial, Beginner)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              {videoData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {videoData.tags.map((tag) => (
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
                  value={videoData.visibility}
                  onValueChange={(value: 'draft' | 'published') => 
                    setVideoData(prev => ({ ...prev, visibility: value }))
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
            <Button variant="outline">Save as Draft</Button>
            <Button onClick={saveVideo}>
              <Save className="h-4 w-4 mr-2" />
              Save Video
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
