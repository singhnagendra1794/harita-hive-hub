import Layout from '@/components/Layout';
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

  const upcomingCourses = [
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
      enrolled: 26,
      maxStudents: 50,
      rating: 5.0,
      isLive: true,
      isPriority: true,
      courseUrl: "/courses/geospatial-technology-unlocked"
    },
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
      enrolled: 156,
      maxStudents: 200,
      rating: 4.9,
      isUpcoming: true
    }
  ];

  // Check if enrollment is still open for Geospatial Technology Unlocked
  const isEnrollmentOpen = () => {
    const enrollmentDeadline = new Date('2025-07-21T13:30:00.000Z'); // 7 PM IST in UTC
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
    // Here you would typically redirect to payment processing
    toast({
      title: "Enrollment Successful!",
      description: "Redirecting to payment..."
    });
    // Implement Razorpay payment integration here
  };

  const formatPrice = (course: any) => {
    return currencyMode === 'INR' ? course.priceINR : course.priceUSD;
  };

  return (
    <Layout>
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Browse Upcoming Courses</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive GIS training programs. Join the waitlist to secure your spot and get early bird pricing.
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

        {/* Course Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {upcomingCourses.map((course) => {
            const IconComponent = course.icon;
            const progress = (course.enrolled / course.maxStudents) * 100;
            
            return (
              <Card key={course.id} className={`hover:shadow-lg transition-shadow ${course.isPriority ? 'border-primary shadow-md' : ''}`}>
                {course.isPriority && (
                  <div className="bg-primary text-primary-foreground text-center py-2 rounded-t-lg">
                    <span className="text-sm font-medium">⭐ FEATURED COURSE</span>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{course.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {course.description}
                        </CardDescription>
                      </div>
                    </div>
                    {course.isLive ? (
                      <Badge className="bg-green-500 text-white">
                        LIVE TRAINING
                      </Badge>
                    ) : course.isUpcoming ? (
                      <Badge className="bg-blue-500 text-white">
                        LAUNCHING 2025
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        COMING SOON
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center">
                      {"★".repeat(Math.floor(course.rating))}
                      <span className="text-sm text-muted-foreground ml-1">
                        {course.rating}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {course.enrolled}/{course.maxStudents} enrolled
                      </span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-800">
                        {formatPrice(course)}
                      </div>
                      <div className="text-sm text-green-600">Course Price</div>
                    </div>

                    {course.isLive && course.id === "geospatial-technology-unlocked" ? (
                      isEnrollmentOpen() ? (
                        <Button 
                          className="w-full"
                          onClick={() => handleEnrollNow(course)}
                        >
                          Enroll Now
                        </Button>
                      ) : (
                        <Button 
                          className="w-full" 
                          disabled
                          variant="outline"
                        >
                          Enrollment Closed
                        </Button>
                      )
                    ) : course.isLive ? (
                      <Link to={course.courseUrl}>
                        <Button className="w-full">
                          View Course Details
                        </Button>
                      </Link>
                    ) : (
                      <Button 
                        className="w-full"
                        onClick={() => handleJoinWaitlist(course)}
                      >
                        Join Waitlist - Get Early Access
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
    </Layout>
  );
};

export default BrowseCourses;