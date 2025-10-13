import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  Users, 
  Star,
  Search,
  Filter,
  GraduationCap,
  CheckCircle,
  DollarSign,
  IndianRupee,
  Brain,
  Globe,
  Code,
  MapPin,
  BarChart3
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { EnrollmentForm } from "@/components/course-enrollment/EnrollmentForm";
import { WaitlistForm } from "@/components/course-enrollment/WaitlistForm";
import CourseCard from "@/components/cards/CourseCard";
import GeospatialTechUnlockedDetails from "@/components/course-details/GeospatialTechUnlockedDetails";

const BrowseCourses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [currencyMode, setCurrencyMode] = useState<'INR' | 'USD'>('USD');
  const { toast } = useToast();
  const { user } = useAuth();

  // Detect user location and set currency
  useEffect(() => {
    const locale = navigator.language || 'en-US';
    setCurrencyMode(locale.includes('IN') || locale === 'hi-IN' ? 'INR' : 'USD');
  }, []);

  // Ongoing courses - currently active and accepting enrollments
  const ongoingCourses = [
    {
      id: "geospatial-technology-unlocked-batch-1",
      title: "Geospatial Technology Unlocked - Batch 1",
      description: "90-Day Advanced Practical Program – GIS, Remote Sensing, Python, SQL, GeoAI",
      instructor: "Expert Instructors",
      timeline: "Starts from 21st July 08:00 PM TO 09:30 PM Monday to Saturday",
      duration: "90 days",
      level: "Advanced",
      category: "live-training",
      icon: GraduationCap,
      priceINR: "₹11,999",
      priceUSD: "$149",
      enrolled: 35,
      maxStudents: 50,
      rating: 5.0,
      isLive: true,
      isPriority: true,
      courseUrl: "/courses/geospatial-technology-unlocked",
      enrollmentDeadline: "25th July, 11:59 PM",
      startDate: "July 21, 2025"
    },
    {
      id: "geospatial-technology-unlocked-batch-2",
      title: "Geospatial Technology Unlocked - Batch 2",
      description: "90-Day Advanced Practical Program – GIS, Remote Sensing, Python, SQL, GeoAI",
      instructor: "Expert Instructors",
      timeline: "Starts from 14th October 08:00 PM TO 09:30 PM Monday to Saturday",
      duration: "90 days",
      level: "Advanced",
      category: "live-training",
      icon: GraduationCap,
      priceINR: "₹11,999",
      priceUSD: "$149",
      enrolled: 0,
      maxStudents: 50,
      rating: 5.0,
      isLive: true,
      isPriority: true,
      courseUrl: "/courses/geospatial-technology-unlocked",
      enrollmentDeadline: "12th October, 11:59 PM",
      startDate: "October 14, 2025"
    }
  ];

  // Upcoming courses - future courses accepting waitlist signups
  const upcomingCourses = [
    {
      id: "geoai-mastery-program",
      title: "GeoAI Mastery Program",
      description: "Transform your career with comprehensive 8-week program combining GIS, AI, and Machine Learning",
      instructor: "GeoAI Experts",
      timeline: "January 2025 - March 2025",
      duration: "8 weeks",
      level: "Advanced",
      category: "ai-ml",
      icon: Brain,
      priceINR: "₹14,999",
      priceUSD: "$179",
      enrolled: 0,
      maxStudents: 100,
      rating: 5.0,
      isUpcoming: true,
      launchDate: "To be launched"
    },
    {
      id: "arcgis-enterprise-mastery",
      title: "ArcGIS Enterprise Mastery",
      description: "From Server Setup to Custom Web Apps & Widgets. Master the full ArcGIS Enterprise stack with hands-on labs",
      instructor: "Enterprise GIS Specialists",
      timeline: "September 2025 - November 2025",
      duration: "12 weeks",
      level: "Advanced",
      category: "enterprise-gis",
      icon: Globe,
      priceINR: "₹11,999",
      priceUSD: "$149",
      enrolled: 0,
      maxStudents: 75,
      rating: 4.9,
      isUpcoming: true,
      launchDate: "To be launched"
    },
    {
      id: "python-gis-automation",
      title: "Advanced Python for GIS Automation",
      description: "Master Python scripting for complex geospatial workflows, including ArcPy, GDAL, and custom tool development",
      instructor: "Python GIS Developers",
      timeline: "October 2025 - December 2025",
      duration: "10 weeks",
      level: "Advanced",
      category: "programming",
      icon: Code,
      priceINR: "₹10,999",
      priceUSD: "$129",
      enrolled: 0,
      maxStudents: 120,
      rating: 4.8,
      isUpcoming: true,
      launchDate: "To be launched"
    },
    {
      id: "drone-mapping-photogrammetry",
      title: "Drone Mapping & Photogrammetry",
      description: "Learn to process drone imagery, create orthomosaics, and generate 3D models for various applications",
      instructor: "Remote Sensing Experts",
      timeline: "December 2025 - February 2026",
      duration: "8 weeks",
      level: "Intermediate",
      category: "remote-sensing",
      icon: MapPin,
      priceINR: "₹10,999",
      priceUSD: "$129",
      enrolled: 0,
      maxStudents: 80,
      rating: 4.7,
      isUpcoming: true,
      launchDate: "To be launched"
    },
    {
      id: "gis-data-science",
      title: "GIS Data Science & Machine Learning",
      description: "Apply machine learning techniques to geospatial data for predictive modeling and pattern recognition",
      instructor: "Data Science Team",
      timeline: "January 2026 - March 2026",
      duration: "12 weeks",
      level: "Advanced",
      category: "data-science",
      icon: BarChart3,
      priceINR: "₹10,999",
      priceUSD: "$129",
      enrolled: 0,
      maxStudents: 60,
      rating: 4.9,
      isUpcoming: true,
      launchDate: "To be launched"
    }
  ];

  // Check if enrollment is still open for Geospatial Technology Unlocked
  const isEnrollmentOpen = () => {
    const enrollmentDeadline = new Date('2025-07-25T18:29:00.000Z'); // 25th July, 11:59 PM IST in UTC
    return new Date() <= enrollmentDeadline;
  };

  const handleEnrollNow = (course: any) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to enroll in this course.",
        variant: "destructive"
      });
      return;
    }

    if (!isEnrollmentOpen()) {
      toast({
        title: "Enrollment Closed",
        description: "Enrollment deadline has passed for this course.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedCourse(course);
    setShowEnrollmentForm(true);
  };

  const handleJoinWaitlist = (course: any) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to join the waitlist.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedCourse(course);
    setShowWaitlistForm(true);
  };

  const handleEnrollmentSuccess = (enrollmentId: string) => {
    setShowEnrollmentForm(false);
    toast({
      title: "Enrollment Complete!",
      description: "Payment successful. Check your email for course details.",
    });
    
    // Redirect to dashboard with enrollment success
    setTimeout(() => {
      window.location.href = '/dashboard?enrolled=true';
    }, 2000);
  };

  const formatPrice = (course: any) => {
    return currencyMode === 'INR' ? course.priceINR : course.priceUSD;
  };

  return (
    <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Browse Courses</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive GIS training programs designed to advance your geospatial skills.
          </p>
        </div>

        {/* Currency Toggle & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Currency:</span>
              <Button
                variant={currencyMode === 'INR' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrencyMode('INR')}
              >
                <IndianRupee className="h-3 w-3 mr-1" />
                INR
              </Button>
              <Button
                variant={currencyMode === 'USD' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrencyMode('USD')}
              >
                <DollarSign className="h-3 w-3 mr-1" />
                USD
              </Button>
            </div>
          </div>
        </div>

        {/* Ongoing Courses Section */}
        {ongoingCourses.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <GraduationCap className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">📚 Ongoing Courses</h2>
            </div>
            
            {/* Featured Course: Geospatial Technology Unlocked */}
            <div className="mb-8">
              <GeospatialTechUnlockedDetails
                currencyMode={currencyMode}
                isEnrollmentOpen={isEnrollmentOpen()}
                onEnrollNow={() => handleEnrollNow(ongoingCourses[0])}
              />
            </div>
            
            {/* Other ongoing courses if any */}
            {ongoingCourses.length > 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {ongoingCourses.slice(1).map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    currencyMode={currencyMode}
                    isEnrollmentOpen={isEnrollmentOpen()}
                    onEnrollNow={handleEnrollNow}
                    onJoinWaitlist={handleJoinWaitlist}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Upcoming Courses Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <Calendar className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">🗓️ Upcoming Courses</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {upcomingCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                currencyMode={currencyMode}
                isEnrollmentOpen={false}
                onEnrollNow={handleEnrollNow}
                onJoinWaitlist={handleJoinWaitlist}
              />
            ))}
          </div>
        </div>

        {/* Enrollment Form Modal */}
        {showEnrollmentForm && selectedCourse && (
          <EnrollmentForm
            courseId={selectedCourse.id}
            courseTitle={selectedCourse.title}
            price={formatPrice(selectedCourse).replace(/[₹$]/g, '')}
            currency={currencyMode === 'INR' ? '₹' : '$'}
            isInternational={currencyMode === 'USD'}
            onClose={() => setShowEnrollmentForm(false)}
            onSuccess={handleEnrollmentSuccess}
          />
        )}

        {/* Waitlist Form Modal */}
        {showWaitlistForm && selectedCourse && (
          <WaitlistForm
            courseId={selectedCourse.id}
            courseTitle={selectedCourse.title}
            onClose={() => setShowWaitlistForm(false)}
          />
        )}
    </div>
  );
};

export default BrowseCourses;