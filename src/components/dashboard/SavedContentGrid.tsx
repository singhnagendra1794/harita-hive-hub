
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Bookmark, FileText, Code, Video, ExternalLink, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SavedContent {
  id: string;
  content_type: string;
  content_id: string;
  collection_name: string;
  created_at: string;
}

export const SavedContentGrid = () => {
  const { user } = useAuth();
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
      setSavedContent(data || []);
    } catch (error) {
      console.error('Error fetching saved content:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeSavedContent = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from('saved_content')
        .delete()
        .eq('id', contentId);

      if (error) throw error;
      setSavedContent(prev => prev.filter(item => item.id !== contentId));
    } catch (error) {
      console.error('Error removing saved content:', error);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'note':
        return <FileText className="h-5 w-5" />;
      case 'code_snippet':
        return <Code className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      default:
        return <Bookmark className="h-5 w-5" />;
    }
  };

  const getContentColor = (type: string) => {
    switch (type) {
      case 'note':
        return 'bg-blue-500';
      case 'code_snippet':
        return 'bg-green-500';
      case 'video':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-6 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-3 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (savedContent.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No saved content yet</h3>
          <p className="text-muted-foreground">
            Save notes, code snippets, and videos to access them quickly later.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group content by collection
  const contentByCollection = savedContent.reduce((acc, item) => {
    const collection = item.collection_name || 'default';
    if (!acc[collection]) {
      acc[collection] = [];
    }
    acc[collection].push(item);
    return acc;
  }, {} as Record<string, SavedContent[]>);

  return (
    <div className="space-y-6">
      {Object.entries(contentByCollection).map(([collection, items]) => (
        <div key={collection}>
          <h3 className="text-lg font-semibold mb-4 capitalize">
            {collection === 'default' ? 'Saved Items' : collection}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <Card key={item.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg text-white ${getContentColor(item.content_type)}`}>
                      {getContentIcon(item.content_type)}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeSavedContent(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Badge variant="secondary" className="text-xs">
                      {item.content_type.replace('_', ' ')}
                    </Badge>
                    <h4 className="font-medium truncate">
                      Content ID: {item.content_id}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Saved {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Content
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
