
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, MessageCircle, Sparkles, Zap, Clock } from 'lucide-react';

const AITutorPlaceholder: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Main AI Tutor Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">AI Tutor Assistant</CardTitle>
              <CardDescription>
                Your personal GIS learning companion powered by AI
              </CardDescription>
            </div>
            <Badge variant="secondary" className="ml-auto">
              <Clock className="h-3 w-3 mr-1" />
              Coming Soon
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span>Get instant answers to your GIS questions</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MessageCircle className="h-4 w-4 text-purple-500" />
              <span>Interactive chat with code examples</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-green-500" />
              <span>Personalized learning recommendations</span>
            </div>
          </div>
          
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground italic">
              "Ask me anything about QGIS, Python scripting, spatial analysis, or geospatial concepts. 
              I'm trained on all the content in HaritaHive to provide you with accurate, contextual answers."
            </p>
          </div>
          
          <Button disabled className="w-full" size="lg">
            <Bot className="h-4 w-4 mr-2" />
            Start Chat with AI Tutor
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            We're working on integrating advanced AI capabilities. 
            This feature will be available once our OpenAI integration is complete.
          </p>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              <h3 className="font-medium">Smart Q&A</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Ask questions directly within notes and tutorials
            </p>
            <Button variant="outline" size="sm" disabled className="w-full">
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <h3 className="font-medium">Code Assistant</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Get help with Python, SQL, and QGIS scripting
            </p>
            <Button variant="outline" size="sm" disabled className="w-full">
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Feature Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What to Expect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-lg bg-blue-50">
              <Bot className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-medium mb-1">Intelligent Responses</h4>
              <p className="text-xs text-muted-foreground">
                Context-aware answers based on your learning progress
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-purple-50">
              <Zap className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h4 className="font-medium mb-1">Real-time Help</h4>
              <p className="text-xs text-muted-foreground">
                Instant assistance while you work on projects
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-green-50">
              <Sparkles className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-medium mb-1">Learning Paths</h4>
              <p className="text-xs text-muted-foreground">
                Personalized curriculum based on your goals
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AITutorPlaceholder;
