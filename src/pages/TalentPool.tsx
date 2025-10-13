import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Briefcase, TrendingUp, MapPin, RefreshCw, Clock, Users, Filter, HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import JobCard from "@/components/jobs/JobCard";
import EmployerJobPostingForm from "@/components/jobs/EmployerJobPostingForm";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { updatePageSEO, addSchemaMarkup } from "@/utils/seoUtils";
import { Separator } from "@/components/ui/separator";

const TalentPool = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

  // Set SEO on component mount
  useEffect(() => {
    updatePageSEO({
      title: "Find Verified Geospatial Jobs | Harita Hive Talent Pool",
      description: "Discover verified GIS, Remote Sensing, and GeoAI jobs from across India and the world. Apply directly or via Harita Hive — where geospatial talent meets opportunity.",
      keywords: "GIS Jobs India, Remote Sensing Careers, GeoAI Jobs, Geospatial Jobs, QGIS Jobs, PostGIS Jobs, Drone Mapping Jobs, Spatial Analyst Jobs, India GIS Careers",
      type: "website"
    });

    // Add job posting schema
    if (jobs.length > 0) {
      jobs.slice(0, 5).forEach(job => {
        const schema = {
          "@context": "https://schema.org",
          "@type": "JobPosting",
          "title": job.title,
          "description": job.description,
          "datePosted": job.posted_date,
          "hiringOrganization": {
            "@type": "Organization",
            "name": job.company
          },
          "jobLocation": {
            "@type": "Place",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": job.location
            }
          },
          "employmentType": job.employment_type?.toUpperCase()
        };
        addSchemaMarkup(schema);
      });
    }
  }, [jobs]);

  // Fetch jobs from Supabase
  useEffect(() => {
    fetchJobs();
    if (user) {
      fetchSavedJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('job_postings_ai')
        .select('*')
        .order('posted_date', { ascending: false })
        .limit(100);

      if (error) throw error;
      setJobs(data || []);
      setLastUpdated(new Date());
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load job listings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('saved_jobs')
        .select('project_id')
        .eq('user_id', user.id);
      
      if (data) {
        setSavedJobIds(new Set(data.map(item => item.project_id)));
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    }
  };

  const handleSaveJob = async (jobId: string, jobData: any) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to save jobs.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (savedJobIds.has(jobId)) {
        // Unsave
        await supabase
          .from('saved_jobs')
          .delete()
          .eq('user_id', user.id)
          .eq('project_id', jobId);
        
        setSavedJobIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });

        toast({
          title: "Job Removed",
          description: "Job removed from saved list.",
        });
      } else {
        // Save
        await supabase
          .from('saved_jobs')
          .insert({
            user_id: user.id,
            project_id: jobId,
            project_data: jobData
          });
        
        setSavedJobIds(prev => new Set([...prev, jobId]));

        toast({
          title: "Job Saved! 📌",
          description: "Job added to your saved list.",
        });
      }
    } catch (error) {
      console.error('Error saving job:', error);
      toast({
        title: "Error",
        description: "Failed to save job. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMarkApplied = (jobId: string) => {
    toast({
      title: "Application Noted! 📝",
      description: "We've marked this job as applied. Good luck!",
    });
  };

  const handleRefreshJobs = async () => {
    try {
      setRefreshing(true);
      
      // Call AI job discovery function
      const { data, error } = await supabase.functions.invoke('ai-job-discovery', {
        body: {
          search_keywords: [],
          location_filter: 'India',
          max_jobs: 20
        }
      });

      if (error) throw error;

      // Refresh the job list
      await fetchJobs();
      
      toast({
        title: "Jobs Updated! 🚀",
        description: `${data.jobs_generated} new job listings discovered and added.`,
      });
    } catch (error: any) {
      console.error('Error refreshing jobs:', error);
      toast({
        title: "Update Failed",
        description: "Failed to refresh job listings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Filter jobs based on current filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchTerm || 
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills_required?.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocation = locationFilter === "all" || 
      job.location?.toLowerCase().includes(locationFilter.toLowerCase());
    
    const matchesJobType = jobTypeFilter === "all" || job.employment_type === jobTypeFilter;
    const matchesExperience = experienceFilter === "all" || job.experience_level === experienceFilter;
    
    return matchesSearch && matchesLocation && matchesJobType && matchesExperience;
  });

  // Separate jobs by categories
  const indiaJobs = filteredJobs.filter(job => 
    job.location?.toLowerCase().includes('india') || 
    (job.remote_allowed && job.location?.toLowerCase().includes('remote'))
  );
  
  const remoteJobs = filteredJobs.filter(job => job.remote_allowed);
  
  const freshJobs = filteredJobs.filter(job => {
    if (!job.posted_date) return false;
    const postedDate = new Date(job.posted_date);
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    return postedDate > threeDaysAgo;
  });

  const stats = {
    totalJobs: jobs.length,
    indiaJobs: indiaJobs.length,
    remoteJobs: remoteJobs.length,
    freshJobs: freshJobs.length
  };

  const renderJobList = (jobList: any[]) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {jobList.map(job => (
        <JobCard 
          key={job.id} 
          id={job.id}
          title={job.title}
          company={job.company}
          location={job.location || 'Location not specified'}
          job_type={job.employment_type || 'full-time'}
          experience_level={job.experience_level}
          salary_min={job.salary_min}
          salary_max={job.salary_max}
          currency="INR"
          description={job.description || ''}
          requirements={job.requirements ? [job.requirements] : []}
          skills={job.skills_required || []}
          apply_url={job.source_url || '#'}
          source_platform={job.source_platform || 'unknown'}
          is_remote={job.remote_allowed || false}
          is_india_focused={job.location?.toLowerCase().includes('india') || false}
          is_verified={job.is_verified || false}
          posted_date={job.posted_date || new Date().toISOString()}
          ai_relevance_score={85}
          created_at={job.created_at || new Date().toISOString()}
          isSaved={savedJobIds.has(job.id)}
          onSave={() => handleSaveJob(job.id, job)}
          onMarkApplied={() => handleMarkApplied(job.id)}
        />
      ))}
    </div>
  );

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">🇮🇳 Geospatial Jobs Discovery</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
          AI-powered job discovery for GIS, Remote Sensing, GeoAI, and Spatial Data professionals. 
          Focused on India with global opportunities.
        </p>
        {lastUpdated && (
          <p className="text-sm text-muted-foreground">
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

      {/* AI Job Discovery & Employer Posting CTA */}
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
              <EmployerJobPostingForm onSuccess={fetchJobs} />
              <Button 
                onClick={handleRefreshJobs}
                disabled={refreshing}
                variant="outline"
              >
                {refreshing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Discovering...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Discover Jobs
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
            renderJobList(filteredJobs)
          )}
        </TabsContent>

        <TabsContent value="india">
          {renderJobList(indiaJobs)}
        </TabsContent>

        <TabsContent value="remote">
          {renderJobList(remoteJobs)}
        </TabsContent>

        <TabsContent value="fresh">
          {renderJobList(freshJobs)}
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

      {/* FAQ Section for SEO */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Can companies post jobs directly?</AccordionTrigger>
              <AccordionContent>
                Yes! Employers can submit job listings through Harita Hive's verified posting form by clicking the "Post a Job" button. All submissions are reviewed by our team within 24 hours before being published on the platform.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How often is the job list updated?</AccordionTrigger>
              <AccordionContent>
                New jobs are added daily through our AI-powered discovery system at 8 AM IST. We aggregate opportunities from LinkedIn, Naukri, Indeed, government portals, and verified employer submissions to keep listings fresh and relevant.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Is it free to browse and apply to jobs?</AccordionTrigger>
              <AccordionContent>
                Absolutely! Browsing and applying to jobs on Harita Hive is 100% free for all users. We believe in making geospatial career opportunities accessible to everyone. Premium features like AI insights and analytics are available for subscribed users.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>What types of geospatial jobs are featured?</AccordionTrigger>
              <AccordionContent>
                We feature jobs across all major geospatial domains including GIS Analysis & Mapping, Remote Sensing & Satellite Data, Drone & Photogrammetry, GeoAI & Machine Learning, Environmental & Urban Analytics, Spatial Databases (PostGIS, BigQuery), WebGIS & Cartography, and Government/Policy GIS roles.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>Are all job listings verified?</AccordionTrigger>
              <AccordionContent>
                Yes! Every job listing on Harita Hive is verified through our AI screening process and manual review. We work only with trusted sources and require employer verification for direct submissions, ensuring authenticity and protecting job seekers from fraudulent listings.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Marketing Taglines */}
      <div className="mt-12 text-center space-y-4 pb-8">
        <Separator className="my-8" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">India's #1 GeoAI Career Platform</h2>
          <p className="text-lg text-muted-foreground">
            Real Jobs. Real Companies. Verified by Harita Hive.
          </p>
          <p className="text-muted-foreground">
            Empowering the Future of Geospatial Work.
          </p>
        </div>
        <Badge variant="outline" className="text-sm px-4 py-2">
          🛰️ Where Geospatial Talent Meets Opportunity
        </Badge>
      </div>
    </div>
  );
};

export default TalentPool;
