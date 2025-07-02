
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bookmark, BookOpen, Play, FileText, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SavedContent {
  id: string;
  content_id: string;
  content_type: string;
  collection_name: string;
  created_at: string;
  // These would come from joins in a real implementation
  title?: string;
  description?: string;
}

export const SavedContentGrid = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedContent, setSavedContent] = useState<SavedContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSavedContent();
    }
  }, [user]);

  const fetchSavedContent = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_content')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mock additional data since we don't have the actual content tables set up
      const mockContent = data?.map(item => ({
        ...item,
        title: `Sample ${item.content_type} Content`,
        description: `This is a saved ${item.content_type} item from your collection.`
      })) || [];

      setSavedContent(mockContent);
    } catch (error) {
      console.error('Error fetching saved content:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeSavedContent = async (contentId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_content')
        .delete()
        .eq('id', contentId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Content removed from saved items",
      });

      fetchSavedContent();
    } catch (error) {
      console.error('Error removing saved content:', error);
      toast({
        title: "Error",
        description: "Failed to remove saved content",
        variant: "destructive",
      });
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'course': return BookOpen;
      case 'lesson': return Play;
      case 'document': return FileText;
      default: return Bookmark;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'course': return 'bg-blue-100 text-blue-800';
      case 'lesson': return 'bg-green-100 text-green-800';
      case 'document': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div>Loading saved content...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Saved Content</h2>
        <p className="text-muted-foreground">Your bookmarked lessons, courses, and resources</p>
      </div>

      {savedContent.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No saved content yet</h3>
            <p className="text-muted-foreground mb-4">
              Start bookmarking lessons and courses to build your personal library
            </p>
            <Button>Browse Courses</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedContent.map((item) => {
            const IconComponent = getContentIcon(item.content_type);
            
            return (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5 text-primary" />
                      <Badge className={getContentTypeColor(item.content_type)}>
                        {item.content_type}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSavedContent(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Saved {new Date(item.created_at).toLocaleDateString()}
                    </div>
                    <Button size="sm">
                      <Play className="h-4 w-4 mr-2" />
                      Open
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Collections */}
      <Card>
        <CardHeader>
          <CardTitle>Collections</CardTitle>
          <CardDescription>
            Organize your saved content into collections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-dashed border-2 border-muted">
              <CardContent className="text-center py-8">
                <Button variant="ghost" className="h-full w-full">
                  <div>
                    <Bookmark className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm">Create Collection</p>
                  </div>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="py-6">
                <div className="text-center">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold">GIS Fundamentals</h3>
                  <p className="text-sm text-muted-foreground">3 items</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <div className="text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold">Remote Sensing</h3>
                  <p className="text-sm text-muted-foreground">5 items</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
