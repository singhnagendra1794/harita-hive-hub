import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, Play, BookOpen, ExternalLink, 
  Star, Clock, Users, Layers
} from 'lucide-react';
import { SpatialTool } from '@/pages/SpatialAnalysisLab';

interface ToolCardProps {
  tool: SpatialTool;
  onSelect: (tool: SpatialTool) => void;
}

const ToolCard = ({ tool, onSelect }: ToolCardProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'basic': return '🟢';
      case 'advanced': return '🟡';
      case 'expert': return '🔴';
      case 'sector-specific': return '🧠';
      default: return '📊';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'qgis': return '🗺️';
      case 'arcgis': return '🌍';
      case 'python': return '🐍';
      case 'r': return '📊';
      case 'web': return '🌐';
      default: return '💻';
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer group" onClick={() => onSelect(tool)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getCategoryIcon(tool.category)}</span>
            <Badge className={getDifficultyColor(tool.difficulty)} variant="outline">
              {tool.difficulty}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{tool.stats.rating}</span>
          </div>
        </div>
        
        <CardTitle className="text-lg group-hover:text-primary transition-colors">
          {tool.name}
        </CardTitle>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {tool.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Platforms */}
        <div className="flex items-center gap-1 flex-wrap">
          {tool.platforms.map((platform) => (
            <span key={platform} className="text-sm" title={platform}>
              {getPlatformIcon(platform)}
            </span>
          ))}
        </div>

        {/* Output & Processing Time */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Layers className="h-3 w-3" />
            <span>{tool.outputType}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{tool.processingTime}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {tool.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {tool.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{tool.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
          <div className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            <span>{tool.stats.downloads.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{tool.stats.reviews} reviews</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button 
            variant="default" 
            size="sm" 
            className="text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(tool);
            }}
          >
            <Play className="h-3 w-3 mr-1" />
            Use Tool
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
            onClick={(e) => {
              e.stopPropagation();
              // Handle download
            }}
          >
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ToolCard;