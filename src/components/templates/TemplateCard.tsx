import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  FileText, 
  Star, 
  Users, 
  ExternalLink, 
  Lock,
  BookOpen,
  Eye,
  Code2,
  MapPin,
  Satellite,
  TreePine,
  Building,
  Globe,
  BarChart3
} from "lucide-react";

export interface ProjectTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  tags: string[];
  isPremium: boolean;
  isFeatured: boolean;
  downloadCount: number;
  rating: number;
  ratingCount: number;
  usedInProjects: number;
  recommendedCourse?: string;
  thumbnailUrl?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  tools: string[];
  author: string;
  lastUpdated: string;
  fileSize: string;
  includes: string[];
}

interface TemplateCardProps {
  template: ProjectTemplate;
  onDownload: () => void;
  onViewGuide: () => void;
  userHasAccess: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onDownload,
  onViewGuide,
  userHasAccess
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'remote-sensing':
        return <Satellite className="h-4 w-4" />;
      case 'urban-planning':
        return <Building className="h-4 w-4" />;
      case 'environmental':
        return <TreePine className="h-4 w-4" />;
      case 'agriculture':
        return <TreePine className="h-4 w-4" />;
      case 'web-mapping':
        return <Globe className="h-4 w-4" />;
      case 'analysis':
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 relative">
      {/* Featured Badge */}
      {template.isFeatured && (
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
            <Star className="h-3 w-3 mr-1 fill-current" />
            Featured
          </Badge>
        </div>
      )}

      {/* Premium Lock */}
      {template.isPremium && !userHasAccess && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="secondary" className="bg-gray-900 text-white">
            <Lock className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        </div>
      )}

      <CardHeader className="pb-4">
        {/* Thumbnail or Icon */}
        <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
          {template.thumbnailUrl ? (
            <img 
              src={template.thumbnailUrl} 
              alt={template.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="text-center">
              {getCategoryIcon(template.category)}
              <div className="text-xs text-muted-foreground mt-2 capitalize">
                {template.category.replace('-', ' ')}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {/* Category and Type Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {getCategoryIcon(template.category)}
              <span className="ml-1 capitalize">{template.category.replace('-', ' ')}</span>
            </Badge>
            <Badge 
              variant="outline" 
              className={`text-xs ${getDifficultyColor(template.difficulty)}`}
            >
              {template.difficulty}
            </Badge>
          </div>

          {/* Title */}
          <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {template.title}
          </CardTitle>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {template.description}
          </p>

          {/* Rating and Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              {renderStars(template.rating)}
              <span className="ml-1">({template.ratingCount})</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                {template.downloadCount}
              </div>
              {template.usedInProjects > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {template.usedInProjects}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {template.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{template.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div>
            <div className="font-medium mb-1">Time</div>
            <div>{template.estimatedTime}</div>
          </div>
          <div>
            <div className="font-medium mb-1">Size</div>
            <div>{template.fileSize}</div>
          </div>
        </div>

        {/* Tools */}
        <div>
          <div className="text-xs font-medium text-muted-foreground mb-2">Tools Used</div>
          <div className="flex flex-wrap gap-1">
            {template.tools.slice(0, 3).map((tool, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                <Code2 className="h-3 w-3 mr-1" />
                {tool}
              </Badge>
            ))}
          </div>
        </div>

        {/* Recommended Course */}
        {template.recommendedCourse && (
          <div className="bg-primary/5 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs">
              <BookOpen className="h-3 w-3 text-primary" />
              <span className="text-primary font-medium">Recommended Course:</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {template.recommendedCourse}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={onDownload}
            disabled={template.isPremium && !userHasAccess}
            className="w-full"
            variant={template.isPremium && !userHasAccess ? "outline" : "default"}
          >
            {template.isPremium && !userHasAccess ? (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Upgrade to Access
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download Project
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={onViewGuide}
            className="w-full"
          >
            <FileText className="h-4 w-4 mr-2" />
            View Guide PDF
          </Button>
        </div>

        {/* Portfolio Badge */}
        <div className="text-center">
          <Badge variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20">
            <Eye className="h-3 w-3 mr-1" />
            Use in Portfolio
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateCard;