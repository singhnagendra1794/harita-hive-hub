import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Award, Shield, Users, Star, Search, CheckCircle, Download, Share2, HelpCircle, Linkedin, FileText } from "lucide-react";
import CertificationCourseCard from "../components/certifications/CertificationCourseCard";
import { useCertificationCourses } from "@/hooks/useCertificationCourses";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const CertificationHub = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [trackFilter, setTrackFilter] = useState("all");
  const [showNftModal, setShowNftModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState<any>(null);
  
  const { courses, loading, error } = useCertificationCourses();
  const { user } = useAuth();
  const { toast } = useToast();

  const filteredCertifications = courses.filter(cert => {
    const matchesSearch = cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === "all" || cert.difficulty.toLowerCase() === difficultyFilter;
    const matchesPrice = priceFilter === "all" || 
                        (priceFilter === "free" && cert.price === 0) ||
                        (priceFilter === "paid" && cert.price > 0);
    
    // Track filtering
    const matchesTrack = trackFilter === "all" || 
      (trackFilter === "gis" && cert.title.toLowerCase().includes("gis")) ||
      (trackFilter === "geoai" && cert.title.toLowerCase().includes("ai")) ||
      (trackFilter === "remote-sensing" && cert.title.toLowerCase().includes("remote")) ||
      (trackFilter === "webgis" && cert.title.toLowerCase().includes("web"));
    
    return matchesSearch && matchesDifficulty && matchesPrice && matchesTrack;
  });

  const blockchainCertifications = courses.filter(c => c.is_blockchain_verified);

  const stats = {
    totalCertifications: courses.length,
    blockchainCount: blockchainCertifications.length,
  };

  const handleEarnNftBadge = (cert: any) => {
    setSelectedCert(cert);
    setShowNftModal(true);
  };

  const handleDownloadCertificate = (cert: any) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to download certificates.",
        variant: "destructive"
      });
      return;
    }
    
    // Generate mock certificate
    toast({
      title: "Certificate Downloaded",
      description: `Smart certificate for ${cert.title} has been generated and downloaded.`,
    });
  };

  const handleShareLinkedIn = (cert: any) => {
    const shareText = `Just earned my certification in ${cert.title} from HaritaHive! 🎓🌍 #GIS #Certification #GeospatialTech`;
    const shareUrl = `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(shareText)}`;
    window.open(shareUrl, '_blank');
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
            <Select value={trackFilter} onValueChange={setTrackFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Track" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tracks</SelectItem>
                <SelectItem value="gis">GIS</SelectItem>
                <SelectItem value="geoai">GeoAI</SelectItem>
                <SelectItem value="remote-sensing">Remote Sensing</SelectItem>
                <SelectItem value="webgis">Web GIS</SelectItem>
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-full md:w-40">
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

      {/* How It Works Section */}
      <Card className="mb-8 border-dashed border-2">
        <CardContent className="p-8">
          <div className="text-center">
            <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">How Smart Credentials Work</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Complete Course</h3>
                <p className="text-sm text-muted-foreground">Finish all modules and pass assessments</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="font-semibold mb-2">Earn NFT Badge</h3>
                <p className="text-sm text-muted-foreground">Get blockchain-verified digital badge</p>
              </div>
              <div className="text-center">
                <div className="bg-green-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Share2 className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="font-semibold mb-2">Share Achievements</h3>
                <p className="text-sm text-muted-foreground">Display on LinkedIn and professional profiles</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certification Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {filteredCertifications.map(cert => (
          <div key={cert.id} className="relative">
            <CertificationCourseCard {...cert} />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleEarnNftBadge(cert)}
                title="Earn NFT Badge"
              >
                🎖️
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownloadCertificate(cert)}
                title="Download Certificate"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleShareLinkedIn(cert)}
                title="Share on LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* NFT Badge Modal */}
      <Dialog open={showNftModal} onOpenChange={setShowNftModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>🎖️ NFT Badge Earned!</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full w-24 h-24 flex items-center justify-center mx-auto">
              <Award className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-xl font-bold">{selectedCert?.title}</h3>
            <p className="text-muted-foreground">
              Your achievement has been recorded on the blockchain for permanent verification.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => handleDownloadCertificate(selectedCert)}>
                <FileText className="h-4 w-4 mr-2" />
                Download Certificate
              </Button>
              <Button variant="outline" onClick={() => handleShareLinkedIn(selectedCert)}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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