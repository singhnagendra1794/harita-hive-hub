
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AIFeedback {
  clarity: number;
  depth: number;
  quality: number;
  suggestions: string[];
  overallScore: number;
  strengths: string[];
  improvements: string[];
}

export const AIFeedbackAssistant = () => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [feedback, setFeedback] = useState<AIFeedback | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeFeedback = async () => {
    if (!user || !content.trim()) {
      toast.error('Please enter content to analyze');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai/analyze-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          userId: user.id
        })
      });

      if (!response.ok) throw new Error('Failed to analyze content');

      const data = await response.json();
      setFeedback(data);
      toast.success('Content analyzed successfully!');
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast.error('Failed to analyze content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Feedback Assistant</h1>
        <p className="text-muted-foreground">
          Get AI-powered feedback on your content before publishing
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Content Analysis</CardTitle>
            <CardDescription>
              Paste your content to get detailed AI feedback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your lesson content, article, or tutorial here..."
              className="min-h-[300px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <Button 
              onClick={analyzeFeedback}
              disabled={loading || !content.trim()}
              className="w-full"
            >
              {loading ? 'Analyzing...' : 'Analyze Content'}
            </Button>
          </CardContent>
        </Card>

        {feedback && (
          <Card>
            <CardHeader>
              <CardTitle>AI Feedback Report</CardTitle>
              <CardDescription>
                Detailed analysis of your content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {feedback.overallScore}/10
                </div>
                <div className="text-muted-foreground">Overall Score</div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full ${getScoreColor(feedback.clarity)} text-white flex items-center justify-center font-bold mx-auto mb-2`}>
                    {feedback.clarity}
                  </div>
                  <div className="text-sm">Clarity</div>
                </div>
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full ${getScoreColor(feedback.depth)} text-white flex items-center justify-center font-bold mx-auto mb-2`}>
                    {feedback.depth}
                  </div>
                  <div className="text-sm">Depth</div>
                </div>
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full ${getScoreColor(feedback.quality)} text-white flex items-center justify-center font-bold mx-auto mb-2`}>
                    {feedback.quality}
                  </div>
                  <div className="text-sm">Quality</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-green-600">Strengths</h3>
                <div className="space-y-1">
                  {feedback.strengths.map((strength, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      • {strength}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-orange-600">Areas for Improvement</h3>
                <div className="space-y-1">
                  {feedback.improvements.map((improvement, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      • {improvement}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Suggestions</h3>
                <div className="space-y-2">
                  {feedback.suggestions.map((suggestion, index) => (
                    <Badge key={index} variant="outline" className="mr-2 mb-2">
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
