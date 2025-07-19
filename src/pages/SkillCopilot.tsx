import Layout from '@/components/Layout';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  PlayCircle, 
  BarChart3, 
  Award, 
  Clock,
  Users,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import UpgradePrompt from '@/components/premium/UpgradePrompt';
import { SkillQuiz } from '@/components/skill-assessment/SkillQuiz';
import { RadarChart } from '@/components/skill-assessment/RadarChart';
import { SkillRecommendations } from '@/components/skill-assessment/SkillRecommendations';
import { QuizCategory, QuizResult, AssessmentReport } from '@/types/skill-assessment';
import { generateSkillReport } from '@/utils/pdfGenerator';

type ViewMode = 'dashboard' | 'quiz' | 'results';

const SkillCopilot = () => {
  const { user } = useAuth();
  const { hasAccess } = usePremiumAccess();
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | null>(null);
  const [completedResults, setCompletedResults] = useState<QuizResult[]>([]);
  
  const hasProAccess = hasAccess('pro');

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
          feature="Skill Assessment Tool"
          description="Take comprehensive skill assessments, get personalized recommendations, and track your progress with our interactive quiz system."
        />
      </div>
    );
  }

  if (currentView === 'quiz' && selectedCategory) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <SkillQuiz
            category={selectedCategory}
            onComplete={handleQuizComplete}
            onBack={handleBackToDashboard}
          />
        </div>
      </Layout>
    );
  }

  if (currentView === 'results') {
    return (
      <Layout>
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
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold">Skill Assessment Center</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover your geospatial expertise level with our comprehensive skill assessment tool. 
            Get personalized recommendations and track your learning progress.
          </p>
        </div>

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

        {/* Assessment Categories */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Choose Your Assessment</CardTitle>
            <CardDescription>
              Select a skill category to begin your timed assessment. Each quiz contains 12 randomized questions.
            </CardDescription>
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
    </Layout>
  );
};

export default SkillCopilot;