import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ResumeUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (data: { resumeId: string; careerGoal: string; weeklyTime: string }) => void;
}

const careerGoals = [
  { value: 'geoai-engineer', label: 'GeoAI Engineer' },
  { value: 'fullstack-developer', label: 'Fullstack Developer' },
  { value: 'remote-freelancer', label: 'Remote Freelancer' },
  { value: 'gis-analyst', label: 'GIS Analyst' },
  { value: 'data-scientist', label: 'Geospatial Data Scientist' }
];

const weeklyTimeOptions = [
  { value: '1-hour', label: '1 hour/day (7 hours/week)' },
  { value: '2-hours', label: '2 hours/day (14 hours/week)' },
  { value: 'flexible', label: 'Flexible schedule' },
  { value: 'intensive', label: 'Intensive (20+ hours/week)' }
];

export const ResumeUploadModal: React.FC<ResumeUploadModalProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [careerGoal, setCareerGoal] = useState('');
  const [weeklyTime, setWeeklyTime] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [resumeId, setResumeId] = useState<string>('');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 10485760, // 10MB in bytes
    onDrop: (acceptedFiles, fileRejections) => {
      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        if (rejection.errors.find(e => e.code === 'file-too-large')) {
          toast({
            title: "File Too Large",
            description: "Please select a file smaller than 10MB.",
            variant: "destructive"
          });
        } else if (rejection.errors.find(e => e.code === 'file-invalid-type')) {
          toast({
            title: "Invalid File Type",
            description: "Please select a PDF, DOC, or DOCX file.",
            variant: "destructive"
          });
        }
        return;
      }
      
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        // Additional validation
        if (file.size > 10485760) {
          toast({
            title: "File Too Large",
            description: "Please select a file smaller than 10MB.",
            variant: "destructive"
          });
          return;
        }
        setUploadedFile(file);
        setStep(2);
      }
    }
  });

  const handleUploadResume = async () => {
    if (!uploadedFile || !user) return;

    setIsUploading(true);
    try {
      // Upload file to storage
      const fileName = `${user.id}/${Date.now()}_${uploadedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-resumes')
        .upload(fileName, uploadedFile);

      if (uploadError) throw uploadError;

      // Create resume record with correct schema (temporary type assertion until types regenerate)
      const { data: resumeData, error: resumeError } = await supabase
        .from('user_resumes')
        .insert({
          user_id: user.id,
          file_name: uploadedFile.name,
          file_path: uploadData.path,
          file_size: uploadedFile.size,
          file_type: uploadedFile.type,
          uploaded_at: new Date().toISOString()
        } as any)
        .select()
        .single();

      if (resumeError) throw resumeError;

      setResumeId(resumeData.id);
      
      // Start resume analysis
      const { error: analysisError } = await supabase.functions.invoke('analyze-resume', {
        body: { resumeId: resumeData.id, userId: user.id }
      });

      if (analysisError) {
        console.warn('Resume analysis failed:', analysisError);
        // Continue anyway as we can still generate plans
      }

      setStep(3);
    } catch (error: any) {
      console.error('Error uploading resume:', error);
      
      let errorMessage = "Failed to upload resume. Please try again.";
      
      if (error?.message?.includes('File size')) {
        errorMessage = "File is too large. Please select a file smaller than 10MB.";
      } else if (error?.message?.includes('file type')) {
        errorMessage = "Invalid file type. Please select a PDF, DOC, or DOCX file.";
      } else if (error?.message?.includes('storage')) {
        errorMessage = "Storage error. Please check your connection and try again.";
      } else if (error?.message?.includes('user_resumes')) {
        errorMessage = "Database error. Please contact support if this persists.";
      }
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!careerGoal || !weeklyTime) {
      toast({
        title: "Missing Information",
        description: "Please select both career goal and weekly time commitment.",
        variant: "destructive"
      });
      return;
    }

    onSuccess({ resumeId, careerGoal, weeklyTime });
    onOpenChange(false);
    resetModal();
  };

  const resetModal = () => {
    setStep(1);
    setUploadedFile(null);
    setCareerGoal('');
    setWeeklyTime('');
    setResumeId('');
  };

  const handleClose = () => {
    onOpenChange(false);
    resetModal();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create Your Personalized Learning Plan
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center text-muted-foreground">
              Upload your resume to get a personalized 7-day study plan
            </div>
            
            <Card className="border-2 border-dashed border-primary/20">
              <CardContent className="p-8">
                <div {...getRootProps()} className="cursor-pointer text-center space-y-4">
                  <input {...getInputProps()} />
                  <Upload className="h-12 w-12 text-primary mx-auto" />
                  <div>
                    <p className="text-lg font-medium">
                      {isDragActive ? 'Drop your resume here' : 'Upload Your Resume'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports PDF, DOC, DOCX (max 10MB)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {uploadedFile && (
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUploadedFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <FileText className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Resume Ready!</h3>
              <p className="text-muted-foreground">Now let's customize your learning plan</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Career Goal</label>
                <Select value={careerGoal} onValueChange={setCareerGoal}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your target career" />
                  </SelectTrigger>
                  <SelectContent>
                    {careerGoals.map((goal) => (
                      <SelectItem key={goal.value} value={goal.value}>
                        {goal.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Weekly Learning Time</label>
                <Select value={weeklyTime} onValueChange={setWeeklyTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="How much time can you dedicate?" />
                  </SelectTrigger>
                  <SelectContent>
                    {weeklyTimeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleUploadResume}
                disabled={!careerGoal || !weeklyTime || isUploading}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Generate Plan'
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Perfect! 🎯</h3>
                <p className="text-muted-foreground">
                  Your resume has been analyzed and your personalized plan is being generated.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>✅ Resume uploaded and analyzed</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>✅ Career goal: {careerGoals.find(g => g.value === careerGoal)?.label}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>✅ Schedule: {weeklyTimeOptions.find(t => t.value === weeklyTime)?.label}</span>
              </div>
            </div>

            <Button onClick={handleSubmit} className="w-full">
              Create My Learning Plan
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};