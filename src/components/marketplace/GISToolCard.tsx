
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Star, Code, Zap } from "lucide-react";

interface GISTool {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  tool_type: string;
  programming_language?: string;
  compatible_software: string[];
  downloads_count: number;
  rating: number;
  is_featured: boolean;
  creator: {
    full_name: string;
  };
}

interface GISToolCardProps {
  tool: GISTool;
}

const GISToolCard = ({ tool }: GISToolCardProps) => {
  const getToolIcon = (type: string) => {
    switch (type) {
      case 'script':
        return <Code className="h-5 w-5" />;
      case 'plugin':
        return <Zap className="h-5 w-5" />;
      default:
        return <Download className="h-5 w-5" />;
    }
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${tool.is_featured ? 'border-primary' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              {getToolIcon(tool.tool_type)}
            </div>
            <div>
              <CardTitle className="text-lg">{tool.title}</CardTitle>
              <CardDescription>by {tool.creator.full_name}</CardDescription>
            </div>
          </div>
          {tool.is_featured && (
            <Badge variant="default" className="bg-gradient-to-r from-primary to-accent">
              Featured
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{tool.description}</p>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {tool.category}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {tool.tool_type}
            </Badge>
            {tool.programming_language && (
              <Badge variant="outline" className="text-xs">
                {tool.programming_language}
              </Badge>
            )}
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Compatible Software</h4>
            <div className="flex flex-wrap gap-1">
              {tool.compatible_software.slice(0, 3).map((software, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {software}
                </Badge>
              ))}
              {tool.compatible_software.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tool.compatible_software.length - 3} more
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>{tool.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>{tool.downloads_count.toLocaleString()} downloads</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <div className="text-lg font-bold">
            {tool.price === 0 ? 'Free' : `$${tool.price}`}
          </div>
          <Button>{tool.price === 0 ? 'Download' : 'Purchase'}</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GISToolCard;
