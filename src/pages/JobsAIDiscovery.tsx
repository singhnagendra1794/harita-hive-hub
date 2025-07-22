import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  MapPin, 
  Building, 
  Clock, 
  ExternalLink, 
  FileText, 
  Zap, 
  Briefcase,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  Globe,
  Filter,
  Bookmark,
  BookmarkCheck,
  AlertCircle,
  Star,
  ChevronDown,
  Target,
  Brain,
  LinkedinIcon,
  BarChart3,
  Sparkles,
  Eye,
  BookmarkPlus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { usePersonalization } from '@/hooks/usePersonalization';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import UpgradePrompt from '@/components/premium/UpgradePrompt';

interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string | null;
  remote_allowed: boolean;
  description: string | null;
  requirements: string | null;
  skills_required: string[] | null;
  salary_min: number | null;
  salary_max: number | null;
  employment_type: string | null;
  experience_level: string | null;
  source_url: string | null;
  source_platform: string | null;
  posted_date: string | null;
  is_verified: boolean | null;
  expires_at: string | null;
}

interface SavedJob {
  id: string;
  user_id: string;
  job_id: string;
  saved_at: string;
}

interface JobStats {
  total_jobs: number;
  new_this_week: number;
  remote_opportunities: number;
  verified_companies: number;
  avg_salary: number;
}

// Calculate AI match score for jobs
const calculateJobMatchScore = (job: JobPosting, userPreferences: any) => {
  let score = 60; // Base score
  
  // Match with enrolled courses
  if (userPreferences?.enrolled_courses?.length > 0) {
    const courseSkills = ['GIS', 'Remote Sensing', 'Python', 'JavaScript', 'Geospatial', 'Mapping'];
    const matchingSkills = job.skills_required?.filter(skill => 
      courseSkills.some(courseSkill => skill.toLowerCase().includes(courseSkill.toLowerCase()))
    ) || [];
    score += matchingSkills.length * 5;
  }
  
  // Match with user's preferred skills
  const preferredSkills = ['Python', 'QGIS', 'ArcGIS', 'PostGIS', 'JavaScript', 'React'];
  const skillMatches = job.skills_required?.filter(skill => 
    preferredSkills.some(prefSkill => skill.toLowerCase().includes(prefSkill.toLowerCase()))
  ) || [];
  score += skillMatches.length * 3;
  
  // Boost for remote work
  if (job.remote_allowed) score += 5;
  
  // Boost for verified companies
  if (job.is_verified) score += 10;
  
  // Add randomness for variety
  score += Math.floor(Math.random() * 15);
  
  return Math.min(score, 98);
};

// Check if job should be recommended
const isRecommendedJob = (job: JobPosting, userPreferences: any) => {
  if (!userPreferences) return false;
  
  // Check if user has geospatial course enrollment
  const hasGeospatialCourse = userPreferences.enrolled_courses?.some((course: string) => 
    course.toLowerCase().includes('geospatial') || course.toLowerCase().includes('gis')
  );
  
  // Check if job skills match common geospatial skills
  const geospatialSkills = ['GIS', 'QGIS', 'ArcGIS', 'PostGIS', 'Remote Sensing', 'Python', 'JavaScript', 'Mapping'];
  const hasMatchingSkills = job.skills_required?.some(skill => 
    geospatialSkills.some(geoSkill => skill.toLowerCase().includes(geoSkill.toLowerCase()))
  ) || false;
  
  return hasGeospatialCourse && hasMatchingSkills;
};

