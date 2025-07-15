import React, { useState } from 'react';
import Layout from "../../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  Users, 
  Star,
  CheckCircle,
  MapPin,
  Code,
  Database,
  Globe,
  Brain,
  ArrowRight,
  Play,
  Download,
  Trophy,
  Zap,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const GeospatialFullstackDeveloper = () => {
  const [email, setEmail] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();

  const courseStructure = [
    {
      week: "1-2",
      title: "Spatial Fundamentals for Developers",
      topics: [
        "GeoJSON, TopoJSON, Shapefiles",
        "Coordinate Reference Systems",
        "OpenStreetMap & Tile Layers",
        "QGIS & GDAL CLI tools"
      ],
      icon: <MapPin className="h-5 w-5" />
    },
    {
      week: "3-4", 
      title: "Backend with PostGIS + API",
      topics: [
        "PostGIS setup & spatial indexing",
        "SQL geometry & geography types",
        "ExpressJS REST API with PostGIS"
      ],
      icon: <Database className="h-5 w-5" />
    },
    {
      week: "5-6",
      title: "Web Mapping with Leaflet + MapLibre", 
      topics: [
        "Leaflet plugins, draw tools, basemaps",
        "MapLibre GL for 3D visualizations",
        "Tileserver-GL & custom vector tiles"
      ],
      icon: <Globe className="h-5 w-5" />
    },
    {
      week: "7-8",
      title: "Frontend GIS with React + Supabase",
      topics: [
        "React + Leaflet integration",
        "Supabase as spatial backend", 
        "Auth, dashboards, map filtering"
      ],
      icon: <Code className="h-5 w-5" />
    },
    {
      week: "9-10",
      title: "Real-time GIS Apps",
      topics: [
        "WebSockets + Supabase Realtime",
        "Live geolocation tracking",
        "Clustering, heatmaps with Turf.js"
      ],
      icon: <Zap className="h-5 w-5" />
    },
    {
      week: "11-12", 
      title: "Capstone & Deployment",
      topics: [
        "Choose from 4 real-world use cases",
        "Deploy with Vercel / Render",
        "GitHub repo, walkthrough, PDF cert"
      ],
      icon: <Trophy className="h-5 w-5" />
    }
  ];

  const toolsStack = {
    backend: ["PostgreSQL", "PostGIS", "Express", "Supabase"],
    frontend: ["React", "Leaflet", "MapLibre", "Tailwind"],
    realtime: ["Socket.io", "Supabase Realtime"],
    deployment: ["Vercel", "Netlify", "Render"],
    utilities: ["GDAL", "Turf.js", "QGIS", "Git"]
  };

  const capstoneProjects = [
    "Fleet Tracker - Real-time vehicle monitoring",
    "Urban Planner Dashboard - City analytics platform", 
    "Wildlife Sensor Map - Conservation tracking system",
    "Emergency Response Portal - Crisis management tools"
  ];

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    try {
      // Here you would integrate with your waitlist system
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Successfully joined waitlist!",
        description: "We'll notify you when enrollment opens on October 6, 2025.",
      });
      
      setEmail("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join waitlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Layout>
      <div className="container py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 bg-primary/10 text-primary border-primary/20">
            LAUNCHING OCTOBER 6, 2025
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Geospatial Full Stack Developer
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Master Web GIS, PostGIS, React Leaflet, and real-time mapping with AI-powered instruction. 
            Build production-ready geospatial applications from scratch.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              12 Weeks
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              October 6, 2025
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              Certification
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Brain className="h-3 w-3" />
              AI Avatar Instructor
            </Badge>
          </div>

          <div className="bg-primary/5 rounded-lg p-6 max-w-md mx-auto mb-8">
            <div className="text-3xl font-bold text-primary mb-2">₹14,999</div>
            <div className="text-muted-foreground">$179 USD</div>
            <div className="text-sm text-muted-foreground mt-2">Full course + certification</div>
          </div>
        </div>

        {/* AI Instructor Feature */}
        <Card className="mb-12 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Meet Harita AI Mentor</CardTitle>
                <CardDescription>Cutting-edge AI mentor powered by OpenAI + OBS with screen-share, voice, and live Q&A</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">AI Features:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Live screen-share via OBS streaming</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">AI voice + lipsync for explanations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Real-time questions via chat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Context-aware code highlighting</span>
                  </div>
                </div>
              </div>
              <div className="bg-background rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Play className="h-4 w-4 text-primary" />
                  <span className="font-medium">Demo Video</span>
                </div>
                <Link to="/ai-instructor">
                  <Button variant="outline" className="w-full">
                    Meet Your AI Instructor
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Structure */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">12-Week Learning Journey</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courseStructure.map((module, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {module.icon}
                      </div>
                      <Badge variant="outline">Week {module.week}</Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {module.topics.map((topic, topicIndex) => (
                      <div key={topicIndex} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{topic}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tools & Technologies */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Complete Tech Stack</CardTitle>
            <CardDescription className="text-center">Master the modern geospatial development ecosystem</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
              {Object.entries(toolsStack).map(([category, tools]) => (
                <div key={category} className="text-center">
                  <h4 className="font-semibold mb-3 capitalize">{category.replace('-', ' ')}</h4>
                  <div className="space-y-2">
                    {tools.map((tool, index) => (
                      <Badge key={index} variant="outline" className="block">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Access Tiers */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Choose Your Access Level</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2">
              <CardHeader>
                <Badge variant="outline" className="w-fit">Free</Badge>
                <CardTitle>Preview Only</CardTitle>
                <CardDescription>Sample lessons and course overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">First 2 lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Course roadmap</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Community access</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">POPULAR</Badge>
              </div>
              <CardHeader>
                <Badge variant="outline" className="w-fit">Professional</Badge>
                <CardTitle>Full Access</CardTitle>
                <CardDescription>Complete course with certification</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">All 12 weeks content</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">AI instructor access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Capstone project</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">PDF certification</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary">₹14,999</div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <Badge variant="outline" className="w-fit">Enterprise</Badge>
                <CardTitle>Full + Mentorship</CardTitle>
                <CardDescription>Everything plus 1-on-1 support</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Everything in Professional</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Weekly 1-on-1 sessions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Priority support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Project downloads</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Capstone Projects */}
        <Card className="mb-12" id="curriculum">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Real-World Capstone Projects</CardTitle>
            <CardDescription className="text-center">Choose from 4 industry-focused applications - explore project templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {capstoneProjects.map((project, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-secondary/10 rounded-lg">
                  <Target className="h-5 w-5 text-primary" />
                  <span>{project}</span>
                </div>
              ))}
            </div>
            <div className="text-center">
              <h4 className="font-semibold mb-3">Explore Project Templates:</h4>
              <div className="flex flex-wrap justify-center gap-2">
                <Link to="/project-templates/fleet-tracker">
                  <Badge variant="outline" className="hover:bg-primary/10">Fleet Tracker</Badge>
                </Link>
                <Link to="/project-templates/forest-fire-classifier">
                  <Badge variant="outline" className="hover:bg-primary/10">Forest Fire Classifier</Badge>
                </Link>
                <Link to="/project-templates/urban-traffic-dashboard">
                  <Badge variant="outline" className="hover:bg-primary/10">Urban Traffic Dashboard</Badge>
                </Link>
                <Link to="/project-templates/web-tourist-map">
                  <Badge variant="outline" className="hover:bg-primary/10">Web Tourist Map</Badge>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Waitlist Form */}
        <Card className="max-w-md mx-auto" id="waitlist">
          <CardHeader>
            <CardTitle className="text-center">Join the Waitlist</CardTitle>
            <CardDescription className="text-center">
              Be the first to know when enrollment opens on October 6, 2025
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoinWaitlist} className="space-y-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={isJoining}>
                {isJoining ? "Joining..." : "Join Waitlist"}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center mt-4">
              We'll only email you about this course. No spam.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default GeospatialFullstackDeveloper;