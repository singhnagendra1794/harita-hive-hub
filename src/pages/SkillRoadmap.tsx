import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Target, Clock, BookOpen, Loader2, CheckCircle, ArrowRight, Upload, FileText, Sparkles } from 'lucide-react';
import { ResumeToRoadmapFlow } from '@/components/roadmap/ResumeToRoadmapFlow';
import { ComprehensiveRoadmapDisplay } from '@/components/roadmap/ComprehensiveRoadmapDisplay';


interface RoadmapStep {
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  category: string;
  resources: string[];
  order: number;
}

const SkillRoadmap = () => {
  const [formData, setFormData] = useState({
    fieldOfInterest: '',
    skillLevel: '',
    careerGoal: ''
  });
  const [roadmap, setRoadmap] = useState<RoadmapStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'form' | 'roadmap'>('upload');
  const [showResumeFlow, setShowResumeFlow] = useState(false);
  const [comprehensiveRoadmap, setComprehensiveRoadmap] = useState<any>(null);
  const { toast } = useToast();

  const fieldOptions = [
    'Urban Planning & Smart Cities',
    'Agricultural & Food Security',
    'Disaster Management & Emergency Response',
    'Climate Change & Environmental Monitoring',
    'Natural Resource Management',
    'Transportation & Logistics',
    'Public Health & Epidemiology',
    'Archaeology & Cultural Heritage'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'].includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or Word document.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    setResumeFile(file);
    await uploadAndAnalyzeResume(file);
  };

  const uploadAndAnalyzeResume = async (file: File) => {
    setIsAnalyzing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to upload your resume.",
          variant: "destructive"
        });
        return;
      }

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
          uploaded_at: new Date().toISOString()
        } as any)
        .select()
        .single();

      if (resumeError) throw resumeError;

      setResumeId(resumeData.id);

      // Analyze resume
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-resume', {
        body: {
          resumeId: resumeData.id,
          userId: user.id
        }
      });

      if (analysisError) throw analysisError;

      if (analysisData.success) {
        setCurrentStep('form');
        toast({
          title: "Resume Analyzed!",
          description: "Your resume has been processed. Now provide additional details.",
        });
      } else {
        throw new Error(analysisData.error || 'Failed to analyze resume');
      }
    } catch (error: any) {
      console.error('Error uploading/analyzing resume:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload and analyze resume. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateRoadmap = async () => {
    if (!formData.fieldOfInterest || !formData.skillLevel || !formData.careerGoal) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to generate your roadmap.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to generate your learning roadmap.",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-roadmap', {
        body: {
          resumeId: resumeId,
          userId: user.id
        }
      });

      if (error) throw error;

      if (data.success && data.roadmap) {
        setComprehensiveRoadmap(data.roadmap);
        setCurrentStep('roadmap');
        toast({
          title: "Roadmap Generated!",
          description: "Your comprehensive personalized learning roadmap is ready.",
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
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'theory': return <BookOpen className="h-4 w-4" />;
      case 'practical': return <Target className="h-4 w-4" />;
      case 'project': return <MapPin className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'theory': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'practical': return 'bg-green-100 text-green-800 border-green-200';
      case 'project': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'intermediate': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              AI-Powered Career Roadmap
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Upload your resume and get a personalized learning roadmap based on your experience and career goals
            </p>
            <div className="mt-8">
              <Button 
                onClick={() => setShowResumeFlow(true)}
                size="lg"
                className="bg-gradient-to-r from-primary to-primary-foreground text-primary-foreground hover:opacity-90"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Generate AI Roadmap from Resume
              </Button>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="flex items-center justify-center space-x-8">
              <div className={`flex items-center ${currentStep === 'upload' ? 'text-primary' : 
                ['form', 'roadmap'].includes(currentStep) ? 'text-green-600' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  currentStep === 'upload' ? 'border-primary bg-primary text-primary-foreground' :
                  ['form', 'roadmap'].includes(currentStep) ? 'border-green-600 bg-green-600 text-white' :
                  'border-muted-foreground'
                }`}>
                  {['form', 'roadmap'].includes(currentStep) ? <CheckCircle className="h-4 w-4" /> : '1'}
                </div>
                <span className="ml-2 font-medium">Upload Resume</span>
              </div>
              
              <div className={`flex items-center ${currentStep === 'form' ? 'text-primary' : 
                currentStep === 'roadmap' ? 'text-green-600' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  currentStep === 'form' ? 'border-primary bg-primary text-primary-foreground' :
                  currentStep === 'roadmap' ? 'border-green-600 bg-green-600 text-white' :
                  'border-muted-foreground'
                }`}>
                  {currentStep === 'roadmap' ? <CheckCircle className="h-4 w-4" /> : '2'}
                </div>
                <span className="ml-2 font-medium">Additional Details</span>
              </div>
              
              <div className={`flex items-center ${currentStep === 'roadmap' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  currentStep === 'roadmap' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
                }`}>
                  3
                </div>
                <span className="ml-2 font-medium">Get Roadmap</span>
              </div>
            </div>
          </div>

          {/* Step Content */}
          {currentStep === 'upload' && (
            <div className="max-w-2xl mx-auto animate-fade-in">
              <Card className="shadow-lg border-0 bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    Upload Your Resume
                  </CardTitle>
                  <CardDescription>
                    Upload your resume to get a personalized career roadmap based on your experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-primary/10 rounded-full">
                        <FileText className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-2">Choose your resume file</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Supports PDF, DOC, and DOCX files up to 10MB
                        </p>
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileUpload}
                          disabled={isAnalyzing}
                          className="max-w-xs mx-auto"
                        />
                      </div>
                    </div>
                  </div>

                  {resumeFile && (
                    <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">{resumeFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      {isAnalyzing && <Loader2 className="h-5 w-5 animate-spin" />}
                    </div>
                  )}

                  {isAnalyzing && (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-primary">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Analyzing your resume...</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 'form' && (
            <div className="max-w-2xl mx-auto animate-fade-in">
              <Card className="shadow-lg border-0 bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Tell Us About Your Goals
                  </CardTitle>
                  <CardDescription>
                    Provide additional details to customize your learning roadmap
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="field">Field of Interest</Label>
                    <Select onValueChange={(value) => handleInputChange('fieldOfInterest', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your area of interest" />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldOptions.map((field) => (
                          <SelectItem key={field} value={field}>
                            {field}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skill-level">Current Skill Level</Label>
                    <Select onValueChange={(value) => handleInputChange('skillLevel', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your current level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner - New to GIS/Geospatial</SelectItem>
                        <SelectItem value="intermediate">Intermediate - Some experience</SelectItem>
                        <SelectItem value="advanced">Advanced - Experienced professional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="career-goal">Career Goal</Label>
                    <Textarea
                      id="career-goal"
                      placeholder="Describe your career goals and what you want to achieve..."
                      value={formData.careerGoal}
                      onChange={(e) => handleInputChange('careerGoal', e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <Button 
                    onClick={generateRoadmap} 
                    disabled={isLoading}
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Your Roadmap...
                      </>
                    ) : (
                      <>
                        Generate My Roadmap
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep('upload')}
                    className="w-full"
                  >
                    Back to Resume Upload
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 'roadmap' && comprehensiveRoadmap && (
            <ComprehensiveRoadmapDisplay roadmap={comprehensiveRoadmap} />
          )}

          {currentStep === 'roadmap' && !comprehensiveRoadmap && (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">Loading your roadmap...</p>
            </div>
          )}

          {/* Resume to Roadmap Flow */}
          <ResumeToRoadmapFlow 
            open={showResumeFlow} 
            onOpenChange={setShowResumeFlow}
          />
        </div>
      </div>
  );
};

export default SkillRoadmap;