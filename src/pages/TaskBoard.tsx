
import { useState } from "react";
import Layout from "../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FreelanceProjectCard from "../components/projects/FreelanceProjectCard";
import { Search, Briefcase, TrendingUp, DollarSign, Plus, Filter } from "lucide-react";

const TaskBoard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [budgetFilter, setBudgetFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");

  // Mock data - replace with real data from Supabase
  const projects = [
    {
      id: "1",
      title: "Interactive Web Map for Real Estate Platform",
      description: "Need an experienced web developer to create an interactive map showing property listings with custom markers, filters, and popup information windows. Must integrate with existing React application.",
      budget: { min: 2500, max: 4000 },
      deadline: "2024-02-15",
      difficulty: "intermediate",
      skills: ["JavaScript", "React", "Leaflet", "CSS", "API Integration"],
      client: {
        name: "PropTech Solutions",
        avatar: "/api/placeholder/32/32",
        rating: 4.8,
        location: "San Francisco, CA",
        completedProjects: 23
      },
      applicationsCount: 12,
      postedDate: "2024-01-20",
      isUrgent: false,
      projectType: "Web Development"
    },
    {
      id: "2",
      title: "Land Use Classification from Satellite Imagery",
      description: "Seeking a remote sensing expert to classify land use patterns from Landsat imagery covering 50,000 hectares. Experience with machine learning and Google Earth Engine required.",
      budget: { min: 3000, max: 5500 },
      deadline: "2024-02-28",
      difficulty: "expert",
      skills: ["Remote Sensing", "Machine Learning", "Google Earth Engine", "Python", "Classification"],
      client: {
        name: "Dr. Maria Rodriguez",
        avatar: "/api/placeholder/32/32",
        rating: 4.9,
        location: "University Research",
        completedProjects: 8
      },
      applicationsCount: 5,
      postedDate: "2024-01-18",
      isUrgent: true,
      projectType: "Analysis"
    },
    {
      id: "3",
      title: "GPS Data Processing and Route Optimization",
      description: "Process large GPS tracking dataset (1M+ points) and create optimized routes for delivery fleet. Need experience with spatial algorithms and performance optimization.",
      budget: { min: 1800, max: 3200 },
      deadline: "2024-02-10",
      difficulty: "intermediate",
      skills: ["Python", "Spatial Algorithms", "PostGIS", "Route Optimization", "Data Processing"],
      client: {
        name: "LogiFlow Inc",
        avatar: "/api/placeholder/32/32",
        rating: 4.6,
        location: "Chicago, IL",
        completedProjects: 15
      },
      applicationsCount: 8,
      postedDate: "2024-01-22",
      isUrgent: false,
      projectType: "Data Processing"
    },
    {
      id: "4",
      title: "Simple Map Digitization Task",
      description: "Digitize building footprints from high-resolution aerial imagery. Straightforward task requiring attention to detail. Perfect for entry-level GIS professionals.",
      budget: { min: 500, max: 800 },
      deadline: "2024-02-05",
      difficulty: "entry",
      skills: ["QGIS", "Digitization", "Attention to Detail", "GIS Basics"],
      client: {
        name: "City Planning Office",
        avatar: "/api/placeholder/32/32",
        rating: 4.4,
        location: "Austin, TX",
        completedProjects: 31
      },
      applicationsCount: 24,
      postedDate: "2024-01-25",
      isUrgent: false,
      projectType: "Digitization"
    }
  ];

  const skills = ["JavaScript", "Python", "QGIS", "ArcGIS", "Remote Sensing", "Machine Learning", "Web Development"];
  
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === "all" || project.difficulty === difficultyFilter;
    const matchesBudget = budgetFilter === "all" || 
                         (budgetFilter === "under-1k" && project.budget.max < 1000) ||
                         (budgetFilter === "1k-3k" && project.budget.min >= 1000 && project.budget.max <= 3000) ||
                         (budgetFilter === "3k-5k" && project.budget.min >= 3000 && project.budget.max <= 5000) ||
                         (budgetFilter === "over-5k" && project.budget.min > 5000);
    const matchesSkill = skillFilter === "all" || project.skills.includes(skillFilter);
    
    return matchesSearch && matchesDifficulty && matchesBudget && matchesSkill;
  });

  const urgentProjects = projects.filter(p => p.isUrgent);
  const totalBudget = projects.reduce((sum, p) => sum + p.budget.max, 0);
  const stats = {
    totalProjects: projects.length,
    totalBudget: totalBudget,
    avgBudget: Math.round(totalBudget / projects.length)
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">GIS Task Board</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Earn money while building your GIS skills. Find freelance projects and micro-tasks that match your expertise level.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Briefcase className="h-10 w-10 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalProjects}</div>
                  <div className="text-muted-foreground">Active Projects</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <DollarSign className="h-10 w-10 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">${stats.totalBudget.toLocaleString()}</div>
                  <div className="text-muted-foreground">Total Budget Available</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <TrendingUp className="h-10 w-10 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">${stats.avgBudget.toLocaleString()}</div>
                  <div className="text-muted-foreground">Average Project Value</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA for Freelancers */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-2">Ready to Start Earning?</h3>
                <p className="text-muted-foreground">Create your freelancer profile and start bidding on projects that match your skills.</p>
              </div>
              <div className="flex gap-2">
                <Button>Create Freelancer Profile</Button>
                <Button variant="outline">Post a Project</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects by title, description, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
              <Select value={budgetFilter} onValueChange={setBudgetFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Budget Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Budgets</SelectItem>
                  <SelectItem value="under-1k">Under $1,000</SelectItem>
                  <SelectItem value="1k-3k">$1,000 - $3,000</SelectItem>
                  <SelectItem value="3k-5k">$3,000 - $5,000</SelectItem>
                  <SelectItem value="over-5k">Over $5,000</SelectItem>
                </SelectContent>
              </Select>
              <Select value={skillFilter} onValueChange={setSkillFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Skills" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  {skills.map(skill => (
                    <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All Projects</TabsTrigger>
              <TabsTrigger value="urgent">Urgent</TabsTrigger>
              <TabsTrigger value="high-budget">High Budget</TabsTrigger>
              <TabsTrigger value="entry-level">Entry Level</TabsTrigger>
            </TabsList>
            
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Post Project
            </Button>
          </div>

          <TabsContent value="all">
            <div className="space-y-6">
              {filteredProjects.map(project => (
                <FreelanceProjectCard key={project.id} {...project} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="urgent">
            <div className="space-y-6">
              {urgentProjects.map(project => (
                <FreelanceProjectCard key={project.id} {...project} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="high-budget">
            <div className="space-y-6">
              {projects.filter(p => p.budget.min >= 3000).map(project => (
                <FreelanceProjectCard key={project.id} {...project} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="entry-level">
            <div className="space-y-6">
              {projects.filter(p => p.difficulty === 'entry').map(project => (
                <FreelanceProjectCard key={project.id} {...project} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {filteredProjects.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or check back later for new projects.
              </p>
              <Button onClick={() => {
                setSearchTerm("");
                setDifficultyFilter("all");
                setBudgetFilter("all");
                setSkillFilter("all");
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default TaskBoard;
