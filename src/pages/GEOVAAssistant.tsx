import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GEOVAChatInterface } from '@/components/geova/GEOVAChatInterface';
import { useGEOVA } from '@/hooks/useGEOVA';
import { useAuth } from '@/contexts/AuthContext';
import { Brain, BookOpen, Target, Code, Map, Rocket, Trophy, Clock, TrendingUp } from 'lucide-react';

const GEOVAAssistant = () => {
  const { user } = useAuth();
  const { learningProgress, getLearningProgress, askQuickQuestion } = useGEOVA();
  const [currentTab, setCurrentTab] = useState('chat');

  useEffect(() => {
    if (user) {
      getLearningProgress();
    }
  }, [user, getLearningProgress]);

  const quickStartOptions = [
    {
      id: 'getting-started',
      title: 'Getting Started with GIS',
      description: 'Perfect for complete beginners',
      icon: <Rocket className="w-5 h-5" />,
      color: 'bg-blue-500'
    },
    {
      id: 'qgis-help',
      title: 'QGIS Workflow Help',
      description: 'Learn QGIS tools and techniques',
      icon: <Map className="w-5 h-5" />,
      color: 'bg-green-500'
    },
    {
      id: 'python-gis',
      title: 'Python for GIS',
      description: 'Automate with Python & GeoPandas',
      icon: <Code className="w-5 h-5" />,
      color: 'bg-purple-500'
    },
    {
      id: 'career-advice',
      title: 'Career Guidance',
      description: 'Plan your geospatial career path',
      icon: <Target className="w-5 h-5" />,
      color: 'bg-orange-500'
    },
    {
      id: 'project-help',
      title: 'Project Assistance',
      description: 'Get help with current projects',
      icon: <BookOpen className="w-5 h-5" />,
      color: 'bg-pink-500'
    },
    {
      id: 'tools-comparison',
      title: 'Tools & Technologies',
      description: 'Compare GIS tools and platforms',
      icon: <Trophy className="w-5 h-5" />,
      color: 'bg-cyan-500'
    }
  ];

  const learningStats = [
    {
      label: 'Progress to Professional',
      value: learningProgress?.progress_percentage || 0,
      max: 100,
      unit: '%',
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'text-green-600'
    },
    {
      label: 'Lessons Completed',
      value: learningProgress?.completed_lessons || 0,
      max: learningProgress?.total_lessons || 1,
      unit: 'lessons',
      icon: <BookOpen className="w-4 h-4" />,
      color: 'text-blue-600'
    },
    {
      label: 'Days Learning',
      value: learningProgress?.days_learning || 0,
      max: 120,
      unit: 'days',
      icon: <Clock className="w-4 h-4" />,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mr-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Meet GEOVA</h1>
            <p className="text-xl text-muted-foreground">Your AI Geospatial Mentor</p>
          </div>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your personal AI mentor designed to guide you from beginner to geospatial professional in 120 days. 
          Ask anything about GIS, get personalized learning paths, and master spatial technology with confidence.
        </p>
      </div>

      {/* Learning Progress Dashboard */}
      {user && (
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Your Learning Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {learningStats.map((stat, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={stat.color}>{stat.icon}</span>
                      <span className="font-medium">{stat.label}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {stat.value}/{stat.max} {stat.unit}
                    </span>
                  </div>
                  <Progress value={(stat.value / stat.max) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat">Chat with GEOVA</TabsTrigger>
          <TabsTrigger value="quick-start">Quick Start</TabsTrigger>
          <TabsTrigger value="learning-path">Learning Path</TabsTrigger>
        </TabsList>

        {/* Chat Interface */}
        <TabsContent value="chat">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <GEOVAChatInterface 
                contextType="assistant"
                showVoiceControls={true}
              />
            </div>
            
            {/* Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🎯 Learning Goals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Badge variant="outline" className="w-full justify-start">
                    <BookOpen className="w-3 h-3 mr-1" />
                    Master QGIS
                  </Badge>
                  <Badge variant="outline" className="w-full justify-start">
                    <Code className="w-3 h-3 mr-1" />
                    Python for GIS
                  </Badge>
                  <Badge variant="outline" className="w-full justify-start">
                    <Map className="w-3 h-3 mr-1" />
                    Spatial Analysis
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">💡 Tips</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p>• Be specific about your goals</p>
                  <p>• Ask for step-by-step guidance</p>
                  <p>• Request code examples</p>
                  <p>• Share your current skill level</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Quick Start */}
        <TabsContent value="quick-start">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>🚀 Start Learning with GEOVA</CardTitle>
                <p className="text-muted-foreground">
                  Choose a topic below to begin an interactive learning session with your AI mentor.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quickStartOptions.map((option) => (
                    <Card key={option.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <Button
                          variant="ghost"
                          className="w-full h-auto flex-col items-start gap-3 p-0"
                          onClick={() => {
                            askQuickQuestion(option.id);
                            setCurrentTab('chat');
                          }}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className={`w-10 h-10 ${option.color} rounded-lg flex items-center justify-center text-white`}>
                              {option.icon}
                            </div>
                            <div className="text-left flex-1">
                              <h3 className="font-semibold">{option.title}</h3>
                              <p className="text-sm text-muted-foreground">{option.description}</p>
                            </div>
                          </div>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Featured Topics */}
            <Card>
              <CardHeader>
                <CardTitle>🌟 Popular Learning Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    'QGIS Basics', 'PostGIS Setup', 'Python GeoPandas', 'Remote Sensing',
                    'Web Mapping', 'Spatial Analysis', 'Data Processing', 'Career Path'
                  ].map((topic) => (
                    <Badge key={topic} variant="secondary" className="justify-center py-2">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Learning Path */}
        <TabsContent value="learning-path">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>📚 Your 120-Day Learning Path</CardTitle>
                <p className="text-muted-foreground">
                  Structured curriculum designed to take you from beginner to professional.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    {
                      phase: 'Foundation (Days 1-30)',
                      description: 'GIS fundamentals, QGIS basics, and spatial thinking',
                      progress: 75,
                      status: 'In Progress'
                    },
                    {
                      phase: 'Intermediate (Days 31-60)',
                      description: 'Advanced QGIS, PostGIS, and spatial analysis',
                      progress: 25,
                      status: 'Upcoming'
                    },
                    {
                      phase: 'Advanced (Days 61-90)',
                      description: 'Python automation, web mapping, and specialized tools',
                      progress: 0,
                      status: 'Locked'
                    },
                    {
                      phase: 'Professional (Days 91-120)',
                      description: 'Portfolio projects, career preparation, and specialization',
                      progress: 0,
                      status: 'Locked'
                    }
                  ].map((phase, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{phase.phase}</h3>
                        <Badge variant={phase.status === 'In Progress' ? 'default' : 'secondary'}>
                          {phase.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{phase.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{phase.progress}%</span>
                        </div>
                        <Progress value={phase.progress} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GEOVAAssistant;