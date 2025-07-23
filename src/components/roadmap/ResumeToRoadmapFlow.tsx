import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, Loader2, Download, Mail, Calendar, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ResumeToRoadmapFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ExtractedData {
  personalInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  currentRole?: string;
  skills?: string[];
  gisTools?: string[];
  programmingLanguages?: string[];
  careerStage?: string;
  keyStrengths?: string[];
  improvementAreas?: string[];
  followUpQuestions?: string[];
}

interface RoadmapData {
  roadmapTitle?: string;
  targetRole?: string;
  estimatedTimeToGoal?: string;
  months?: Array<{
    month: number;
    focus: string;
    weeklyGoals: Array<{
      week: number;
      theme: string;
      dailyTasks: Array<{
        day: string;
        tasks: Array<{
          type: string;
          task: string;
          duration: string;
          resources: string[];
        }>;
      }>;
    }>;
  }>;
  skillsToAcquire?: string[];
  toolsToMaster?: string[];
  projectMilestones?: string[];
  certificationTargets?: string[];
}

export const ResumeToRoadmapFlow: React.FC<ResumeToRoadmapFlowProps> = ({
  open,
  onOpenChange
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'questions' | 'roadmap'>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resumeId, setResumeId] = useState<string>('');
  const [extractedData, setExtractedData] = useState<ExtractedData>({});
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, string>>({});
  const [roadmapData, setRoadmapData] = useState<RoadmapData>({});

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 10485760, // 10MB
    onDrop: async (acceptedFiles, fileRejections) => {
      if (fileRejections.length > 0) {
        toast({
          title: "File Upload Error",
          description: "Please upload a PDF, DOC, or DOCX file under 10MB.",
          variant: "destructive"
        });
        return;
      }
      
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setUploadedFile(file);
        await uploadAndAnalyzeResume(file);
      }
    }
  });

  const uploadAndAnalyzeResume = async (file: File) => {
    if (!user) return;

    setIsAnalyzing(true);
    try {
      // Upload file to storage
      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-resumes')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create resume record
      const { data: resumeData, error: resumeError } = await supabase
        .from('user_resumes')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          file_type: file.type,
          uploaded_at: new Date().toISOString(),
          file_url: uploadData.path
        } as any)
        .select()
        .single();

      if (resumeError) throw resumeError;

      setResumeId(resumeData.id);
      
      // Analyze resume
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-resume', {
        body: { resumeId: resumeData.id, userId: user.id }
      });

      if (analysisError) throw analysisError;

      if (analysisData.success) {
        setExtractedData(analysisData.extractedData);
        setCurrentStep('preview');
        toast({
          title: "Resume Analyzed Successfully!",
          description: "Your resume has been processed. Review the extracted information.",
        });
      } else {
        throw new Error(analysisData.error || 'Failed to analyze resume');
      }
    } catch (error: any) {
      console.error('Error uploading/analyzing resume:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFollowUpAnswers = async () => {
    if (!user || !resumeId) return;

    try {
      // Save follow-up answers
      const { error } = await supabase
        .from('resume_follow_up_questions')
        .update({ responses: followUpAnswers })
        .eq('resume_id', resumeId)
        .eq('user_id', user.id);

      if (error) throw error;

      setCurrentStep('roadmap');
      await generateRoadmap();
    } catch (error: any) {
      toast({
        title: "Error Saving Responses",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const generateRoadmap = async () => {
    if (!user || !resumeId) return;

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-roadmap', {
        body: { resumeId, userId: user.id }
      });

      if (error) throw error;

      if (data.success) {
        // Fetch the generated roadmap
        const { data: roadmapRecord, error: fetchError } = await supabase
          .from('career_roadmaps')
          .select('*')
          .eq('id', data.roadmapId)
          .single();

        if (fetchError) throw fetchError;

        // Handle different roadmap data structures
        let parsedRoadmap: RoadmapData = {};
        
        if (roadmapRecord.roadmap_data) {
          if (typeof roadmapRecord.roadmap_data === 'string') {
            try {
              parsedRoadmap = JSON.parse(roadmapRecord.roadmap_data);
            } catch {
              parsedRoadmap = { roadmapTitle: roadmapRecord.roadmap_data };
            }
          } else if (typeof roadmapRecord.roadmap_data === 'object' && roadmapRecord.roadmap_data !== null) {
            // Check if it has a content property (old format)
            const roadmapObj = roadmapRecord.roadmap_data as any;
            if (roadmapObj.content) {
              if (typeof roadmapObj.content === 'string') {
                try {
                  parsedRoadmap = JSON.parse(roadmapObj.content);
                } catch {
                  parsedRoadmap = { roadmapTitle: roadmapObj.content };
                }
              } else {
                parsedRoadmap = roadmapObj.content;
              }
            } else {
              // Direct roadmap object
              parsedRoadmap = roadmapObj;
            }
          }
        }
        
        setRoadmapData(parsedRoadmap);

        toast({
          title: "Roadmap Generated!",
          description: "Your personalized 6-month learning roadmap is ready.",
        });
      } else {
        throw new Error(data.error || 'Failed to generate roadmap');
      }
    } catch (error: any) {
      console.error('Error generating roadmap:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate roadmap. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadRoadmapPDF = () => {
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${roadmapData.roadmapTitle || 'Career Roadmap'}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #2563eb; }
          h2 { color: #1e40af; margin-top: 30px; }
          .month { margin: 20px 0; padding: 15px; border: 1px solid #e5e7eb; }
          .week { margin-left: 20px; }
          .task { margin-left: 40px; }
        </style>
      </head>
      <body>
        <h1>${roadmapData.roadmapTitle || 'Career Development Roadmap'}</h1>
        <p><strong>Target Role:</strong> ${roadmapData.targetRole || 'Not specified'}</p>
        <p><strong>Timeline:</strong> ${roadmapData.estimatedTimeToGoal || '6 months'}</p>
        
        <h2>Skills to Acquire</h2>
        <ul>${roadmapData.skillsToAcquire?.map(skill => `<li>${skill}</li>`).join('') || '<li>No specific skills listed</li>'}</ul>
        
        <h2>Tools to Master</h2>
        <ul>${roadmapData.toolsToMaster?.map(tool => `<li>${tool}</li>`).join('') || '<li>No specific tools listed</li>'}</ul>
        
        <h2>Monthly Breakdown</h2>
        ${roadmapData.months?.map(month => `
          <div class="month">
            <h3>Month ${month.month}: ${month.focus}</h3>
            ${month.weeklyGoals?.map(week => `
              <div class="week">
                <h4>Week ${week.week}: ${week.theme}</h4>
              </div>
            `).join('') || ''}
          </div>
        `).join('') || '<p>No detailed monthly breakdown available</p>'}
      </body>
      </html>
    `;

    const blob = new Blob([content], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'career-roadmap.html';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetFlow = () => {
    setCurrentStep('upload');
    setUploadedFile(null);
    setResumeId('');
    setExtractedData({});
    setFollowUpAnswers({});
    setRoadmapData({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            AI-Powered Career Roadmap Generator
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Upload Resume */}
        {currentStep === 'upload' && (
          <div className="space-y-6">
            <div className="text-center text-muted-foreground">
              Upload your resume to get a personalized 6-month career roadmap
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
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {isAnalyzing && <Loader2 className="h-5 w-5 animate-spin" />}
              </div>
            )}

            {isAnalyzing && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Analyzing your resume with AI...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Preview Extracted Data */}
        {currentStep === 'preview' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>Resume analysis complete!</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Name:</strong> {extractedData.personalInfo?.name || 'Not found'}</p>
                  <p><strong>Current Role:</strong> {extractedData.currentRole || 'Not specified'}</p>
                  <p><strong>Career Stage:</strong> {extractedData.careerStage || 'Not determined'}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Skills & Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <strong>GIS Tools:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {extractedData.gisTools?.map((tool, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">{tool}</Badge>
                      )) || <span className="text-muted-foreground">None identified</span>}
                    </div>
                  </div>
                  <div>
                    <strong>Programming:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {extractedData.programmingLanguages?.map((lang, index) => (
                        <Badge key={index} variant="outline" className="text-xs">{lang}</Badge>
                      )) || <span className="text-muted-foreground">None identified</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep('upload')}>
                Upload Different Resume
              </Button>
              <Button onClick={() => setCurrentStep('questions')} className="flex-1">
                Continue to Questions
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Follow-up Questions */}
        {currentStep === 'questions' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Help us personalize your roadmap</h3>
              <p className="text-muted-foreground">Answer these questions to get the most relevant career guidance</p>
            </div>

            <div className="space-y-4">
              {extractedData.followUpQuestions?.map((question, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`question-${index}`}>{question}</Label>
                  <Textarea
                    id={`question-${index}`}
                    placeholder="Your answer..."
                    value={followUpAnswers[question] || ''}
                    onChange={(e) => setFollowUpAnswers(prev => ({
                      ...prev,
                      [question]: e.target.value
                    }))}
                  />
                </div>
              )) || (
                <div className="text-center text-muted-foreground">
                  No follow-up questions were generated. You can proceed to generate your roadmap.
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep('preview')}>
                Back to Preview
              </Button>
              <Button onClick={handleFollowUpAnswers} className="flex-1">
                Generate My Roadmap
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Generated Roadmap */}
        {currentStep === 'roadmap' && (
          <div className="space-y-6">
            {isGenerating ? (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Generating Your Personalized Roadmap</h3>
                <p className="text-muted-foreground">This may take a few moments...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{roadmapData.roadmapTitle || 'Your Career Roadmap'}</h3>
                    <p className="text-muted-foreground">Target: {roadmapData.targetRole || 'Professional Growth'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={downloadRoadmapPDF}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Skills to Acquire</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {roadmapData.skillsToAcquire?.map((skill, index) => (
                          <Badge key={index} className="text-xs">{skill}</Badge>
                        )) || <span className="text-muted-foreground">No specific skills listed</span>}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Tools to Master</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {roadmapData.toolsToMaster?.map((tool, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">{tool}</Badge>
                        )) || <span className="text-muted-foreground">No specific tools listed</span>}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>6-Month Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {roadmapData.months?.length ? (
                      <div className="space-y-4">
                        {roadmapData.months.map((month, index) => (
                          <div key={index} className="border-l-2 border-primary pl-4">
                            <h4 className="font-semibold">Month {month.month}: {month.focus}</h4>
                            <p className="text-sm text-muted-foreground">
                              {month.weeklyGoals?.length || 0} weekly goals planned
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Detailed timeline will be generated based on your specific needs.</p>
                    )}
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={resetFlow}>
                    Generate New Roadmap
                  </Button>
                  <Button onClick={() => onOpenChange(false)}>
                    Done
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};