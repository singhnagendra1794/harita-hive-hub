
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Star, Bookmark, TrendingUp, X } from 'lucide-react';
import { usePersonalization } from '@/hooks/usePersonalization';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';

const ContinueLearningDashboard: React.FC = () => {
  const { 
    recentInteractions, 
    recommendations, 
    loading, 
    trackInteraction,
    dismissRecommendation,
    getRecentlyViewed,
    getBookmarkedContent 
  } = usePersonalization();
  
  const { hasPremiumAccess } = usePremiumAccess();

  const recentlyViewed = getRecentlyViewed();
  const bookmarkedContent = getBookmarkedContent();

  const handleContentClick = (contentType: string, contentId: string) => {
    trackInteraction(contentType, contentId, 'view');
  };

  const handleBookmark = (contentType: string, contentId: string) => {
    trackInteraction(contentType, contentId, 'bookmark');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Recently Viewed */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-semibold">Continue Learning</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentlyViewed.map((interaction) => (
            <Card key={interaction.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {interaction.content_type.replace('_', ' ')}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBookmark(interaction.content_type, interaction.content_id)}
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-lg">
                  {interaction.metadata?.title || `${interaction.content_type} #${interaction.content_id.slice(0, 8)}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Last viewed: {new Date(interaction.created_at).toLocaleDateString()}
                </p>
                <Button 
                  className="w-full" 
                  onClick={() => handleContentClick(interaction.content_type, interaction.content_id)}
                >
                  Continue Reading
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        {recentlyViewed.length === 0 && (
          <Card className="text-center py-8">
            <CardContent>
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Start exploring content to see your recent activity here.</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Personalized Recommendations */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-green-500" />
          <h2 className="text-xl font-semibold">Recommended for You</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec, index) => (
            <Card key={`${rec.content_type}-${rec.content_id}`} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    {Math.round(rec.score * 100)}% match
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissRecommendation(rec.content_type, rec.content_id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-lg">
                  {rec.content_type.replace('_', ' ')} Content
                </CardTitle>
                <CardDescription className="text-sm">
                  {rec.reason}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => handleContentClick(rec.content_type, rec.content_id)}
                >
                  Explore Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        {recommendations.length === 0 && (
          <Card className="text-center py-8">
            <CardContent>
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Interact with more content to get personalized recommendations.
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Bookmarked Content */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Bookmark className="h-5 w-5 text-purple-500" />
          <h2 className="text-xl font-semibold">Your Bookmarks</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {bookmarkedContent.slice(0, 8).map((interaction) => (
            <Card key={interaction.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <Badge variant="outline" className="text-xs mb-2">
                  {interaction.content_type.replace('_', ' ')}
                </Badge>
                <h4 className="font-medium text-sm mb-2">
                  {interaction.metadata?.title || `Content #${interaction.content_id.slice(0, 8)}`}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Saved: {new Date(interaction.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        {bookmarkedContent.length === 0 && (
          <Card className="text-center py-6">
            <CardContent>
              <Bookmark className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No bookmarks yet. Start saving content you love!</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
};

export default ContinueLearningDashboard;
