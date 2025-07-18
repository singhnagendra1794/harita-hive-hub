import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Trophy, Users, MessageSquare, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FeaturedCreatorData {
  id: string;
  user_id: string;
  posts_count: number;
  engagement_score: number;
  featured_week: string;
  user_name?: string;
  user_bio?: string;
}

export const FeaturedCreator: React.FC = () => {
  const [featuredCreator, setFeaturedCreator] = useState<FeaturedCreatorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedCreator();
  }, []);

  const fetchFeaturedCreator = async () => {
    try {
      setLoading(true);
      
      // Get current week's featured creator
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      
      const { data, error } = await supabase
        .from('creator_stats')
        .select('*')
        .gte('featured_week', startOfWeek.toISOString().split('T')[0])
        .order('engagement_score', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      // If no featured creator for this week, get the top creator overall
      if (!data) {
        const { data: topCreator, error: topError } = await supabase
          .from('creator_stats')
          .select('*')
          .order('engagement_score', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (topError) throw topError;
        
        if (topCreator) {
          // Enrich with user data
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', topCreator.user_id)
            .single();
          
          setFeaturedCreator({
            ...topCreator,
            user_name: profile?.full_name || 'Anonymous Creator',
            user_bio: 'Passionate about geospatial technology'
          });
        }
      } else {
        // Enrich with user data
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', data.user_id)
          .single();
        
        setFeaturedCreator({
          ...data,
          user_name: profile?.full_name || 'Anonymous Creator',
          user_bio: 'Passionate about geospatial technology'
        });
      }
    } catch (error) {
      console.error('Error fetching featured creator:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-muted rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-32"></div>
              <div className="h-3 bg-muted rounded w-24"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="flex gap-2">
              <div className="h-6 bg-muted rounded w-16"></div>
              <div className="h-6 bg-muted rounded w-20"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!featuredCreator) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Featured Creator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Featured Creator Yet</h3>
            <p className="text-muted-foreground text-sm">
              Be the first to contribute and get featured!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const creator = featuredCreator;
  const displayName = creator.user_name || 'Anonymous Creator';
  const bio = creator.user_bio || 'Passionate about geospatial technology';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Card className="relative overflow-hidden">
      {/* Featured badge */}
      <div className="absolute top-4 right-4">
        <Badge className="bg-yellow-500 text-white">
          <Trophy className="h-3 w-3 mr-1" />
          Featured
        </Badge>
      </div>

      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="h-5 w-5 text-yellow-500" />
          Creator of the Week
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Creator profile */}
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="" alt={displayName} />
            <AvatarFallback className="text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{displayName}</h3>
              <Badge variant="secondary" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Top Contributor
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{bio}</p>
          </div>
        </div>

        {/* Specialties */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Interests</p>
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">GIS Analysis</Badge>
            <Badge variant="outline" className="text-xs">Remote Sensing</Badge>
            <Badge variant="outline" className="text-xs">Cartography</Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-accent/50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm font-semibold">
              <MessageSquare className="h-4 w-4" />
              {creator.posts_count}
            </div>
            <p className="text-xs text-muted-foreground">Posts</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm font-semibold">
              <Users className="h-4 w-4" />
              {creator.engagement_score}
            </div>
            <p className="text-xs text-muted-foreground">Engagement</p>
          </div>
        </div>


        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Recognized for outstanding contributions to the GIS community
          </p>
        </div>
      </CardContent>
    </Card>
  );
};