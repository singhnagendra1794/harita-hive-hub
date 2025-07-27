import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  ExternalLink, 
  Calendar,
  Star,
  Users,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import LinkedInNewsletterImporter from './LinkedInNewsletterImporter';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface NewsletterPost {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  linkedin_url: string | null;
  cover_image_url: string | null;
  published_date: string;
  tags: string[];
  view_count: number;
  is_featured: boolean | null;
  created_at: string;
  updated_at: string;
  user_id?: string;
  is_deleted?: boolean;
  likes_count?: number;
  comments_count?: number;
}

export const NewsletterAdmin = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<NewsletterPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<NewsletterPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    linkedin_url: '',
    featured_image_url: '',
    published_date: '',
    tags: '',
    is_featured: false
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletter_posts')
        .select('*')
        .order('published_date', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch newsletter posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      summary: '',
      content: '',
      linkedin_url: '',
      featured_image_url: '',
      published_date: '',
      tags: '',
      is_featured: false
    });
    setEditingPost(null);
  };

  const openEditDialog = (post: NewsletterPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      summary: post.summary || '',
      content: post.content || '',
      linkedin_url: post.linkedin_url || '',
      featured_image_url: post.cover_image_url || '',
      published_date: post.published_date.split('T')[0],
      tags: post.tags.join(', '),
      is_featured: post.is_featured || false
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    resetForm();
    setFormData(prev => ({
      ...prev,
      published_date: new Date().toISOString().split('T')[0]
    }));
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    const postData = {
      title: formData.title,
      summary: formData.summary || null,
      content: formData.content || null,
      linkedin_url: formData.linkedin_url || null,
      cover_image_url: formData.featured_image_url || null,
      published_date: formData.published_date,
      tags: tagsArray,
      is_featured: formData.is_featured
    };

    try {
      if (editingPost) {
        const { error } = await supabase
          .from('newsletter_posts')
          .update(postData)
          .eq('id', editingPost.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Newsletter post updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('newsletter_posts')
          .insert(postData);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Newsletter post created successfully",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Error",
        description: "Failed to save newsletter post",
        variant: "destructive",
      });
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this newsletter post?')) return;

    try {
      const { error } = await supabase
        .from('newsletter_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Newsletter post deleted successfully",
      });
      
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete newsletter post",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Newsletter Management</h2>
          <p className="text-muted-foreground">Manage LinkedIn newsletter posts and editions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Newsletter Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPost ? 'Edit Newsletter Post' : 'Add Newsletter Post'}
              </DialogTitle>
              <DialogDescription>
                Add a new edition from LinkedIn newsletter or edit existing one
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Edition #5: GeoAI + Remote Sensing Trends"
                  required
                />
              </div>

              <div>
                <Label htmlFor="linkedin_url">LinkedIn URL *</Label>
                <Input
                  id="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                  placeholder="https://www.linkedin.com/pulse/..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="summary">Summary</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="1-2 sentence excerpt describing the newsletter content"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="featured_image_url">Featured Image URL</Label>
                <Input
                  id="featured_image_url"
                  value={formData.featured_image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured_image_url: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="published_date">Published Date *</Label>
                  <Input
                    id="published_date"
                    type="date"
                    value={formData.published_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, published_date: e.target.value }))}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2 mt-8">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                  />
                  <Label htmlFor="is_featured">Featured Post</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="GeoAI, Remote Sensing, Python, Careers"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingPost ? 'Update' : 'Create'} Post
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* LinkedIn Newsletter Importer */}
      <LinkedInNewsletterImporter />

      {/* Newsletter Posts List */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Current Newsletter Posts</h3>
        
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {posts.map((post) => (
            <Card key={post.id} className={`${post.is_featured ? 'ring-2 ring-primary/20 bg-primary/5' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {post.title}
                      {post.is_featured && <Star className="h-4 w-4 text-yellow-500" />}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(post.published_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {post.view_count} views
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(post)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deletePost(post.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {post.summary && (
                  <p className="text-muted-foreground mb-3">{post.summary}</p>
                )}
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Created: {formatDate(post.created_at)}
                  </div>
                  {post.linkedin_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(post.linkedin_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View on LinkedIn
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsletterAdmin;