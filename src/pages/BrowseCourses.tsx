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
  IndianRupee
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { EnrollmentForm } from "@/components/course-enrollment/EnrollmentForm";
import { WaitlistForm } from "@/components/course-enrollment/WaitlistForm";
import CourseCard from "@/components/cards/CourseCard";

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

  const liveCourses = [
    {
      id: "geospatial-technology-unlocked",
      title: "Geospatial Technology Unlocked",
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
      enrollmentDeadline: "25th July, 11:59 PM"
    }
  ];

  const upcomingCourses = [
    {
      id: 1,
      title: "Complete GIS Fundamentals",
      description: "Master the basics of Geographic Information Systems with hands-on QGIS training",
      instructor: "Dr. Sarah Chen",
      timeline: "January 2025 - March 2025",
      duration: "12 weeks",
      level: "Beginner",
      category: "fundamentals",
      icon: BookOpen,
      priceINR: "₹9,999",
      priceUSD: "$125",
      enrolled: 0,
      maxStudents: 200,
      rating: 4.9,
      isUpcoming: true,
      launchDate: "January 15, 2025"
    },
    {
      id: 2,
      title: "Advanced Remote Sensing with Python",
      description: "Deep dive into satellite imagery analysis and machine learning applications",
      instructor: "Dr. Michael Rodriguez",
      timeline: "March 2025 - May 2025",
      duration: "10 weeks",
      level: "Advanced",
      category: "remote-sensing",
      icon: BookOpen,
      priceINR: "₹14,999",
      priceUSD: "$199",
      enrolled: 0,
      maxStudents: 150,
      rating: 4.8,
      isUpcoming: true,
      launchDate: "March 10, 2025"
    },
    {
      id: 3,
      title: "GeoAI and Machine Learning",
      description: "Apply artificial intelligence techniques to geospatial data analysis",
      instructor: "Prof. Lisa Wang",
      timeline: "May 2025 - July 2025",
      duration: "8 weeks",
      level: "Expert",
      category: "ai-ml",
      icon: BookOpen,
      priceINR: "₹18,999",
      priceUSD: "$249",
      enrolled: 0,
      maxStudents: 100,
      rating: 4.9,
      isUpcoming: true,
      launchDate: "May 20, 2025"
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

        {/* Live Courses Section */}
        {liveCourses.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <GraduationCap className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">🔴 Live Courses - Enroll Now</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {liveCourses.map((course) => (
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
          </div>
        )}

        {/* Upcoming Courses Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <Calendar className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">🗓️ Upcoming Courses</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
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