import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Github, 
  Globe, 
  Eye, 
  Calendar, 
  Share2, 
  Copy, 
  Sparkles,
  ExternalLink,
  Settings,
  CheckCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  title: string;
  description: string;
  type: "web-map" | "analysis" | "tool" | "research" | "challenge" | "custom";
  technologies: string[];
  githubUrl?: string;
  demoUrl?: string;
  imageUrl?: string;
  completedDate: string;
  duration?: string;
  source: "harita-hive" | "custom" | "live-class";
  skills?: string[];
  isPublished?: boolean;
  aiSummary?: string;
}

interface EnhancedProjectCardProps {
  project: Project;
  onEdit?: () => void;
  onDelete?: () => void;
  onPublishToggle?: (projectId: string, published: boolean) => void;
  showActions?: boolean;
}

const projectTypes = {
  "web-map": "Web Mapping",
  "analysis": "Spatial Analysis", 
  "tool": "GIS Tool",
  "research": "Research Project",
  "challenge": "Challenge Submission",
  "custom": "Custom Project"
};

export const EnhancedProjectCard = ({ 
  project, 
  onEdit, 
  onDelete, 
  onPublishToggle,
  showActions = false 
}: EnhancedProjectCardProps) => {
  const [isPublished, setIsPublished] = useState(project.isPublished || false);
  const [showSettings, setShowSettings] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Generate AI summary (mock for now)
  const aiSummary = project.aiSummary || `This ${project.type} project demonstrates expertise in ${project.technologies.slice(0, 2).join(' and ')}, showcasing practical application of geospatial technologies to solve real-world problems.`;
  
  // Generate shareable URL
  const shareableUrl = `${window.location.origin}/portfolio/${user?.id}/projects/${project.id}`;
  
  // Auto-detect skills from technologies
  const detectedSkills = project.skills || project.technologies.slice(0, 4);

  const handlePublishToggle = () => {
    const newPublished = !isPublished;
    setIsPublished(newPublished);
    onPublishToggle?.(project.id, newPublished);
    
    toast({
      title: newPublished ? "Project Published" : "Project Unpublished",
      description: newPublished 
        ? "Your project is now visible in the public showcase"
        : "Your project has been removed from the public showcase"
    });
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareableUrl);
    toast({
      title: "Link Copied",
      description: "Project URL has been copied to clipboard"
    });
  };

  const handleShare = () => {
    const shareText = `Check out my geospatial project: ${project.title}`;
    const linkedinUrl = `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(linkedinUrl, '_blank');
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200">
      {/* Project Source Badge */}
      <div className="absolute top-2 left-2 z-10">
        <Badge variant={project.source === "live-class" ? "default" : "secondary"} className="text-xs">
          {project.source === "live-class" && "🔴 Live Class"}
          {project.source === "harita-hive" && "HH"}
          {project.source === "custom" && "Custom"}
        </Badge>
      </div>

      {/* Settings Button */}
      {showActions && (
        <div className="absolute top-2 right-2 z-10">
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="bg-background/80 backdrop-blur-sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Project Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="publish-toggle" className="text-sm">
                    Publish to Showcase
                  </Label>
                  <Switch
                    id="publish-toggle"
                    checked={isPublished}
                    onCheckedChange={handlePublishToggle}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Shareable URL</Label>
                  <div className="flex gap-2">
                    <code className="flex-1 px-2 py-1 bg-muted rounded text-xs break-all">
                      {shareableUrl}
                    </code>
                    <Button size="sm" variant="outline" onClick={handleCopyUrl}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {project.imageUrl && (
        <div className="aspect-video bg-muted relative">
          <img 
            src={project.imageUrl} 
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg leading-tight">{project.title}</h3>
            {isPublished && (
              <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            {projectTypes[project.type] || project.type}
          </Badge>
        </div>

        {/* AI-Generated Summary */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="text-xs font-medium text-purple-700 dark:text-purple-300">AI Summary</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{aiSummary}</p>
        </div>

        {/* Skills Used */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Skills Used</Label>
          <div className="flex flex-wrap gap-1">
            {detectedSkills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex gap-2">
            {project.githubUrl && (
              <Button size="sm" variant="outline" asChild>
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                </a>
              </Button>
            )}
            {project.demoUrl && (
              <Button size="sm" variant="outline" asChild>
                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                  <Eye className="h-4 w-4" />
                </a>
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(project.completedDate).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};