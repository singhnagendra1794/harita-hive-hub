import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Video, 
  Square, 
  Monitor, 
  Mic, 
  MicOff, 
  Settings,
  Download,
  Upload,
  Camera,
  Maximize
} from 'lucide-react';

interface ScreenRecorderProps {
  onComplete: () => void;
}

export const ScreenRecorder: React.FC<ScreenRecorderProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previewRef = useRef<HTMLVideoElement>(null);

  const [recordingSettings, setRecordingSettings] = useState({
    quality: '1080p',
    frameRate: 30,
    audioSource: 'microphone',
    captureArea: 'screen'
  });

  const [videoMetadata, setVideoMetadata] = useState({
    title: '',
    description: '',
    tags: '',
    category: 'tutorial'
  });

  const getDisplayMedia = async () => {
    try {
      const constraints: any = {
        video: {
          width: recordingSettings.quality === '4k' ? 3840 : recordingSettings.quality === '1080p' ? 1920 : 1280,
          height: recordingSettings.quality === '4k' ? 2160 : recordingSettings.quality === '1080p' ? 1080 : 720,
          frameRate: recordingSettings.frameRate
        }
      };

      if (recordingSettings.audioSource !== 'none') {
        constraints.audio = true;
      }

      const displayStream = await navigator.mediaDevices.getDisplayMedia(constraints);
      
      // Add microphone audio if needed
      if (recordingSettings.audioSource === 'microphone' || recordingSettings.audioSource === 'both') {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioTrack = audioStream.getAudioTracks()[0];
        displayStream.addTrack(audioTrack);
      }

      return displayStream;
    } catch (error) {
      console.error('Error accessing display media:', error);
      throw error;
    }
  };

  const startRecording = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to start recording.",
        variant: "destructive"
      });
      return;
    }

    try {
      const stream = await getDisplayMedia();
      streamRef.current = stream;
      
      if (previewRef.current) {
        previewRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stopTimer();
        setIsRecording(false);
        setIsPaused(false);
      };

      mediaRecorder.start(1000); // Record in 1-second chunks
      setIsRecording(true);
      setHasPermission(true);
      startTimer();

      toast({
        title: "Recording Started",
        description: "Your screen recording has begun successfully.",
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Failed",
        description: "Failed to start screen recording. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      toast({
        title: "Recording Stopped",
        description: "Processing your recording...",
      });
    }
  };

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadRecording = () => {
    if (chunksRef.current.length === 0) return;

    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `screen-recording-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: "Your recording is being downloaded.",
    });
  };

  const uploadToStudio = async () => {
    if (chunksRef.current.length === 0 || !user) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const fileName = `screen-recording-${user.id}-${Date.now()}.webm`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('studio-content')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false
        });

      setUploadProgress(100);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('studio-content')
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase
        .from('studio_content')
        .insert({
          user_id: user.id,
          title: videoMetadata.title || `Screen Recording - ${new Date().toLocaleDateString()}`,
          description: videoMetadata.description || 'Screen recording created with HaritaHive Studio',
          content_type: 'video',
          file_url: urlData.publicUrl,
          duration: recordingTime,
          tools_used: ['Screen Recorder'],
          tags: videoMetadata.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          skill_domain: videoMetadata.category,
          is_published: true
        });

      if (dbError) throw dbError;

      toast({
        title: "Upload Successful",
        description: "Your screen recording has been uploaded to your studio!",
      });

      onComplete();
      
      // Reset state
      setRecordingTime(0);
      chunksRef.current = [];
      setVideoMetadata({ title: '', description: '', tags: '', category: 'tutorial' });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload your recording. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Professional Screen Recorder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recording Settings */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Quality</Label>
              <Select 
                value={recordingSettings.quality} 
                onValueChange={(value) => setRecordingSettings(prev => ({ ...prev, quality: value }))}
                disabled={isRecording}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="720p">720p HD</SelectItem>
                  <SelectItem value="1080p">1080p Full HD</SelectItem>
                  <SelectItem value="4k">4K Ultra HD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Frame Rate</Label>
              <Select 
                value={recordingSettings.frameRate.toString()} 
                onValueChange={(value) => setRecordingSettings(prev => ({ ...prev, frameRate: parseInt(value) }))}
                disabled={isRecording}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">24 FPS</SelectItem>
                  <SelectItem value="30">30 FPS</SelectItem>
                  <SelectItem value="60">60 FPS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Audio Source</Label>
              <Select 
                value={recordingSettings.audioSource} 
                onValueChange={(value) => setRecordingSettings(prev => ({ ...prev, audioSource: value }))}
                disabled={isRecording}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Audio</SelectItem>
                  <SelectItem value="microphone">Microphone</SelectItem>
                  <SelectItem value="system">System Audio</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Capture</Label>
              <Select 
                value={recordingSettings.captureArea} 
                onValueChange={(value) => setRecordingSettings(prev => ({ ...prev, captureArea: value }))}
                disabled={isRecording}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="screen">Full Screen</SelectItem>
                  <SelectItem value="window">Application Window</SelectItem>
                  <SelectItem value="tab">Browser Tab</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Recording Controls */}
          <div className="flex items-center justify-center gap-4">
            {!isRecording ? (
              <Button onClick={startRecording} size="lg" className="px-8">
                <Video className="h-5 w-5 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button onClick={stopRecording} size="lg" variant="destructive" className="px-8">
                <Square className="h-5 w-5 mr-2" />
                Stop Recording
              </Button>
            )}
          </div>

          {/* Recording Status */}
          {isRecording && (
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-lg font-mono">{formatTime(recordingTime)}</span>
              </div>
              <Badge variant="secondary">Recording in progress...</Badge>
            </div>
          )}

          {/* Preview */}
          {hasPermission && (
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={previewRef}
                autoPlay
                muted
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading to Studio...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Metadata Form */}
      {chunksRef.current.length > 0 && !isRecording && (
        <Card>
          <CardHeader>
            <CardTitle>Add Video Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={videoMetadata.title}
                onChange={(e) => setVideoMetadata(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Give your recording a descriptive title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={videoMetadata.description}
                onChange={(e) => setVideoMetadata(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this recording demonstrates"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={videoMetadata.tags}
                  onChange={(e) => setVideoMetadata(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="tutorial, gis, analysis"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={videoMetadata.category} onValueChange={(value) => setVideoMetadata(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tutorial">Tutorial</SelectItem>
                    <SelectItem value="analysis">Analysis</SelectItem>
                    <SelectItem value="walkthrough">Walkthrough</SelectItem>
                    <SelectItem value="demo">Demonstration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={downloadRecording} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download Recording
              </Button>
              <Button onClick={uploadToStudio} className="flex-1" disabled={isUploading}>
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload to Studio'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};