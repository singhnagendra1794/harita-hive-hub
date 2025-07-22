import React, { useState, useEffect } from "react";
import { Upload, Video, Mic, Settings, Play, Download, Share, Globe, FileText, Camera, Users, TrendingUp, Star, Award } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { VideoUploadComponent } from "@/components/studio/VideoUploadComponent";
import { ContentCard } from "@/components/studio/ContentCard";

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
  views_count: number;
  likes_count: number;
  comments_count: number;
  is_featured: boolean;
  created_at: string;
  user_id: string;
  tags: any;
  user_liked?: boolean;
  creator_name?: string;
  creator_avatar?: string;
}

interface FeaturedCreator {
  id: string;
  user_id: string;
  creator_name: string;
  bio: string;
  total_views: number;
  total_likes: number;
  content_count: number;
  avatar_url?: string;
  specialties: any;
  featured_this_week: boolean;
}

const Studio = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("create");
  const [myContent, setMyContent] = useState<StudioContent[]>([]);
  const [featuredContent, setFeaturedContent] = useState<StudioContent[]>([]);
  const [featuredCreators, setFeaturedCreators] = useState<FeaturedCreator[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (activeTab === 'my-content') {
      fetchMyContent();
    } else if (activeTab === 'featured-creators') {
      fetchFeaturedContent();
      fetchFeaturedCreators();
    }
  }, [activeTab, user]);

  const fetchMyContent = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('studio_content')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyContent(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedContent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('studio_content')
        .select('*')
        .eq('is_published', true)
        .order('likes_count', { ascending: false })
        .order('views_count', { ascending: false })
        .limit(12);

      if (error) throw error;
      setFeaturedContent(data || []);
    } catch (error) {
      console.error('Error fetching featured content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedCreators = async () => {
    try {
      const { data, error } = await supabase
        .from('creator_profiles_enhanced')
        .select('*')
        .eq('featured_this_week', true)
        .order('total_views', { ascending: false })
        .limit(6);

      if (error) throw error;
      
      const mapped = data?.map(item => ({
        ...item,
        creator_name: 'Creator',
        content_count: 0
      })) || [];
      
      setFeaturedCreators(mapped);
    } catch (error) {
      console.error('Error fetching featured creators:', error);
    }
  };

  const handleContentUpdate = () => {
    if (activeTab === 'my-content') {
      fetchMyContent();
    } else if (activeTab === 'featured-creators') {
      fetchFeaturedContent();
    }
  };

  const handleStartRecording = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create content.",
        variant: "destructive"
      });
      return;
    }

    setIsRecording(true);
    toast({
      title: "Recording Started",
      description: "Your screen recording has begun. Click stop when finished.",
    });

    setTimeout(() => {
      setIsRecording(false);
      toast({
        title: "Recording Complete",
        description: "Your video is being processed and will be available soon.",
      });
    }, 5000);
  };

  const handleAIVoiceover = () => {
    toast({
      title: "AI Voiceover",
      description: "AI voiceover generation will be available soon!",
    });
  };

  return (
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Geospatial Talent Showcase</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Create, upload, and showcase your geospatial expertise to the global community
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="my-content">My Content</TabsTrigger>
            <TabsTrigger value="featured-creators">Featured Creators</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Screen Recording */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Screen Recording
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Record your screen to create tutorials and demonstrations
                  </p>
                  <Button 
                    onClick={handleStartRecording}
                    className={`w-full ${isRecording ? 'bg-red-600 hover:bg-red-700' : ''}`}
                    disabled={isRecording}
                  >
                    {isRecording ? 'Recording...' : 'Start Recording'}
                  </Button>
                  {isRecording && (
                    <div className="mt-4 text-center">
                      <div className="animate-pulse text-red-600">● REC</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Map Walkthrough */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Map Walkthrough
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Create guided tours of your maps with voiceover
                  </p>
                  <Button className="w-full" onClick={() => toast({ title: "Feature Coming Soon", description: "Map walkthrough creator is in development." })}>
                    Create Walkthrough
                  </Button>
                </CardContent>
              </Card>

              {/* Before/After Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Before/After Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Showcase temporal changes using satellite imagery
                  </p>
                  <Button className="w-full" onClick={() => toast({ title: "Feature Coming Soon", description: "Before/after analysis tool is in development." })}>
                    Create Analysis
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Recording Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Recording Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="quality">Quality</Label>
                    <Select defaultValue="1080p">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="720p">720p HD</SelectItem>
                        <SelectItem value="1080p">1080p Full HD</SelectItem>
                        <SelectItem value="4k">4K Ultra HD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="framerate">Frame Rate</Label>
                    <Select defaultValue="30fps">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24fps">24 FPS</SelectItem>
                        <SelectItem value="30fps">30 FPS</SelectItem>
                        <SelectItem value="60fps">60 FPS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="audio">Audio Source</Label>
                    <Select defaultValue="microphone">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Audio</SelectItem>
                        <SelectItem value="microphone">Microphone</SelectItem>
                        <SelectItem value="system">System Audio</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <VideoUploadComponent onUploadComplete={handleContentUpdate} />
          </TabsContent>

          <TabsContent value="my-content" className="space-y-6">
            {!user ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Video className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Sign in to view your content</h3>
                  <p className="text-muted-foreground text-center">
                    Please sign in to access your uploaded videos and content.
                  </p>
                </CardContent>
              </Card>
            ) : loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-video bg-muted rounded-t-lg" />
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : myContent.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No content yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Start by uploading your first video or creating new content.
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={() => setActiveTab('upload')}>
                      Upload Content
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('create')}>
                      Create New
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myContent.map((content) => (
                  <ContentCard
                    key={content.id}
                    content={content}
                    onUpdate={handleContentUpdate}
                    showCreator={false}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="featured-creators" className="space-y-6">
            {/* Featured Content */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Trending Content</h2>
                <Badge variant="secondary">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  This Week
                </Badge>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="aspect-video bg-muted rounded-t-lg" />
                      <CardHeader>
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : featuredContent.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Star className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No featured content yet</h3>
                    <p className="text-muted-foreground text-center">
                      Be the first to create amazing geospatial content!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredContent.map((content) => (
                    <ContentCard
                      key={content.id}
                      content={content}
                      onUpdate={handleContentUpdate}
                      showCreator={true}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Featured Creators */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Featured Creators</h2>
                <Badge variant="secondary">
                  <Award className="h-4 w-4 mr-1" />
                  This Week
                </Badge>
              </div>
              
              {featuredCreators.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No featured creators yet</h3>
                    <p className="text-muted-foreground text-center">
                      Start creating content to become a featured creator!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredCreators.map((creator) => (
                    <Card key={creator.id} className="group hover:shadow-lg transition-shadow">
                      <CardHeader className="text-center">
                        <Avatar className="h-16 w-16 mx-auto mb-4">
                          <AvatarImage src={creator.avatar_url} />
                          <AvatarFallback className="text-lg">
                            {creator.creator_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <CardTitle className="group-hover:text-primary transition-colors">
                          {creator.creator_name}
                        </CardTitle>
                        {creator.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {creator.bio}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-primary">{creator.total_views}</div>
                            <div className="text-xs text-muted-foreground">Total Views</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-primary">{creator.total_likes}</div>
                            <div className="text-xs text-muted-foreground">Total Likes</div>
                          </div>
                        </div>

                        <Button className="w-full" size="sm">
                          View Profile
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default Studio;