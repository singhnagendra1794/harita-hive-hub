import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Copy, 
  Download, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  Globe, 
  Star,
  Heart,
  BookOpen,
  Bug,
  MessageSquare,
  Calendar,
  User,
  TestTube,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface EnhancedCodeSnippetProps {
  snippet: {
    id: string;
    title: string;
    summary: string;
    description: string;
    use_case: string;
    language: string;
    category: string;
    code: string;
    inputs_required: string[];
    output_format: string;
    configuration: Record<string, any>;
    author_name: string;
    is_tested: boolean;
    is_production_ready: boolean;
    version: string;
    created_at: string;
    updated_at: string;
    last_tested_at?: string;
    download_count: number;
    view_count: number;
    rating_average: number;
    rating_count: number;
    tags: string[];
    notebook_url?: string;
    colab_url?: string;
    github_url?: string;
    preview_image_url?: string;
    test_results?: Array<{
      test_status: 'passed' | 'failed' | 'warning';
      test_environment: string;
      tested_at: string;
    }>;
  };
  onRun?: (id: string) => void;
  onFavorite?: (id: string) => void;
  onRate?: (id: string, rating: number) => void;
  onReportIssue?: (id: string, issue: { type: string; title: string; description: string }) => void;
  isRunning?: boolean;
  isFavorited?: boolean;
  userRating?: number;
}

