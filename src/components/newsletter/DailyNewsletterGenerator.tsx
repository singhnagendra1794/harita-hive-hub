import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Newspaper, Sparkles, Save, Eye, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const DailyNewsletterGenerator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{
    title: string;
    content: string;
    date: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'generator' | 'preview'>('generator');

  const generateNewsletter = async (autoSave = false) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate newsletters",
        variant: "destructive",
      });
      return;
    }

    try {
      setGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('generate-daily-newsletter', {
        body: { 
          autoSave,
          userId: user.id 
        }
      });

      if (error) throw error;

      setGeneratedContent({
        title: data.title,
        content: data.content,
        date: data.date
      });

      if (autoSave) {
        toast({
          title: "Newsletter Generated & Saved",
          description: "Your daily newsletter has been generated and published",
        });
      } else {
        toast({
          title: "Newsletter Generated",
          description: "Review and save your daily newsletter",
        });
        setActiveTab('preview');
      }

    } catch (error) {
      console.error('Error generating newsletter:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate newsletter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const saveNewsletter = async () => {
    if (!user || !generatedContent) return;

    try {
      const { error } = await supabase
        .from('newsletter_posts')
        .insert({
          user_id: user.id,
          title: generatedContent.title,
          content: generatedContent.content,
          tags: ['Daily Newsletter', 'GeoAI', 'Geospatial Tech', 'Innovation'],
          published_date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      toast({
        title: "Newsletter Saved",
        description: "Your daily newsletter has been published successfully",
      });

      setGeneratedContent(null);
      setActiveTab('generator');
    } catch (error) {
      console.error('Error saving newsletter:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save newsletter. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-6 w-6" />
            Harita Hive Daily Generator
          </CardTitle>
          <CardDescription>
            AI-powered daily newsletter covering geospatial technology updates, research, and innovations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generator">Generator</TabsTrigger>
              <TabsTrigger value="preview" disabled={!generatedContent}>
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generator" className="space-y-4 mt-4">
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  Generate a comprehensive daily newsletter with:
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>Latest global geospatial news & updates</li>
                    <li>Tool & software spotlight</li>
                    <li>Open source community highlights</li>
                    <li>Research & emerging trends</li>
                    <li>Real-world use cases</li>
                    <li>Upcoming events & resources</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => generateNewsletter(false)}
                  disabled={generating || !user}
                  className="flex items-center gap-2 flex-1"
                >
                  <Sparkles className="h-4 w-4" />
                  {generating ? 'Generating...' : 'Generate Newsletter'}
                </Button>
                
                <Button
                  onClick={() => generateNewsletter(true)}
                  disabled={generating || !user}
                  variant="outline"
                  className="flex items-center gap-2 flex-1"
                >
                  <Save className="h-4 w-4" />
                  Generate & Auto-Save
                </Button>
              </div>

              <div className="text-sm text-muted-foreground space-y-2 pt-4 border-t">
                <p className="font-medium">📅 Automation Tip:</p>
                <p>
                  Set up a daily cron job to automatically generate and publish newsletters every morning at 9:00 AM IST.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-4">
              {generatedContent && (
                <div className="space-y-4">
                  <div className="border rounded-lg p-6 bg-muted/30">
                    <h2 className="text-2xl font-bold mb-2">{generatedContent.title}</h2>
                    <p className="text-sm text-muted-foreground mb-4">{generatedContent.date}</p>
                    
                    <div 
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ 
                        __html: generatedContent.content.replace(/\n/g, '<br/>') 
                      }}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      onClick={() => {
                        setGeneratedContent(null);
                        setActiveTab('generator');
                      }}
                      variant="outline"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Generate New
                    </Button>
                    <Button onClick={saveNewsletter}>
                      <Save className="h-4 w-4 mr-2" />
                      Save & Publish
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
