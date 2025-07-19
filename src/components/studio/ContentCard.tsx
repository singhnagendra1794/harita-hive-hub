import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, MessageCircle, Share2, Play, Download, ExternalLink, 
  Eye, Calendar, User, MapPin, Target, TrendingUp 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StudioContent {
  id: string;
  title: string;
  description: string;
  content_type: string;
  file_url?: string;
  thumbnail_url?: string;
  embed_url?: string;
  duration?: number;
  tools_used: string[];
  skill_domain?: string;
  region?: string;
  goal?: string;
  outcome?: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
  is_featured: boolean;
  created_at: string;
  user_id: string;
  tags: string[];
  user_liked?: boolean;
  creator_name?: string;
  creator_avatar?: string;
}

interface ContentCardProps {
  content: StudioContent;
  onUpdate: () => void;
  showCreator?: boolean;
}

export const ContentCard: React.FC<ContentCardProps> = ({ 
  content, 
  onUpdate, 
  showCreator = true 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (!user || loading) return;

    setLoading(true);
    try {
      if (content.user_liked) {
        // Remove like
        await supabase
          .from('studio_content_interactions')
          .delete()
          .eq('content_id', content.id)
          .eq('user_id', user.id)
          .eq('interaction_type', 'like');
      } else {
        // Add like
        await supabase
          .from('studio_content_interactions')
          .insert({
            content_id: content.id,
            user_id: user.id,
            interaction_type: 'like'
          });
      }

      onUpdate();
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleView = async () => {
    if (!user) return;

    try {
      // Record view (if not already viewed by this user)
      await supabase
        .from('studio_content_interactions')
        .insert({
          content_id: content.id,
          user_id: user.id,
          interaction_type: 'view'
        });
    } catch (error) {
      // Ignore if already viewed
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: content.title,
        text: content.description,
        url: `${window.location.origin}/studio/content/${content.id}`
      });

      // Record share interaction
      if (user) {
        await supabase
          .from('studio_content_interactions')
          .insert({
            content_id: content.id,
            user_id: user.id,
            interaction_type: 'share'
          });
      }
    } catch (error) {
      // Fallback to clipboard
      await navigator.clipboard.writeText(`${window.location.origin}/studio/content/${content.id}`);
      toast({
        title: "Link copied!",
        description: "Content link copied to clipboard."
      });
    }
  };

  const renderContent = () => {
    if (content.content_type === 'embed' && content.embed_url) {
      // Extract video ID and create embed URL
      const getEmbedUrl = (url: string) => {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          const videoId = url.includes('youtu.be') 
            ? url.split('/').pop()?.split('?')[0]
            : url.split('v=')[1]?.split('&')[0];
          return `https://www.youtube.com/embed/${videoId}`;
        } else if (url.includes('vimeo.com')) {
          const videoId = url.split('/').pop();
          return `https://player.vimeo.com/video/${videoId}`;
        }
        return url;
      };

      return (
        <div className="aspect-video w-full">
          <iframe
            src={getEmbedUrl(content.embed_url)}
            title={content.title}
            className="w-full h-full rounded-t-lg"
            frameBorder="0"
            allowFullScreen
            onClick={handleView}
          />
        </div>
      );
    } else if (content.file_url) {
      if (content.content_type === 'video') {
        return (
          <div className="aspect-video w-full relative group">
            <video
              src={content.file_url}
              poster={content.thumbnail_url}
              className="w-full h-full object-cover rounded-t-lg"
              controls
              onClick={handleView}
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all rounded-t-lg" />
          </div>
        );
      } else {
        return (
          <div className="aspect-video w-full relative">
            <img
              src={content.file_url}
              alt={content.title}
              className="w-full h-full object-cover rounded-t-lg cursor-pointer"
              onClick={handleView}
            />
          </div>
        );
      }
    }
    return null;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Content Display */}
      {renderContent()}

      {/* Content Info */}
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {content.title}
            </CardTitle>
            
            {/* Creator Info */}
            {showCreator && (
              <div className="flex items-center gap-2 mt-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={content.creator_avatar} />
                  <AvatarFallback className="text-xs">
                    {content.creator_name?.charAt(0) || <User className="h-3 w-3" />}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {content.creator_name || 'Anonymous Creator'}
                </span>
              </div>
            )}
            
            {/* Metadata */}
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {content.views_count}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(content.created_at)}
              </div>
              {content.duration && (
                <div className="flex items-center gap-1">
                  <Play className="h-3 w-3" />
                  {formatDuration(content.duration)}
                </div>
              )}
            </div>
          </div>
          
          {/* Featured Badge */}
          {content.is_featured && (
            <Badge className="ml-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>

        {/* Description */}
        {content.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {content.description}
          </p>
        )}

        {/* Domain and Region */}
        <div className="flex flex-wrap gap-1">
          {content.skill_domain && (
            <Badge variant="outline" className="text-xs">
              {content.skill_domain}
            </Badge>
          )}
          {content.region && (
            <Badge variant="outline" className="text-xs">
              <MapPin className="h-3 w-3 mr-1" />
              {content.region}
            </Badge>
          )}
        </div>

        {/* Tools Used */}
        <div className="flex flex-wrap gap-1">
          {content.tools_used.slice(0, 3).map(tool => (
            <Badge key={tool} variant="secondary" className="text-xs">
              {tool}
            </Badge>
          ))}
          {content.tools_used.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{content.tools_used.length - 3}
            </Badge>
          )}
        </div>

        {/* Goal and Outcome */}
        {(content.goal || content.outcome) && (
          <div className="space-y-1 text-xs">
            {content.goal && (
              <div className="flex items-start gap-1">
                <Target className="h-3 w-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground line-clamp-1">{content.goal}</span>
              </div>
            )}
            {content.outcome && (
              <div className="flex items-start gap-1">
                <TrendingUp className="h-3 w-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground line-clamp-1">{content.outcome}</span>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      {/* Actions */}
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={loading || !user}
              className={`text-xs ${content.user_liked ? 'text-red-500' : ''}`}
            >
              <Heart className={`h-4 w-4 mr-1 ${content.user_liked ? 'fill-current' : ''}`} />
              {content.likes_count}
            </Button>
            
            <Button variant="ghost" size="sm" className="text-xs">
              <MessageCircle className="h-4 w-4 mr-1" />
              {content.comments_count}
            </Button>
          </div>

          <div className="flex items-center gap-1">
            {content.file_url && (
              <Button size="sm" variant="outline" className="text-xs p-2" asChild>
                <a href={content.file_url} target="_blank" rel="noopener noreferrer">
                  <Download className="h-3 w-3" />
                </a>
              </Button>
            )}
            
            {content.embed_url && (
              <Button size="sm" variant="outline" className="text-xs p-2" asChild>
                <a href={content.embed_url} target="_blank" rel="noopener noreferrer">
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
  );
};