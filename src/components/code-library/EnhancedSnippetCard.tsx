import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Download, 
  BookOpen, 
  Copy, 
  Star, 
  Heart, 
  ExternalLink,
  CheckCircle,
  TestTube,
  AlertCircle,
  Code,
  Sparkles,
  Eye,
  Calendar,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CustomizationGuideModal } from "./CustomizationGuideModal";

interface EnhancedSnippetCardProps {
  snippet: {
    id: string;
    title: string;
    summary: string;
    description: string;
    use_case: string;
    language: string;
    category: string;
    code: string;
    author_name: string;
    is_tested: boolean;
    is_production_ready: boolean;
    is_featured?: boolean;
    download_count: number;
    view_count: number;
    rating_average: number;
    rating_count: number;
    tags: string[];
    updated_at: string;
    configuration: Record<string, any>;
    customization_guide?: any;
    colab_url?: string;
    github_url?: string;
  };
  onRun?: (id: string) => void;
  onFavorite?: (id: string) => void;
  onDownload?: (id: string) => void;
  isRunning?: boolean;
  isFavorited?: boolean;
}

export const EnhancedSnippetCard = ({ 
  snippet, 
  onRun, 
  onFavorite, 
  onDownload,
  isRunning = false,
  isFavorited = false 
}: EnhancedSnippetCardProps) => {
  const { toast } = useToast();
  const [showGuide, setShowGuide] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      python: 'bg-blue-100 text-blue-800 border-blue-200',
      r: 'bg-purple-100 text-purple-800 border-purple-200',
      javascript: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      sql: 'bg-green-100 text-green-800 border-green-200',
      qgis: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[language.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusBadge = () => {
    if (snippet.is_production_ready) {
      return (
        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
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

  const handleCopyCode = () => {
    navigator.clipboard.writeText(snippet.code);
    toast({
      title: "Code copied!",
      description: "Code snippet has been copied to clipboard",
    });
  };

  const handleDownload = () => {
    onDownload?.(snippet.id);
    
    // Create downloadable file
    const content = `# ${snippet.title}\n\n${snippet.description}\n\n## Code\n\n\`\`\`${snippet.language}\n${snippet.code}\n\`\`\`\n\n## Configuration\n\n\`\`\`json\n${JSON.stringify(snippet.configuration, null, 2)}\n\`\`\``;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${snippet.title.replace(/\s+/g, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download started!",
      description: "Snippet has been downloaded as Markdown file",
    });
  };

  const handleRunInNotebook = () => {
    if (snippet.colab_url) {
      window.open(snippet.colab_url, '_blank');
    } else if (snippet.language === 'python') {
      // Generate Colab link
      const notebookContent = {
        cells: [{
          cell_type: 'code',
          source: snippet.code.split('\n')
        }]
      };
      const encoded = encodeURIComponent(JSON.stringify(notebookContent));
      window.open(`https://colab.research.google.com/`, '_blank');
    }
    
    toast({
      title: "Opening notebook...",
      description: "Code will be loaded in a new tab",
    });
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 border hover:border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {snippet.is_featured && (
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Staff Pick
                  </Badge>
                )}
                <Badge className={getLanguageColor(snippet.language)}>
                  <Code className="h-3 w-3 mr-1" />
                  {snippet.language}
                </Badge>
                {getStatusBadge()}
              </div>
              
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {snippet.title}
              </CardTitle>
              
              <p className="text-sm text-muted-foreground line-clamp-2">
                {snippet.summary}
              </p>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {snippet.author_name}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(snippet.updated_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  {snippet.download_count}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {snippet.view_count}
                </div>
                {snippet.rating_count > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current text-yellow-500" />
                    {snippet.rating_average.toFixed(1)} ({snippet.rating_count})
                  </div>
                )}
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFavorite?.(snippet.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Use Case */}
          <div>
            <h4 className="text-sm font-medium mb-1">Use Case</h4>
            <p className="text-sm text-muted-foreground">{snippet.use_case}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {snippet.tags.slice(0, 4).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {snippet.tags.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{snippet.tags.length - 4} more
              </Badge>
            )}
          </div>

          {/* Code Preview */}
          {isExpanded && (
            <div className="bg-muted rounded-lg p-3 relative">
              <pre className="text-xs overflow-x-auto max-h-32">
                <code>{snippet.code.slice(0, 300)}...</code>
              </pre>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={handleCopyCode}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleDownload}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            
            {(snippet.language === 'python' || snippet.colab_url) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRunInNotebook}
              >
                <Play className="h-4 w-4 mr-1" />
                Run in Notebook
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowGuide(true)}
            >
              <BookOpen className="h-4 w-4 mr-1" />
              Customize
            </Button>

            {snippet.github_url && (
              <Button variant="ghost" size="sm" asChild>
                <a href={snippet.github_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>

          {/* Expand/Collapse */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full text-xs"
          >
            {isExpanded ? 'Show Less' : 'Show Code Preview'}
          </Button>
        </CardContent>
      </Card>

      <CustomizationGuideModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        snippet={snippet}
      />
    </>
  );
};