
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Upload, FileVideo, FileText, Link, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const ContentUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const [lessonData, setLessonData] = useState({
    title: '',
    content: '',
    video_url: '',
    lesson_type: 'video',
    duration: 0
  });

  const handleFileUpload = async (file: File) => {
    if (!file) return null;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('course-content')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('course-content')
        .getPublicUrl(filePath);

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });

      return data.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast({
        title: "Error",
        description: "Please select a video file",
        variant: "destructive",
      });
      return;
    }

    const url = await handleFileUpload(file);
    if (url) {
      setLessonData(prev => ({ ...prev, video_url: url }));
    }
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-powerpoint'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Please select a PDF or PowerPoint file",
        variant: "destructive",
      });
      return;
    }

    const url = await handleFileUpload(file);
    if (url) {
      // Handle document URL storage
      console.log('Document uploaded:', url);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Content Upload</h2>
        <p className="text-muted-foreground">Upload videos, documents, and create lessons</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileVideo className="h-5 w-5" />
              Video Upload
            </CardTitle>
            <CardDescription>
              Upload video files or provide external links
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  disabled={isUploading}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Choose Video File'}
                </Button>
              </div>
            </div>

            <div className="text-center text-muted-foreground">or</div>

            <div>
              <Label htmlFor="video-url">Video URL (YouTube, Vimeo, etc.)</Label>
              <Input
                id="video-url"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={lessonData.video_url}
                onChange={(e) => setLessonData(prev => ({ ...prev, video_url: e.target.value }))}
              />
            </div>

            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} />
                <p className="text-sm text-muted-foreground text-center">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Upload
            </CardTitle>
            <CardDescription>
              Upload PDFs, slides, or other learning materials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="document-file">Upload Document</Label>
              <div className="mt-2">
                <input
                  type="file"
                  id="document-file"
                  accept=".pdf,.ppt,.pptx,.doc,.docx"
                  onChange={handleDocumentUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('document-file')?.click()}
                  disabled={isUploading}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Document
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Supported formats:</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-muted px-2 py-1 rounded">PDF</span>
                <span className="text-xs bg-muted px-2 py-1 rounded">PowerPoint</span>
                <span className="text-xs bg-muted px-2 py-1 rounded">Word</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lesson Creation */}
      <Card>
        <CardHeader>
          <CardTitle>Create Lesson</CardTitle>
          <CardDescription>
            Add lesson details and content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="lesson-title">Lesson Title</Label>
            <Input
              id="lesson-title"
              value={lessonData.title}
              onChange={(e) => setLessonData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter lesson title"
            />
          </div>

          <div>
            <Label htmlFor="lesson-content">Lesson Content</Label>
            <Textarea
              id="lesson-content"
              value={lessonData.content}
              onChange={(e) => setLessonData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Enter lesson description and notes"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lesson-type">Lesson Type</Label>
              <select
                id="lesson-type"
                className="w-full p-2 border rounded-md"
                value={lessonData.lesson_type}
                onChange={(e) => setLessonData(prev => ({ ...prev, lesson_type: e.target.value }))}
              >
                <option value="video">Video</option>
                <option value="document">Document</option>
                <option value="text">Text</option>
                <option value="quiz">Quiz</option>
              </select>
            </div>
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={lessonData.duration}
                onChange={(e) => setLessonData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline">Save as Draft</Button>
            <Button>Publish Lesson</Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Upload</CardTitle>
          <CardDescription>
            Upload multiple files or use CSV for bulk content creation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Upload className="h-6 w-6 mb-2" />
              Bulk File Upload
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="h-6 w-6 mb-2" />
              CSV Import
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Upload multiple files at once or use a CSV template to create courses and lessons in bulk.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
