import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Building, Clock, ExternalLink, Search } from 'lucide-react';
import Layout from '@/components/Layout';

interface Job {
  id: string;
  title: string;
  company: string;
  location?: string;
  job_type: string;
  experience_level?: string;
  salary_range?: string;
  tags: string[];
  description: string;
  apply_url: string;
  created_at: string;
}

const JobBoard = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('job_listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load job listings.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || job.job_type === selectedType;
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading job opportunities...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Geospatial Jobs & Internships
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover career opportunities in the geospatial industry
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search jobs, companies, or skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                      <div className="flex items-center gap-4 text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {job.company}
                        </div>
                        {job.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(job.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {job.job_type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {job.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.tags.slice(0, 5).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      {job.experience_level && `${job.experience_level} level`}
                      {job.salary_range && ` • ${job.salary_range}`}
                    </div>
                    <Button onClick={() => window.open(job.apply_url, '_blank')}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💼</div>
              <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms to find more opportunities.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default JobBoard;