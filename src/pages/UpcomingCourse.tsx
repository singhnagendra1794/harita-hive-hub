import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, BookOpen, Brain, Target, Users, ArrowRight, CheckCircle, Globe, Code, MapPin, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

import { CourseWaitlistForm } from '@/components/CourseWaitlistForm';

interface ScheduleItem {
  id: string;
  day: number;
  week: number;
  topic: string;
  description: string;
  learning_goal: string;
  phase: string;
  estimated_duration: string;
}

interface Cohort {
  id: string;
  name: string;
  start_date: string;
  enrollment_deadline: string;
  price: number;
  max_students: number;
  current_enrollments: number;
}

const UpcomingCourse: React.FC = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const { toast } = useToast();

  useEffect(() => {
    fetchScheduleData();
    fetchCohortData();
  }, []);

  useEffect(() => {
    if (cohort) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const deadline = new Date(cohort.enrollment_deadline).getTime();
        const difference = deadline - now;

        if (difference > 0) {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000)
          });
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [cohort]);

  const fetchScheduleData = async () => {
    try {
      const { data, error } = await supabase
        .from('upcoming_course_schedule')
        .select('*')
        .eq('is_active', true)
        .order('day');

      if (error) throw error;
      setSchedule(data || []);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const fetchCohortData = async () => {
    try {
      const { data, error } = await supabase
        .from('course_cohorts')
        .select('*')
        .eq('status', 'upcoming')
        .order('start_date')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setCohort(data);
    } catch (error) {
      console.error('Error fetching cohort:', error);
    }
  };


  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'fundamentals': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ml': return 'bg-green-100 text-green-800 border-green-300';
      case 'geoai': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'webgis': return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'fundamentals': return <BookOpen className="h-4 w-4" />;
      case 'ml': return <Brain className="h-4 w-4" />;
      case 'geoai': return <Target className="h-4 w-4" />;
      case 'webgis': return <Users className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const phaseDescriptions = {
    fundamentals: "Master the core concepts of GIS, spatial thinking, and Python programming",
    ml: "Learn to apply machine learning techniques to geospatial data and problems",
    geoai: "Dive deep into AI-powered geospatial analysis and computer vision",
    webgis: "Build and deploy modern web GIS applications and services"
  };

  const groupedSchedule = schedule.reduce((acc, item) => {
    if (!acc[item.phase]) {
      acc[item.phase] = [];
    }
    acc[item.phase].push(item);
    return acc;
  }, {} as Record<string, ScheduleItem[]>);

  return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-6">
            GeoAI Mastery Program
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Transform your career with our comprehensive 8-week program that combines 
            Geographic Information Systems, Artificial Intelligence, and Machine Learning
          </p>
          
          {cohort && (
            <div className="bg-primary/10 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-semibold mb-4">Next Cohort Starts</h3>
              <p className="text-3xl font-bold text-primary mb-4">
                {new Date(cohort.start_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              
              {/* Countdown Timer */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-background rounded-lg p-3">
                  <div className="text-2xl font-bold">{timeLeft.days}</div>
                  <div className="text-sm text-muted-foreground">Days</div>
                </div>
                <div className="bg-background rounded-lg p-3">
                  <div className="text-2xl font-bold">{timeLeft.hours}</div>
                  <div className="text-sm text-muted-foreground">Hours</div>
                </div>
                <div className="bg-background rounded-lg p-3">
                  <div className="text-2xl font-bold">{timeLeft.minutes}</div>
                  <div className="text-sm text-muted-foreground">Minutes</div>
                </div>
                <div className="bg-background rounded-lg p-3">
                  <div className="text-2xl font-bold">{timeLeft.seconds}</div>
                  <div className="text-sm text-muted-foreground">Seconds</div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Enrollment deadline: {new Date(cohort.enrollment_deadline).toLocaleDateString()}
              </p>
              <p className="text-sm text-muted-foreground">
                {cohort.current_enrollments}/{cohort.max_students} spots filled
              </p>
            </div>
          )}

          {/* Main Waitlist Section */}
          <div className="bg-primary/5 rounded-lg p-8 mb-12 max-w-2xl mx-auto border">
            <h3 className="text-2xl font-semibold mb-4 text-center">🚀 Get Early Access</h3>
            <p className="text-muted-foreground text-center mb-6">
              Join our exclusive waitlist to be the first to know when the GeoAI Mastery Program opens for enrollment.
            </p>
            <div className="max-w-md mx-auto">
              <CourseWaitlistForm 
                courseTitle="GeoAI Mastery Program"
                buttonText="Join Waitlist"
                buttonClassName="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              />
            </div>
            <p className="text-sm text-center text-muted-foreground mt-4">
              ✅ Early bird pricing • ✅ Exclusive content • ✅ Priority support
            </p>
          </div>
        </div>

        {/* Course Cards Grid - All 4 courses from the image */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Course 1: ArcGIS Enterprise Mastery */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-background to-secondary/5 border-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full border border-orange-300">
                  <span className="text-sm">🔒</span>
                  <span className="text-sm font-medium">COMING SOON</span>
                </div>
                <div className="text-sm text-muted-foreground">September 2025</div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <Badge className="bg-red-100 text-red-800 border-red-300" variant="outline">
                  Advanced
                </Badge>
              </div>

              <CardTitle className="text-xl mb-3">ArcGIS Enterprise Mastery</CardTitle>
              <CardDescription className="text-sm mb-6">
                From Server Setup to Custom Web Apps & Widgets. Master the full ArcGIS Enterprise stack with hands-on labs and certification.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">What you'll learn:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Enterprise Stack Setup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Custom Widgets Development</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Web AppBuilder & Experience Builder</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Security & Access Control</span>
                  </div>
                </div>
              </div>

              <CourseWaitlistForm 
                courseTitle="ArcGIS Enterprise Mastery"
                buttonText="Join Waitlist"
              />
            </CardContent>
          </Card>

          {/* Course 2: Advanced Python for GIS Automation */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-background to-secondary/5 border-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full border border-orange-300">
                  <span className="text-sm">🔒</span>
                  <span className="text-sm font-medium">COMING SOON</span>
                </div>
                <div className="text-sm text-muted-foreground">October 2025</div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <Badge className="bg-red-100 text-red-800 border-red-300" variant="outline">
                  Advanced
                </Badge>
              </div>

              <CardTitle className="text-xl mb-3">Advanced Python for GIS Automation</CardTitle>
              <CardDescription className="text-sm mb-6">
                Master Python scripting for complex geospatial workflows, including ArcPy, GDAL, and custom tool development.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">What you'll learn:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">ArcPy Mastery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">GDAL/OGR Deep Dive</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Custom Tool Development</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Workflow Automation</span>
                  </div>
                </div>
              </div>

              <CourseWaitlistForm 
                courseTitle="Advanced Python for GIS Automation"
                buttonText="Notify Me"
              />
            </CardContent>
          </Card>

          {/* Course 3: Drone Mapping & Photogrammetry */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-background to-secondary/5 border-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full border border-orange-300">
                  <span className="text-sm">🔒</span>
                  <span className="text-sm font-medium">COMING SOON</span>
                </div>
                <div className="text-sm text-muted-foreground">December 2025</div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300" variant="outline">
                  Intermediate
                </Badge>
              </div>

              <CardTitle className="text-xl mb-3">Drone Mapping & Photogrammetry</CardTitle>
              <CardDescription className="text-sm mb-6">
                Learn to process drone imagery, create orthomosaics, and generate 3D models for various applications.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">What you'll learn:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Flight Planning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Image Processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">3D Modeling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Precision Agriculture</span>
                  </div>
                </div>
              </div>

              <CourseWaitlistForm 
                courseTitle="Drone Mapping & Photogrammetry"
                buttonText="Notify Me"
              />
            </CardContent>
          </Card>

          {/* Course 4: GIS Data Science & Machine Learning */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-background to-secondary/5 border-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full border border-orange-300">
                  <span className="text-sm">🔒</span>
                  <span className="text-sm font-medium">COMING SOON</span>
                </div>
                <div className="text-sm text-muted-foreground">January 2025</div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <Badge className="bg-red-100 text-red-800 border-red-300" variant="outline">
                  Advanced
                </Badge>
              </div>

              <CardTitle className="text-xl mb-3">GIS Data Science & Machine Learning</CardTitle>
              <CardDescription className="text-sm mb-6">
                Apply machine learning techniques to geospatial data for predictive modeling and pattern recognition.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">What you'll learn:</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Spatial Statistics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">ML Algorithms</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Predictive Modeling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Big Data Processing</span>
                  </div>
                </div>
              </div>

              <CourseWaitlistForm 
                courseTitle="GIS Data Science & Machine Learning"
                buttonText="Notify Me"
              />
            </CardContent>
          </Card>
        </div>

        {/* Additional Details Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Program Overview</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="text-center">
              <CardContent className="p-6">
                <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Fundamentals</h3>
                <p className="text-sm text-muted-foreground">GIS, Python & Spatial Thinking</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Brain className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Machine Learning</h3>
                <p className="text-sm text-muted-foreground">ML for Geospatial Data</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Target className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Advanced GeoAI</h3>
                <p className="text-sm text-muted-foreground">Deep Learning & Computer Vision</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="p-6">
                <Users className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Web GIS</h3>
                <p className="text-sm text-muted-foreground">Deploy & Scale Applications</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>
  );
};

export default UpcomingCourse;