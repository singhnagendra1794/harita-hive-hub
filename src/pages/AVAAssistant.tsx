import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Sparkles, 
  Zap, 
  Target, 
  BookOpen, 
  Code, 
  Map, 
  Settings,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  Users
} from 'lucide-react';
import { AVAChatInterface } from '@/components/ava/AVAChatInterface';
import { useAuth } from '@/contexts/AuthContext';

const AVAAssistant = () => {
  const [selectedContext, setSelectedContext] = useState('general');
  const { user } = useAuth();

  const contextTypes = [
    { id: 'general', label: 'General Help', icon: MessageSquare, color: 'bg-blue-500' },
    { id: 'gis_tools', label: 'GIS Tools', icon: Map, color: 'bg-green-500' },
    { id: 'code_snippets', label: 'Code & Scripts', icon: Code, color: 'bg-purple-500' },
    { id: 'spatial_analysis', label: 'Spatial Analysis', icon: Target, color: 'bg-orange-500' },
    { id: 'workflows', label: 'Workflows', icon: Zap, color: 'bg-red-500' },
    { id: 'learning', label: 'Learning Path', icon: BookOpen, color: 'bg-indigo-500' }
  ];

  const quickActions = [
    {
      title: "🗺️ Plan a GIS Project",
      description: "Get step-by-step guidance for your geospatial project",
      prompt: "I need help planning a GIS project. Can you guide me through the essential steps?"
    },
    {
      title: "🔧 Tool Recommendation",
      description: "Find the right tools for your specific use case",
      prompt: "What GIS tools would be best for my specific workflow?"
    },
    {
      title: "📊 Data Processing",
      description: "Learn how to process and analyze spatial data",
      prompt: "How do I process and analyze spatial data efficiently?"
    },
    {
      title: "🐛 Troubleshoot Issues",
      description: "Get help with errors and technical problems",
      prompt: "I'm having technical issues with my GIS workflow. Can you help troubleshoot?"
    },
    {
      title: "📚 Learning Roadmap",
      description: "Create a personalized learning path",
      prompt: "Can you create a personalized learning roadmap for my GIS skills?"
    },
    {
      title: "🔍 Best Practices",
      description: "Learn industry best practices and standards",
      prompt: "What are the best practices for professional GIS work?"
    }
  ];

  const features = [
    {
      icon: Brain,
      title: "Use-Case Intelligence",
      description: "Understands your project context and suggests appropriate tools and workflows"
    },
    {
      icon: Zap,
      title: "Multi-Step Guidance",
      description: "Breaks down complex tasks into clear, sequential steps with actionable outcomes"
    },
    {
      icon: BookOpen,
      title: "Platform Knowledge",
      description: "Access to code snippets, tools, templates, courses, and user-generated content"
    },
    {
      icon: Target,
      title: "Smart Answers",
      description: "Contextual responses for GIS tools, spatial analysis, and sector-specific workflows"
    },
    {
      icon: Settings,
      title: "Live Copilot",
      description: "Real-time assistance while building maps, configuring tools, or debugging analysis"
    },
    {
      icon: TrendingUp,
      title: "Memory & Learning",
      description: "Remembers your goals, preferences, and provides personalized recommendations"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Brain className="h-12 w-12 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">AVA Assistant</h1>
            <p className="text-xl text-muted-foreground">Your Intelligent Geospatial AI Companion</p>
          </div>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Get expert guidance on GIS workflows, spatial analysis, tool selection, and project planning. 
          AVA understands your context and provides step-by-step solutions tailored to your needs.
        </p>
      </div>

      <Tabs defaultValue="chat" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat">Chat with AVA</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-6">
          {/* Context Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Choose Your Context
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Select the type of help you need to get more relevant responses
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {contextTypes.map((context) => {
                  const IconComponent = context.icon;
                  return (
                    <Button
                      key={context.id}
                      variant={selectedContext === context.id ? "default" : "outline"}
                      onClick={() => setSelectedContext(context.id)}
                      className="flex items-center gap-2 p-3 h-auto"
                    >
                      <div className={`p-1 rounded ${context.color} text-white`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <span className="text-sm">{context.label}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Quick Start
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Common questions to get you started
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">{action.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          // This would need to be passed to the chat interface
                          console.log('Quick action:', action.prompt);
                        }}
                      >
                        Ask AVA
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Main Chat Interface */}
          <AVAChatInterface 
            contextType={selectedContext}
            className="max-w-4xl mx-auto"
          />
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold">{feature.title}</h3>
                    </div>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Capabilities Overview */}
          <Card>
            <CardHeader>
              <CardTitle>What AVA Can Help You With</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">🛠️ GIS Tools & Software</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• QGIS workflows and plugin development</li>
                    <li>• PostGIS spatial queries and optimization</li>
                    <li>• ArcGIS desktop and online solutions</li>
                    <li>• GeoPandas and Python automation</li>
                    <li>• MapLibre and web mapping libraries</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-3">🏭 Sector-Specific Solutions</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Urban planning and smart cities</li>
                    <li>• Telecom network optimization</li>
                    <li>• Precision agriculture and crop monitoring</li>
                    <li>• Forest management and conservation</li>
                    <li>• Infrastructure and transportation planning</li>
                    <li>• Mining and environmental impact assessment</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sample Questions AVA Can Answer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm mb-1">🗺️ Workflow Planning</p>
                    <p className="text-sm text-muted-foreground">
                      "Help me convert a city shapefile to WGS84 and merge with rainfall data"
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm mb-1">🔍 Analysis Guidance</p>
                    <p className="text-sm text-muted-foreground">
                      "What is the best model to detect land use changes over 5 years?"
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm mb-1">📡 Sector-Specific Help</p>
                    <p className="text-sm text-muted-foreground">
                      "Give me a 4-step plan to analyze telecom tower coverage using PostGIS"
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm mb-1">⛏️ Industry Applications</p>
                    <p className="text-sm text-muted-foreground">
                      "I'm working on a mining EIA report – suggest spatial layers I need"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AVA's Response Style</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Badge variant="secondary" className="mb-2">Multi-Step Breakdown</Badge>
                    <p className="text-sm text-muted-foreground">
                      Complex tasks are broken into 2-4 clear, actionable steps with specific tools and methods
                    </p>
                  </div>
                  <div>
                    <Badge variant="secondary" className="mb-2">Context-Aware</Badge>
                    <p className="text-sm text-muted-foreground">
                      Responses consider your skill level, subscription tier, and previous conversations
                    </p>
                  </div>
                  <div>
                    <Badge variant="secondary" className="mb-2">Resource Integration</Badge>
                    <p className="text-sm text-muted-foreground">
                      Includes relevant code snippets, tools, templates, and learning materials from the platform
                    </p>
                  </div>
                  <div>
                    <Badge variant="secondary" className="mb-2">Follow-up Questions</Badge>
                    <p className="text-sm text-muted-foreground">
                      Asks clarifying questions when your intent is unclear or provides next-step suggestions
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Success Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                AVA Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">95%</div>
                  <p className="text-sm text-muted-foreground">User Satisfaction</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">2.3s</div>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">10k+</div>
                  <p className="text-sm text-muted-foreground">Questions Answered</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">500+</div>
                  <p className="text-sm text-muted-foreground">Workflows Supported</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AVAAssistant;