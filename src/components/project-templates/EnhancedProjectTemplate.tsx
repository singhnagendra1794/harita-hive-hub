import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Download, 
  Star, 
  Eye, 
  Clock, 
  Users, 
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Github,
  Play,
  BookOpen,
  Video,
  CheckCircle,
  AlertCircle,
  Heart,
  ThumbsUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";

interface EnhancedProjectTemplateProps {
  template: {
    id: string;
    title: string;
    slug: string;
    description: string;
    use_case: string;
    sector: string;
    skill_level: string;
    overview: string;
    objectives: string[];
    tools_required: string[];
    estimated_duration: string;
    template_files: Array<{
      name: string;
      url: string;
      type: string;
      size: number;
    }>;
    sample_data_url?: string;
    sample_data_description?: string;
    documentation_url?: string;
    preview_images: string[];
    result_images: string[];
    folder_structure: Record<string, any>;
    main_script_file?: string;
    requirements_file?: string;
    author_id?: string;
    contributor_name?: string;
    contributor_email?: string;
    organization?: string;
    license_type: string;
    version: string;
    changelog: Array<{
      version: string;
      date: string;
      changes: string[];
    }>;
    download_count: number;
    rating_average: number;
    rating_count: number;
    view_count: number;
    status: string;
    is_featured: boolean;
    is_verified: boolean;
    quality_score: number;
    tags: string[];
    keywords: string[];
    prerequisites: string[];
    learning_outcomes: string[];
    github_url?: string;
    documentation_external_url?: string;
    video_tutorial_url?: string;
    blog_post_url?: string;
    created_at: string;
    updated_at: string;
    published_at?: string;
    last_verified_at?: string;
  };
  onDownload: (templateId: string, downloadType: string) => void;
  onRate: (templateId: string, rating: number) => void;
  onFavorite: (templateId: string) => void;
  isDownloading?: boolean;
  userRating?: number;
  isFavorited?: boolean;
}

const sectorIcons = {
  agriculture: "🌾",
  urban_planning: "🏙️", 
  infrastructure: "🏗️",
  risk_mapping: "⚠️",
  forestry: "🌲",
  water_resources: "💧",
  climate: "🌡️",
  remote_sensing: "🛰️",
  health: "🏥",
  real_estate: "🏢",
  mining: "⛏️",
  transportation: "🚚",
  environmental: "🌍",
  disaster_management: "🚨",
  archaeology: "🏺",
  marine: "🌊",
  energy: "⚡"
};

const skillLevelColors = {
  beginner: "bg-green-100 text-green-800 border-green-300",
  intermediate: "bg-yellow-100 text-yellow-800 border-yellow-300", 
  advanced: "bg-orange-100 text-orange-800 border-orange-300",
  expert: "bg-red-100 text-red-800 border-red-300"
};

const toolColors = {
  qgis: "bg-green-100 text-green-700",
  arcgis: "bg-blue-100 text-blue-700",
  python: "bg-yellow-100 text-yellow-700",
  r: "bg-purple-100 text-purple-700",
  google_earth_engine: "bg-teal-100 text-teal-700",
  postgis: "bg-indigo-100 text-indigo-700",
  sql: "bg-gray-100 text-gray-700",
  javascript: "bg-orange-100 text-orange-700"
};

