import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { useUserStats } from "@/hooks/useUserStats";
import { useUserActivity } from "@/hooks/useUserActivity";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
// Removed useSessionValidation to avoid conflicts with Supabase auth

import { ArrowRight, Crown, Zap, Lock, Loader2, Shield, RefreshCw } from "lucide-react";
import { BookOpen, Map, Brain, Users, Code, Briefcase, Calendar, Layers, Building, Package, Puzzle, Award, GraduationCap, FileCode2, FileSearch2, FileBarChart, Globe, Wrench, Presentation, UserPlus, Trophy, DollarSign, Upload, Target, Gamepad2, Play, BookText, ClipboardList, Compass, School, BrainCircuit, FileText, Database, Microscope } from "lucide-react";

interface Stat {
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  href?: string;
}

interface UserProfile {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

const UserDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isSuperAdmin, loading: rolesLoading } = useUserRoles();
  const { hasAccess, subscription, canAccessLearnSection, canAccessGeoAILab, canAccessWebGISBuilder, loading: premiumLoading } = usePremiumAccess();
  const { stats, plan, loading: statsLoading, refreshSession } = useUserStats();
  const { activities, loading: activityLoading } = useUserActivity();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState("quick-actions");

  // Fetch user profile data
  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, first_name, last_name, avatar_url')
          .eq('id', user.id)
          .single();

        if (data && !error) {
          setUserProfile(data);
        }
      };

      fetchUserProfile();
    }
  }, [user]);

  const isProfessionalOrAbove = () => {
    const tier = plan?.subscription_tier || 'free';
    return tier === 'pro' || tier === 'enterprise' || tier === 'premium';
  };

  const userStats: Stat[] = [
    { 
      title: "Courses Enrolled", 
      value: (isProfessionalOrAbove() ? "1" : stats?.course_count?.toString()) ?? "0", 
      icon: BookOpen,
      href: isProfessionalOrAbove() ? "/courses/geospatial-technology-unlocked" : "/browse-courses"
    },
    { 
      title: "Projects Completed", 
      value: stats?.projects_completed?.toString() ?? "0", 
      icon: FileCode2,
      href: "/projects"
    },
    { 
      title: "Community Posts", 
      value: stats?.community_posts?.toString() ?? "0", 
      icon: Users,
      href: "/community"
    },
    { 
      title: "Spatial Analyses", 
      value: stats?.spatial_analyses?.toString() ?? "0", 
      icon: FileBarChart,
      href: hasAccess('pro') ? "/geoai-lab" : "/choose-plan"
    },
  ];

  const quickActions = [
    { title: "Browse Courses", description: "Explore learning paths and tutorials", href: "/browse-courses", icon: BookOpen },
    { title: "Plugin Marketplace", description: "Discover and download GIS plugins", href: "/plugin-marketplace", icon: Puzzle },
    { title: "GIS Marketplace", description: "Tools, scripts & templates", href: "/gis-marketplace", icon: Package },
    { title: "Freelance Projects", description: "Find GIS project opportunities", href: "/task-board", icon: Briefcase },
    { title: "Portfolio Builder", description: "Showcase your GIS work", href: "/portfolio", icon: Presentation },
    { title: "Project Studio", description: "Create and manage projects", href: "/projects", icon: Layers },
    { title: "Spatial Tools", description: "GIS analysis and processing tools", href: hasAccess('pro') ? "/geoai-lab" : "/choose-plan", icon: Wrench, premium: true },
    { title: "Certification", description: "Get industry-recognized credentials", href: "/certifications", icon: Award },
    { title: "AI Mentor", description: "Get AI-powered GIS guidance", href: hasAccess('pro') ? "/ai-mentor" : "/choose-plan", icon: BrainCircuit, premium: true },
    { title: "Resume Roadmap", description: "Build your career path", href: "/resume-roadmap", icon: FileText },
    { title: "Labs", description: "Hands-on GIS experiments", href: hasAccess('pro') ? "/labs" : "/choose-plan", icon: Microscope, premium: true },
    { title: "Code Snippets", description: "Ready-to-use GIS code examples", href: "/code-snippets", icon: Code },
    { title: "Templates", description: "Project templates and starter kits", href: "/templates", icon: FileSearch2 },
    { title: "Live Classes", description: "Join live GIS training sessions", href: "/live-classes", icon: Calendar },
    { title: "Community", description: "Connect with other GIS professionals", href: "/community", icon: Users },
    { title: "Interactive Map", description: "Explore our mapping tools", href: hasAccess('pro') ? "/map-playground" : "/choose-plan", icon: Map, premium: true },
  ];

  const monetizationFeatures = [
    { title: "Upload Plugin", description: "Sell your GIS plugins to the community", href: "/plugin-marketplace/upload", icon: Upload, badge: "Earn" },
    { title: "Freelance Projects", description: "Apply to GIS project opportunities", href: "/task-board", icon: Target, badge: "Apply" },
    { title: "Sell GIS Tools", description: "Monetize your tools and scripts", href: "/gis-marketplace/sell", icon: Package, badge: "Sell" },
    { title: "Offer Services", description: "Provide data and consulting services", href: "/services/offer", icon: Building, badge: "Services" },
    { title: "Become Creator", description: "Join our creator program", href: "/community/creator-application", icon: UserPlus, badge: "Creator" },
    { title: "Referral Program", description: "Earn rewards for referrals", href: "/referrals", icon: DollarSign, badge: "Rewards" },
    { title: "Corporate Training", description: "Offer training to companies", href: "/corporate-training", icon: School, badge: "Training" },
    { title: "Marketplace Revenue", description: "Track your earnings", href: "/dashboard/earnings", icon: Trophy, badge: "Revenue" },
  ];

  // Use real activity data from the hook
  const recentActivities = activities.length > 0 ? activities : [
    { title: "Welcome to Harita Hive! Start exploring", date: "Just now" },
    { title: "Complete your profile to get personalized recommendations", date: "Today" },
  ];

  const recommendations = [
    { title: "Advanced Remote Sensing Techniques", description: "Explore advanced methods for analyzing satellite imagery" },
    { title: "Building a GeoAI Application", description: "Learn how to integrate AI into your GIS workflows" },
    { title: "Contributing to Open Source GIS", description: "Discover how to contribute to open source GIS projects" },
  ];

  const handleRefreshSession = async () => {
    try {
      await refreshSession();
      toast({
        title: "Session refreshed",
        description: "Your session and plan information have been updated.",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Failed to refresh session. Please try logging in again.",
        variant: "destructive",
      });
    }
  };

  const getPlanDisplayName = () => {
    // Always use subscription_tier as primary source of truth
    const tier = plan?.subscription_tier || 'free';
    
    switch (tier) {
      case 'pro':
        return 'Professional Plan';
      case 'enterprise':
        return 'Enterprise Plan';
      case 'premium':
        return 'Premium Plan';
      default:
        return 'Free Plan';
    }
  };

  const shouldShowFreePlanTag = () => {
    // Only show Free Plan tag for actual free users
    const tier = plan?.subscription_tier || 'free';
    return tier === 'free';
  };

  // Show loading state while validating session
  if (authLoading || premiumLoading || rolesLoading || statsLoading || activityLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">
            {authLoading ? "Loading user data..." : 
             rolesLoading ? "Loading user roles..." : 
             statsLoading ? "Loading user statistics..." : "Loading dashboard..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {userProfile?.full_name || 
                (userProfile?.first_name && userProfile?.last_name 
                  ? `${userProfile.first_name} ${userProfile.last_name}` 
                  : user?.user_metadata?.full_name) || 'GIS Professional'}! 👋
            </h1>
            <p className="text-muted-foreground">
            Continue your geospatial journey and explore new opportunities
            </p>
          </div>
          {isSuperAdmin() ? (
            <Card className="max-w-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Super Admin</p>
                    <p className="text-xs text-muted-foreground">Full platform access</p>
                  </div>
                  <Link to="/admin">
                    <Button size="sm">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin Panel
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="max-w-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {isProfessionalOrAbove() ? (
                    <Crown className="h-5 w-5 text-primary" />
                  ) : (
                    <Crown className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{getPlanDisplayName()}</p>
                    <p className="text-xs text-muted-foreground">
                      {isProfessionalOrAbove() ? "Premium features unlocked" : "Upgrade for full access"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={handleRefreshSession}>
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                    {!isProfessionalOrAbove() && (
                      <Link to="/pricing">
                        <Button size="sm">
                          <Zap className="h-3 w-3 mr-1" />
                          Upgrade
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {userStats.map((stat, index) => {
          const StatCard = ({ children }: { children: React.ReactNode }) => {
            if (stat.href && (parseInt(stat.value) > 0 || stat.title === "Courses Enrolled")) {
              return (
                <Link to={stat.href} className="block">
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    {children}
                  </Card>
                </Link>
              );
            }
            return <Card>{children}</Card>;
          };

          return (
            <StatCard key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {stat.href && (parseInt(stat.value) > 0 || stat.title === "Courses Enrolled") && (
                      <p className="text-xs text-primary mt-1">Click to view →</p>
                    )}
                  </div>
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </StatCard>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="quick-actions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quick-actions">Quick Actions</TabsTrigger>
          <TabsTrigger value="monetization">Earn Money</TabsTrigger>
          <TabsTrigger value="recent-activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="recommendations">For You</TabsTrigger>
        </TabsList>

        <TabsContent value="quick-actions">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const isPremiumFeature = action.premium || false;
              // Super admins have access to all features
              const hasFeatureAccess = isSuperAdmin() || !isPremiumFeature || hasAccess('pro') || hasAccess('enterprise');
              
              return (
                <Card key={index} className={`group hover:shadow-lg transition-all duration-300 ${!hasFeatureAccess ? 'opacity-75' : 'cursor-pointer'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <action.icon className={`h-6 w-6 group-hover:scale-110 transition-transform ${!hasFeatureAccess ? 'text-muted-foreground' : 'text-primary'}`} />
                      {isPremiumFeature && !hasFeatureAccess && (
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <h3 className={`font-semibold mb-1 text-sm group-hover:text-primary transition-colors ${!hasFeatureAccess ? 'text-muted-foreground' : ''}`}>
                      {action.title}
                      {isPremiumFeature && !hasFeatureAccess && (
                        <Badge variant="secondary" className="ml-1 text-xs">Premium</Badge>
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      {action.description}
                    </p>
                    {hasFeatureAccess ? (
                      <Link to={action.href}>
                        <Button variant="outline" size="sm" className="w-full text-xs">
                          Access <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    ) : (
                      <Link to="/pricing">
                        <Button variant="outline" size="sm" className="w-full text-xs">
                          <Crown className="h-3 w-3 mr-1" />
                          Upgrade
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="monetization">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {monetizationFeatures.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20">
                <CardContent className="p-6">
                  <Link to={feature.href} className="block">
                    <div className="flex items-center justify-between mb-4">
                      <feature.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                      <Badge variant="secondary" className="text-xs">
                        {feature.badge}
                      </Badge>
                    </div>
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                    <div className="mt-4">
                      <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        Explore <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent-activity">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              <ul className="list-none space-y-3">
                {recentActivities.map((activity, index) => (
                  <li key={index} className="border-b pb-3 last:border-none">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.date}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Recommended for You</h2>
              <ul className="list-none space-y-4">
                {recommendations.map((recommendation, index) => (
                  <li key={index} className="border-b pb-4 last:border-none">
                    <h3 className="font-semibold">{recommendation.title}</h3>
                    <p className="text-sm text-muted-foreground">{recommendation.description}</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Explore
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Call to Action Section */}
      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to take your GIS skills to the next level?</h2>
        <p className="text-muted-foreground mb-6">
          Explore our learning resources, connect with the community, and discover new opportunities.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/auth">
            <Button size="lg">Start Learning</Button>
          </Link>
          <a 
            href="https://discord.gg/haritahive" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg">Join Community</Button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
