import React, { useState, useEffect } from "react";
import { 
  Upload, Video, Mic, Settings, Play, Download, Share, Globe, FileText, Camera, Users, TrendingUp, Star, Award,
  ScreenShare, Map, Palette, Layers, Zap, BookOpen, Folder, Monitor, MapPin, BarChart3, Sparkles
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { VideoUploadComponent } from "@/components/studio/VideoUploadComponent";
import { ContentCard } from "@/components/studio/ContentCard";
import { ScreenRecorder } from "@/components/studio/ScreenRecorder";
import { MapWalkthroughCreator } from "@/components/studio/MapWalkthroughCreator";
import { BeforeAfterAnalyzer } from "@/components/studio/BeforeAfterAnalyzer";
import { StudioResourceCenter } from "@/components/studio/StudioResourceCenter";
import { AIFeatures } from "@/components/studio/AIFeatures";
import { EnhancedUploadSystem } from "@/components/studio/EnhancedUploadSystem";

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
  const [activeSection, setActiveSection] = useState("my-studio");
  const [activeCreationTool, setActiveCreationTool] = useState<string | null>(null);
  const [myContent, setMyContent] = useState<StudioContent[]>([]);
  const [featuredContent, setFeaturedContent] = useState<StudioContent[]>([]);
  const [featuredCreators, setFeaturedCreators] = useState<FeaturedCreator[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (activeSection === 'my-studio') {
      fetchMyContent();
    } else if (activeSection === 'showcase-gallery') {
      fetchFeaturedContent();
      fetchFeaturedCreators();
    }
  }, [activeSection, user]);

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
    if (activeSection === 'my-studio') {
      fetchMyContent();
    } else if (activeSection === 'showcase-gallery') {
      fetchFeaturedContent();
    }
  };

  const studioSections = [
    { id: 'my-studio', label: 'My Studio', icon: Monitor },
    { id: 'upload-content', label: 'Enhanced Upload', icon: Upload },
    { id: 'ai-features', label: 'AI Tools', icon: Sparkles },
    { id: 'record-screen', label: 'Record Screen', icon: ScreenShare },
    { id: 'map-walkthrough', label: 'Map Walkthrough', icon: MapPin },
    { id: 'before-after', label: 'Before/After Analysis', icon: BarChart3 },
    { id: 'showcase-gallery', label: 'Showcase Gallery', icon: Star },
    { id: 'downloads', label: 'Downloads', icon: Download },
  ];

  const creationTools = [
    {
      id: 'screen-recording',
      title: 'Professional Screen Recording',
      description: 'Record your screen in 1080p with audio for tutorials and demos',
      icon: ScreenShare,
      component: ScreenRecorder,
      features: ['1080p HD Recording', 'Audio Capture', 'Auto-upload', 'Custom Thumbnails']
    },
    {
      id: 'map-walkthrough',
      title: 'Interactive Map Walkthrough',
      description: 'Create guided tours of your maps with voiceover narration',
      icon: MapPin,
      component: MapWalkthroughCreator,
      features: ['Step-by-step Navigation', 'Voiceover Recording', 'Scene Jumps', 'Export Options']
    },
    {
      id: 'before-after-analysis',
      title: 'Before/After Satellite Analysis',
      description: 'Showcase temporal changes using satellite imagery comparison',
      icon: BarChart3,
      component: BeforeAfterAnalyzer,
      features: ['Satellite Data Integration', 'Temporal Analysis', 'Interactive Slider', 'Auto-generation']
    }
  ];

  const renderMainContent = () => {
    switch (activeSection) {
      case 'my-studio':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">My Studio Dashboard</h2>
                <p className="text-muted-foreground">Manage and create your geospatial content</p>
              </div>
              {user && (
                <Button onClick={() => setActiveSection('upload-content')}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Content
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {creationTools.map((tool) => (
                <Card key={tool.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
                      onClick={() => setActiveCreationTool(tool.id)}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 group-hover:text-primary transition-colors">
                      <tool.icon className="h-5 w-5" />
                      {tool.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{tool.description}</p>
                    <div className="space-y-2">
                      {tool.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">My Recent Content</h3>
                <Button variant="outline" size="sm">View All</Button>
              </div>
              
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
                  {[...Array(3)].map((_, i) => (
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
                      Start by creating your first video or uploading content.
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={() => setActiveSection('upload-content')}>
                        Upload Content
                      </Button>
                      <Button variant="outline" onClick={() => setActiveCreationTool('screen-recording')}>
                        Start Recording
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myContent.slice(0, 3).map((content) => (
                    <ContentCard
                      key={content.id}
                      content={content}
                      onUpdate={handleContentUpdate}
                      showCreator={false}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'upload-content':
        return <EnhancedUploadSystem onUploadComplete={handleContentUpdate} />;
      case 'ai-features':
        return <AIFeatures onUpdate={handleContentUpdate} />;
      case 'record-screen':
        return <ScreenRecorder onComplete={handleContentUpdate} />;
      case 'map-walkthrough':
        return <MapWalkthroughCreator onComplete={handleContentUpdate} />;
      case 'before-after':
        return <BeforeAfterAnalyzer onComplete={handleContentUpdate} />;
      case 'downloads':
        return <StudioResourceCenter />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <div className="w-64 min-h-screen bg-muted/30 border-r">
          <div className="p-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold">Content Studio</h1>
              <p className="text-sm text-muted-foreground">Professional GIS Creator Hub</p>
            </div>

            <nav className="space-y-2">
              {studioSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    setActiveCreationTool(null);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <section.icon className="h-5 w-5" />
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex-1 p-8">
          {activeCreationTool ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => setActiveCreationTool(null)}>
                  ← Back to Studio
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <div>
                  <h2 className="text-2xl font-bold">
                    {creationTools.find(t => t.id === activeCreationTool)?.title}
                  </h2>
                  <p className="text-muted-foreground">
                    {creationTools.find(t => t.id === activeCreationTool)?.description}
                  </p>
                </div>
              </div>
              
              {(() => {
                const tool = creationTools.find(t => t.id === activeCreationTool);
                if (!tool) return null;
                const Component = tool.component;
                return <Component onComplete={handleContentUpdate} />;
              })()}
            </div>
          ) : (
            renderMainContent()
          )}
        </div>
      </div>
    </div>
  );
};

export default Studio;