export function EnhancedProjectTemplate({ 
  template, 
  onDownload, 
  onRate, 
  onFavorite, 
  isDownloading = false,
  userRating,
  isFavorited = false 
}: EnhancedProjectTemplateProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();
  const { hasAccess } = usePremiumAccess();

  const handleDownload = (downloadType: string) => {
    if (!hasAccess('pro') && downloadType === 'full') {
      toast({
        title: "Pro Feature",
        description: "Full template downloads require a Pro subscription",
        variant: "destructive"
      });
      return;
    }
    onDownload(template.id, downloadType);
  };

  const handleRate = (rating: number) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to rate templates",
        variant: "destructive"
      });
      return;
    }
    onRate(template.id, rating);
  };

  const handleFavorite = () => {
    if (!user) {
      toast({
        title: "Login required", 
        description: "Please login to save favorites",
        variant: "destructive"
      });
      return;
    }
    onFavorite(template.id);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
      <CardHeader className="space-y-4">
        {/* Header with badges and actions */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{sectorIcons[template.sector] || "📁"}</span>
              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                {template.title}
              </CardTitle>
              {template.is_verified && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              {template.is_featured && (
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={skillLevelColors[template.skill_level] || "bg-gray-100 text-gray-800"}>
                {template.skill_level}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {template.sector.replace('_', ' ')}
              </Badge>
              <Badge variant="secondary">
                v{template.version}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {template.license_type}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavorite}
              className={isFavorited ? "text-red-600 hover:text-red-700" : ""}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
            </Button>
            
            <div className="text-right text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500" />
                {template.rating_average.toFixed(1)} ({template.rating_count})
              </div>
              <div className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                {template.download_count}
              </div>
            </div>
          </div>
        </div>

        {/* Preview image carousel */}
        {template.preview_images && template.preview_images.length > 0 && (
          <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden">
            <img
              src={template.preview_images[selectedImageIndex]}
              alt={`${template.title} preview ${selectedImageIndex + 1}`}
              className="object-cover w-full h-full"
            />
            {template.preview_images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                {template.preview_images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === selectedImageIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </AspectRatio>
        )}

        <CardDescription className="text-sm leading-relaxed">
          {template.description}
        </CardDescription>

        {/* Use case highlight */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="font-medium text-blue-900 mb-1">Use Case</h4>
          <p className="text-blue-700 text-sm">{template.use_case}</p>
        </div>

        {/* Tools and duration */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {template.estimated_duration || "Self-paced"}
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {template.skill_level} level
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {template.view_count} views
          </div>
        </div>

        {/* Tools required */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Tools Required:</h4>
          <div className="flex flex-wrap gap-1">
            {template.tools_required.map((tool) => (
              <Badge 
                key={tool} 
                variant="outline" 
                className={`text-xs ${toolColors[tool] || "bg-gray-100 text-gray-700"}`}
              >
                {tool.replace('_', ' ').toUpperCase()}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick actions */}
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => handleDownload('full')}
            disabled={isDownloading}
            className="flex-1 min-w-[200px]"
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? "Downloading..." : "Start with this template"}
          </Button>
          
          {template.sample_data_url && (
            <Button 
              variant="outline" 
              onClick={() => handleDownload('sample_data')}
            >
              <Download className="h-4 w-4 mr-2" />
              Sample Data
            </Button>
          )}

          {template.github_url && (
            <Button variant="outline" asChild>
              <a href={template.github_url} target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </a>
            </Button>
          )}

          {template.video_tutorial_url && (
            <Button variant="outline" asChild>
              <a href={template.video_tutorial_url} target="_blank" rel="noopener noreferrer">
                <Video className="h-4 w-4 mr-2" />
                Tutorial
              </a>
            </Button>
          )}
        </div>

        {/* Collapsible detailed information */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <span>View Details</span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-6 mt-4">
            {/* Overview */}
            <div>
              <h4 className="font-medium mb-2">Overview</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {template.overview}
              </p>
            </div>

            {/* Learning objectives */}
            {template.objectives && template.objectives.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Learning Objectives</h4>
                <ul className="space-y-1">
                  {template.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Prerequisites */}
            {template.prerequisites && template.prerequisites.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Prerequisites</h4>
                <ul className="space-y-1">
                  {template.prerequisites.map((prereq, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      {prereq}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* File structure */}
            {template.template_files && template.template_files.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Template Files</h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  {template.template_files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono">{file.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {file.type}
                        </Badge>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags and keywords */}
            {template.tags && template.tags.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {template.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Contributor info */}
            {template.contributor_name && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Contributor</h4>
                <div className="text-sm text-muted-foreground">
                  <p>{template.contributor_name}</p>
                  {template.organization && (
                    <p className="text-xs">{template.organization}</p>
                  )}
                  <p className="text-xs">
                    Last updated: {new Date(template.updated_at).toLocaleDateString()}
                  </p>
                  {template.last_verified_at && (
                    <p className="text-xs text-green-600">
                      ✓ Verified: {new Date(template.last_verified_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Rating section */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Rate this template:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  className={`text-lg transition-colors ${
                    (userRating && star <= userRating) || star <= Math.round(template.rating_average)
                      ? "text-yellow-500"
                      : "text-gray-300 hover:text-yellow-400"
                  }`}
                >
                  ★
                </button>
              ))}
              <span className="text-sm text-muted-foreground ml-2">
                ({template.rating_count} reviews)
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}