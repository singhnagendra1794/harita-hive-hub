
import Layout from '@/components/Layout';
import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Briefcase, TrendingUp, MapPin, RefreshCw, Clock, Users, Filter } from "lucide-react";
import { useJobListings } from "@/hooks/useJobListings";
import JobCard from "@/components/jobs/JobCard";
import { useToast } from "@/hooks/use-toast";

const TalentPool = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  
  const { jobs, loading, error, lastUpdated, fetchJobs, refreshJobs } = useJobListings();
  const { toast } = useToast();

  // Build filters object - simplified for now
  const applyFilters = () => {
    // Client-side filtering since we have mock data
    fetchJobs();
  };

  // Filter jobs based on current filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocation = locationFilter === "all" || 
      job.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    const matchesJobType = jobTypeFilter === "all" || job.job_type === jobTypeFilter;
    const matchesExperience = experienceFilter === "all" || job.experience_level === experienceFilter;
    
    return matchesSearch && matchesLocation && matchesJobType && matchesExperience;
  });

  // Separate jobs by categories
  const indiaJobs = filteredJobs.filter(job => job.is_india_focused);
  const remoteJobs = filteredJobs.filter(job => job.is_remote);
  const freshJobs = filteredJobs.filter(job => {
    const postedDate = new Date(job.posted_date);
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    return postedDate > threeDaysAgo;
  });

  const handleRefreshJobs = async () => {
    try {
      setRefreshing(true);
      await refreshJobs();
      
      toast({
        title: "Jobs Updated! 🚀",
        description: "Fresh job listings have been fetched using AI discovery.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to refresh job listings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const stats = {
    totalJobs: jobs.length,
    indiaJobs: indiaJobs.length,
    remoteJobs: remoteJobs.length,
    freshJobs: freshJobs.length
  };

  if (error) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error loading job listings</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">🇮🇳 Geospatial Jobs Discovery</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            AI-powered job discovery for GIS, Remote Sensing, GeoAI, and Spatial Data professionals. 
            Focused on India with global opportunities.
          </p>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground mt-2">
              Last updated {lastUpdated.toLocaleTimeString()} • {stats.totalJobs} active positions
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Briefcase className="h-10 w-10 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalJobs}</div>
                  <div className="text-muted-foreground">Total Jobs</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <MapPin className="h-10 w-10 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.indiaJobs}</div>
                  <div className="text-muted-foreground">India-Focused</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Users className="h-10 w-10 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.remoteJobs}</div>
                  <div className="text-muted-foreground">Remote Jobs</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Clock className="h-10 w-10 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.freshJobs}</div>
                  <div className="text-muted-foreground">Posted This Week</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Job Discovery CTA */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-2">🤖 AI-Powered Job Discovery</h3>
                <p className="text-muted-foreground">
                  Get the latest geospatial jobs from across India using our AI job discovery engine.
                  Fresh listings updated daily from LinkedIn, Naukri, Government portals & more.
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleRefreshJobs}
                  disabled={refreshing}
                  className="bg-primary hover:bg-primary/90"
                >
                  {refreshing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Discovering...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Discover New Jobs
                    </>
                  )}
                </Button>
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
                  placeholder="Search jobs, companies, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="india">India</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="bangalore">Bangalore</SelectItem>
                  <SelectItem value="delhi">Delhi/NCR</SelectItem>
                  <SelectItem value="mumbai">Mumbai</SelectItem>
                  <SelectItem value="pune">Pune</SelectItem>
                  <SelectItem value="hyderabad">Hyderabad</SelectItem>
                </SelectContent>
              </Select>

              <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>

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
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Jobs ({filteredJobs.length})</TabsTrigger>
            <TabsTrigger value="india">India Focus ({indiaJobs.length})</TabsTrigger>
            <TabsTrigger value="remote">Remote ({remoteJobs.length})</TabsTrigger>
            <TabsTrigger value="fresh">Fresh ({freshJobs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading job opportunities...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredJobs.map(job => (
                  <JobCard 
                    key={job.id} 
                    {...job}
                    onMarkApplied={() => {
                      toast({
                        title: "Application Noted! 📝",
                        description: "We've marked this job as applied. Good luck!",
                      });
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="india">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {indiaJobs.map(job => (
                <JobCard 
                  key={job.id} 
                  {...job}
                  onMarkApplied={() => {
                    toast({
                      title: "Application Noted! 📝",
                      description: "We've marked this job as applied. Good luck!",
                    });
                  }}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="remote">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {remoteJobs.map(job => (
                <JobCard 
                  key={job.id} 
                  {...job}
                  onMarkApplied={() => {
                    toast({
                      title: "Application Noted! 📝",
                      description: "We've marked this job as applied. Good luck!",
                    });
                  }}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="fresh">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {freshJobs.map(job => (
                <JobCard 
                  key={job.id} 
                  {...job}
                  onMarkApplied={() => {
                    toast({
                      title: "Application Noted! 📝",
                      description: "We've marked this job as applied. Good luck!",
                    });
                  }}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {filteredJobs.length === 0 && !loading && (
          <Card className="text-center py-12">
            <CardContent>
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or discover new jobs using our AI engine.
              </p>
              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    setLocationFilter("all");
                    setJobTypeFilter("all");
                    setExperienceFilter("all");
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
                <Button onClick={handleRefreshJobs}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Discover Jobs
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default TalentPool;