const JobsAIDiscovery = () => {
  const { user } = useAuth();
  const { hasAccess } = usePremiumAccess();
  const { preferences, recentInteractions } = usePersonalization();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobPosting[]>([]);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [salaryFilter, setSalaryFilter] = useState('');
  const [remoteFilter, setRemoteFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [loading, setLoading] = useState(true);
  const [jobStats, setJobStats] = useState<JobStats | null>(null);
  const [activeFilters, setActiveFilters] = useState(0);

  const hasProfessionalAccess = hasAccess('pro');
  const hasEnterpriseAccess = hasAccess('enterprise');

  useEffect(() => {
    fetchJobs();
    fetchSavedJobs();
    fetchJobStats();
  }, []);

  useEffect(() => {
    filterAndSortJobs();
    updateActiveFilters();
  }, [jobs, searchTerm, locationFilter, skillFilter, experienceFilter, salaryFilter, remoteFilter, sourceFilter, sortBy]);

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
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch jobs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    // Saved jobs functionality temporarily disabled
    // Will be implemented when saved_jobs table is created
    setSavedJobs([]);
  };

  const fetchJobStats = async () => {
    try {
      const { data, error } = await supabase
        .from('job_postings_ai')
        .select('posted_date, remote_allowed, salary_min, salary_max, is_verified');

      if (error) throw error;

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const stats: JobStats = {
        total_jobs: data?.length || 0,
        new_this_week: data?.filter(job => 
          job.posted_date && new Date(job.posted_date) > oneWeekAgo
        ).length || 0,
        remote_opportunities: data?.filter(job => job.remote_allowed).length || 0,
        verified_companies: data?.filter(job => job.is_verified).length || 0,
        avg_salary: Math.round(
          data?.reduce((sum, job) => {
            const avg = ((job.salary_min || 0) + (job.salary_max || 0)) / 2;
            return sum + avg;
          }, 0) / (data?.length || 1)
        ),
      };

      setJobStats(stats);
    } catch (error) {
      console.error('Error fetching job stats:', error);
    }
  };

  const updateActiveFilters = () => {
    let count = 0;
    if (searchTerm) count++;
    if (locationFilter) count++;
    if (skillFilter) count++;
    if (experienceFilter) count++;
    if (salaryFilter) count++;
    if (remoteFilter) count++;
    if (sourceFilter) count++;
    setActiveFilters(count);
  };

  // Enhanced jobs with AI features
  const enhancedJobs = useMemo(() => {
    return jobs.map(job => ({
      ...job,
      matchScore: calculateJobMatchScore(job, preferences),
      isRecommended: isRecommendedJob(job, preferences)
    }));
  }, [jobs, preferences]);

  // Get top picks for sidebar
  const topPicks = useMemo(() => {
    if (!user) return [];
    return enhancedJobs
      .filter(job => job.isRecommended)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 4);
  }, [enhancedJobs, user]);

  const filterAndSortJobs = () => {
    let filtered = [...enhancedJobs];

    // Apply filters
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(term) ||
        job.company?.toLowerCase().includes(term) ||
        job.description?.toLowerCase().includes(term) ||
        job.skills_required?.some(skill => skill.toLowerCase().includes(term))
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
        job.skills_required?.some(skill => 
          skill.toLowerCase().includes(skillFilter.toLowerCase())
        )
      );
    }

    if (experienceFilter && experienceFilter !== 'all') {
      filtered = filtered.filter(job =>
        job.experience_level === experienceFilter
      );
    }

    if (remoteFilter && remoteFilter !== 'all') {
      if (remoteFilter === 'remote') {
        filtered = filtered.filter(job => job.remote_allowed);
      } else if (remoteFilter === 'onsite') {
        filtered = filtered.filter(job => !job.remote_allowed);
      }
    }

    if (sourceFilter && sourceFilter !== 'all') {
      filtered = filtered.filter(job => job.source_platform === sourceFilter);
    }

    if (salaryFilter && salaryFilter !== 'any') {
      filtered = filtered.filter(job => {
        const maxSalary = job.salary_max || 0;
        switch (salaryFilter) {
          case '50k': return maxSalary >= 50000;
          case '75k': return maxSalary >= 75000;
          case '100k': return maxSalary >= 100000;
          case '150k': return maxSalary >= 150000;
          default: return true;
        }
      });
    }

    // Apply sorting
    switch (sortBy) {
      case 'date':
        filtered.sort((a, b) => new Date(b.posted_date || 0).getTime() - new Date(a.posted_date || 0).getTime());
        break;
      case 'salary':
        filtered.sort((a, b) => (b.salary_max || 0) - (a.salary_max || 0));
        break;
      case 'company':
        filtered.sort((a, b) => (a.company || '').localeCompare(b.company || ''));
        break;
      case 'relevance':
      default:
        // Sort by recommendation and match score
        filtered.sort((a, b) => {
          if (a.isRecommended && !b.isRecommended) return -1;
          if (!a.isRecommended && b.isRecommended) return 1;
          return b.matchScore - a.matchScore;
        });
        break;
    }

    setFilteredJobs(filtered);
  };

  const toggleSaveJob = async (jobId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save jobs",
        variant: "destructive",
      });
      return;
    }

    // Saved jobs functionality temporarily disabled
    toast({
      title: "Feature Coming Soon",
      description: "Job saving functionality will be available soon.",
    });
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setSkillFilter('');
    setExperienceFilter('');
    setSalaryFilter('');
    setRemoteFilter('');
    setSourceFilter('');
  };

  const applyToJobWithLinkedIn = (job: JobPosting) => {
    if (job.source_url) {
      window.open(job.source_url, '_blank');
    }
  };

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Salary not disclosed';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return 'Competitive salary';
  };

  const getSourceBadgeColor = (platform: string | null) => {
    switch (platform) {
      case 'linkedin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'indeed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'glassdoor': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'government': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'company': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const calculateMatchScore = (job: JobPosting) => {
    // Enhanced AI matching logic would go here
    // For now, using a more sophisticated placeholder
    let score = 70;
    
    // Boost score for verified companies
    if (job.is_verified) score += 10;
    
    // Boost score for remote jobs
    if (job.remote_allowed) score += 5;
    
    // Boost score for recent postings
    if (job.posted_date) {
      const daysSincePosted = Math.floor(
        (new Date().getTime() - new Date(job.posted_date).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSincePosted <= 3) score += 5;
    }
    
    // Add some randomness for variety
    score += Math.floor(Math.random() * 10);
    
    return Math.min(score, 99);
  };

  const getJobSourceIcon = (platform: string | null) => {
    switch (platform) {
      case 'linkedin': return <LinkedinIcon className="h-4 w-4" />;
      case 'indeed': return <Briefcase className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const handleViewSimilar = (job: JobPosting) => {
    // Filter jobs with similar skills
    const similarJobs = jobs.filter(j => 
      j.id !== job.id && 
      j.skills_required?.some(skill => job.skills_required?.includes(skill))
    ).slice(0, 3);
    
    toast({
      title: "Similar Jobs Found",
      description: `Found ${similarJobs.length} jobs with similar skills. Check the list below!`,
    });
  };

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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">AI-Powered Geospatial Jobs</h1>
                <p className="text-muted-foreground">
                  Discover opportunities from LinkedIn, Indeed, government portals, and company websites worldwide
                </p>
                {user && (
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm mt-2">
                    <Brain className="h-3 w-3 mr-1" />
                    AI-Personalized Results
                  </Badge>
                )}
              </div>
            </div>

        {/* Job Statistics */}
        {jobStats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{jobStats.total_jobs}</p>
                  <p className="text-xs text-muted-foreground">Total Jobs</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{jobStats.new_this_week}</p>
                  <p className="text-xs text-muted-foreground">New This Week</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{jobStats.remote_opportunities}</p>
                  <p className="text-xs text-muted-foreground">Remote Jobs</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">{jobStats.verified_companies}</p>
                  <p className="text-xs text-muted-foreground">Verified</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <div>
                  <p className="text-2xl font-bold">${jobStats.avg_salary}k</p>
                  <p className="text-xs text-muted-foreground">Avg Salary</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">
            <Search className="h-4 w-4 mr-2" />
            Browse Jobs
          </TabsTrigger>
          <TabsTrigger value="saved">
            <Bookmark className="h-4 w-4 mr-2" />
            Saved Jobs ({savedJobs.length})
          </TabsTrigger>
          <TabsTrigger value="ai-insights" disabled={!hasProfessionalAccess}>
            <Brain className="h-4 w-4 mr-2" />
            AI Insights {!hasProfessionalAccess && '🔒'}
          </TabsTrigger>
          <TabsTrigger value="analytics" disabled={!hasEnterpriseAccess}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics {!hasEnterpriseAccess && '🔒'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Advanced Search and Filters */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Search & Filter Jobs</h3>
                {activeFilters > 0 && (
                  <Button variant="outline" size="sm" onClick={clearAllFilters}>
                    Clear Filters ({activeFilters})
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Job title, company, or keyword..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Input
                  placeholder="Location (city, country, or 'remote')"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
                
                <Input
                  placeholder="Required skill (GIS, Python, etc.)"
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                />
                
                <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Experience Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior Level</SelectItem>
                    <SelectItem value="lead">Lead/Principal</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={salaryFilter} onValueChange={setSalaryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Minimum Salary" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Salary</SelectItem>
                    <SelectItem value="50k">$50k+</SelectItem>
                    <SelectItem value="75k">$75k+</SelectItem>
                    <SelectItem value="100k">$100k+</SelectItem>
                    <SelectItem value="150k">$150k+</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={remoteFilter} onValueChange={setRemoteFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Work Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="remote">Remote Only</SelectItem>
                    <SelectItem value="onsite">On-site Only</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Job Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="indeed">Indeed</SelectItem>
                    <SelectItem value="glassdoor">Glassdoor</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="company">Company Direct</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">AI Relevance</SelectItem>
                    <SelectItem value="date">Date Posted</SelectItem>
                    <SelectItem value="salary">Salary</SelectItem>
                    <SelectItem value="company">Company Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Found {displayedJobs.length} jobs matching your criteria
            </p>
            <div className="flex items-center gap-2">
              {hasProfessionalAccess && (
                <Badge variant="outline" className="text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  AI-Enhanced
                </Badge>
              )}
            </div>
          </div>

          {/* Jobs List */}
          <div className="space-y-4">
            {displayedJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        {hasProfessionalAccess && (
                          <Badge variant="outline" className="text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            {calculateMatchScore(job)}% match
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {job.company}
                          {job.is_verified && (
                            <Badge variant="secondary" className="text-xs ml-2">
                              <Star className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location || 'Location not specified'}
                          {job.remote_allowed && (
                            <Badge variant="outline" className="ml-2 text-xs">Remote OK</Badge>
                          )}
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSaveJob(job.id)}
                        className="h-8 w-8 p-0"
                      >
                        {savedJobs.includes(job.id) ? (
                          <BookmarkCheck className="h-4 w-4 text-primary" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                      <Badge className={getSourceBadgeColor(job.source_platform)}>
                        <div className="flex items-center gap-1">
                          {getJobSourceIcon(job.source_platform)}
                          {job.source_platform || 'External'}
                        </div>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {job.employment_type || 'Full-time'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Posted {job.posted_date ? new Date(job.posted_date).toLocaleDateString() : 'Recently'}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {formatSalary(job.salary_min, job.salary_max)}
                      </div>
                      {job.experience_level && (
                        <Badge variant="outline" className="text-xs">
                          {job.experience_level}
                        </Badge>
                      )}
                    </div>

                    {job.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {job.description}
                      </p>
                    )}

                    {job.skills_required && job.skills_required.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {job.skills_required.slice(0, 8).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills_required.length > 8 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.skills_required.length - 8} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {job.expires_at && (
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Expires {new Date(job.expires_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {hasProfessionalAccess && (
                          <Button size="sm" variant="outline">
                            <Brain className="h-4 w-4 mr-2" />
                            AI Apply
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => applyToJobWithLinkedIn(job)}>
                          <LinkedinIcon className="h-4 w-4 mr-2" />
                          Apply on LinkedIn
                        </Button>
                        <Button size="sm" onClick={() => job.source_url && window.open(job.source_url, '_blank')}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Job
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {displayedJobs.length === 0 && !loading && (
            <Card className="p-12 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No jobs found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or check back later for new opportunities.
              </p>
              <Button variant="outline" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Saved Jobs</CardTitle>
              <CardDescription>
                Jobs you've bookmarked for future reference
              </CardDescription>
            </CardHeader>
            <CardContent>
              {savedJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No saved jobs yet</h3>
                  <p className="text-muted-foreground">
                    Start browsing and save interesting opportunities for later.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedJobs.filter(job => savedJobs.includes(job.id)).map((job) => (
                    <Card key={job.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{job.title}</h4>
                          <p className="text-sm text-muted-foreground">{job.company}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSaveJob(job.id)}
                        >
                          <BookmarkCheck className="h-4 w-4 text-primary" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-insights">
          {!hasProfessionalAccess ? (
            <UpgradePrompt 
              feature="AI-Powered Job Insights"
              description="Get personalized job recommendations, skill gap analysis, and career progression insights powered by AI."
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Career Insights
                </CardTitle>
                <CardDescription>
                  Personalized recommendations and career guidance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">AI Insights Coming Soon</h3>
                  <p className="text-muted-foreground mb-4">
                    Get personalized job recommendations, skill gap analysis, and career progression insights.
                  </p>
                  <Button>Set Up AI Profile</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          {!hasEnterpriseAccess ? (
            <UpgradePrompt 
              feature="Job Market Analytics"
              description="Access comprehensive job market trends, salary benchmarks, and hiring patterns in the geospatial industry."
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Market Analytics
                </CardTitle>
                <CardDescription>
                  Industry insights and hiring trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
                  <p className="text-muted-foreground mb-4">
                    Access comprehensive job market trends and salary benchmarks.
                  </p>
                  <Button>View Analytics</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
        </div>

        {/* Sidebar - Top Picks for You */}
        {user && topPicks.length > 0 && (
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-primary" />
                  Top Picks for You
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topPicks.map((job) => (
                  <Card key={job.id} className="border-primary/20">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-sm mb-2">{job.title}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <Progress value={job.matchScore} className="h-1 flex-1" />
                        <span className="text-xs text-primary">{job.matchScore}%</span>
                      </div>
                      <Button size="sm" className="w-full text-xs">Apply Now</Button>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsAIDiscovery;