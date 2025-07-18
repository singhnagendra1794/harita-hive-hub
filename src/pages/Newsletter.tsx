import React, { useState, useEffect } from 'react';
import { updatePageSEO, seoData } from '@/utils/seoUtils';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NewsletterPost {
  id: string;
  title: string;
  summary: string;
  linkedin_url: string;
  published_date: string;
  tags: string[];
  view_count: number;
  is_featured: boolean;
}

const Newsletter = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [posts, setPosts] = useState<NewsletterPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Update SEO for newsletter page
    const { title, description, keywords } = seoData.newsletter;
    updatePageSEO({
      title,
      description,
      keywords,
      url: window.location.href,
      type: 'website'
    });
    
    fetchNewsletterPosts();
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user]);

  const fetchNewsletterPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletter_posts')
        .select('*')
        .order('published_date', { ascending: false })
        .limit(6);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching newsletter posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    if (!user) return;

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
          description: "Welcome to the Harita Hive newsletter community.",
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      'GeoAI': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Python': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Remote Sensing': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Careers': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'OpenStreetMap': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      'default': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    };
    return colors[tag] || colors.default;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            🌍 Never Miss a Geospatial Breakthrough
          </h1>
        </div>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Weekly insights, updates, tools, jobs, and industry trends — directly from Harita Hive.
        </p>

        {/* Newsletter Subscription Form */}
        {!isSubscribed ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-lg">Subscribe Now</CardTitle>
              <CardDescription>
                Join 5,000+ geospatial professionals getting weekly updates
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
                  className="w-full" 
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
                      Subscribe Now
                    </>
                  )}
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

      {/* Latest Newsletters Grid */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Latest Newsletter Posts</h2>
          <Badge variant="secondary" className="text-sm">
            <TrendingUp className="h-4 w-4 mr-1" />
            Weekly Updates
          </Badge>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className={`hover:shadow-lg transition-shadow ${post.is_featured ? 'ring-2 ring-primary/20' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg leading-tight">
                      {post.title}
                      {post.is_featured && <Star className="h-4 w-4 text-yellow-500 inline ml-2" />}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    {formatDate(post.published_date)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {post.summary}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags?.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className={getTagColor(tag)}>
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {post.view_count} views
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(post.linkedin_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Read Full Post
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Why Subscribe Section */}
      <div className="mb-16">
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2">Why Subscribe to Our Newsletter?</CardTitle>
            <CardDescription className="text-lg">
              Join thousands of GIS professionals staying ahead of the curve
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Wrench className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">🛠️ New GIS Tools & Templates</h3>
                  <p className="text-muted-foreground">
                    Be first to hear about new tools, plugins, and templates that can boost your productivity.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">📚 Course Launches & Updates</h3>
                  <p className="text-muted-foreground">
                    Get notified on new course launches, updates, and exclusive early bird discounts.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Briefcase className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">💼 Job Postings & Internships</h3>
                  <p className="text-muted-foreground">
                    Stay in sync with new job postings, internship alerts, and career opportunities.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Brain className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">🧠 AI Tutorials & GeoAI Tips</h3>
                  <p className="text-muted-foreground">
                    Learn from AI tutorials, GeoAI tips, and see student projects that inspire.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Newsletter Archive Section */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Newsletter Archive
            </CardTitle>
            <CardDescription>
              Browse past newsletters organized by month and year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Archive feature coming soon! All newsletters will be organized by month and year for easy browsing.
              </p>
              <Badge variant="outline">Coming Soon</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </Layout>
  );
};

export default Newsletter;