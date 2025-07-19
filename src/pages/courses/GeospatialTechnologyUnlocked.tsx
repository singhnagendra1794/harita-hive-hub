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
      title: "Track 1: Foundations of Geospatial Science",
      description: "Days 1–25: GIS, Remote Sensing, GNSS, Cartography, Data Preparation",
      duration: "25 sessions",
      completed: true,
      lessons: [
        { title: "Day 1: Intro to Geospatial Tech - Understanding 'Where' and 'Why there' questions", duration: "1.5 hours", completed: true },
        { title: "Days 2-3: GIS Concepts & Data Types - Vector vs Raster, spatial vs attribute", duration: "3 hours", completed: true },
        { title: "Day 4: Coordinate Systems - GCS vs PCS, projections", duration: "1.5 hours", completed: true },
        { title: "Days 5-6: Cartography - Map elements, symbology", duration: "3 hours", completed: true },
        { title: "Days 7-8: Remote Sensing Basics - EM spectrum, resolutions", duration: "3 hours", completed: true },
        { title: "Days 9-10: Satellite Sensors & Data Acquisition", duration: "3 hours", completed: true },
        { title: "Day 11: GNSS, GPS - Field data collection", duration: "1.5 hours", completed: true },
        { title: "Day 12: Surveying + Open Data - Integrate GPS and open datasets", duration: "1.5 hours", completed: true },
        { title: "Days 13-14: Spatial Analysis Basics - Buffer, clip, intersect", duration: "3 hours", completed: true },
        { title: "Day 15: Intro to QGIS Plugins", duration: "1.5 hours", completed: true },
        { title: "Days 16-17: Project I (Foundations) - Apply skills to local planning", duration: "3 hours", completed: true },
        { title: "Days 18-19: Data Quality & Metadata", duration: "3 hours", completed: true },
        { title: "Day 20: Map Layouts - Design print-ready maps", duration: "1.5 hours", completed: true },
        { title: "Days 21-22: Dashboards & Storytelling", duration: "3 hours", completed: true },
        { title: "Days 23-25: Capstone #1 - Present & review foundational project", duration: "4.5 hours", completed: true }
      ]
    },
    {
      id: 2,
      title: "Track 2: Spatial Programming & Automation",
      description: "Days 26–50: Python, R, SQL, PostGIS, Automation Pipelines",
      duration: "25 sessions",
      completed: false,
      lessons: [
        { title: "Day 26: Intro to Python for GIS - Set up environment", duration: "1.5 hours", completed: false },
        { title: "Days 27-28: Vector Ops in Python - Spatial joins, buffers", duration: "3 hours", completed: false },
        { title: "Days 29-30: Raster Processing in Python - Load, calc, export rasters", duration: "3 hours", completed: false },
        { title: "Day 31: Folium & Interactive Maps - HTML map creation", duration: "1.5 hours", completed: false },
        { title: "Days 32-33: Automating QGIS - PyQGIS scripting", duration: "3 hours", completed: false },
        { title: "Days 34-35: R for Spatial Analysis - Spatial stats, plotting", duration: "3 hours", completed: false },
        { title: "Day 36: Raster Analysis in R - Raster math, reclassification", duration: "1.5 hours", completed: false },
        { title: "Days 37-38: Spatial Joins & Overlays in R", duration: "3 hours", completed: false },
        { title: "Days 39-40: SQL Basics - Joins, queries", duration: "3 hours", completed: false },
        { title: "Days 41-42: Spatial SQL in PostGIS - ST_Buffer, ST_Intersects", duration: "3 hours", completed: false },
        { title: "Day 43: DB Design & Indexing", duration: "1.5 hours", completed: false },
        { title: "Days 44-45: Python + SQL Integration", duration: "3 hours", completed: false },
        { title: "Days 46-47: R + SQL Integration", duration: "3 hours", completed: false },
        { title: "Days 48-50: Capstone #2 - Full spatial data pipeline", duration: "4.5 hours", completed: false }
      ]
    },
    {
      id: 3,
      title: "Track 3: Web GIS & Cloud Platforms",
      description: "Days 51–70: Leaflet, Mapbox, GeoServer, GEE, Cloud Storage",
      duration: "20 sessions",
      completed: false,
      lessons: [
        { title: "Day 51: Web GIS Intro - Web map architecture", duration: "1.5 hours", completed: false },
        { title: "Days 52-53: Leaflet JS Basics - Load layers, interactivity", duration: "3 hours", completed: false },
        { title: "Days 54-55: Mapbox Styling - Custom maps and tokens", duration: "3 hours", completed: false },
        { title: "Days 56-58: GeoServer Setup - Serve WMS/WFS", duration: "4.5 hours", completed: false },
        { title: "Days 59-60: GeoServer Styling - SLD, layer rules", duration: "3 hours", completed: false },
        { title: "Days 61-62: Web GIS Fullstack - Backend + frontend", duration: "3 hours", completed: false },
        { title: "Days 63-64: Cloud GIS: Google Earth Engine", duration: "3 hours", completed: false },
        { title: "Day 65: Earth Engine Python API", duration: "1.5 hours", completed: false },
        { title: "Day 66: Open Data Cube / AWS Open Data", duration: "1.5 hours", completed: false },
        { title: "Days 67-68: Web Dashboards - Integrate maps with UI", duration: "3 hours", completed: false },
        { title: "Day 69: Publish Portfolio Website", duration: "1.5 hours", completed: false },
        { title: "Day 70: Capstone #3 - Web GIS / GEE project", duration: "1.5 hours", completed: false }
      ]
    },
    {
      id: 4,
      title: "Track 4: GeoAI & Deep Learning",
      description: "Days 71–100+: ML models, deep learning (YOLO, UNet), image detection, time series",
      duration: "30+ sessions",
      completed: false,
      lessons: [
        { title: "Day 71: Intro to GeoAI - Why ML in geospatial", duration: "1.5 hours", completed: false },
        { title: "Days 72-73: Data Prep for ML - Band math, labeling", duration: "3 hours", completed: false },
        { title: "Days 74-75: Supervised Classification - Random Forest, SVM", duration: "3 hours", completed: false },
        { title: "Days 76-77: Unsupervised Clustering - KMeans, DBSCAN", duration: "3 hours", completed: false },
        { title: "Day 78: Accuracy Assessment - Confusion matrix", duration: "1.5 hours", completed: false },
        { title: "Days 79-80: Deep Learning Intro - CNNs, UNet, YOLO", duration: "3 hours", completed: false },
        { title: "Days 81-83: Building Detection - YOLOv8, LabelImg", duration: "4.5 hours", completed: false },
        { title: "Days 84-85: Land Cover Segmentation - UNet, semantic segmentation", duration: "3 hours", completed: false },
        { title: "Day 86: Time Series + Change Detection", duration: "1.5 hours", completed: false },
        { title: "Day 87: ML in GEE - Train RF in GEE", duration: "1.5 hours", completed: false },
        { title: "Days 88-89: AI Model Deployment - Streamlit app", duration: "3 hours", completed: false },
        { title: "Day 90+: Final Capstone - End-to-end GeoAI + automation project", duration: "Open-ended", completed: false }
      ]
    }
  ];

  const completedModules = courseModules.filter(m => m.completed).length;
  const progressPercentage = (completedModules / courseModules.length) * 100;

  const courseInfo = {
    title: "Geospatial Technology Unlocked – Full 90+ Day Curriculum",
    description: "From beginner to advanced, students will be job-ready geospatial professionals with AI and automation skills. 90 sessions (1.5 hours/day) with a blend of lecture (20–30%), demos, and practical exercises.",
    duration: "90+ sessions (135+ hours)",
    level: "Beginner to Advanced",
    students: "2,847 enrolled",
    rating: 4.8,
    instructor: "HaritaHive Expert Team",
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
                  {completedModules} of {courseModules.length} tracks completed
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
                {courseModules.length} tracks • 90+ sessions • 135+ hours of content
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

            {/* Deliverables Section */}
            <div className="mt-8 space-y-6">
              <h2 className="text-2xl font-bold">Student Deliverables</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Major Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      At least 4 major capstone projects (1 per track) showcasing practical skills
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Portfolio Website
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Personal geospatial portfolio site (GitHub Pages or custom)
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      GitHub Repository
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Resume-ready GitHub repo of code and maps
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Career Readiness
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Ability to apply for internships, jobs, or freelance roles
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Bonus Add-ons */}
            <div className="mt-8 space-y-6">
              <h2 className="text-2xl font-bold">Bonus Add-ons (Optional)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  "Slide decks for each module",
                  "Assignment templates (Google Docs / Notion)",
                  "PDF workbook for students",
                  "Student showcase gallery template",
                  "Mentorship / internship mapping"
                ].map((addon, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        <span className="text-sm">{addon}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
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
                    Expert team of GIS professionals, data scientists, and AI specialists with combined 100+ years 
                    of experience in geospatial technology, remote sensing, and machine learning applications.
                  </p>
                  <div className="flex gap-4 text-sm">
                    <span>10,000+ students trained</span>
                    <span>4.8 instructor rating</span>
                    <span>Industry-proven curriculum</span>
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