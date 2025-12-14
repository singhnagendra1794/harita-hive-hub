import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLMSData, TeacherBatch } from '@/hooks/useLMSData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Video, 
  FileText, 
  Plus, 
  Calendar,
  Upload,
  GraduationCap
} from 'lucide-react';
import { format } from 'date-fns';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const { teacherBatches, loading, fetchTeacherBatches } = useLMSData();
  const { toast } = useToast();
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [showAddSession, setShowAddSession] = useState(false);
  const [showAddRecording, setShowAddRecording] = useState(false);
  const [showAddMaterial, setShowAddMaterial] = useState(false);

  // Session form state
  const [sessionForm, setSessionForm] = useState({
    title: '',
    description: '',
    scheduled_at: '',
    duration_minutes: 60,
    meeting_link: '',
    meeting_platform: 'zoom'
  });

  // Recording form state
  const [recordingForm, setRecordingForm] = useState({
    title: '',
    description: '',
    video_url: '',
    video_platform: 'youtube',
    duration_seconds: 0
  });

  // Material form state
  const [materialForm, setMaterialForm] = useState({
    title: '',
    description: '',
    file_url: '',
    file_type: '',
    category: 'notes'
  });

  const handleAddLiveSession = async () => {
    if (!selectedBatch || !user) return;

    try {
      const { error } = await supabase
        .from('batch_live_sessions')
        .insert({
          batch_id: selectedBatch,
          title: sessionForm.title,
          description: sessionForm.description,
          scheduled_at: sessionForm.scheduled_at,
          duration_minutes: sessionForm.duration_minutes,
          meeting_link: sessionForm.meeting_link,
          meeting_platform: sessionForm.meeting_platform,
          created_by: user.id,
          status: 'scheduled'
        });

      if (error) throw error;

      toast({
        title: "Session Created",
        description: "Live session has been scheduled successfully."
      });

      setShowAddSession(false);
      setSessionForm({
        title: '',
        description: '',
        scheduled_at: '',
        duration_minutes: 60,
        meeting_link: '',
        meeting_platform: 'zoom'
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleAddRecording = async () => {
    if (!selectedBatch) return;

    try {
      const { error } = await supabase
        .from('batch_recordings')
        .insert({
          batch_id: selectedBatch,
          title: recordingForm.title,
          description: recordingForm.description,
          video_url: recordingForm.video_url,
          video_platform: recordingForm.video_platform,
          duration_seconds: recordingForm.duration_seconds || null,
          is_available: true
        });

      if (error) throw error;

      toast({
        title: "Recording Added",
        description: "Recording has been added to the batch."
      });

      setShowAddRecording(false);
      setRecordingForm({
        title: '',
        description: '',
        video_url: '',
        video_platform: 'youtube',
        duration_seconds: 0
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleAddMaterial = async () => {
    if (!selectedBatch || !user) return;

    try {
      const { error } = await supabase
        .from('batch_study_materials')
        .insert({
          batch_id: selectedBatch,
          title: materialForm.title,
          description: materialForm.description,
          file_url: materialForm.file_url,
          file_type: materialForm.file_type,
          category: materialForm.category,
          uploaded_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Material Added",
        description: "Study material has been uploaded successfully."
      });

      setShowAddMaterial(false);
      setMaterialForm({
        title: '',
        description: '',
        file_url: '',
        file_type: '',
        category: 'notes'
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (teacherBatches.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Batches Assigned</h3>
          <p className="text-muted-foreground">
            You haven't been assigned to any batches yet. Contact the admin for batch assignments.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Teacher Dashboard</h2>
        <Badge variant="outline" className="text-sm">
          {teacherBatches.length} Batch{teacherBatches.length > 1 ? 'es' : ''} Assigned
        </Badge>
      </div>

      {/* Batch Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teacherBatches.map((batch) => (
          <Card 
            key={batch.batch_id}
            className={`cursor-pointer transition-all ${
              selectedBatch === batch.batch_id 
                ? 'border-primary shadow-lg' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedBatch(batch.batch_id)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{batch.batch_name}</CardTitle>
              <CardDescription>{batch.course_title}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {batch.student_count || 0} students
                </span>
                {batch.start_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(batch.start_date), 'MMM d')}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      {selectedBatch && (
        <Card>
          <CardHeader>
            <CardTitle>Batch Management</CardTitle>
            <CardDescription>
              Add content for {teacherBatches.find(b => b.batch_id === selectedBatch)?.batch_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Add Live Session */}
              <Dialog open={showAddSession} onOpenChange={setShowAddSession}>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6 text-center">
                      <Video className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <h4 className="font-semibold">Schedule Live Session</h4>
                      <p className="text-sm text-muted-foreground">
                        Create a new live class
                      </p>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Schedule Live Session</DialogTitle>
                    <DialogDescription>
                      Add a new live session for this batch
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Title</Label>
                      <Input 
                        value={sessionForm.title}
                        onChange={(e) => setSessionForm({...sessionForm, title: e.target.value})}
                        placeholder="Session title"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea 
                        value={sessionForm.description}
                        onChange={(e) => setSessionForm({...sessionForm, description: e.target.value})}
                        placeholder="Session description"
                      />
                    </div>
                    <div>
                      <Label>Date & Time</Label>
                      <Input 
                        type="datetime-local"
                        value={sessionForm.scheduled_at}
                        onChange={(e) => setSessionForm({...sessionForm, scheduled_at: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Duration (minutes)</Label>
                      <Input 
                        type="number"
                        value={sessionForm.duration_minutes}
                        onChange={(e) => setSessionForm({...sessionForm, duration_minutes: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label>Meeting Platform</Label>
                      <Select 
                        value={sessionForm.meeting_platform}
                        onValueChange={(value) => setSessionForm({...sessionForm, meeting_platform: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="zoom">Zoom</SelectItem>
                          <SelectItem value="google_meet">Google Meet</SelectItem>
                          <SelectItem value="youtube">YouTube Live</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Meeting Link</Label>
                      <Input 
                        value={sessionForm.meeting_link}
                        onChange={(e) => setSessionForm({...sessionForm, meeting_link: e.target.value})}
                        placeholder="https://..."
                      />
                    </div>
                    <Button onClick={handleAddLiveSession} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Session
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Add Recording */}
              <Dialog open={showAddRecording} onOpenChange={setShowAddRecording}>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <h4 className="font-semibold">Upload Recording</h4>
                      <p className="text-sm text-muted-foreground">
                        Add session recording
                      </p>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Upload Recording</DialogTitle>
                    <DialogDescription>
                      Add a recording for this batch
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Title</Label>
                      <Input 
                        value={recordingForm.title}
                        onChange={(e) => setRecordingForm({...recordingForm, title: e.target.value})}
                        placeholder="Recording title"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea 
                        value={recordingForm.description}
                        onChange={(e) => setRecordingForm({...recordingForm, description: e.target.value})}
                        placeholder="Recording description"
                      />
                    </div>
                    <div>
                      <Label>Video URL</Label>
                      <Input 
                        value={recordingForm.video_url}
                        onChange={(e) => setRecordingForm({...recordingForm, video_url: e.target.value})}
                        placeholder="YouTube or video URL"
                      />
                    </div>
                    <div>
                      <Label>Platform</Label>
                      <Select 
                        value={recordingForm.video_platform}
                        onValueChange={(value) => setRecordingForm({...recordingForm, video_platform: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="vimeo">Vimeo</SelectItem>
                          <SelectItem value="s3">AWS S3</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAddRecording} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Recording
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Add Material */}
              <Dialog open={showAddMaterial} onOpenChange={setShowAddMaterial}>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-6 text-center">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <h4 className="font-semibold">Upload Material</h4>
                      <p className="text-sm text-muted-foreground">
                        Add notes or resources
                      </p>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Upload Study Material</DialogTitle>
                    <DialogDescription>
                      Add notes or resources for this batch
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Title</Label>
                      <Input 
                        value={materialForm.title}
                        onChange={(e) => setMaterialForm({...materialForm, title: e.target.value})}
                        placeholder="Material title"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea 
                        value={materialForm.description}
                        onChange={(e) => setMaterialForm({...materialForm, description: e.target.value})}
                        placeholder="Material description"
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select 
                        value={materialForm.category}
                        onValueChange={(value) => setMaterialForm({...materialForm, category: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="notes">Notes</SelectItem>
                          <SelectItem value="slides">Slides</SelectItem>
                          <SelectItem value="assignment">Assignment</SelectItem>
                          <SelectItem value="resource">Resource</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>File URL</Label>
                      <Input 
                        value={materialForm.file_url}
                        onChange={(e) => setMaterialForm({...materialForm, file_url: e.target.value})}
                        placeholder="Link to file"
                      />
                    </div>
                    <div>
                      <Label>File Type</Label>
                      <Input 
                        value={materialForm.file_type}
                        onChange={(e) => setMaterialForm({...materialForm, file_type: e.target.value})}
                        placeholder="pdf, docx, pptx, etc."
                      />
                    </div>
                    <Button onClick={handleAddMaterial} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Material
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeacherDashboard;
