
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Award, Shield, Users, Star, Search, CheckCircle } from "lucide-react";
import CertificationCourseCard from "../components/certifications/CertificationCourseCard";
import { useCertificationCourses } from "@/hooks/useCertificationCourses";

const CertificationHub = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  
  const { courses, loading, error } = useCertificationCourses();

  const filteredCertifications = courses.filter(cert => {
    const matchesSearch = cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === "all" || cert.difficulty.toLowerCase() === difficultyFilter;
    const matchesPrice = priceFilter === "all" || 
                        (priceFilter === "free" && cert.price === 0) ||
                        (priceFilter === "paid" && cert.price > 0);
    
    return matchesSearch && matchesDifficulty && matchesPrice;
  });

  const blockchainCertifications = courses.filter(c => c.is_blockchain_verified);

  const stats = {
    totalCertifications: courses.length,
    blockchainCount: blockchainCertifications.length,
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading certification courses...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="text-center py-12">
          <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error loading certifications</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">GIS Certifications</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Earn industry-recognized credentials with blockchain verification. Validate your GIS skills and advance your career.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Award className="h-10 w-10 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalCertifications}</div>
                  <div className="text-muted-foreground">Available Certifications</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Shield className="h-10 w-10 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.blockchainCount}</div>
                  <div className="text-muted-foreground">Blockchain Verified</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Users className="h-10 w-10 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{courses.reduce((sum, c) => sum + c.students_enrolled, 0).toLocaleString()}</div>
                  <div className="text-muted-foreground">Total Students</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Why Choose Our Certifications?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="flex flex-col items-center text-center">
                  <Shield className="h-12 w-12 text-blue-500 mb-3" />
                  <h3 className="font-semibold mb-2">Blockchain Verified</h3>
                  <p className="text-sm text-muted-foreground">Tamper-proof certificates stored on blockchain for lifetime verification</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Users className="h-12 w-12 text-green-500 mb-3" />
                  <h3 className="font-semibold mb-2">Industry Recognized</h3>
                  <p className="text-sm text-muted-foreground">Certificates valued by top employers and industry professionals</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Star className="h-12 w-12 text-yellow-500 mb-3" />
                  <h3 className="font-semibold mb-2">Expert-Led</h3>
                  <p className="text-sm text-muted-foreground">Courses designed and taught by leading GIS professionals</p>
                </div>
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
                  placeholder="Search certifications..."
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
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-full md:w-32">
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Certification Courses Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {filteredCertifications.map(cert => (
            <CertificationCourseCard key={cert.id} {...cert} />
          ))}
        </div>

        {filteredCertifications.length === 0 && courses.length > 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No certifications found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or browse all certifications.
              </p>
              <Button onClick={() => {
                setSearchTerm("");
                setDifficultyFilter("all");
                setPriceFilter("all");
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {courses.length === 0 && !loading && (
          <Card className="text-center py-12">
            <CardContent>
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No certification courses available</h3>
              <p className="text-muted-foreground mb-4">
                Check back soon for new certification opportunities!
              </p>
              <Button asChild>
                <a href="/upcoming-course">Browse Upcoming Courses</a>
              </Button>
            </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CertificationHub;
