import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Brain, 
  PlayCircle, 
  BarChart3, 
  Award, 
  Clock,
  Users,
  CheckCircle,
  ArrowRight,
  Target,
  Calendar,
  BookOpen,
  Code,
  Briefcase,
  RefreshCw,
  ChevronRight,
  MapPin,
  GraduationCap,
  Rocket,
  Download,
  Mail,
  FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import UpgradePrompt from '@/components/premium/UpgradePrompt';
import { SkillQuiz } from '@/components/skill-assessment/SkillQuiz';
import { RadarChart } from '@/components/skill-assessment/RadarChart';
import { SkillRecommendations } from '@/components/skill-assessment/SkillRecommendations';
import { QuizCategory, QuizResult, AssessmentReport } from '@/types/skill-assessment';
import { generateSkillReport } from '@/utils/pdfGenerator';
import { ResumeUploadModal } from '@/components/skill-copilot/ResumeUploadModal';
import { WeeklyPlanModal } from '@/components/skill-copilot/WeeklyPlanModal';
import { useWeeklyPlan } from '@/hooks/useWeeklyPlan';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type ViewMode = 'dashboard' | 'quiz' | 'results';

const SkillCopilot = () => {
  const { user } = useAuth();
  const { hasAccess } = usePremiumAccess();
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | null>(null);
  const [completedResults, setCompletedResults] = useState<QuizResult[]>([]);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isWeeklyPlanModalOpen, setIsWeeklyPlanModalOpen] = useState(false);
  const [roadmapPDFGenerating, setRoadmapPDFGenerating] = useState<string | null>(null);
  
  const {
    weeklyPlan,
    isGenerating: isGeneratingPlan,
    generatePersonalizedPlan,
    downloadPDF,
    emailPlan,
    addToCalendar
  } = useWeeklyPlan();
  
  const hasProAccess = hasAccess('pro');

  // Goal-Based Roadmaps data
  const roadmaps = [
    {
      id: 'fullstack-90',
      title: 'Become a Geospatial Fullstack Developer in 90 Days',
      description: 'Master both frontend and backend geospatial development with modern web technologies',
      duration: '90 Days',
      stages: [
        'Week 1-2: GIS Fundamentals & Python Basics',
        'Week 3-4: PostGIS & Spatial Databases',
        'Week 5-6: Web Mapping with Leaflet & Mapbox',
        'Week 7-8: React & Geospatial APIs',
        'Week 9-10: Backend Development with FastAPI',
        'Week 11-12: Full-Stack Project & Deployment'
      ],
      icon: <Code className="h-6 w-6" />,
      difficulty: 'Intermediate',
      color: 'border-l-blue-500'
    },
    {
      id: 'gis-to-geoai',
      title: 'Transition from GIS Analyst to GeoAI Engineer',
      description: 'Bridge the gap between traditional GIS and modern AI-powered geospatial analysis',
      duration: '120 Days',
      stages: [
        'Week 1-3: Python Programming for GIS',
        'Week 4-6: Machine Learning Fundamentals',
        'Week 7-9: Deep Learning for Remote Sensing',
        'Week 10-12: Computer Vision for Satellite Imagery',
        'Week 13-15: MLOps and Model Deployment',
        'Week 16-17: Portfolio Project & Job Applications'
      ],
      icon: <Brain className="h-6 w-6" />,
      difficulty: 'Advanced',
      color: 'border-l-purple-500'
    },
    {
      id: 'freelance-30',
      title: 'Land a Remote GIS Freelance Project in 30 Days',
      description: 'Build skills, create portfolio, and secure your first remote GIS freelance opportunity',
      duration: '30 Days',
      stages: [
        'Week 1: Portfolio Setup & Skill Assessment',
        'Week 2: Freelance Profile Creation & Networking',
        'Week 3: Project Applications & Client Outreach',
        'Week 4: Interview Preparation & Contract Negotiation'
      ],
      icon: <Briefcase className="h-6 w-6" />,
      difficulty: 'Beginner',
      color: 'border-l-green-500'
    }
  ];

  const handleResumeUploadSuccess = async (data: { resumeId: string; careerGoal: string; weeklyTime: string }) => {
    try {
      await generatePersonalizedPlan(data);
      setIsWeeklyPlanModalOpen(true);
    } catch (error) {
      console.error('Error generating plan:', error);
    }
  };

  const handleAddToRoadmap = async (roadmapId: string) => {
    if (!user) return;
    
    try {
      // Generate roadmap using existing function
      const { data: roadmapData, error } = await supabase.functions.invoke('generate-roadmap', {
        body: {
          resumeId: null, // Can work without resume
          userId: user.id,
          roadmapType: roadmapId
        }
      });

      if (error) throw error;

      toast({
        title: "Roadmap Added! 🎯",
        description: "Your learning roadmap has been generated and saved to your dashboard.",
      });
    } catch (error) {
      console.error('Error adding roadmap:', error);
      toast({
        title: "Error",
        description: "Failed to add roadmap. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadRoadmapPDF = async (roadmapId: string, roadmapTitle: string) => {
    setRoadmapPDFGenerating(roadmapId);
    try {
      const roadmapData = roadmaps.find(r => r.id === roadmapId);
      if (!roadmapData) return;

      const htmlContent = generateRoadmapPDFContent(roadmapData);
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        setTimeout(() => {
          newWindow.print();
        }, 1000);
      }

      toast({
        title: "PDF Generated! 📥",
        description: "Your roadmap PDF is ready for download.",
      });
    } catch (error) {
      console.error('Error generating roadmap PDF:', error);
      toast({
        title: "PDF Generation Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRoadmapPDFGenerating(null);
    }
  };

  const handleEmailRoadmap = async (roadmapId: string) => {
    if (!user?.email) return;

    try {
      const roadmapData = roadmaps.find(r => r.id === roadmapId);
      if (!roadmapData) return;

      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: user.email,
          subject: 'Your HaritaHive Learning Roadmap is Ready!',
          template: 'roadmap',
          data: {
            firstName: user.user_metadata?.first_name || 'there',
            roadmapTitle: roadmapData.title,
            roadmapData: roadmapData
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Email Sent! 📧",
        description: "Your roadmap has been sent to your email.",
      });
    } catch (error) {
      console.error('Error sending roadmap email:', error);
      toast({
        title: "Email Failed",
        description: "Failed to send email. Please try again.",
        variant: "destructive"
      });
    }
  };

  const generateRoadmapPDFContent = (roadmapData: any) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${roadmapData.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
          .roadmap-info { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
          .stage { margin-bottom: 20px; padding: 15px; border-left: 4px solid #2563eb; background: #f9fafb; }
          .stage h3 { margin: 0 0 10px 0; color: #2563eb; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎯 ${roadmapData.title}</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="roadmap-info">
          <h2>Roadmap Overview</h2>
          <p><strong>Duration:</strong> ${roadmapData.duration}</p>
          <p><strong>Difficulty:</strong> ${roadmapData.difficulty}</p>
          <p><strong>Description:</strong> ${roadmapData.description}</p>
        </div>

        <h2>Learning Path</h2>
        ${roadmapData.stages.map((stage: string, index: number) => `
          <div class="stage">
            <h3>Stage ${index + 1}</h3>
            <p>${stage}</p>
          </div>
        `).join('')}

        <div class="footer">
          <p>This roadmap was generated by HaritaHive Skill Copilot</p>
          <p>Continue your learning journey at haritahive.com</p>
        </div>
      </body>
      </html>
    `;
  };

  const categories: { name: QuizCategory; icon: string; description: string; questions: number }[] = [
    {
      name: 'GIS Basics',
      icon: '🗺️',
      description: 'Fundamental GIS concepts and principles',
      questions: 12
    },
    {
      name: 'Remote Sensing',
      icon: '🛰️',
      description: 'Satellite imagery and remote sensing analysis',
      questions: 12
    },
    {
      name: 'Python',
      icon: '🐍',
      description: 'Python programming for geospatial analysis',
      questions: 12
    },
    {
      name: 'SQL',
      icon: '🗄️',
      description: 'Spatial databases and PostGIS',
      questions: 12
    },
    {
      name: 'QGIS',
      icon: '🖥️',
      description: 'QGIS software and geoprocessing',
      questions: 12
    },
    {
      name: 'GeoAI',
      icon: '🤖',
      description: 'Machine learning for geospatial applications',
      questions: 12
    }
  ];

  const startQuiz = (category: QuizCategory) => {
    setSelectedCategory(category);
    setCurrentView('quiz');
  };

  const handleQuizComplete = (result: QuizResult) => {
    setCompletedResults(prev => {
      const filtered = prev.filter(r => r.category !== result.category);
      return [...filtered, result];
    });
    setCurrentView('results');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedCategory(null);
  };

  const generateReport = () => {
    const overallScore = Math.round(
      completedResults.reduce((sum, r) => sum + r.score, 0) / completedResults.length
    );
    
    const strengths = completedResults
      .filter(r => r.score >= 80)
      .map(r => r.category);
    
    const weaknesses = completedResults
      .filter(r => r.score < 60)
      .map(r => r.category);

    const recommendations = completedResults
      .filter(r => r.score < 70)
      .map(r => ({
        skill: r.category,
        currentLevel: r.level,
        targetLevel: (r.level === 'Beginner' ? 'Intermediate' : 'Advanced') as 'Beginner' | 'Intermediate' | 'Advanced',
        courses: [],
        priority: (r.score < 50 ? 'High' : 'Medium') as 'High' | 'Medium' | 'Low'
      }));

    const report: AssessmentReport = {
      overallScore,
      results: completedResults,
      recommendations,
      strengths,
      weaknesses,
      generatedAt: new Date().toISOString()
    };

    generateSkillReport(report);
  };

  if (!hasProAccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <UpgradePrompt 
          feature="Your Geospatial AI Mentor"
          description="Access personalized learning roadmaps, weekly AI coaching, comprehensive skill assessments, and advanced career guidance to accelerate your geospatial career."
        />
      </div>
    );
  }

  if (currentView === 'quiz' && selectedCategory) {
    return (
      <div className="container mx-auto px-4 py-8">
        <SkillQuiz
          category={selectedCategory}
          onComplete={handleQuizComplete}
          onBack={handleBackToDashboard}
        />
      </div>
    );
  }

  if (currentView === 'results') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button onClick={handleBackToDashboard} variant="outline">
            ← Back to Dashboard
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <RadarChart results={completedResults} />
          <div className="lg:col-span-1">
            <SkillRecommendations 
              results={completedResults}
              onDownloadReport={generateReport}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GraduationCap className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold">Your Geospatial AI Mentor</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Accelerate your geospatial career with AI-powered coaching, personalized roadmaps, and comprehensive skill assessments.
          </p>
        </div>

        {/* My Weekly Coach Feature */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle>My Weekly Coach</CardTitle>
                  <CardDescription>
                    Get personalized 7-day study plans with Study-Build-Apply methodology
                  </CardDescription>
                </div>
              </div>
              <Button 
                onClick={() => setIsResumeModalOpen(true)}
                disabled={isGeneratingPlan}
              >
                {isGeneratingPlan ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Get My Weekly Plan
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Goal-Based Roadmaps */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Goal-Based Roadmaps</CardTitle>
                <CardDescription>
                  Choose your career path and follow structured learning journeys
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {roadmaps.map((roadmap) => (
                <Card key={roadmap.id} className={`border-l-4 ${roadmap.color} hover:shadow-md transition-shadow`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          {roadmap.icon}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {roadmap.difficulty}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {roadmap.duration}
                      </div>
                    </div>
                    <CardTitle className="text-lg leading-tight">{roadmap.title}</CardTitle>
                    <CardDescription className="text-sm">{roadmap.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Learning Path:</h4>
                      <div className="space-y-1">
                        {roadmap.stages.slice(0, 3).map((stage, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <ChevronRight className="h-3 w-3" />
                            {stage}
                          </div>
                        ))}
                        {roadmap.stages.length > 3 && (
                          <div className="text-xs text-muted-foreground ml-5">
                            +{roadmap.stages.length - 3} more stages...
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1" 
                          onClick={() => handleAddToRoadmap(roadmap.id)}
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Add to My Roadmap
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1"
                          onClick={() => handleDownloadRoadmapPDF(roadmap.id, roadmap.title)}
                          disabled={roadmapPDFGenerating === roadmap.id}
                        >
                          {roadmapPDFGenerating === roadmap.id ? (
                            <>
                              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Download className="h-3 w-3 mr-1" />
                              PDF
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEmailRoadmap(roadmap.id)}
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          Email
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{completedResults.length}</div>
              <p className="text-sm text-muted-foreground">Assessments Completed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">10</div>
              <p className="text-sm text-muted-foreground">Minutes Per Quiz</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">15K+</div>
              <p className="text-sm text-muted-foreground">Assessments Taken</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {completedResults.length > 0 
                  ? Math.round(completedResults.reduce((sum, r) => sum + r.score, 0) / completedResults.length)
                  : '--'
                }%
              </div>
              <p className="text-sm text-muted-foreground">Average Score</p>
            </CardContent>
          </Card>
        </div>

        {/* Skill Assessment Center */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Skill Assessment Center</CardTitle>
                <CardDescription>
                  Evaluate your geospatial expertise with comprehensive skill assessments. Each quiz contains 12 randomized questions.
                </CardDescription>
              </div>
            </div>  
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => {
                const isCompleted = completedResults.some(r => r.category === category.name);
                const result = completedResults.find(r => r.category === category.name);
                
                return (
                  <Card 
                    key={category.name} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isCompleted ? 'border-green-200 bg-green-50/50' : 'hover:border-primary/50'
                    }`}
                    onClick={() => startQuiz(category.name)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-3xl">{category.icon}</div>
                        {isCompleted && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{category.questions} questions</span>
                        </div>
                        
                        {isCompleted ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{result?.score}%</Badge>
                            <Badge variant={
                              result?.level === 'Advanced' ? 'default' :
                              result?.level === 'Intermediate' ? 'secondary' : 'outline'
                            }>
                              {result?.level}
                            </Badge>
                          </div>
                        ) : (
                          <Button size="sm">
                            <PlayCircle className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {completedResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
              <CardDescription>
                Track your skill development across different geospatial technologies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {completedResults.map(result => (
                    <div key={result.category} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{result.category}</h4>
                        <p className="text-sm text-muted-foreground">
                          Completed {new Date(result.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{result.score}%</div>
                        <Badge variant={
                          result.level === 'Advanced' ? 'default' :
                          result.level === 'Intermediate' ? 'secondary' : 'outline'
                        }>
                          {result.level}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-center">
                  <Button 
                    onClick={() => setCurrentView('results')} 
                    size="lg"
                    className="w-full"
                  >
                    View Detailed Analysis
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        <ResumeUploadModal
          open={isResumeModalOpen}
          onOpenChange={setIsResumeModalOpen}
          onSuccess={handleResumeUploadSuccess}
        />

        <WeeklyPlanModal
          open={isWeeklyPlanModalOpen}
          onOpenChange={setIsWeeklyPlanModalOpen}
          plan={weeklyPlan}
          onRegeneratePlan={() => {
            // This would need the original resume data to regenerate
            toast({
              title: "Regenerate Plan",
              description: "Please upload your resume again to regenerate the plan.",
            });
            setIsWeeklyPlanModalOpen(false);
            setIsResumeModalOpen(true);
          }}
          onDownloadPDF={() => weeklyPlan && downloadPDF(weeklyPlan)}
          onEmailPlan={() => weeklyPlan && emailPlan(weeklyPlan)}
          onAddToCalendar={() => weeklyPlan && addToCalendar(weeklyPlan)}
          isGenerating={isGeneratingPlan}
        />
    </div>
  );
};

export default SkillCopilot;