import React, { useState, useEffect } from 'react';
import { updatePageSEO, seoData } from '@/utils/seoUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Send, 
  CalendarDays, 
  ExternalLink, 
  CheckCircle,
  Briefcase,
  GraduationCap,
  Wrench,
  Brain,
  Clock,
  Users,
  TrendingUp,
  Star,
  Search,
  Filter,
  Grid,
  List,
  Globe,
  Plus,
  Edit,
  Sparkles,
  BookOpen,
  Calendar,
  Bookmark,
  Share,
  Download,
  Eye,
  ArrowRight,
  Newspaper
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { NewsletterCreator } from '@/components/newsletter/NewsletterCreator';
import { CuratedContent } from '@/components/newsletter/CuratedContent';
import { AINewsletterSuggestions } from '@/components/newsletter/AINewsletterSuggestions';

const Newsletter = () => {
  const { user } = useAuth();
  const { hasRole } = useUserRoles();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeTab, setActiveTab] = useState('discover');

  useEffect(() => {
    // Update SEO for newsletter page
    const { title, description, keywords } = seoData.newsletter;
    updatePageSEO({
      title: 'Geospatial Newsletter Hub - Latest GeoAI & Tech Updates | HaritaHive',
      description: 'Your one-stop hub for geospatial technology, GeoAI, automation, and data science newsletters. Discover curated content and create your own newsletter.',
      keywords: 'geospatial newsletter, GeoAI newsletter, geospatial technology news, remote sensing updates, GIS automation, spatial data science',
      url: window.location.href,
      type: 'website'
    });
    
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user]);

  const checkSubscriptionStatus = async () => {
    if (!user?.email) return;

    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('status')
        .eq('email', user.email)
        .eq('status', 'active')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setIsSubscribed(!!data);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !fullName) {
      toast({
        title: "Missing Information",
        description: "Please fill in both your name and email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubscribing(true);

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email: email.toLowerCase(),
          full_name: fullName,
          user_id: user?.id || null,
          status: 'active'
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already Subscribed",
            description: "This email is already subscribed to our newsletter.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        setIsSubscribed(true);
        toast({
          title: "Successfully Subscribed!",
          description: "Welcome to the HaritaHive newsletter community.",
        });
        setEmail('');
        setFullName('');
      }
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      toast({
        title: "Subscription Failed",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Newspaper className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            🌍 Geospatial Newsletter Hub
          </h1>
        </div>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-4xl mx-auto">
          Your one-stop hub for the most relevant <strong>Geospatial Technology, GeoAI, Automation, Data Science, and Machine Learning</strong> newsletters—featuring curated content from the past month, direct article links, and a built-in newsletter creator.
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">25+</div>
            <div className="text-sm text-muted-foreground">Featured Newsletters</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">150+</div>
            <div className="text-sm text-muted-foreground">Curated Articles</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">5K+</div>
            <div className="text-sm text-muted-foreground">Subscribers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">Weekly</div>
            <div className="text-sm text-muted-foreground">Updates</div>
          </div>
        </div>

        {/* Newsletter Subscription Form */}
        {!isSubscribed ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-lg">Join the Community</CardTitle>
              <CardDescription>
                Stay updated with the latest geospatial technology trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubscribe} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button 
                  type="submit" 
                  className="w-full mb-3" 
                  disabled={isSubscribing}
                >
                  {isSubscribing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Subscribe to Updates
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => window.open('https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7329705663612289024', '_blank')}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Follow on LinkedIn
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-md mx-auto border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">You're subscribed!</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2 text-center">
                Thank you for joining our newsletter community.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discover" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Discover
          </TabsTrigger>
          <TabsTrigger value="curated" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Curated Content
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Create Newsletter
          </TabsTrigger>
          <TabsTrigger value="ai-suggestions" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI Suggestions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-8">
          {/* Featured Newsletters Section */}
          <div>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
              <Star className="h-8 w-8 text-yellow-500" />
              Featured Newsletters (July 2025)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="group hover:shadow-lg transition-all duration-300 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                    <Badge variant="secondary">AI Platform</Badge>
                  </div>
                  <CardTitle className="text-lg">Shovels.ai July 2025</CardTitle>
                  <CardDescription>
                    Updates on mapping & AI platform developments, permit data, and enterprise news
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      2.1K views
                    </div>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Read More
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-green-200 bg-green-50/50 dark:bg-green-950/20">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <Globe className="h-4 w-4 text-white" />
                    </div>
                    <Badge variant="secondary">Industry</Badge>
                  </div>
                  <CardTitle className="text-lg">NV5 Geospatial June 2025</CardTitle>
                  <CardDescription>
                    Industry projects update with real-world application examples and case studies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      1.8K views
                    </div>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Read More
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <GraduationCap className="h-4 w-4 text-white" />
                    </div>
                    <Badge variant="secondary">Research</Badge>
                  </div>
                  <CardTitle className="text-lg">I‑GUIDE Spring 2025</CardTitle>
                  <CardDescription>
                    Spatial AI challenges, workshops in sustainability, and academic research updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      1.5K views
                    </div>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Read More
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <Badge variant="secondary">Events</Badge>
                  </div>
                  <CardTitle className="text-lg">Geo Week Spotlight</CardTitle>
                  <CardDescription>
                    Esri UC highlights, drone AI in flood mapping, and industry event coverage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      2.8K views
                    </div>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Read More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Article Spotlight */}
          <div>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-blue-500" />
              Article Spotlight
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Startup News</Badge>
                    <Badge variant="outline">$15M Series A</Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    Startup Raises $15M for Custom AI Maps
                  </CardTitle>
                  <CardDescription>
                    Revolutionary platform for wildfire and flood monitoring using advanced geospatial AI and real-time satellite data processing.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        July 15, 2025
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        3.2K reads
                      </span>
                    </div>
                    <Button size="sm">
                      Read Article
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Industry Trends</Badge>
                    <Badge variant="outline">Case Studies</Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    How GeoAI is Shaping Field Operations
                  </CardTitle>
                  <CardDescription>
                    Comprehensive analysis of GeoAI applications in utility management, construction planning, and infrastructure development.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        July 12, 2025
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        2.7K reads
                      </span>
                    </div>
                    <Button size="sm">
                      Read Article
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Upcoming Events */}
          <div>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="h-8 w-8 text-green-500" />
              Upcoming Events & Newsletters
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <Badge>Aug 15-17, 2025</Badge>
                  </div>
                  <CardTitle>GeoAI Conference 2025</CardTitle>
                  <CardDescription>
                    Major AI+GIS event featuring latest innovations in spatial artificial intelligence
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Learn More
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>GEO Insight Newsletter</CardTitle>
                  <CardDescription>
                    July 2025 edition featuring industry reflections & AI innovation trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Bookmark className="h-4 w-4 mr-2" />
                    Subscribe
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>WGIC Horizon News</CardTitle>
                  <CardDescription>
                    Global mapping & sustainability trends with monthly industry updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    <Bookmark className="h-4 w-4 mr-2" />
                    Subscribe
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="curated">
          <CuratedContent />
        </TabsContent>

        <TabsContent value="create">
          <NewsletterCreator />
        </TabsContent>

        <TabsContent value="ai-suggestions">
          <AINewsletterSuggestions />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Newsletter;