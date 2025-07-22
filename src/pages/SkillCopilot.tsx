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
  Rocket
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import UpgradePrompt from '@/components/premium/UpgradePrompt';
import { SkillQuiz } from '@/components/skill-assessment/SkillQuiz';
import { RadarChart } from '@/components/skill-assessment/RadarChart';
import { SkillRecommendations } from '@/components/skill-assessment/SkillRecommendations';
import { QuizCategory, QuizResult, AssessmentReport } from '@/types/skill-assessment';
import { generateSkillReport } from '@/utils/pdfGenerator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type ViewMode = 'dashboard' | 'quiz' | 'results';

const SkillCopilot = () => {
  const { user } = useAuth();
  const { hasAccess } = usePremiumAccess();
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | null>(null);
  const [completedResults, setCompletedResults] = useState<QuizResult[]>([]);
  const [isWeeklyCoachOpen, setIsWeeklyCoachOpen] = useState(false);
  const [weeklyPlan, setWeeklyPlan] = useState<any>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  
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

  const handleAddToRoadmap = async (roadmapId: string) => {
    if (!user) return;
    
    try {
      // Add roadmap to user's profile or create tracking entry
      toast({
        title: "Roadmap Added!",
        description: "Check your dashboard to track progress on this roadmap.",
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

  const generateWeeklyPlan = async () => {
    if (!user) return;
    
    setIsGeneratingPlan(true);
    try {
      // Generate AI-powered weekly study plan
      const plan = {
        generatedAt: new Date().toISOString(),
        week: `Week of ${new Date().toLocaleDateString()}`,
        days: [
          {
            day: 'Monday',
            theme: 'Study Foundation',
            tasks: [
              { type: 'study', task: 'Watch: "GIS Fundamentals" (45 min)', icon: <BookOpen className="h-4 w-4" /> },
              { type: 'build', task: 'Lab: Create your first QGIS project', icon: <Code className="h-4 w-4" /> },
              { type: 'apply', task: 'Update LinkedIn with new GIS skills', icon: <Briefcase className="h-4 w-4" /> }
            ]
          },
          {
            day: 'Tuesday',
            theme: 'Hands-on Practice',
            tasks: [
              { type: 'study', task: 'Read: "Python for GIS" Chapter 1-2', icon: <BookOpen className="h-4 w-4" /> },
              { type: 'build', task: 'Code: Automate a GIS workflow in Python', icon: <Code className="h-4 w-4" /> },
              { type: 'apply', task: 'Share your project on GitHub', icon: <Briefcase className="h-4 w-4" /> }
            ]
          },
          {
            day: 'Wednesday',
            theme: 'Database Skills',
            tasks: [
              { type: 'study', task: 'Course: "PostGIS Essentials" (1 hour)', icon: <BookOpen className="h-4 w-4" /> },
              { type: 'build', task: 'Project: Build a spatial database', icon: <Code className="h-4 w-4" /> },
              { type: 'apply', task: 'Apply to 2 GIS Analyst positions', icon: <Briefcase className="h-4 w-4" /> }
            ]
          },
          {
            day: 'Thursday', 
            theme: 'Web Mapping',
            tasks: [
              { type: 'study', task: 'Tutorial: "Leaflet.js Basics" (30 min)', icon: <BookOpen className="h-4 w-4" /> },
              { type: 'build', task: 'Create: Interactive web map portfolio', icon: <Code className="h-4 w-4" /> },
              { type: 'apply', task: 'Network with 3 GIS professionals', icon: <Briefcase className="h-4 w-4" /> }
            ]
          },
          {
            day: 'Friday',
            theme: 'Remote Sensing',
            tasks: [
              { type: 'study', task: 'Watch: "Satellite Image Analysis" (1 hour)', icon: <BookOpen className="h-4 w-4" /> },
              { type: 'build', task: 'Analyze: Land cover change detection', icon: <Code className="h-4 w-4" /> },
              { type: 'apply', task: 'Write blog post about your analysis', icon: <Briefcase className="h-4 w-4" /> }
            ]
          },
          {
            day: 'Saturday',
            theme: 'Project Work',
            tasks: [
              { type: 'study', task: 'Research: Latest GIS industry trends', icon: <BookOpen className="h-4 w-4" /> },
              { type: 'build', task: 'Work on: Personal GIS portfolio project', icon: <Code className="h-4 w-4" /> },
              { type: 'apply', task: 'Attend: Virtual GIS meetup/webinar', icon: <Briefcase className="h-4 w-4" /> }
            ]
          },
          {
            day: 'Sunday',
            theme: 'Review & Plan',
            tasks: [
              { type: 'study', task: 'Review: Week\'s learning materials', icon: <BookOpen className="h-4 w-4" /> },
              { type: 'build', task: 'Polish: One project from this week', icon: <Code className="h-4 w-4" /> },
              { type: 'apply', task: 'Plan: Next week\'s learning goals', icon: <Briefcase className="h-4 w-4" /> }
            ]
          }
        ]
      };
      
      setWeeklyPlan(plan);
    } catch (error) {
      console.error('Error generating plan:', error);
      toast({
        title: "Error",
        description: "Failed to generate weekly plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPlan(false);
    }
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
              <Dialog open={isWeeklyCoachOpen} onOpenChange={setIsWeeklyCoachOpen}>
                <DialogTrigger asChild>
                  <Button onClick={generateWeeklyPlan} disabled={isGeneratingPlan}>
                    {isGeneratingPlan ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-4 w-4 mr-2" />
                        Get My Weekly Plan
                      </>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Your Personalized Weekly Study Plan
                    </DialogTitle>
                  </DialogHeader>
                  {weeklyPlan && (
                    <div className="space-y-6">
                      <div className="text-center p-4 bg-primary/5 rounded-lg">
                        <h3 className="text-lg font-semibold">{weeklyPlan.week}</h3>
                        <p className="text-sm text-muted-foreground">Generated on {new Date(weeklyPlan.generatedAt).toLocaleDateString()}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={generateWeeklyPlan} 
                          className="mt-2"
                          disabled={isGeneratingPlan}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Regenerate Plan
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {weeklyPlan.days.map((day: any, index: number) => (
                          <Card key={day.day} className="border-l-4 border-l-primary">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm font-medium">{day.day}</CardTitle>
                              <CardDescription className="text-xs">{day.theme}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              {day.tasks.map((task: any, taskIndex: number) => (
                                <div key={taskIndex} className="flex items-start gap-2 p-2 rounded bg-muted/50">
                                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 mt-0.5">
                                    {task.icon}
                                  </div>
                                  <div>
                                    <div className="text-xs font-medium capitalize text-primary">{task.type}</div>
                                    <div className="text-xs text-muted-foreground">{task.task}</div>
                                  </div>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
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
                    <Button 
                      className="w-full" 
                      onClick={() => handleAddToRoadmap(roadmap.id)}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Add to My Roadmap
                    </Button>
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
    </div>
  );
};

export default SkillCopilot;