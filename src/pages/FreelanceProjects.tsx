import { useState, useEffect } from "react";
import { Search, MapPin, DollarSign, Clock, Star, ExternalLink, Plus, RefreshCw, Bookmark, Filter, Zap } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useFreelanceProjects, FreelanceProject } from "@/hooks/useFreelanceProjects";

const FreelanceProjects = () => {
  const { user } = useAuth();
  const { projects, loading, refreshing, refreshProjects, saveProject, trackApplication } = useFreelanceProjects();
  const [filteredProjects, setFilteredProjects] = useState<FreelanceProject[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [budgetFilter, setBudgetFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [activeTab, setActiveTab] = useState("browse");
  const { toast } = useToast();

  useEffect(() => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (project.client_name && project.client_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (budgetFilter) {
      filtered = filtered.filter(project => {
        const maxBudget = project.budget_type === "hourly" ? 
          (project.budget_max || 0) * 160 : // Assume 160 hours/month for hourly
          (project.budget_max || 0);
        switch (budgetFilter) {
          case "under-10000": return maxBudget < 10000;
          case "10000-50000": return maxBudget >= 10000 && maxBudget <= 50000;
          case "over-50000": return maxBudget > 50000;
          default: return true;
        }
      });
    }

    if (difficultyFilter) {
      filtered = filtered.filter(project => project.difficulty === difficultyFilter);
    }

    if (platformFilter) {
      filtered = filtered.filter(project => project.source === platformFilter);
    }

    if (locationFilter) {
      if (locationFilter === "india") {
        filtered = filtered.filter(project => 
          project.location?.toLowerCase().includes('india') ||
          project.location?.toLowerCase().includes('mumbai') ||
          project.location?.toLowerCase().includes('delhi') ||
          project.location?.toLowerCase().includes('bangalore') ||
          project.location?.toLowerCase().includes('chennai') ||
          project.location?.toLowerCase().includes('pune') ||
          project.location?.toLowerCase().includes('hyderabad')
        );
      } else if (locationFilter === "remote") {
        filtered = filtered.filter(project => project.is_remote);
      }
    }

    setFilteredProjects(filtered);
  }, [searchTerm, budgetFilter, difficultyFilter, platformFilter, locationFilter, projects]);

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

  const handleSaveProject = (project: FreelanceProject) => {
    saveProject(project.id, project);
  };

  const handleApplyToProject = (project: FreelanceProject) => {
    if (project.apply_url) {
      trackApplication(project.id, project.platform, 'redirect');
      window.open(project.apply_url, '_blank');
    }
  };

  const formatBudget = (project: FreelanceProject) => {
    const currency = project.currency === 'INR' ? '₹' : '$';
    if (project.budget_type === "hourly") {
      return `${currency}${project.budget_min}-${project.budget_max}/hr`;
    }
    return `${currency}${project.budget_min?.toLocaleString()}-${project.budget_max?.toLocaleString()}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "advanced": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "Upwork": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Freelancer": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Guru": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "PeoplePerHour": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "Harita Hive": return "bg-primary/10 text-primary";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setBudgetFilter("");
    setDifficultyFilter("");
    setPlatformFilter("");
    setLocationFilter("");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Real Geospatial Freelance Opportunities</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Find live projects from top platforms • Earn while you learn • India-focused opportunities
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Badge variant="outline" className="text-sm">Live Projects from Upwork, Freelancer & More</Badge>
            <Badge variant="outline" className="text-sm">Updated Daily</Badge>
            <Badge variant="outline" className="text-sm">70% India-focused</Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse Live Projects</TabsTrigger>
            <TabsTrigger value="post">Post Project</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search projects, skills, companies..."
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
                      <SelectItem value="under-10000">Under ₹10,000</SelectItem>
                      <SelectItem value="10000-50000">₹10,000 - ₹50,000</SelectItem>
                      <SelectItem value="over-50000">Over ₹50,000</SelectItem>
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
                  <Select value={platformFilter} onValueChange={setPlatformFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Platforms</SelectItem>
                      <SelectItem value="Upwork">Upwork</SelectItem>
                      <SelectItem value="Freelancer">Freelancer</SelectItem>
                      <SelectItem value="Guru">Guru</SelectItem>
                      <SelectItem value="PeoplePerHour">PeoplePerHour</SelectItem>
                      <SelectItem value="Truelancer">Truelancer</SelectItem>
                      <SelectItem value="Harita Hive">Harita Hive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Locations</SelectItem>
                      <SelectItem value="india">India</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(searchTerm || budgetFilter || difficultyFilter || platformFilter || locationFilter) && (
                  <div className="mt-4">
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      <Filter className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Summary and Actions */}
            <div className="flex justify-between items-center flex-wrap gap-4">
              <p className="text-muted-foreground">
                {loading ? "Loading..." : `${filteredProjects.length} live projects found`}
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={refreshProjects} 
                  disabled={refreshing}
                  variant="outline"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0"
                >
                  {refreshing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  {refreshing ? "Fetching..." : "Discover New Jobs"}
                </Button>
                <Button onClick={handlePostProject} className="bg-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Post Project
                </Button>
              </div>
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
                  <Card key={project.id} className={`hover:shadow-lg transition-all duration-300 ${project.is_internal ? 'border-primary/30 bg-primary/5' : ''}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <CardTitle className="text-xl">{project.title}</CardTitle>
                            <Badge className={getPlatformColor(project.source || 'Unknown')}>
                              {project.source}
                            </Badge>
                            {project.is_internal && <Badge variant="default">Verified Client</Badge>}
                            {project.is_remote && <Badge variant="outline">Remote</Badge>}
                            <Badge className={getDifficultyColor(project.difficulty)}>
                              {project.difficulty}
                            </Badge>
                          </div>
                          <p className="text-lg font-semibold text-primary">{project.client_name}</p>
                          {project.client_rating && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-semibold">{project.client_rating}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-muted-foreground mt-2 flex-wrap">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {formatBudget(project)}
                            </div>
                            {project.duration && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {project.duration}
                              </div>
                            )}
                            {project.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {project.location}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {user && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSaveProject(project)}
                            >
                              <Bookmark className="h-4 w-4" />
                            </Button>
                          )}
                          {project.is_internal ? (
                            <Button>
                              Apply Now
                            </Button>
                          ) : (
                            <Button 
                              onClick={() => handleApplyToProject(project)}
                              variant="outline"
                            >
                              Apply on {project.source}
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4 leading-relaxed">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Posted {new Date(project.posted_date).toLocaleDateString()}</span>
                        <span>{project.applicants_count} applicant{project.applicants_count !== 1 ? 's' : ''}</span>
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
                  Connect with talented geospatial professionals in India and worldwide
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold mb-2">Premium Project Posting Coming Soon</h3>
                  <p className="text-muted-foreground mb-4">
                    We're building an integrated marketplace where you can post projects and hire vetted geospatial professionals from our network.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="bg-primary/10 p-3 rounded-full w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                        <Star className="h-8 w-8 text-primary" />
                      </div>
                      <h4 className="font-semibold">Verified Talent</h4>
                      <p className="text-sm text-muted-foreground">Pre-screened professionals</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-primary/10 p-3 rounded-full w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                        <MapPin className="h-8 w-8 text-primary" />
                      </div>
                      <h4 className="font-semibold">India-First</h4>
                      <p className="text-sm text-muted-foreground">70% India-based talent pool</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-primary/10 p-3 rounded-full w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                        <DollarSign className="h-8 w-8 text-primary" />
                      </div>
                      <h4 className="font-semibold">Fair Pricing</h4>
                      <p className="text-sm text-muted-foreground">Competitive Indian rates</p>
                    </div>
                  </div>
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
            <p className="text-muted-foreground mb-4">Try adjusting your search criteria or refresh for new opportunities</p>
            <div className="flex justify-center gap-2">
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
              <Button onClick={refreshProjects} disabled={refreshing}>
                {refreshing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
                {refreshing ? "Fetching..." : "Discover New Jobs"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FreelanceProjects;