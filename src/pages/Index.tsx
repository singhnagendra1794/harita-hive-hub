
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Users, Award, MapPin, Code, Brain, Layers } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const features = [
    {
      icon: BookOpen,
      title: "Interactive Learning",
      description: "Hands-on GIS courses with real-world projects and expert instruction"
    },
    {
      icon: Brain,
      title: "GeoAI Lab",
      description: "AI-powered geospatial analysis tools for advanced workflows"
    },
    {
      icon: Layers,
      title: "Web GIS Builder",
      description: "Create interactive web maps and dashboards without coding"
    },
    {
      icon: Code,
      title: "Plugin Marketplace",
      description: "Download and share GIS tools, scripts, and extensions"
    },
    {
      icon: Users,
      title: "Professional Network",
      description: "Connect with GIS professionals and find career opportunities"
    },
    {
      icon: Award,
      title: "Certifications",
      description: "Earn industry-recognized credentials with blockchain verification"
    }
  ];

  const stats = [
    { label: "Active Students", value: "2,500+" },
    { label: "Courses Available", value: "50+" },
    { label: "Expert Instructors", value: "25+" },
    { label: "Success Rate", value: "95%" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      {/* Hero Section */}
      <section className="container py-20 text-center">
        <Badge variant="secondary" className="mb-6 px-4 py-2">
          🚀 Platform Launch - Join Our Community
        </Badge>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Master GIS Technology
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Transform your career with comprehensive GIS education, cutting-edge tools, and a thriving professional community. 
          From beginner basics to advanced enterprise solutions.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link to="/signup">
            <Button size="lg" className="min-w-[200px]">
              Start Learning Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/learn">
            <Button variant="outline" size="lg" className="min-w-[200px]">
              Browse Courses
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">Everything You Need to Excel</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive platform combines education, tools, and community to accelerate your GIS journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your GIS Journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of professionals who have transformed their careers with our comprehensive GIS platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="min-w-[200px]">
                Create Free Account
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary min-w-[200px]">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
