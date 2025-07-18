
import Layout from '@/components/Layout';
import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CertificationCard from "../components/certifications/CertificationCard";
import { Search, Award, Shield, TrendingUp, Users, CheckCircle, Star } from "lucide-react";

const CertificationHub = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");

  // Mock data - replace with real data from Supabase
  const certifications = [
    {
      id: "1",
      title: "GIS Fundamentals Professional",
      description: "Master the core concepts of Geographic Information Systems with hands-on projects and real-world applications.",
      price: 0,
      duration: "4-6 weeks",
      difficulty: "beginner",
      requirements: [
        "Basic computer skills",
        "Interest in geography and mapping",
        "Complete 5 hands-on projects",
        "Pass final assessment (80%)"
      ],
      isBlockchainVerified: true,
      rating: 4.8,
      studentsEnrolled: 2847
    },
    {
      id: "2",
      title: "Advanced Spatial Analysis Specialist",
      description: "Deep dive into advanced spatial analysis techniques, statistical methods, and research applications.",
      price: 199,
      duration: "8-10 weeks",
      difficulty: "advanced",
      requirements: [
        "GIS Fundamentals certification or equivalent",
        "Statistics background recommended",
        "Complete 8 analysis projects",
        "Peer review assignments",
        "Final capstone project"
      ],
      isBlockchainVerified: true,
      rating: 4.9,
      studentsEnrolled: 1243,
      progress: 65
    },
    {
      id: "3",
      title: "Web GIS Developer",
      description: "Learn to build modern web mapping applications using JavaScript, APIs, and cloud platforms.",
      price: 149,
      duration: "6-8 weeks",
      difficulty: "intermediate",
      requirements: [
        "Basic programming knowledge",
        "HTML/CSS fundamentals",
        "Build 4 web mapping projects",
        "Deploy applications to cloud",
        "Code review participation"
      ],
      isBlockchainVerified: true,
      rating: 4.7,
      studentsEnrolled: 1876
    },
    {
      id: "4",
      title: "Remote Sensing & Earth Observation",
      description: "Master satellite imagery analysis, machine learning classification, and temporal analysis techniques.",
      price: 249,
      duration: "10-12 weeks",
      difficulty: "advanced",
      requirements: [
        "GIS experience required",
        "Basic Python knowledge",
        "Access to Google Earth Engine",
        "Complete 6 RS projects",
        "Research paper submission"
      ],
      isBlockchainVerified: true,
      rating: 4.8,
      studentsEnrolled: 892
    },
    {
      id: "5",
      title: "QGIS Professional Certification",
      description: "Comprehensive QGIS training covering all aspects of the popular open-source GIS software.",
      price: 99,
      duration: "4-5 weeks",
      difficulty: "intermediate",
      requirements: [
        "Download and install QGIS",
        "Basic GIS knowledge",
        "Complete 10 practical exercises",
        "Create a portfolio project"
      ],
      isBlockchainVerified: false,
      rating: 4.6,
      studentsEnrolled: 3214,
      isEarned: true
    }
  ];

  const filteredCertifications = certifications.filter(cert => {
    const matchesSearch = cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === "all" || cert.difficulty === difficultyFilter;
    const matchesPrice = priceFilter === "all" || 
                        (priceFilter === "free" && cert.price === 0) ||
                        (priceFilter === "paid" && cert.price > 0);
    
    return matchesSearch && matchesDifficulty && matchesPrice;
  });

  const earnedCertifications = certifications.filter(c => c.isEarned);
  const inProgressCertifications = certifications.filter(c => c.progress && c.progress > 0 && !c.isEarned);
  const blockchainCertifications = certifications.filter(c => c.isBlockchainVerified);

  const stats = {
    totalCertifications: certifications.length,
    earnedCount: earnedCertifications.length,
    blockchainCount: blockchainCertifications.length,
    inProgressCount: inProgressCertifications.length
  };

  return (
    <Layout>
    <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">GIS Certifications</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Earn industry-recognized credentials with blockchain verification. Validate your GIS skills and advance your career.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                <CheckCircle className="h-10 w-10 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.earnedCount}</div>
                  <div className="text-muted-foreground">Earned</div>
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
                <TrendingUp className="h-10 w-10 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.inProgressCount}</div>
                  <div className="text-muted-foreground">In Progress</div>
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

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Certifications</TabsTrigger>
            <TabsTrigger value="earned">My Certificates</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="blockchain">Blockchain Verified</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCertifications.map(cert => (
                <CertificationCard key={cert.id} {...cert} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="earned">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {earnedCertifications.map(cert => (
                <CertificationCard key={cert.id} {...cert} />
              ))}
            </div>
            {earnedCertifications.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No certificates earned yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start your GIS learning journey and earn your first certification!
                  </p>
                  <Button>Browse Certifications</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="in-progress">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inProgressCertifications.map(cert => (
                <CertificationCard key={cert.id} {...cert} />
              ))}
            </div>
            {inProgressCertifications.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No certifications in progress</h3>
                  <p className="text-muted-foreground mb-4">
                    Enroll in a certification program to start your learning journey.
                  </p>
                  <Button>Start Learning</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="blockchain">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {blockchainCertifications.map(cert => (
                <CertificationCard key={cert.id} {...cert} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {filteredCertifications.length === 0 && (
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
      </div>
    </Layout>
  );
};

export default CertificationHub;
