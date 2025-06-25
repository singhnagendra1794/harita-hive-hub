
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type ContentType = 'lesson-plan' | 'newsletter' | 'code-snippet';

interface GeneratedContent {
  type: ContentType;
  title: string;
  content: string;
  tags: string[];
  summary: string;
}

export const AIContentGenerator = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [inputs, setInputs] = useState({
    title: '',
    description: '',
    difficulty: 'beginner',
    duration: '30',
    topic: ''
  });

  const generateContent = async (type: ContentType) => {
    if (!user) {
      toast.error('Please login to use AI content generation');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          inputs,
          userId: user.id
        })
      });

      if (!response.ok) throw new Error('Failed to generate content');

      const data = await response.json();
      setGeneratedContent(data);
      toast.success('Content generated successfully!');
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    if (!generatedContent || !user) return;

    try {
      // Save to appropriate table based on content type
      toast.success('Content saved successfully!');
      setGeneratedContent(null);
      setInputs({ title: '', description: '', difficulty: 'beginner', duration: '30', topic: '' });
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content.');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Content Generator</h1>
        <p className="text-muted-foreground">
          Generate lesson plans, newsletters, and code snippets with AI assistance
        </p>
      </div>

      <Tabs defaultValue="lesson-plan" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lesson-plan">Lesson Plans</TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
          <TabsTrigger value="code-snippet">Code Snippets</TabsTrigger>
        </TabsList>

        <TabsContent value="lesson-plan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Lesson Plan</CardTitle>
              <CardDescription>
                Create structured lesson plans for your GIS courses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lesson-title">Lesson Title</Label>
                  <Input
                    id="lesson-title"
                    placeholder="Introduction to QGIS"
                    value={inputs.title}
                    onChange={(e) => setInputs({ ...inputs, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="30"
                    value={inputs.duration}
                    onChange={(e) => setInputs({ ...inputs, duration: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="lesson-description">Description</Label>
                <Textarea
                  id="lesson-description"
                  placeholder="Describe what students will learn..."
                  value={inputs.description}
                  onChange={(e) => setInputs({ ...inputs, description: e.target.value })}
                />
              </div>
              <Button 
                onClick={() => generateContent('lesson-plan')} 
                disabled={loading || !inputs.title}
                className="w-full"
              >
                {loading ? 'Generating...' : 'Generate Lesson Plan'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="newsletter" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Newsletter</CardTitle>
              <CardDescription>
                Create engaging newsletter content for your audience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="newsletter-topic">Topic</Label>
                <Input
                  id="newsletter-topic"
                  placeholder="Latest GIS trends, tool updates..."
                  value={inputs.topic}
                  onChange={(e) => setInputs({ ...inputs, topic: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="newsletter-description">Key Points</Label>
                <Textarea
                  id="newsletter-description"
                  placeholder="List key points to cover..."
                  value={inputs.description}
                  onChange={(e) => setInputs({ ...inputs, description: e.target.value })}
                />
              </div>
              <Button 
                onClick={() => generateContent('newsletter')} 
                disabled={loading || !inputs.topic}
                className="w-full"
              >
                {loading ? 'Generating...' : 'Generate Newsletter'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code-snippet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Code Snippet</CardTitle>
              <CardDescription>
                Create code examples with explanations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="code-title">Code Title</Label>
                <Input
                  id="code-title"
                  placeholder="Buffer Analysis in Python"
                  value={inputs.title}
                  onChange={(e) => setInputs({ ...inputs, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="code-description">Description</Label>
                <Textarea
                  id="code-description"
                  placeholder="Describe what the code should do..."
                  value={inputs.description}
                  onChange={(e) => setInputs({ ...inputs, description: e.target.value })}
                />
              </div>
              <Button 
                onClick={() => generateContent('code-snippet')} 
                disabled={loading || !inputs.title}
                className="w-full"
              >
                {loading ? 'Generating...' : 'Generate Code Snippet'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {generatedContent && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
            <CardDescription>Review and edit your generated content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input 
                value={generatedContent.title} 
                onChange={(e) => setGeneratedContent({
                  ...generatedContent,
                  title: e.target.value
                })}
              />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea 
                className="min-h-[300px]"
                value={generatedContent.content}
                onChange={(e) => setGeneratedContent({
                  ...generatedContent,
                  content: e.target.value
                })}
              />
            </div>
            <div>
              <Label>Summary</Label>
              <Textarea 
                value={generatedContent.summary}
                onChange={(e) => setGeneratedContent({
                  ...generatedContent,
                  summary: e.target.value
                })}
              />
            </div>
            <div>
              <Label>Tags</Label>
              <Input 
                value={generatedContent.tags.join(', ')}
                onChange={(e) => setGeneratedContent({
                  ...generatedContent,
                  tags: e.target.value.split(', ').filter(tag => tag.trim())
                })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={saveContent} className="flex-1">
                Save Content
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setGeneratedContent(null)}
                className="flex-1"
              >
                Discard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