export const EnhancedCodeSnippet = ({ 
  snippet, 
  onRun, 
  onFavorite, 
  onRate, 
  onReportIssue,
  isRunning = false,
  isFavorited = false,
  userRating
}: EnhancedCodeSnippetProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    type: 'improvement',
    title: '',
    description: ''
  });
  const [selectedRating, setSelectedRating] = useState(userRating || 0);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(snippet.code);
    toast({
      title: "Copied to clipboard!",
      description: "Code snippet has been copied",
    });
  };

  const openColab = () => {
    if (snippet.colab_url) {
      window.open(snippet.colab_url, '_blank');
    } else {
      // Generate Colab URL with the code
      const encodedCode = encodeURIComponent(snippet.code);
      const colabUrl = `https://colab.research.google.com/github/googlecolab/colabtools/blob/master/notebooks/colab-github-demo.ipynb#code=${encodedCode}`;
      window.open(colabUrl, '_blank');
    }
    
    toast({
      title: "Opening in Google Colab",
      description: "Code will be loaded in a new tab",
    });
  };

  const downloadNotebook = () => {
    // Create Jupyter notebook format
    const notebook = {
      cells: [
        {
          cell_type: "markdown",
          metadata: {},
          source: [
            `# ${snippet.title}\n\n`,
            `${snippet.description}\n\n`,
            `**Use Case:** ${snippet.use_case}\n\n`,
            `**Author:** ${snippet.author_name}\n`,
            `**Version:** ${snippet.version}\n`,
            `**Last Updated:** ${new Date(snippet.updated_at).toLocaleDateString()}\n\n`,
            `## Configuration\n`,
            `${JSON.stringify(snippet.configuration, null, 2)}\n\n`,
            `## Inputs Required\n`,
            snippet.inputs_required.map(input => `- ${input}`).join('\n') + '\n\n',
            `## Expected Output\n`,
            `${snippet.output_format || 'Various formats depending on use case'}\n`
          ]
        },
        {
          cell_type: "code",
          execution_count: null,
          metadata: {},
          outputs: [],
          source: snippet.code.split('\n')
        }
      ],
      metadata: {
        kernelspec: {
          display_name: snippet.language === 'python' ? 'Python 3' : snippet.language,
          language: snippet.language,
          name: snippet.language === 'python' ? 'python3' : snippet.language
        },
        language_info: {
          name: snippet.language
        }
      },
      nbformat: 4,
      nbformat_minor: 4
    };

    const blob = new Blob([JSON.stringify(notebook, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${snippet.title.replace(/\s+/g, '_').toLowerCase()}.ipynb`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Notebook downloaded!",
      description: "Jupyter notebook file has been saved",
    });
  };

  const handleRating = (rating: number) => {
    setSelectedRating(rating);
    onRate?.(snippet.id, rating);
    toast({
      title: "Rating submitted!",
      description: `You rated this snippet ${rating} stars`,
    });
  };

  const handleReportIssue = () => {
    if (!feedbackData.title.trim() || !feedbackData.description.trim()) {
      toast({
        title: "Please fill all fields",
        description: "Both title and description are required",
        variant: "destructive"
      });
      return;
    }

    onReportIssue?.(snippet.id, feedbackData);
    setShowFeedbackForm(false);
    setFeedbackData({ type: 'improvement', title: '', description: '' });
    
    toast({
      title: "Feedback submitted!",
      description: "Thank you for helping improve this snippet",
    });
  };

  const getStatusBadge = () => {
    if (snippet.is_production_ready) {
      return (
        <Badge variant="default" className="bg-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          Production Ready
        </Badge>
      );
    } else if (snippet.is_tested) {
      return (
        <Badge variant="secondary">
          <TestTube className="h-3 w-3 mr-1" />
          Tested
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="border-yellow-400 text-yellow-700">
          <AlertCircle className="h-3 w-3 mr-1" />
          Experimental
        </Badge>
      );
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{snippet.title}</CardTitle>
              {getStatusBadge()}
              <Badge variant="secondary">{snippet.language}</Badge>
              <Badge variant="outline">{snippet.category}</Badge>
            </div>
            <CardDescription className="mb-2">{snippet.summary}</CardDescription>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {snippet.author_name}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(snippet.updated_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                {snippet.download_count}
              </div>
              {snippet.rating_count > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current text-yellow-500" />
                  {snippet.rating_average.toFixed(1)} ({snippet.rating_count})
                </div>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFavorite?.(snippet.id)}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="config">Config</TabsTrigger>
            <TabsTrigger value="tests">Tests</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Use Case</h4>
              <p className="text-sm text-muted-foreground">{snippet.use_case}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{snippet.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Inputs Required</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {snippet.inputs_required.map((input, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-current rounded-full"></span>
                      {input}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Output Format</h4>
                <p className="text-sm text-muted-foreground">{snippet.output_format}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {snippet.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Rating Section */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Rate this snippet</h4>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRating(star)}
                    className="p-1 h-auto"
                  >
                    <Star className={`h-4 w-4 ${star <= selectedRating ? 'fill-current text-yellow-500' : 'text-gray-300'}`} />
                  </Button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {selectedRating > 0 && `You rated: ${selectedRating} stars`}
                </span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="code" className="space-y-4">
            <div className="bg-muted rounded-lg p-4 relative">
              <pre className="text-sm overflow-x-auto">
                <code>{snippet.code}</code>
              </pre>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={copyToClipboard}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={downloadNotebook}>
                <BookOpen className="h-4 w-4 mr-1" />
                Download Notebook
              </Button>
              
              <Button size="sm" variant="outline" onClick={openColab}>
                <ExternalLink className="h-4 w-4 mr-1" />
                Open in Colab
              </Button>

              {snippet.github_url && (
                <Button size="sm" variant="outline" asChild>
                  <a href={snippet.github_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View on GitHub
                  </a>
                </Button>
              )}

              {onRun && (
                <Button 
                  size="sm" 
                  variant="default"
                  onClick={() => onRun(snippet.id)}
                  disabled={isRunning}
                >
                  {isRunning ? (
                    <>
                      <AlertCircle className="h-4 w-4 mr-1 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-1" />
                      Run Code
                    </>
                  )}
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Configuration Parameters</h4>
              <div className="bg-muted rounded-lg p-4">
                <pre className="text-sm">
                  <code>{JSON.stringify(snippet.configuration, null, 2)}</code>
                </pre>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Modify these parameters to customize the code for your specific use case.
                Replace file paths, coordinate reference systems, and thresholds as needed.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Version Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Version:</span> {snippet.version}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span> {new Date(snippet.updated_at).toLocaleDateString()}
                </div>
                {snippet.last_tested_at && (
                  <div>
                    <span className="font-medium">Last Tested:</span> {new Date(snippet.last_tested_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tests" className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Test Results</h4>
              {snippet.test_results && snippet.test_results.length > 0 ? (
                <div className="space-y-2">
                  {snippet.test_results.map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        {test.test_status === 'passed' && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        {test.test_status === 'failed' && (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        {test.test_status === 'warning' && (
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                        )}
                        <span className="font-medium">{test.test_environment}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(test.tested_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <TestTube className="h-8 w-8 mx-auto mb-2" />
                  <p>No test results available</p>
                  <p className="text-sm">This snippet hasn't been tested yet</p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-800 mb-2">Testing Information</h5>
              <p className="text-sm text-blue-700">
                All production-ready snippets have been tested in multiple environments. 
                Test status indicates compatibility and reliability across different setups.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-4">
            {!showFeedbackForm ? (
              <div className="text-center py-6">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <h4 className="font-medium mb-2">Report an Issue or Suggest Improvement</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Help us improve this code snippet by reporting bugs or suggesting enhancements
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setShowFeedbackForm(true)}>
                    <Bug className="h-4 w-4 mr-1" />
                    Report Issue
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setFeedbackData({ ...feedbackData, type: 'improvement' });
                    setShowFeedbackForm(true);
                  }}>
                    <Settings className="h-4 w-4 mr-1" />
                    Suggest Improvement
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Issue Type</label>
                  <select
                    value={feedbackData.type}
                    onChange={(e) => setFeedbackData({ ...feedbackData, type: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-input rounded-md"
                  >
                    <option value="bug_report">Bug Report</option>
                    <option value="improvement">Improvement Suggestion</option>
                    <option value="question">Question</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={feedbackData.title}
                    onChange={(e) => setFeedbackData({ ...feedbackData, title: e.target.value })}
                    placeholder="Brief description of the issue"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={feedbackData.description}
                    onChange={(e) => setFeedbackData({ ...feedbackData, description: e.target.value })}
                    placeholder="Detailed description of the issue or suggestion"
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleReportIssue}>Submit Feedback</Button>
                  <Button variant="outline" onClick={() => setShowFeedbackForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};