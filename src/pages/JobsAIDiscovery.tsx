import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MapPin, Building, Clock, ExternalLink, FileText, Zap, Briefcase } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { supabase } from '@/integrations/supabase/client';
import UpgradePrompt from '@/components/premium/UpgradePrompt';

interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  remote_allowed: boolean;
  description: string;
  requirements: string;
  skills_required: string[];
  salary_min: number;
  salary_max: number;
  employment_type: string;
  experience_level: string;
  source_url: string;
  source_platform: string;
  posted_date: string;
  is_verified: boolean;
}

const JobsAIDiscovery = () => {
  const { user } = useAuth();
  const { hasAccess } = usePremiumAccess();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobPosting[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const hasProfessionalAccess = hasAccess('pro');
  const hasEnterpriseAccess = hasAccess('enterprise');

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, locationFilter, skillFilter, experienceFilter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('job_postings_ai')
        .select('*')
        .order('posted_date', { ascending: false })
        .limit(50);

      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (locationFilter) {
      filtered = filtered.filter(job =>
        job.location?.toLowerCase().includes(locationFilter.toLowerCase()) ||
        (locationFilter === 'remote' && job.remote_allowed)
      );
    }

    if (skillFilter) {
      filtered = filtered.filter(job =>
        job.skills_required.some(skill => 
          skill.toLowerCase().includes(skillFilter.toLowerCase())
        )
      );
    }

    if (experienceFilter) {
      filtered = filtered.filter(job =>
        job.experience_level === experienceFilter
      );
    }

    setFilteredJobs(filtered);
  };

  const formatSalary = (min: number, max: number) => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `$${min}k - $${max}k`;
    if (min) return `$${min}k+`;
    return `Up to $${max}k`;
  };

  const getSourceBadgeColor = (platform: string) => {
    switch (platform) {
      case 'linkedin': return 'bg-blue-100 text-blue-800';
      case 'indeed': return 'bg-green-100 text-green-800';
      case 'government': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateMatchScore = (job: JobPosting) => {
    // Placeholder AI matching logic
    const baseScore = Math.floor(Math.random() * 30) + 60; // 60-90%
    return baseScore;
  };

  // Free users can browse all jobs
  const displayedJobs = filteredJobs;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Briefcase className="h-8 w-8 text-primary" />
          Geo Job Discovery Portal
        </h1>
        <p className="text-muted-foreground">
          AI-aggregated geospatial job opportunities from across the web
        </p>
      </div>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
          <TabsTrigger value="cv-builder" disabled={!hasProfessionalAccess}>
            CV Builder {!hasProfessionalAccess && '🔒'}
          </TabsTrigger>
          <TabsTrigger value="post-job" disabled={!hasEnterpriseAccess}>
            Post Job {!hasEnterpriseAccess && '🔒'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              placeholder="Location or 'remote'"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
            <Input
              placeholder="Required skill..."
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
            />
            <Select value={experienceFilter} onValueChange={setExperienceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Experience Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Levels</SelectItem>
                <SelectItem value="entry">Entry Level</SelectItem>
                <SelectItem value="mid">Mid Level</SelectItem>
                <SelectItem value="senior">Senior Level</SelectItem>
                <SelectItem value="lead">Lead/Principal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Jobs List */}
          <div className="space-y-4">
            {displayedJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Building className="h-4 w-4" />
                        {job.company}
                        {job.is_verified && (
                          <Badge variant="secondary" className="text-xs">Verified</Badge>
                        )}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getSourceBadgeColor(job.source_platform)}>
                          {job.source_platform}
                        </Badge>
                        {hasProfessionalAccess && (
                          <Badge variant="outline" className="text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            {calculateMatchScore(job)}% match
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium">
                        {formatSalary(job.salary_min, job.salary_max)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {job.location || 'Location not specified'}
                      {job.remote_allowed && (
                        <Badge variant="outline" className="ml-2 text-xs">Remote OK</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {job.employment_type || 'Full-time'}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {job.experience_level || 'All levels'}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {job.skills_required.slice(0, 6).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {job.skills_required.length > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +{job.skills_required.length - 6} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Posted {new Date(job.posted_date).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      {hasProfessionalAccess && (
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-2" />
                          Apply with AI CV
                        </Button>
                      )}
                      <Button size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Job
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {displayedJobs.length === 0 && !loading && (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No jobs found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or check back later for new opportunities.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="cv-builder">
          {!hasProfessionalAccess ? (
            <UpgradePrompt 
              feature="AI CV Builder"
              description="Create tailored resumes that match job descriptions with AI-powered keyword optimization and formatting."
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered CV Builder</CardTitle>
                <CardDescription>
                  Create resumes tailored to specific job postings with intelligent keyword matching
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">CV Builder Coming Soon</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload your resume and let AI optimize it for each job application.
                  </p>
                  <Button>Upload Resume to Get Started</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="post-job">
          {!hasEnterpriseAccess ? (
            <UpgradePrompt 
              feature="Job Posting"
              description="Post verified job openings and access our talent pool of geospatial professionals."
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Post a Job</CardTitle>
                <CardDescription>
                  Reach qualified geospatial professionals in our community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Job Posting Portal</h3>
                  <p className="text-muted-foreground mb-4">
                    Create verified job postings and connect with top talent.
                  </p>
                  <Button>Create Job Posting</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JobsAIDiscovery;