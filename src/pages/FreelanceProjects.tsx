import { useState, useEffect } from "react";
import { Search, MapPin, DollarSign, Clock, Star, ExternalLink, Plus, Filter } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface FreelanceProject {
  id: string;
  title: string;
  client: string;
  description: string;
  budget: {
    min: number;
    max: number;
    type: "fixed" | "hourly";
  };
  duration: string;
  skills: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  location?: string;
  isRemote: boolean;
  postedDate: string;
  applicants: number;
  source: string;
  applyUrl?: string;
  isInternal?: boolean;
  clientRating?: number;
}

const FreelanceProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<FreelanceProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<FreelanceProject[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [budgetFilter, setBudgetFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("browse");
  const { toast } = useToast();

  // Mock data
  const mockProjects: FreelanceProject[] = [
    {
      id: "1",
      title: "GIS Analysis for Urban Planning",
      client: "City Development Corp",
      description: "Need a GIS expert to analyze urban development patterns and create detailed maps showing population density, transportation networks, and zoning areas.",
      budget: { min: 2000, max: 3500, type: "fixed" },
      duration: "2-3 weeks",
      skills: ["ArcGIS", "QGIS", "Urban Planning", "Data Analysis"],
      difficulty: "intermediate",
      isRemote: true,
      postedDate: "2024-01-15",
      applicants: 12,
      source: "Upwork",
      applyUrl: "https://upwork.com/project/1",
      clientRating: 4.8
    },
    {
      id: "2",
      title: "Satellite Image Classification with ML",
      client: "AgriTech Solutions",
      description: "Develop machine learning models to classify crop types from satellite imagery. Experience with Google Earth Engine and Python required.",
      budget: { min: 50, max: 75, type: "hourly" },
      duration: "1-2 months",
      skills: ["Google Earth Engine", "Python", "Machine Learning", "Remote Sensing"],
      difficulty: "advanced",
      isRemote: true,
      postedDate: "2024-01-14",
      applicants: 8,
      source: "Freelancer",
      applyUrl: "https://freelancer.com/project/2",
      clientRating: 4.9
    },
    {
      id: "3",
      title: "Interactive Web Map Development",
      client: "Tourism Board",
      description: "Create an interactive web map showcasing tourist attractions, hiking trails, and accommodation options using Leaflet or Mapbox.",
      budget: { min: 1500, max: 2500, type: "fixed" },
      duration: "3-4 weeks",
      skills: ["JavaScript", "Leaflet", "Mapbox", "Web Development"],
      difficulty: "intermediate",
      isRemote: true,
      postedDate: "2024-01-13",
      applicants: 15,
      source: "PeoplePerHour",
      applyUrl: "https://peopleperhour.com/project/3",
      clientRating: 4.7
    },
    {
      id: "4",
      title: "Drone Survey Data Processing",
      client: "Construction Analytics",
      description: "Process drone survey data to create 3D models, orthomosaics, and volumetric calculations for construction site monitoring.",
      budget: { min: 30, max: 45, type: "hourly" },
      duration: "Ongoing",
      skills: ["Photogrammetry", "Pix4D", "Agisoft", "3D Modeling"],
      difficulty: "advanced",
      location: "California, USA",
      isRemote: false,
      postedDate: "2024-01-12",
      applicants: 6,
      source: "Harita Hive",
      isInternal: true,
      clientRating: 5.0
    },
    {
      id: "5",
      title: "QGIS Plugin Development",
      client: "Environmental Consulting",
      description: "Develop a custom QGIS plugin for environmental impact assessment workflows. Must have experience with PyQGIS and Qt.",
      budget: { min: 3000, max: 5000, type: "fixed" },
      duration: "4-6 weeks",
      skills: ["PyQGIS", "Python", "Qt", "Plugin Development"],
      difficulty: "advanced",
      isRemote: true,
      postedDate: "2024-01-11",
      applicants: 4,
      source: "Fiverr",
      applyUrl: "https://fiverr.com/project/5",
      clientRating: 4.6
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setProjects(mockProjects);
      setFilteredProjects(mockProjects);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (budgetFilter) {
      filtered = filtered.filter(project => {
        const maxBudget = project.budget.type === "hourly" ? project.budget.max * 40 : project.budget.max;
        switch (budgetFilter) {
          case "under-1000": return maxBudget < 1000;
          case "1000-5000": return maxBudget >= 1000 && maxBudget <= 5000;
          case "over-5000": return maxBudget > 5000;
          default: return true;
        }
      });
    }

    if (difficultyFilter) {
      filtered = filtered.filter(project => project.difficulty === difficultyFilter);
    }

    setFilteredProjects(filtered);
  }, [searchTerm, budgetFilter, difficultyFilter, projects]);

  const handlePostProject = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to post a project.",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Project Posting",
      description: "Project posting feature coming soon!",
    });
  };

  const formatBudget = (budget: FreelanceProject['budget']) => {
    if (budget.type === "hourly") {
      return `$${budget.min}-${budget.max}/hr`;
    }
    return `$${budget.min.toLocaleString()}-${budget.max.toLocaleString()}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-yellow-100 text-yellow-800";
      case "advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Geospatial Freelance Hub</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Find projects or hire talent for geospatial work
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse Projects</TabsTrigger>
            <TabsTrigger value="post">Post Project</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search projects, skills..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={budgetFilter} onValueChange={setBudgetFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Budget Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Budgets</SelectItem>
                      <SelectItem value="under-1000">Under $1,000</SelectItem>
                      <SelectItem value="1000-5000">$1,000 - $5,000</SelectItem>
                      <SelectItem value="over-5000">Over $5,000</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Results Summary */}
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">
                {loading ? "Loading..." : `${filteredProjects.length} projects found`}
              </p>
              <Button onClick={handlePostProject} className="bg-primary">
                <Plus className="h-4 w-4 mr-2" />
                Post Project
              </Button>
            </div>

            {/* Project Listings */}
            <div className="space-y-6">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                      <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
                      <div className="h-4 bg-muted rounded w-full mb-2"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                filteredProjects.map((project) => (
                  <Card key={project.id} className={`hover:shadow-lg transition-shadow ${project.isInternal ? 'border-primary' : ''}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-xl">{project.title}</CardTitle>
                            {project.isInternal && <Badge variant="default">Harita Hive</Badge>}
                            {project.isRemote && <Badge variant="outline">Remote</Badge>}
                            <Badge className={getDifficultyColor(project.difficulty)}>
                              {project.difficulty}
                            </Badge>
                          </div>
                          <p className="text-lg font-semibold text-primary">{project.client}</p>
                          {project.clientRating && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-semibold">{project.clientRating}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-muted-foreground mt-2">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {formatBudget(project.budget)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {project.duration}
                            </div>
                            {project.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {project.location}
                              </div>
                            )}
                          </div>
                        </div>
                        {project.isInternal ? (
                          <Button>
                            Apply Now
                          </Button>
                        ) : (
                          <Button asChild variant="outline">
                            <a href={project.applyUrl} target="_blank" rel="noopener noreferrer">
                              Apply on {project.source}
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.skills.map((skill) => (
                          <Badge key={skill} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Posted on {new Date(project.postedDate).toLocaleDateString()}</span>
                        <span>{project.applicants} applicants</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="post" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Post a Freelance Project</CardTitle>
                <p className="text-muted-foreground">
                  Find the perfect geospatial expert for your project
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold mb-2">Project Posting Coming Soon</h3>
                  <p className="text-muted-foreground mb-4">
                    We're building an integrated marketplace where you can post projects and hire vetted geospatial professionals.
                  </p>
                  <Button onClick={handlePostProject}>
                    Get Notified When Ready
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {!loading && filteredProjects.length === 0 && activeTab === "browse" && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search criteria</p>
            <Button onClick={() => {
              setSearchTerm("");
              setBudgetFilter("");
              setDifficultyFilter("");
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FreelanceProjects;