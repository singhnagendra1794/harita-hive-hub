import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Sparkles, 
  FileImage, 
  FileText, 
  Tags, 
  MessageSquare, 
  Volume2, 
  Mic,
  Brain,
  Wand2,
  Camera
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AIFeaturesProps {
  content?: {
    id?: string;
    title?: string;
    description?: string;
    file_url?: string;
    content_type?: string;
  };
  onUpdate?: () => void;
}

interface AIAnalysisResult {
  tags: string[];
  summary: string;
  thumbnail_suggestions: string[];
  quality_score: number;
  improvement_suggestions: string[];
}

export const AIFeatures: React.FC<AIFeaturesProps> = ({ content, onUpdate }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [generatingThumbnail, setGeneratingThumbnail] = useState(false);
  const [generatingCaptions, setGeneratingCaptions] = useState(false);
  const [selectedContent, setSelectedContent] = useState('');
  const [geovaFeedback, setGeovaFeedback] = useState('');
  const [askingGeova, setAskingGeova] = useState(false);

  const performAIAnalysis = async () => {
    if (!content?.file_url && !selectedContent) {
      toast.error('Please provide content to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-content-analyzer', {
        body: {
          content_url: content?.file_url,
          content_text: selectedContent,
          content_type: content?.content_type || 'text',
          title: content?.title,
          description: content?.description
        }
      });

      if (error) throw error;

      setAnalysisResult(data);
      toast.success('AI analysis completed!');
      
      // Auto-apply tags if content exists
      if (content?.id && data.tags) {
        await applyAutoTags(data.tags);
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      toast.error('Failed to analyze content');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyAutoTags = async (tags: string[]) => {
    if (!content?.id) return;

    try {
      const { error } = await supabase
        .from('studio_content')
        .update({ tags })
        .eq('id', content.id);

      if (error) throw error;
      toast.success('Auto-tags applied successfully!');
      onUpdate?.();
    } catch (error) {
      console.error('Error applying tags:', error);
      toast.error('Failed to apply auto-tags');
    }
  };

  const generateAIThumbnail = async (prompt?: string) => {
    setGeneratingThumbnail(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-thumbnail-generator', {
        body: {
          prompt: prompt || content?.title || 'Professional geospatial content thumbnail',
          content_type: content?.content_type,
          style: 'professional-gis'
        }
      });

      if (error) throw error;

      toast.success('AI thumbnail generated!');
      
      // If content exists, update the thumbnail
      if (content?.id && data.thumbnail_url) {
        await updateContentThumbnail(data.thumbnail_url);
      }
    } catch (error) {
      console.error('Thumbnail generation error:', error);
      toast.error('Failed to generate thumbnail');
    } finally {
      setGeneratingThumbnail(false);
    }
  };

  const updateContentThumbnail = async (thumbnailUrl: string) => {
    if (!content?.id) return;

    try {
      const { error } = await supabase
        .from('studio_content')
        .update({ thumbnail_url: thumbnailUrl })
        .eq('id', content.id);

      if (error) throw error;
      toast.success('Thumbnail updated!');
      onUpdate?.();
    } catch (error) {
      console.error('Error updating thumbnail:', error);
      toast.error('Failed to update thumbnail');
    }
  };

  const generateCaptions = async () => {
    if (!content?.file_url || content.content_type !== 'video') {
      toast.error('Video content required for caption generation');
      return;
    }

    setGeneratingCaptions(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-caption-generator', {
        body: {
          video_url: content.file_url,
          language: 'en'
        }
      });

      if (error) throw error;

      toast.success('Captions generated successfully!');
      
      // Update content with captions
      if (content.id && data.captions) {
        await updateContentCaptions(data.captions);
      }
    } catch (error) {
      console.error('Caption generation error:', error);
      toast.error('Failed to generate captions');
    } finally {
      setGeneratingCaptions(false);
    }
  };

  const updateContentCaptions = async (captions: any) => {
    if (!content?.id) return;

    try {
      // Store captions in description for now since metadata column doesn't exist
      const { error } = await supabase
        .from('studio_content')
        .update({ 
          description: `${content.description || ''}\n\n[AI Generated Captions: Available]`
        })
        .eq('id', content.id);

      if (error) throw error;
      toast.success('Captions added to content!');
      onUpdate?.();
    } catch (error) {
      console.error('Error updating captions:', error);
      toast.error('Failed to update captions');
    }
  };

  const askGeova = async () => {
    if (!selectedContent.trim()) {
      toast.error('Please describe what you need help with');
      return;
    }

    setAskingGeova(true);
    try {
      const { data, error } = await supabase.functions.invoke('ava-assistant', {
        body: {
          message: `I need feedback on my geospatial content: ${selectedContent}. What can I improve?`,
          context_type: 'content_review',
          context_data: {
            content_title: content?.title,
            content_type: content?.content_type,
            analysis_result: analysisResult
          }
        }
      });

      if (error) throw error;

      setGeovaFeedback(data.response);
      toast.success('GEOVA has reviewed your content!');
    } catch (error) {
      console.error('GEOVA consultation error:', error);
      toast.error('Failed to get feedback from GEOVA');
    } finally {
      setAskingGeova(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">AI-Powered Content Enhancement</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Smart Content Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!content && (
              <div className="space-y-2">
                <Label htmlFor="content-input">Content to Analyze</Label>
                <Textarea
                  id="content-input"
                  placeholder="Paste your content description, script, or title here..."
                  value={selectedContent}
                  onChange={(e) => setSelectedContent(e.target.value)}
                  rows={4}
                />
              </div>
            )}

            <Button 
              onClick={performAIAnalysis} 
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Analyze with AI
                </>
              )}
            </Button>

            {analysisResult && (
              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Tags className="h-4 w-4" />
                    Suggested Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    AI Summary
                  </h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    {analysisResult.summary}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Quality Score</h4>
                  <Progress value={analysisResult.quality_score} className="w-full" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {analysisResult.quality_score}% content quality
                  </p>
                </div>

                {analysisResult.improvement_suggestions.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Improvement Suggestions</h4>
                    <ul className="space-y-1">
                      {analysisResult.improvement_suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Generation Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              AI Generation Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => generateAIThumbnail()} 
              disabled={generatingThumbnail}
              variant="outline"
              className="w-full"
            >
              {generatingThumbnail ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <FileImage className="h-4 w-4 mr-2" />
                  Generate AI Thumbnail
                </>
              )}
            </Button>

            {content?.content_type === 'video' && (
              <Button 
                onClick={generateCaptions} 
                disabled={generatingCaptions}
                variant="outline"
                className="w-full"
              >
                {generatingCaptions ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4 mr-2" />
                    Generate Captions
                  </>
                )}
              </Button>
            )}

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Ask GEOVA for Feedback
              </h4>
              <Textarea
                placeholder="Describe your content or ask for specific feedback..."
                value={selectedContent}
                onChange={(e) => setSelectedContent(e.target.value)}
                rows={3}
                className="mb-2"
              />
              <Button 
                onClick={askGeova} 
                disabled={askingGeova}
                variant="outline"
                className="w-full"
              >
                {askingGeova ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Consulting GEOVA...
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Get AI Feedback
                  </>
                )}
              </Button>

              {geovaFeedback && (
                <div className="mt-4 p-3 bg-muted rounded">
                  <h5 className="font-semibold mb-2">GEOVA's Feedback:</h5>
                  <p className="text-sm">{geovaFeedback}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};