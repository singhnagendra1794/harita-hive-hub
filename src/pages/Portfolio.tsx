import { useState } from "react";
import { Download, Edit, Eye, Github, Globe, FileText, Plus, Settings, Share, User } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Project {
  id: string;
  title: string;
  description: string;
  type: "web-map" | "analysis" | "tool" | "research";
  technologies: string[];
  githubUrl?: string;
  demoUrl?: string;
  imageUrl?: string;
  completedDate: string;
}

interface Skill {
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  category: "programming" | "gis" | "analysis" | "tools";
}

interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date: string;
  verificationUrl?: string;
}

const Portfolio = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("portfolio");
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  // Mock portfolio data
  const [portfolioData, setPortfolioData] = useState({
    name: "John Doe",
    title: "Geospatial Developer & Analyst",
    email: "john.doe@email.com",
    location: "San Francisco, CA",
    bio: "Passionate geospatial professional with 5+ years of experience in GIS development, remote sensing, and spatial analysis. Specialized in creating web-based mapping applications and machine learning solutions for environmental monitoring.",
    website: "https://johndoe.dev",
    linkedin: "https://linkedin.com/in/johndoe",
    github: "https://github.com/johndoe"
  });

  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      title: "Urban Heat Island Analysis",
      description: "Interactive web map analyzing urban heat islands using Landsat thermal data and machine learning algorithms.",
      type: "analysis",
      technologies: ["Python", "Google Earth Engine", "Leaflet", "TensorFlow"],
      githubUrl: "https://github.com/johndoe/urban-heat",
      demoUrl: "https://urban-heat-demo.com",
      imageUrl: "/api/placeholder/400/250",
      completedDate: "2024-01-15"
    },
    {
      id: "2",
      title: "Forest Change Detection Tool",
      description: "Automated forest change detection system using satellite imagery and computer vision.",
      type: "tool",
      technologies: ["Python", "GDAL", "OpenCV", "Django"],
      githubUrl: "https://github.com/johndoe/forest-change",
      imageUrl: "/api/placeholder/400/250",
      completedDate: "2023-12-20"
    },
    {
      id: "3",
      title: "Interactive Population Density Map",
      description: "Real-time population density visualization with demographic overlays and analytical tools.",
      type: "web-map",
      technologies: ["React", "Mapbox GL JS", "PostGIS", "Node.js"],
      demoUrl: "https://population-map-demo.com",
      imageUrl: "/api/placeholder/400/250",
      completedDate: "2023-11-10"
    }
  ]);

  const [skills, setSkills] = useState<Skill[]>([
    { name: "Python", level: "expert", category: "programming" },
    { name: "JavaScript", level: "advanced", category: "programming" },
    { name: "ArcGIS", level: "expert", category: "gis" },
    { name: "QGIS", level: "advanced", category: "gis" },
    { name: "Google Earth Engine", level: "advanced", category: "analysis" },
    { name: "PostGIS", level: "intermediate", category: "tools" },
    { name: "Machine Learning", level: "advanced", category: "analysis" },
    { name: "Remote Sensing", level: "expert", category: "analysis" }
  ]);

  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      id: "1",
      name: "Google Earth Engine Certified Developer",
      issuer: "Google",
      date: "2023-08-15",
      verificationUrl: "https://verify.google.com/cert123"
    },
    {
      id: "2",
      name: "Esri Technical Certification",
      issuer: "Esri",
      date: "2023-06-20"
    },
    {
      id: "3",
      name: "Geospatial Full Stack Developer",
      issuer: "Harita Hive",
      date: "2024-01-10",
      verificationUrl: "https://haritahive.com/verify/cert456"
    }
  ]);

  const handleSaveProfile = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your portfolio.",
        variant: "destructive"
      });
      return;
    }

    setIsEditing(false);
    toast({
      title: "Portfolio Saved",
      description: "Your portfolio has been updated successfully!",
    });
  };

  const handleExportResume = (format: "pdf" | "linkedin") => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to export your resume.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: `${format.toUpperCase()} Export`,
      description: `Your ${format === "linkedin" ? "LinkedIn-optimized" : "PDF"} resume is being generated...`,
    });
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-blue-100 text-blue-800";
      case "advanced": return "bg-purple-100 text-purple-800";
      case "expert": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const groupSkillsByCategory = (skills: Skill[]) => {
    return skills.reduce((groups, skill) => {
      const category = skill.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(skill);
      return groups;
    }, {} as Record<string, Skill[]>);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Portfolio & Resume Builder</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Showcase your geospatial expertise and build your professional presence
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-6">
            {/* Profile Header */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Professional Profile</CardTitle>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditing ? "Cancel" : "Edit"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={portfolioData.name}
                          onChange={(e) => setPortfolioData({ ...portfolioData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="title">Professional Title</Label>
                        <Input
                          id="title"
                          value={portfolioData.title}
                          onChange={(e) => setPortfolioData({ ...portfolioData, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={portfolioData.email}
                          onChange={(e) => setPortfolioData({ ...portfolioData, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={portfolioData.location}
                          onChange={(e) => setPortfolioData({ ...portfolioData, location: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="bio">Professional Bio</Label>
                      <Textarea
                        id="bio"
                        value={portfolioData.bio}
                        onChange={(e) => setPortfolioData({ ...portfolioData, bio: e.target.value })}
                        className="min-h-[120px]"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={portfolioData.website}
                          onChange={(e) => setPortfolioData({ ...portfolioData, website: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          value={portfolioData.linkedin}
                          onChange={(e) => setPortfolioData({ ...portfolioData, linkedin: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="github">GitHub</Label>
                        <Input
                          id="github"
                          value={portfolioData.github}
                          onChange={(e) => setPortfolioData({ ...portfolioData, github: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button onClick={handleSaveProfile}>
                      Save Profile
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-10 w-10 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{portfolioData.name}</h2>
                        <p className="text-lg text-primary">{portfolioData.title}</p>
                        <p className="text-muted-foreground">{portfolioData.location}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{portfolioData.bio}</p>
                    <div className="flex gap-4">
                      <Button variant="outline" size="sm" asChild>
                        <a href={portfolioData.website} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4 mr-2" />
                          Website
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={portfolioData.github} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4 mr-2" />
                          GitHub
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Certificates */}
            <Card>
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{cert.name}</h4>
                        <p className="text-muted-foreground">{cert.issuer} • {new Date(cert.date).toLocaleDateString()}</p>
                      </div>
                      {cert.verificationUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={cert.verificationUrl} target="_blank" rel="noopener noreferrer">
                            Verify
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Projects</h2>
              <Button onClick={() => toast({ title: "Feature Coming Soon", description: "Add new project functionality is being developed." })}>
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="overflow-hidden">
                  {project.imageUrl && (
                    <div className="aspect-video bg-muted">
                      <img 
                        src={project.imageUrl} 
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{project.title}</h3>
                      <Badge variant="outline">{project.type}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-3 text-sm">{project.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {project.githubUrl && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {project.demoUrl && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Skills & Expertise</h2>
              <Button onClick={() => toast({ title: "Feature Coming Soon", description: "Add new skill functionality is being developed." })}>
                <Plus className="h-4 w-4 mr-2" />
                Add Skill
              </Button>
            </div>

            {Object.entries(groupSkillsByCategory(skills)).map(([category, categorySkills]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="capitalize">{category.replace('-', ' ')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {categorySkills.map((skill) => (
                      <Badge 
                        key={skill.name} 
                        className={getSkillLevelColor(skill.level)}
                        variant="secondary"
                      >
                        {skill.name} • {skill.level}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Your Portfolio</CardTitle>
                <p className="text-muted-foreground">
                  Generate professional resumes and portfolio documents
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
                      <h3 className="text-lg font-semibold mb-2">PDF Resume</h3>
                      <p className="text-muted-foreground mb-4">
                        Professional PDF resume with your projects and skills
                      </p>
                      <Button onClick={() => handleExportResume("pdf")} className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 text-center">
                      <Share className="h-12 w-12 mx-auto mb-4 text-primary" />
                      <h3 className="text-lg font-semibold mb-2">LinkedIn Optimized</h3>
                      <p className="text-muted-foreground mb-4">
                        LinkedIn-ready format with optimized keywords
                      </p>
                      <Button onClick={() => handleExportResume("linkedin")} className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Export for LinkedIn
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Portfolio Link</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Share your public portfolio with potential employers
                    </p>
                    <div className="flex gap-2">
                      <Input 
                        value="https://haritahive.com/portfolio/johndoe" 
                        readOnly 
                        className="flex-1"
                      />
                      <Button onClick={() => {
                        navigator.clipboard.writeText("https://haritahive.com/portfolio/johndoe");
                        toast({ title: "Link Copied", description: "Portfolio link copied to clipboard!" });
                      }}>
                        Copy Link
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Portfolio;