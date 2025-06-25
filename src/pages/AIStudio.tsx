
import React from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIContentGenerator } from '@/components/ai/AIContentGenerator';
import { AIFeedbackAssistant } from '@/components/ai/AIFeedbackAssistant';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AIStudio = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto py-16 text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Access Restricted</CardTitle>
              <CardDescription>
                Please log in to access the AI Studio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The AI Studio is available for registered creators only.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Studio</h1>
          <p className="text-xl text-muted-foreground">
            Your AI-powered content creation toolkit
          </p>
        </div>

        <Tabs defaultValue="generator" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generator">Content Generator</TabsTrigger>
            <TabsTrigger value="feedback">Feedback Assistant</TabsTrigger>
          </TabsList>

          <TabsContent value="generator">
            <AIContentGenerator />
          </TabsContent>

          <TabsContent value="feedback">
            <AIFeedbackAssistant />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AIStudio;
