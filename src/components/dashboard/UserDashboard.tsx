import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
// Removed useSessionValidation to avoid conflicts with Supabase auth
import LiveClassBanner from "./LiveClassBanner";
import { ArrowRight, Crown, Zap, Lock, Loader2, Shield } from "lucide-react";
import { BookOpen, Map, Brain, Users, Code, Briefcase, Calendar, Layers, Building, Package, Puzzle, Award, GraduationCap, FileCode2, FileSearch2, FileBarChart } from "lucide-react";

interface Stat {
  title: string;
  value: string;
  icon: React.ComponentType<any>;
}

const UserDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isSuperAdmin, loading: rolesLoading } = useUserRoles();
  const { hasAccess, subscription, canAccessLearnSection, canAccessGeoAILab, canAccessWebGISBuilder, loading: premiumLoading } = usePremiumAccess();
  // Simplified - rely on AuthContext for session validation
  const [activeTab, setActiveTab] = useState("quick-actions");

  const stats: Stat[] = [
    { title: "Courses Enrolled", value: "7", icon: BookOpen },
    { title: "Projects Completed", value: "12", icon: FileCode2 },
    { title: "Community Posts", value: "45", icon: Users },
    { title: "Spatial Analyses", value: "28", icon: FileBarChart },
  ];

  const quickActions = [
    { title: "Start Learning", description: "Browse courses and tutorials", href: "/learn", icon: BookOpen },
    { title: "Interactive Map", description: "Explore our mapping tools", href: "/map-playground", icon: Map },
    { title: "GeoAI Lab", description: "AI-powered geospatial analysis", href: "/geoai-lab", icon: Brain },
    { title: "Community", description: "Connect with other GIS professionals", href: "/community", icon: Users },
    { title: "Code Snippets", description: "Ready-to-use GIS code examples", href: "/code-snippets", icon: Code },
    { title: "Job Board", description: "Find GIS career opportunities", href: "/job-posting", icon: Briefcase },
    { title: "Live Classes", description: "Join live GIS training sessions", href: "/live-classes", icon: Calendar },
    { title: "Web GIS Builder", description: "Create web-based GIS applications", href: "/webgis-builder", icon: Layers },
  ];

  const monetizationFeatures = [
    { title: "Hire GIS Talent", description: "Find verified professionals", href: "/talent-pool", icon: Users, badge: "Hiring" },
    { title: "Corporate Training", description: "Custom team training programs", href: "/corporate-training", icon: Building, badge: "B2B" },
    { title: "GIS Marketplace", description: "Tools, scripts & templates", href: "/gis-marketplace", icon: Package, badge: "Tools" },
    { title: "Plugin Store", description: "Extend your GIS capabilities", href: "/plugin-marketplace", icon: Puzzle, badge: "Plugins" },
    { title: "Task Board", description: "Freelance projects & micro-tasks", href: "/task-board", icon: Briefcase, badge: "Earn" },
    { title: "Certifications", description: "Industry-recognized credentials", href: "/certifications", icon: Award, badge: "Certified" },
  ];

  const recentActivities = [
    { title: "Completed 'Spatial Analysis with Python' course", date: "2 days ago" },
    { title: "Joined the 'Web Mapping' community forum", date: "5 days ago" },
    { title: "Submitted a code snippet for raster processing", date: "1 week ago" },
    { title: "Applied for a GIS Analyst position", date: "2 weeks ago" },
  ];

  const recommendations = [
    { title: "Advanced Remote Sensing Techniques", description: "Explore advanced methods for analyzing satellite imagery" },
    { title: "Building a GeoAI Application", description: "Learn how to integrate AI into your GIS workflows" },
    { title: "Contributing to Open Source GIS", description: "Discover how to contribute to open source GIS projects" },
  ];

  // Show loading state while validating session
  if (authLoading || premiumLoading || rolesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">
            {authLoading ? "Loading user data..." : rolesLoading ? "Loading user roles..." : "Loading dashboard..."}
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
              Welcome back, {user?.user_metadata?.full_name || 'GIS Professional'}! 👋
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
          ) : !hasAccess('premium') && (
            <Card className="max-w-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Crown className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Free Plan</p>
                    <p className="text-xs text-muted-foreground">Upgrade for full access</p>
                  </div>
                  <Link to="/pricing">
                    <Button size="sm">
                      <Zap className="h-3 w-3 mr-1" />
                      Upgrade
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        ))}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const isPremiumFeature = action.href === '/learn' || action.href === '/geoai-lab' || action.href === '/webgis-builder';
              // Super admins have access to all features
              const hasFeatureAccess = isSuperAdmin() || 
                (action.href === '/learn' ? canAccessLearnSection() :
                 action.href === '/geoai-lab' ? canAccessGeoAILab() :
                 action.href === '/webgis-builder' ? canAccessWebGISBuilder() : true);
              
              return (
                <Card key={index} className={`group hover:shadow-lg transition-all duration-300 ${!hasFeatureAccess ? 'opacity-75' : 'cursor-pointer'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <action.icon className={`h-8 w-8 group-hover:scale-110 transition-transform ${!hasFeatureAccess ? 'text-muted-foreground' : 'text-primary'}`} />
                      {isPremiumFeature && !hasFeatureAccess && (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <h3 className={`font-semibold mb-2 group-hover:text-primary transition-colors ${!hasFeatureAccess ? 'text-muted-foreground' : ''}`}>
                      {action.title}
                      {isPremiumFeature && !hasFeatureAccess && (
                        <Badge variant="secondary" className="ml-2 text-xs">Premium</Badge>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {action.description}
                    </p>
                    {hasFeatureAccess ? (
                      <Link to={action.href}>
                        <Button variant="outline" size="sm" className="w-full">
                          Access <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    ) : (
                      <Link to="/pricing">
                        <Button variant="outline" size="sm" className="w-full">
                          <Crown className="h-3 w-3 mr-2" />
                          Upgrade to Access
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
          <Button size="lg">Start Learning</Button>
          <Button variant="outline" size="lg">Join Community</Button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
