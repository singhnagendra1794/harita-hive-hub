
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
  MapPin,
  Layers,
  BarChart3,
  Satellite,
  TreePine,
  Code,
  CheckCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import geospatialThumbnail from "@/assets/courses/geospatial-fullstack-thumbnail.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const BrowseCourses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | number | null>(null);
  const [isEnrolledInGeospatial, setIsEnrolledInGeospatial] = useState(false);
  const [waitlistForm, setWaitlistForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    experienceLevel: "beginner",
    motivation: "",
    referralSource: ""
  });
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if user is enrolled in Geospatial Technology Unlocked
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('course_enrollments')
          .select('course_id, courses!inner(title)')
          .eq('user_id', user.id)
          .eq('courses.title', 'Geospatial Technology Unlocked');
        
        setIsEnrolledInGeospatial(data && data.length > 0);
      } catch (error) {
        console.error('Error checking enrollment:', error);
      }
    };

    checkEnrollment();
  }, [user]);

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
      features: [
        "Live interactive sessions Monday to Saturday",
        "GIS fundamentals to advanced techniques",
        "Remote sensing and satellite imagery analysis",
        "Python automation for geospatial workflows",
        "SQL for spatial databases",
        "Hands-on GeoAI and machine learning projects",
        "Real-world industry projects",
        "Certificate upon completion"
      ],
      learningOutcomes: [
        "Master advanced GIS techniques",
        "Build geospatial applications with Python",
        "Analyze satellite imagery effectively",
        "Implement GeoAI solutions",
        "Work with spatial databases",
        "Create professional portfolios"
      ],
      prerequisites: "Basic computer skills and eagerness to learn",
      price: "₹25,999",
      earlyBird: "₹19,999",
      enrolled: 26,
      maxStudents: 50,
      rating: 5.0,
      testimonials: [
        "Comprehensive program covering all aspects of geospatial technology!",
        "Perfect blend of theory and practical applications."
      ],
      isLive: true,
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
      features: [
        "Introduction to GIS concepts and principles",
        "QGIS software mastery from basics to intermediate",
        "Spatial data types and formats",
        "Map projection and coordinate systems",
        "Basic spatial analysis techniques",
        "Creating professional maps and layouts"
      ],
      learningOutcomes: [
        "Understand core GIS concepts and terminology",
        "Navigate and use QGIS effectively",
        "Work with various spatial data formats",
        "Perform basic spatial analysis",
        "Create publication-ready maps"
      ],
      prerequisites: "No prior GIS experience required",
      price: "₹12,999",
      earlyBird: "₹9,999",
      enrolled: 156,
      maxStudents: 200,
      rating: 4.9,
      testimonials: [
        "Perfect introduction to GIS! The hands-on approach made learning enjoyable.",
        "Dr. Chen explains complex concepts in simple terms. Highly recommended!"
      ]
    },
    {
      id: 2,
      title: "Advanced Spatial Analysis with Python",
      description: "Learn advanced geospatial analysis using Python, GeoPandas, and machine learning",
      instructor: "Prof. Michael Rodriguez",
      timeline: "February 2025 - May 2025",
      duration: "16 weeks",
      level: "Advanced",
      category: "programming",
      icon: BarChart3,
      features: [
        "Python for geospatial analysis",
        "GeoPandas and spatial data manipulation",
        "Rasterio for raster data processing",
        "Machine learning for spatial data",
        "Web mapping with Folium and Plotly",
        "Real-world project implementation"
      ],
      learningOutcomes: [
        "Master Python libraries for GIS",
        "Implement machine learning in geospatial context",
        "Build interactive web maps",
        "Automate spatial analysis workflows",
        "Handle big geospatial datasets"
      ],
      prerequisites: "Basic Python knowledge and GIS fundamentals",
      price: "₹18,999",
      earlyBird: "₹14,999",
      enrolled: 89,
      maxStudents: 150,
      rating: 4.8,
      testimonials: [
        "Excellent blend of theory and practical applications!",
        "The projects were challenging but very rewarding."
      ]
    },
    {
      id: 3,
      title: "Remote Sensing & Satellite Image Analysis",
      description: "Process and analyze satellite imagery for environmental monitoring and change detection",
      instructor: "Dr. Priya Sharma",
      timeline: "March 2025 - June 2025",
      duration: "14 weeks",
      level: "Intermediate",
      category: "remote-sensing",
      icon: Satellite,
      features: [
        "Fundamentals of remote sensing",
        "Satellite image preprocessing",
        "Classification techniques",
        "Change detection analysis",
        "NDVI and vegetation indices",
        "Google Earth Engine applications"
      ],
      learningOutcomes: [
        "Understand remote sensing principles",
        "Process multispectral satellite imagery",
        "Perform land cover classification",
        "Detect environmental changes over time",
        "Use Google Earth Engine effectively"
      ],
      prerequisites: "Basic GIS knowledge recommended",
      price: "₹15,999",
      earlyBird: "₹12,999",
      enrolled: 67,
      maxStudents: 120,
      rating: 4.7,
      testimonials: [
        "Great course for understanding satellite data analysis!",
        "Dr. Sharma's expertise in remote sensing is evident."
      ]
    },
    {
      id: 4,
      title: "Urban Planning with GIS",
      description: "Apply GIS techniques for urban planning, smart cities, and sustainable development",
      instructor: "Arch. David Kim",
      timeline: "April 2025 - July 2025",
      duration: "12 weeks",
      level: "Intermediate",
      category: "urban-planning",
      icon: MapPin,
      features: [
        "Urban spatial analysis",
        "Land use planning",
        "Transportation network analysis",
        "Population density mapping",
        "3D city modeling",
        "Smart city applications"
      ],
      learningOutcomes: [
        "Apply GIS in urban planning projects",
        "Analyze urban growth patterns",
        "Design efficient transportation systems",
        "Create 3D urban models",
        "Understand smart city concepts"
      ],
      prerequisites: "GIS fundamentals and basic statistics",
      price: "₹16,999",
      earlyBird: "₹13,999",
      enrolled: 43,
      maxStudents: 100,
      rating: 4.6,
      testimonials: [
        "Practical applications for real urban planning challenges!",
        "Excellent case studies from around the world."
      ]
    },
    {
      id: 5,
      title: "Environmental GIS & Conservation",
      description: "Use GIS for environmental monitoring, biodiversity conservation, and climate analysis",
      instructor: "Dr. Emma Thompson",
      timeline: "May 2025 - August 2025",
      duration: "14 weeks",
      level: "Intermediate",
      category: "environmental",
      icon: TreePine,
      features: [
        "Environmental spatial analysis",
        "Biodiversity mapping",
        "Climate data analysis",
        "Habitat modeling",
        "Conservation planning",
        "Environmental impact assessment"
      ],
      learningOutcomes: [
        "Analyze environmental spatial patterns",
        "Map and monitor biodiversity",
        "Assess climate change impacts",
        "Design conservation strategies",
        "Conduct environmental assessments"
      ],
      prerequisites: "GIS fundamentals and environmental science basics",
      price: "₹17,999",
      earlyBird: "₹14,999",
      enrolled: 38,
      maxStudents: 80,
      rating: 4.8,
      testimonials: [
        "Perfect for environmental professionals!",
        "Great mix of theory and hands-on practice."
      ]
    },
    {
      id: 6,
      title: "Web GIS Development",
      description: "Build interactive web-based GIS applications using modern web technologies",
      instructor: "Tech Lead Alex Johnson",
      timeline: "June 2025 - September 2025",
      duration: "16 weeks",
      level: "Advanced",
      category: "web-development",
      icon: Layers,
      features: [
        "Web mapping frameworks",
        "Leaflet and OpenLayers",
        "PostGIS and spatial databases",
        "RESTful GIS services",
        "React and Vue.js for GIS",
        "Cloud deployment strategies"
      ],
      learningOutcomes: [
        "Build interactive web maps",
        "Develop GIS web applications",
        "Work with spatial databases",
        "Deploy applications to cloud",
        "Integrate multiple data sources"
      ],
      prerequisites: "JavaScript, HTML/CSS, and basic GIS knowledge",
      price: "₹21,999",
      earlyBird: "₹17,999",
      enrolled: 29,
      maxStudents: 60,
      rating: 4.9,
      testimonials: [
        "Excellent hands-on web development course!",
        "Alex is a fantastic instructor with real industry experience."
      ]
    },
    {
      id: 7,
      title: "Geospatial Full Stack Developer",
      description: "Master Web GIS, PostGIS, React Leaflet, and real-time mapping with AI-powered instruction",
      instructor: "AI Avatar Instructor",
      timeline: "August 2025 - October 2025",
      duration: "12 weeks",
      level: "Advanced",
      category: "fullstack",
      icon: Code,
      features: [
        "PostGIS + Express API development",
        "React + Leaflet integration",
        "MapLibre GL for 3D visualizations",
        "Real-time GIS with WebSockets",
        "Supabase spatial backend",
        "Production deployment"
      ],
      learningOutcomes: [
        "Build full-stack geospatial applications",
        "Master modern GIS web stack",
        "Implement real-time mapping features",
        "Deploy production-ready apps",
        "Integrate AI/ML with spatial data"
      ],
      prerequisites: "JavaScript, React basics, and GIS fundamentals",
      price: "₹14,999",
      earlyBird: "₹11,999",
      enrolled: 0,
      maxStudents: 100,
      rating: 5.0,
      testimonials: [
        "Revolutionary approach with AI instructor!",
        "Perfect blend of modern tech and GIS expertise."
      ],
      isNew: true,
      courseUrl: "/courses/geospatial-fullstack-developer"
    }
  ];

  const categories = [
    { value: "all", label: "All Categories", count: upcomingCourses.length },
    { value: "live-training", label: "Live Training", count: upcomingCourses.filter(c => c.category === "live-training").length },
    { value: "fundamentals", label: "GIS Fundamentals", count: upcomingCourses.filter(c => c.category === "fundamentals").length },
    { value: "programming", label: "Programming", count: upcomingCourses.filter(c => c.category === "programming").length },
    { value: "remote-sensing", label: "Remote Sensing", count: upcomingCourses.filter(c => c.category === "remote-sensing").length },
    { value: "urban-planning", label: "Urban Planning", count: upcomingCourses.filter(c => c.category === "urban-planning").length },
    { value: "environmental", label: "Environmental", count: upcomingCourses.filter(c => c.category === "environmental").length },
    { value: "web-development", label: "Web Development", count: upcomingCourses.filter(c => c.category === "web-development").length },
    { value: "fullstack", label: "Full Stack", count: upcomingCourses.filter(c => c.category === "fullstack").length }
  ];


  const filteredCourses = upcomingCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleJoinWaitlist = (courseId: string | number) => {
    setSelectedCourse(courseId);
    setShowWaitlistForm(true);
  };

  const submitWaitlistForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would typically submit to your backend
    console.log("Waitlist submission:", { courseId: selectedCourse, ...waitlistForm });
    
    toast({
      title: "Successfully joined waitlist!",
      description: "We'll notify you when enrollment opens for this course.",
    });
    
    setShowWaitlistForm(false);
    setWaitlistForm({
      fullName: "",
      email: "",
      phone: "",
      experienceLevel: "beginner",
      motivation: "",
      referralSource: ""
    });
    setSelectedCourse(null);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Browse Upcoming Courses</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive GIS training programs starting in 2025. Join the waitlist to secure your spot and get early bird pricing.
          </p>
        </div>

        {/* Search and Filter */}
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
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-input rounded-md text-sm"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label} ({cat.count})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Course Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {filteredCourses.map((course) => {
            const IconComponent = course.icon;
            const progress = (course.enrolled / course.maxStudents) * 100;
            
            return (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                {course.isNew && (
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    <img 
                      src={geospatialThumbnail} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
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
                      <div className="flex flex-col gap-1">
                        <Badge className="bg-green-500 text-white">
                          LIVE TRAINING
                        </Badge>
                        {course.id === "geospatial-technology-unlocked" && isEnrolledInGeospatial && (
                          <Badge className="bg-blue-500 text-white flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            ENROLLED
                          </Badge>
                        )}
                      </div>
                    ) : course.isNew ? (
                      <Badge className="bg-primary text-primary-foreground">
                        NEW - LAUNCHING AUG 2025
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        COMING SOON
                      </Badge>
                    )}
                  </div>
                  
                  {/* Course Metadata */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge className={getLevelColor(course.level)}>
                      {course.level}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {course.duration}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {course.timeline}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" />
                      {course.instructor}
                    </Badge>
                  </div>

                  {/* Rating and Enrollment */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {"★".repeat(Math.floor(course.rating))}
                        <span className="text-sm text-muted-foreground ml-1">
                          {course.rating}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {course.enrolled}/{course.maxStudents} enrolled
                      </span>
                    </div>
                  </div>

                  {/* Enrollment Progress */}
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Enrollment Progress</span>
                      <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-6">
                    {/* What You'll Learn */}
                    <div>
                      <h4 className="font-semibold mb-3">What You'll Learn:</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {course.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Learning Outcomes */}
                    <div>
                      <h4 className="font-semibold mb-3">Learning Outcomes:</h4>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="grid grid-cols-1 gap-1">
                          {course.learningOutcomes.map((outcome, index) => (
                            <div key={index} className="text-sm text-blue-800">
                              ✓ {outcome}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Prerequisites */}
                    <div>
                      <h4 className="font-semibold mb-2">Prerequisites:</h4>
                      <p className="text-sm text-muted-foreground">{course.prerequisites}</p>
                    </div>

                    {/* Pricing */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-bold text-green-800">{course.earlyBird}</div>
                          <div className="text-sm text-green-600">Early Bird Price</div>
                          <div className="text-xs text-green-500 line-through">{course.price}</div>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Save {Math.round(((parseInt(course.price.replace('₹', '').replace(',', '')) - parseInt(course.earlyBird.replace('₹', '').replace(',', ''))) / parseInt(course.price.replace('₹', '').replace(',', ''))) * 100)}%
                        </Badge>
                      </div>
                    </div>

                    {/* Testimonials */}
                    {course.testimonials.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Student Testimonials:</h4>
                        <div className="space-y-2">
                          {course.testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-muted/50 rounded-lg p-3">
                              <p className="text-sm italic">"{testimonial}"</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    {course.isLive ? (
                      <Link to={course.courseUrl}>
                        <Button 
                          className="w-full" 
                          disabled={course.id === "geospatial-technology-unlocked" && !isEnrolledInGeospatial}
                        >
                          {course.id === "geospatial-technology-unlocked" && isEnrolledInGeospatial 
                            ? "Access Course" 
                            : course.id === "geospatial-technology-unlocked" 
                            ? "Enrollment Required" 
                            : "View Course Details"
                          }
                        </Button>
                      </Link>
                    ) : course.courseUrl ? (
                      <Link to={course.courseUrl}>
                        <Button className="w-full">
                          View Course Details
                        </Button>
                      </Link>
                    ) : (
                      <Button 
                        className="w-full"
                        onClick={() => handleJoinWaitlist(course.id)}
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

        {/* Waitlist Form Modal */}
        {showWaitlistForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Join Course Waitlist</h3>
              <form onSubmit={submitWaitlistForm} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Full Name *</label>
                  <Input
                    required
                    value={waitlistForm.fullName}
                    onChange={(e) => setWaitlistForm({...waitlistForm, fullName: e.target.value})}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email *</label>
                  <Input
                    required
                    type="email"
                    value={waitlistForm.email}
                    onChange={(e) => setWaitlistForm({...waitlistForm, email: e.target.value})}
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={waitlistForm.phone}
                    onChange={(e) => setWaitlistForm({...waitlistForm, phone: e.target.value})}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Experience Level *</label>
                  <select
                    required
                    value={waitlistForm.experienceLevel}
                    onChange={(e) => setWaitlistForm({...waitlistForm, experienceLevel: e.target.value})}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Why are you interested in this course?</label>
                  <Input
                    value={waitlistForm.motivation}
                    onChange={(e) => setWaitlistForm({...waitlistForm, motivation: e.target.value})}
                    placeholder="Brief description of your interest"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">How did you hear about us?</label>
                  <select
                    value={waitlistForm.referralSource}
                    onChange={(e) => setWaitlistForm({...waitlistForm, referralSource: e.target.value})}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="">Select source</option>
                    <option value="google">Google Search</option>
                    <option value="social-media">Social Media</option>
                    <option value="friend-referral">Friend Referral</option>
                    <option value="professional-network">Professional Network</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">Join Waitlist</Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowWaitlistForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* No Results */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No courses found matching your criteria.</p>
          </div>
        )}

        {/* Why Choose Our Courses */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Why Choose Our GIS Courses?</CardTitle>
            <CardDescription>
              Industry-leading curriculum designed by experts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-2">Expert Instructors</h3>
                <p className="text-sm text-muted-foreground">
                  Learn from industry professionals with years of real-world experience
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-2">Hands-on Learning</h3>
                <p className="text-sm text-muted-foreground">
                  Practical projects and real datasets to build your portfolio
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-2">Career Support</h3>
                <p className="text-sm text-muted-foreground">
                  Job placement assistance and networking opportunities
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
};

export default BrowseCourses;