import { useState, useEffect } from "react";
import { Search, MapPin, Briefcase, Clock, Filter, Star, ExternalLink } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  experience: string;
  salary?: string;
  description: string;
  skills: string[];
  postedDate: string;
  source: string;
  applyUrl: string;
  isRemote: boolean;
  isFeatured?: boolean;
}

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Mock data - in real implementation, this would fetch from multiple APIs
  const mockJobs: Job[] = [
    {
      id: "1",
      title: "Senior GIS Developer",
      company: "EsriTech Solutions",
      location: "San Francisco, CA",
      type: "Full-time",
      experience: "Senior",
      salary: "$120,000 - $150,000",
      description: "Join our team to develop cutting-edge GIS applications using ArcGIS and Python...",
      skills: ["ArcGIS", "Python", "JavaScript", "PostGIS"],
      postedDate: "2024-01-15",
      source: "LinkedIn",
      applyUrl: "https://example.com/apply/1",
      isRemote: false,
      isFeatured: true
    },
    {
      id: "2",
      title: "Remote Sensing Analyst",
      company: "SatelliteData Corp",
      location: "Remote",
      type: "Full-time",
      experience: "Mid-level",
      salary: "$80,000 - $100,000",
      description: "Analyze satellite imagery and develop machine learning models for earth observation...",
      skills: ["Remote Sensing", "Python", "GDAL", "Machine Learning"],
      postedDate: "2024-01-14",
      source: "Indeed",
      applyUrl: "https://example.com/apply/2",
      isRemote: true
    },
    {
      id: "3",
      title: "Geospatial Data Scientist",
      company: "DataGeo Inc",
      location: "London, UK",
      type: "Contract",
      experience: "Senior",
      salary: "£600 - £800/day",
      description: "Lead geospatial analytics projects and mentor junior team members...",
      skills: ["R", "Python", "QGIS", "SQL", "Machine Learning"],
      postedDate: "2024-01-13",
      source: "AngelList",
      applyUrl: "https://example.com/apply/3",
      isRemote: false
    },
    {
      id: "4",
      title: "GIS Intern",
      company: "Urban Planning Agency",
      location: "New York, NY",
      type: "Internship",
      experience: "Entry-level",
      description: "Support urban planning initiatives using GIS tools and data analysis...",
      skills: ["ArcGIS", "QGIS", "CAD", "Data Analysis"],
      postedDate: "2024-01-12",
      source: "Government Portal",
      applyUrl: "https://example.com/apply/4",
      isRemote: false
    },
    {
      id: "5",
      title: "Freelance Google Earth Engine Developer",
      company: "Environmental Consulting",
      location: "Remote",
      type: "Freelance",
      experience: "Mid-level",
      salary: "$50 - $80/hour",
      description: "Develop custom applications using Google Earth Engine for environmental monitoring...",
      skills: ["Google Earth Engine", "JavaScript", "Python", "Remote Sensing"],
      postedDate: "2024-01-11",
      source: "Upwork",
      applyUrl: "https://example.com/apply/5",
      isRemote: true
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setJobs(mockJobs);
      setFilteredJobs(mockJobs);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (locationFilter) {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(locationFilter.toLowerCase()) ||
        (locationFilter === "remote" && job.isRemote)
      );
    }

    if (typeFilter) {
      filtered = filtered.filter(job => job.type === typeFilter);
    }

    if (experienceFilter) {
      filtered = filtered.filter(job => job.experience === experienceFilter);
    }

    setFilteredJobs(filtered);
  }, [searchTerm, locationFilter, typeFilter, experienceFilter, jobs]);

  const handleJobAlert = () => {
    toast({
      title: "Job Alert Created",
      description: "You'll receive notifications for jobs matching your criteria.",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Global Geospatial Jobs</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Discover opportunities from top companies worldwide
          </p>
          <Button onClick={handleJobAlert} className="mb-6">
            <Star className="h-4 w-4 mr-2" />
            Create Job Alert
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs, companies, skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Locations</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="san francisco">San Francisco</SelectItem>
                  <SelectItem value="new york">New York</SelectItem>
                  <SelectItem value="london">London</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                </SelectContent>
              </Select>
              <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Levels</SelectItem>
                  <SelectItem value="Entry-level">Entry-level</SelectItem>
                  <SelectItem value="Mid-level">Mid-level</SelectItem>
                  <SelectItem value="Senior">Senior</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            {loading ? "Loading..." : `${filteredJobs.length} jobs found`}
          </p>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>

        {/* Job Listings */}
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
            filteredJobs.map((job) => (
              <Card key={job.id} className={`hover:shadow-lg transition-shadow ${job.isFeatured ? 'border-primary' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        {job.isFeatured && <Badge variant="secondary">Featured</Badge>}
                        {job.isRemote && <Badge variant="outline">Remote</Badge>}
                      </div>
                      <p className="text-lg font-semibold text-primary">{job.company}</p>
                      <div className="flex items-center gap-4 text-muted-foreground mt-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {job.type}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {job.experience}
                        </div>
                      </div>
                      {job.salary && (
                        <p className="text-lg font-semibold text-green-600 mt-2">{job.salary}</p>
                      )}
                    </div>
                    <Button asChild>
                      <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
                        Apply Now
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{job.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Posted on {new Date(job.postedDate).toLocaleDateString()}</span>
                    <span>via {job.source}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {!loading && filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search criteria</p>
            <Button onClick={() => {
              setSearchTerm("");
              setLocationFilter("");
              setTypeFilter("");
              setExperienceFilter("");
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Jobs;