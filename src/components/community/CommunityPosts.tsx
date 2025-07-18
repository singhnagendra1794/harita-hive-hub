import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, MessageCircle, Bookmark, Plus, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  tags: string[];
  votes: number;
  created_at: string;
  user_id: string;
  author_name?: string;
}

export const CommunityPosts: React.FC = () => {
  const { user } = useAuth();
  const { hasPremiumAccess } = usePremiumAccess();
  const { toast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // Create post form
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    tags: [] as string[]
  });

  const commonTags = ['GIS', 'GeoAI', 'Mapping', 'Remote Sensing', 'QGIS', 'ArcGIS', 'PostGIS', 'Python', 'JavaScript', 'Cartography'];

  useEffect(() => {
    fetchPosts();
  }, [sortBy, filterTag]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('community_posts')
        .select('*');

      // Apply filtering
      if (filterTag !== 'all') {
        query = query.contains('tags', [filterTag]);
      }

      // Apply sorting
      if (sortBy === 'latest') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('votes', { ascending: false });
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;
      
      // Enrich posts with author names
      const enrichedPosts = await Promise.all(
        (data || []).map(async (post) => {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', post.user_id)
              .single();
            
            return {
              ...post,
              author_name: profile?.full_name || 'Anonymous'
            };
          } catch {
            return {
              ...post,
              author_name: 'Anonymous'
            };
          }
        })
      );
      
      setPosts(enrichedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load community posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create posts",
        variant: "destructive"
      });
      return;
    }

    if (!hasPremiumAccess) {
      toast({
        title: "Premium access required",
        description: "Full posting rights are available for Pro/Enterprise users",
        variant: "destructive"
      });
      return;
    }

    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: "Invalid input",
        description: "Please provide both title and content",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('community_posts')
        .insert({
          title: newPost.title.trim(),
          content: newPost.content.trim(),
          tags: newPost.tags,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your post has been created successfully!"
      });

      setNewPost({ title: '', content: '', tags: [] });
      setIsCreateOpen(false);
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      });
    }
  };

  const toggleTag = (tag: string) => {
    setNewPost(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const allTags = [...new Set(posts.flatMap(post => post.tags))];

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Community Discussions</h2>
          <p className="text-muted-foreground">Share knowledge and connect with fellow GIS enthusiasts</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Post title..."
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
              />
              <Textarea
                placeholder="What would you like to share with the community?"
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                rows={6}
              />
              <div>
                <p className="text-sm font-medium mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {commonTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={newPost.tags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                {newPost.tags.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Selected: {newPost.tags.join(', ')}
                  </p>
                )}
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreatePost} className="flex-1">
                  Publish Post
                </Button>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'latest' | 'popular')}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterTag} onValueChange={setFilterTag}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Topics</SelectItem>
            {allTags.map(tag => (
              <SelectItem key={tag} value={tag}>#{tag}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-20 bg-muted rounded"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-muted rounded w-16"></div>
                    <div className="h-6 bg-muted rounded w-20"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to start a discussion in the community!
            </p>
            {hasPremiumAccess && (
              <Button onClick={() => setIsCreateOpen(true)}>
                Create First Post
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold line-clamp-2">{post.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        by {post.author_name || 'Anonymous'} • {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground line-clamp-3">{post.content}</p>
                  
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 pt-2">
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {post.votes}
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      Reply
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      <Bookmark className="h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};