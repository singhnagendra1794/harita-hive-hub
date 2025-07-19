import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Heart, MessageCircle, Share2, Github, ExternalLink, Users, 
  Star, Lock, Globe, Download, MoreHorizontal 
} from 'lucide-react';
import { ProjectRatingDialog } from './ProjectRatingDialog';
import { ProjectCollaborationDialog } from './ProjectCollaborationDialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    domain: string;
    tools_used: string[];
    github_url?: string;
    colab_url?: string;
    demo_url?: string;
    is_team_project: boolean;
    is_public: boolean;
    upvotes: number;
    average_rating: number;
    rating_count: number;
    thumbnail_url?: string;
    created_at: string;
    user_id: string;
    status: string;
  };
  currentUserVoted?: boolean;
  onVote?: () => void;
  onUpdate?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  currentUserVoted = false,
  onVote,
  onUpdate
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [showCollabDialog, setShowCollabDialog] = useState(false);
  const [voting, setVoting] = useState(false);

  const isOwner = user?.id === project.user_id;

  const handleVote = async () => {
    if (!user || voting) return;

    setVoting(true);
    try {
      if (currentUserVoted) {
        // Remove vote
        await supabase
          .from('project_votes')
          .delete()
          .eq('user_id', user.id)
          .eq('project_id', project.id);
      } else {
        // Add vote
        await supabase
          .from('project_votes')
          .insert({
            user_id: user.id,
            project_id: project.id,
            vote_type: 'upvote'
          });
      }

      onVote?.();
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to vote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setVoting(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: project.title,
        text: project.description,
        url: `${window.location.origin}/project/${project.id}`
      });
    } catch (error) {
      // Fallback to clipboard
      await navigator.clipboard.writeText(`${window.location.origin}/project/${project.id}`);
      toast({
        title: "Link copied!",
        description: "Project link copied to clipboard."
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'fill-primary text-primary' 
            : 'text-muted-foreground'
        }`}
      />
    ));
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200">
        {project.thumbnail_url && (
          <div className="aspect-video w-full bg-muted overflow-hidden rounded-t-lg relative">
            <img 
              src={project.thumbnail_url} 
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
            <div className="absolute top-2 right-2 flex gap-1">
              {!project.is_public && (
                <Badge variant="secondary" className="text-xs">
                  <Lock className="h-3 w-3 mr-1" />
                  Private
                </Badge>
              )}
              {project.status === 'featured' && (
                <Badge className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
          </div>
        )}
        
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                {project.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {project.domain}
                </Badge>
                {project.is_team_project && (
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    Team
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <CardDescription className="line-clamp-3">
            {project.description}
          </CardDescription>

          {/* Rating Display */}
          {project.rating_count > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">{renderStars(project.average_rating)}</div>
              <span className="text-sm text-muted-foreground">
                {project.average_rating.toFixed(1)} ({project.rating_count} reviews)
              </span>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Tools */}
          <div className="flex flex-wrap gap-1">
            {project.tools_used.slice(0, 4).map((tool) => (
              <Badge key={tool} variant="secondary" className="text-xs">
                {tool}
              </Badge>
            ))}
            {project.tools_used.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{project.tools_used.length - 4}
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVote}
                disabled={voting || !user}
                className={`text-xs ${currentUserVoted ? 'text-red-500 hover:text-red-600' : ''}`}
              >
                <Heart className={`h-4 w-4 mr-1 ${currentUserVoted ? 'fill-current' : ''}`} />
                {project.upvotes}
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs"
                onClick={() => setShowRatingDialog(true)}
                disabled={!user}
              >
                <Star className="h-4 w-4 mr-1" />
                Rate
              </Button>

              {isOwner && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => setShowCollabDialog(true)}
                >
                  <Users className="h-4 w-4 mr-1" />
                  Collaborate
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {project.github_url && (
                <Button size="sm" variant="outline" className="text-xs p-2" asChild>
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                    <Github className="h-3 w-3" />
                  </a>
                </Button>
              )}
              {project.demo_url && (
                <Button size="sm" variant="outline" className="text-xs p-2" asChild>
                  <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              )}
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-xs p-2"
                onClick={handleShare}
              >
                <Share2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProjectRatingDialog
        open={showRatingDialog}
        onOpenChange={setShowRatingDialog}
        projectId={project.id}
        projectTitle={project.title}
        onRated={onUpdate}
      />

      <ProjectCollaborationDialog
        open={showCollabDialog}
        onOpenChange={setShowCollabDialog}
        projectId={project.id}
        projectTitle={project.title}
      />
    </>
  );
};