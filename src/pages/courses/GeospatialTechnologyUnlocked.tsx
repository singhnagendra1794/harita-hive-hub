import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, BookOpen, Users, Clock, Award, CheckCircle, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";

const GeospatialTechnologyUnlocked = () => {
  const { user } = useAuth();
  const { hasAccess } = usePremiumAccess();

  const courseModules = [
    {
      id: 1,
      title: "Introduction to Geospatial Technology",
      description: "Understanding the fundamentals of GIS, remote sensing, and spatial analysis",
      duration: "2 hours",
      completed: true,
      lessons: [
        { title: "What is Geospatial Technology?", duration: "15 min", completed: true },
        { title: "History and Evolution of GIS", duration: "20 min", completed: true },
        { title: "Key Components of GIS", duration: "25 min", completed: true },
        { title: "Introduction to Coordinate Systems", duration: "30 min", completed: true },
      ]
    },
    {
      id: 2,
      title: "Working with Spatial Data",
      description: "Learn about vector and raster data formats, data sources, and data quality",
      duration: "3 hours",
      completed: false,
      lessons: [
        { title: "Vector vs Raster Data", duration: "20 min", completed: false },
        { title: "Common Data Formats", duration: "25 min", completed: false },
        { title: "Data Sources and Acquisition", duration: "30 min", completed: false },
        { title: "Data Quality and Accuracy", duration: "35 min", completed: false },
      ]
    },
    {
      id: 3,
      title: "QGIS Fundamentals",
      description: "Hands-on training with QGIS - the most popular open-source GIS software",
      duration: "4 hours",
      completed: false,
      lessons: [
        { title: "QGIS Interface Overview", duration: "20 min", completed: false },
        { title: "Loading and Managing Data", duration: "30 min", completed: false },
        { title: "Basic Symbology and Styling", duration: "25 min", completed: false },
        { title: "Creating Your First Map", duration: "45 min", completed: false },
      ]
    },
    {
      id: 4,
      title: "Spatial Analysis Techniques",
      description: "Master essential spatial analysis operations and workflows",
      duration: "5 hours",
      completed: false,
      lessons: [
        { title: "Buffer Analysis", duration: "30 min", completed: false },
        { title: "Overlay Operations", duration: "45 min", completed: false },
        { title: "Network Analysis", duration: "40 min", completed: false },
        { title: "Statistical Analysis", duration: "35 min", completed: false },
      ]
    },
    {
      id: 5,
      title: "Remote Sensing Basics",
      description: "Introduction to satellite imagery and remote sensing applications",
      duration: "3 hours",
      completed: false,
      lessons: [
        { title: "Understanding Satellite Imagery", duration: "25 min", completed: false },
        { title: "Image Classification", duration: "40 min", completed: false },
        { title: "NDVI and Vegetation Analysis", duration: "30 min", completed: false },
        { title: "Change Detection", duration: "35 min", completed: false },
      ]
    },
    {
      id: 6,
      title: "Web Mapping and Visualization",
      description: "Create interactive web maps and share your GIS results",
      duration: "3 hours",
      completed: false,
      lessons: [
        { title: "Introduction to Web GIS", duration: "20 min", completed: false },
        { title: "Creating Interactive Maps", duration: "45 min", completed: false },
        { title: "Data Visualization Best Practices", duration: "25 min", completed: false },
        { title: "Publishing and Sharing Maps", duration: "30 min", completed: false },
      ]
    }
  ];

  const completedModules = courseModules.filter(m => m.completed).length;
  const progressPercentage = (completedModules / courseModules.length) * 100;

  const courseInfo = {
    title: "Geospatial Technology Unlocked",
    description: "Master the fundamentals of GIS, remote sensing, and spatial analysis with hands-on projects and real-world applications.",
    duration: "20+ hours",
    level: "Beginner to Intermediate",
    students: "2,847 enrolled",
    rating: 4.8,
    instructor: "Dr. Sarah Johnson",
    lastUpdated: "December 2024"
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Course Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">GIS Fundamentals</Badge>
              <Badge variant="outline">{courseInfo.level}</Badge>
            </div>
            <h1 className="text-4xl font-bold mb-4">{courseInfo.title}</h1>
            <p className="text-lg text-muted-foreground mb-6">
              {courseInfo.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{courseInfo.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">{courseInfo.students}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span className="text-sm">Certificate included</span>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Your Progress</span>
                <span className="text-sm text-muted-foreground">
                  {completedModules} of {courseModules.length} modules completed
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </div>

          <Card className="lg:w-80">
            <CardHeader>
              <CardTitle className="text-lg">Course Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-2">
                    {hasAccess('pro') ? 'Enrolled' : 'Professional Plan Required'}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {hasAccess('pro') 
                      ? 'You have full access to this course'
                      : 'Upgrade to access this premium course'
                    }
                  </p>
                </div>
                
                {hasAccess('pro') ? (
                  <Button className="w-full" size="lg">
                    <Play className="h-4 w-4 mr-2" />
                    Continue Learning
                  </Button>
                ) : (
                  <Button className="w-full" size="lg">
                    Upgrade to Professional
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Course Content */}
      <Tabs defaultValue="curriculum" className="space-y-6">
        <TabsList>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="instructor">Instructor</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="curriculum">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Course Curriculum</h2>
              <div className="text-sm text-muted-foreground">
                {courseModules.length} modules • 20+ hours of content
              </div>
            </div>

            {courseModules.map((module) => (
              <Card key={module.id} className="border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {module.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : hasAccess('pro') ? (
                        <BookOpen className="h-5 w-5 text-primary" />
                      ) : (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {module.duration}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {module.lessons.map((lesson, index) => (
                      <div 
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          hasAccess('pro') ? 'hover:bg-accent cursor-pointer' : 'opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {lesson.completed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : hasAccess('pro') ? (
                            <Play className="h-4 w-4 text-primary" />
                          ) : (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm">{lesson.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {lesson.duration}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="instructor">
          <Card>
            <CardHeader>
              <CardTitle>Meet Your Instructor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">DJ</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{courseInfo.instructor}</h3>
                  <p className="text-muted-foreground mb-4">
                    Ph.D. in Geography, 15+ years of experience in GIS and remote sensing. 
                    Former NASA researcher and current professor at Stanford University.
                  </p>
                  <div className="flex gap-4 text-sm">
                    <span>50,000+ students taught</span>
                    <span>4.9 instructor rating</span>
                    <span>25 courses published</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Student Reviews</CardTitle>
              <CardDescription>
                Average rating: {courseInfo.rating}/5 based on 1,245 reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "Alex Chen",
                    rating: 5,
                    comment: "Excellent course! Clear explanations and hands-on exercises made learning GIS enjoyable and practical.",
                    date: "2 weeks ago"
                  },
                  {
                    name: "Maria Rodriguez",
                    rating: 5,
                    comment: "Perfect for beginners. The instructor explains complex concepts in an easy-to-understand way.",
                    date: "1 month ago"
                  },
                  {
                    name: "David Kim",
                    rating: 4,
                    comment: "Great content and structure. Would love to see more advanced topics covered.",
                    date: "2 months ago"
                  }
                ].map((review, index) => (
                  <div key={index} className="border-b pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{review.name}</span>
                      <div className="flex">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <span key={i} className="text-yellow-400">★</span>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GeospatialTechnologyUnlocked;