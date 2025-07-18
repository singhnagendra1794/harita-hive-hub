
import Layout from '@/components/Layout';
import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GISProfileCard from "../components/talent/GISProfileCard";
import { Search, Users, TrendingUp, MapPin, Plus } from "lucide-react";

const TalentPool = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");

  // Mock data - replace with real data from Supabase
  const profiles = [
    {
      id: "1",
      name: "Sarah Johnson",
      title: "Senior GIS Analyst & Remote Sensing Specialist",
      bio: "Experienced GIS professional with 8+ years in environmental consulting. Specialized in satellite imagery analysis, land use planning, and web mapping applications.",
      avatar: "/api/placeholder/64/64",
      location: "San Francisco, CA",
      hourlyRate: 85,
      experienceLevel: "senior",
      skills: ["ArcGIS", "Python", "Remote Sensing", "Spatial Analysis", "QGIS"],
      tools: ["ArcGIS Pro", "Python", "R", "Google Earth Engine", "PostGIS"],
      rating: 4.9,
      completedProjects: 47,
      availableForHire: true,
      portfolioUrl: "https://sarahjohnson.dev",
      linkedinUrl: "https://linkedin.com/in/sarahjohnson"
    },
    {
      id: "2",
      name: "Michael Chen",
      title: "GIS Developer & Full-Stack Engineer",
      bio: "Full-stack developer specializing in geospatial web applications. Expert in modern web technologies and spatial databases.",
      location: "Remote",
      hourlyRate: 75,
      experienceLevel: "mid",
      skills: ["JavaScript", "React", "Leaflet", "PostGIS", "Node.js"],
      tools: ["Mapbox", "Leaflet", "React", "PostgreSQL", "Docker"],
      rating: 4.8,
      completedProjects: 32,
      availableForHire: true,
      portfolioUrl: "https://michaelchen.io"
    },
    {
      id: "3",
      name: "Dr. Elena Rodriguez",
      title: "Geospatial Data Scientist",
      bio: "PhD in Geography with expertise in machine learning applications for geospatial data. Published researcher with industry experience.",
      location: "Austin, TX",
      hourlyRate: 120,
      experienceLevel: "expert",
      skills: ["Machine Learning", "Python", "R", "Statistical Analysis", "Research"],
      tools: ["Python", "R", "TensorFlow", "GDAL", "Jupyter"],
      rating: 5.0,
      completedProjects: 23,
      availableForHire: false
    },
    {
      id: "4",
      name: "James Wilson",
      title: "Junior GIS Technician",
      bio: "Recent geography graduate with strong foundation in GIS principles. Eager to work on mapping and data collection projects.",
      location: "Denver, CO",
      hourlyRate: 35,
      experienceLevel: "entry",
      skills: ["ArcGIS", "Data Entry", "Cartography", "GPS", "Field Work"],
      tools: ["ArcGIS", "QGIS", "GPS Units", "Excel"],
      rating: 4.5,
      completedProjects: 8,
      availableForHire: true
    }
  ];

  const skills = ["ArcGIS", "Python", "QGIS", "Remote Sensing", "JavaScript", "R", "Machine Learning"];
  const locations = ["Remote", "San Francisco, CA", "Austin, TX", "Denver, CO", "New York, NY"];
  
  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesExperience = experienceFilter === "all" || profile.experienceLevel === experienceFilter;
    const matchesLocation = locationFilter === "all" || profile.location === locationFilter;
    const matchesSkill = skillFilter === "all" || profile.skills.includes(skillFilter);
    
    return matchesSearch && matchesExperience && matchesLocation && matchesSkill;
  });

  const availableProfiles = profiles.filter(p => p.availableForHire);
  const stats = {
    totalProfiles: profiles.length,
    availableNow: availableProfiles.length,
    avgHourlyRate: Math.round(profiles.reduce((sum, p) => sum + p.hourlyRate, 0) / profiles.length)
  };

  return (
    <Layout>
    <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">GIS Talent Pool</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Connect with verified GIS professionals and browse our talent pool. Find the perfect expert for your geospatial projects.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Users className="h-10 w-10 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalProfiles}</div>
                  <div className="text-muted-foreground">GIS Professionals</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <TrendingUp className="h-10 w-10 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.availableNow}</div>
                  <div className="text-muted-foreground">Available Now</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <MapPin className="h-10 w-10 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">${stats.avgHourlyRate}</div>
                  <div className="text-muted-foreground">Avg. Hourly Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA for Companies */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-2">Looking to Hire GIS Talent?</h3>
                <p className="text-muted-foreground">Post your project or browse our verified professionals to find the perfect match.</p>
              </div>
              <div className="flex gap-2">
                <Button>Post a Project</Button>
                <Button variant="outline">Browse All Talent</Button>
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
                  placeholder="Search by name, title, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
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
              <TabsTrigger value="all">All Professionals</TabsTrigger>
              <TabsTrigger value="available">Available Now</TabsTrigger>
              <TabsTrigger value="top-rated">Top Rated</TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
            </TabsList>
            
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Join Talent Pool
            </Button>
          </div>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProfiles.map(profile => (
                <GISProfileCard key={profile.id} {...profile} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="available">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableProfiles.map(profile => (
                <GISProfileCard key={profile.id} {...profile} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="top-rated">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...profiles].sort((a, b) => b.rating - a.rating).map(profile => (
                <GISProfileCard key={profile.id} {...profile} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="verified">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profiles.filter(p => p.completedProjects > 20).map(profile => (
                <GISProfileCard key={profile.id} {...profile} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {filteredProfiles.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No profiles found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or browse all professionals.
              </p>
              <Button onClick={() => {
                setSearchTerm("");
                setExperienceFilter("all");
                setLocationFilter("all");
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

export default TalentPool;
