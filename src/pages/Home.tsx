
import Layout from "../components/Layout";
import HeroSection from "../components/HeroSection";
import BenefitsSection from "../components/BenefitsSection";
import AboutAuthor from "../components/AboutAuthor";
import TestimonialsSection from "../components/TestimonialsSection";
import CommunityLinks from "../components/CommunityLinks";
import ComingSoonSection from "../components/ComingSoonSection";
import OnboardingTour from "../components/OnboardingTour";
import FeedbackWidget from "../components/FeedbackWidget";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Rocket, ArrowRight, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Home = () => {
  const features = [
    {
      title: "Learning Resources",
      description: "Comprehensive tutorials, courses, and hands-on projects to enhance your GIS skills.",
      href: "/learn",
      icon: "📚"
    },
    {
      title: "Interactive Map Tools",
      description: "Create and visualize geospatial data with our interactive mapping playground.",
      href: "/map-playground",
      icon: "🗺️"
    },
    {
      title: "Project Templates",
      description: "Ready-to-use templates with sample data for common GIS workflows and analyses.",
      href: "/project-templates",
      icon: "📋"
    },
    {
      title: "Code Snippets Library",
      description: "Runnable code examples and snippets for GIS development and automation.",
      href: "/code-snippets",
      icon: "💻"
    },
    {
      title: "Spatial Analysis Tools",
      description: "Access advanced spatial analysis capabilities, integrated with Python, SQL, and more.",
      href: "/spatial-analysis",
      icon: "📊"
    },
    {
      title: "Career Opportunities",
      description: "Connect with employers and professionals, and showcase your skills to the community.",
      href: "/job-posting",
      icon: "💼"
    }
  ];

  const benefits = [
    "Free access to core features",
    "Community-driven learning",
    "Industry-standard tools",
    "Expert-led tutorials",
    "Career development resources",
    "Regular updates and new content"
  ];

  return (
    <Layout>
      <HeroSection />
      
      {/* Beta Announcement Banner */}
      <section className="py-8 bg-gradient-to-r from-primary/10 to-accent/10 border-y">
        <div className="container text-center">
          <Badge variant="secondary" className="mb-4 px-4 py-2">
            <Rocket className="h-4 w-4 mr-2" />
            Public Beta Now Open
          </Badge>
          <h2 className="text-3xl font-bold mb-4">Join Our Beta Program!</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto text-lg">
            Get early access to all features, help shape the platform, and join our growing community of geospatial learners.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/beta">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                Join Beta for Free <Rocket className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline" size="lg">
                Create Account <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">About HaritaHive</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              HaritaHive is the comprehensive platform for geospatial professionals, providing cutting-edge tools, 
              resources, and a vibrant community for everyone in the GIS ecosystem.
            </p>
          </div>

          {/* Why Choose Us */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-muted-foreground">{benefit}</span>
              </div>
            ))}
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader>
                  <div className="text-3xl mb-2">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4 text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                  <Link to={feature.href}>
                    <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Explore <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      <TestimonialsSection />
      <ComingSoonSection />
      <BenefitsSection />
      <CommunityLinks />
      <AboutAuthor />
      
      {/* Call to Action */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join the HaritaHive community today and unlock the full potential of geospatial technology.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/beta">
              <Button size="lg" variant="secondary" className="min-w-[200px]">
                Join Beta Program
              </Button>
            </Link>
            <Link to="/learn">
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary min-w-[200px]">
                Explore Resources
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Engagement Components */}
      <OnboardingTour />
      <FeedbackWidget />
    </Layout>
  );
};

export default Home;
