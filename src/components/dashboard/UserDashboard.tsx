
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Play, Clock, Award, TrendingUp, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LearningPathProgress } from './LearningPathProgress';
import { SavedContentGrid } from './SavedContentGrid';
import { NotificationCenter } from './NotificationCenter';

interface Enrollment {
  id: string;
  progress_percentage: number;
  enrolled_at: string;
  completed_at?: string;
  courses: {
    id: string;
    title: string;
    description: string;
    thumbnail_url?: string;
    category: string;
    difficulty_level: string;
  };
}

interface UserStats {
  totalCourses: number;
  completedCourses: number;
  totalWatchTime: number;
  currentStreak: number;
}

export const UserDashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalCourses: 0,
    completedCourses: 0,
    totalWatchTime: 0,
    currentStreak: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch enrollments with course details
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          courses (
            id,
            title,
            description,
            thumbnail_url,
            category,
            difficulty_level
          )
        `)
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });

      if (enrollmentsError) throw enrollmentsError;

      setEnrollments(enrollmentsData || []);

      // Calculate stats
      const totalCourses = enrollmentsData?.length || 0;
      const completedCourses = enrollmentsData?.filter(e => e.completed_at).length || 0;
      
      setStats({
        totalCourses,
        completedCourses,
        totalWatchTime: 0, // Will be calculated from lesson progress
        currentStreak: 0 // Will be calculated from engagement data
      });

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContinueLearningCourse = () => {
    return enrollments.find(e => 
      e.progress_percentage > 0 && 
      e.progress_percentage < 100 && 
      !e.completed_at
    );
  };

  const getRecentCourses = () => {
    return enrollments.slice(0, 3);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const continueCourse = getContinueLearningCourse();
  const recentCourses = getRecentCourses();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.user_metadata?.full_name || 'Learner'}!
        </h1>
        <p className="text-blue-100 mb-6">
          Continue your learning journey and expand your GIS expertise
        </p>
        
        {continueCourse && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">{continueCourse.courses.title}</h3>
                <p className="text-sm text-blue-100 mb-2">
                  {continueCourse.progress_percentage}% complete
                </p>
                <Progress 
                  value={continueCourse.progress_percentage} 
                  className="w-64 h-2 bg-white/20"
                />
              </div>
              <Button className="bg-white text-blue-600 hover:bg-gray-100">
                <Play className="h-4 w-4 mr-2" />
                Continue Learning
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              Enrolled courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedCourses}</div>
            <p className="text-xs text-muted-foreground">
              Courses finished
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Watch Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWatchTime}h</div>
            <p className="text-xs text-muted-foreground">
              Total learning time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentStreak}</div>
            <p className="text-xs text-muted-foreground">
              Days learning
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Recent Courses */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Courses</CardTitle>
              <CardDescription>
                Track your progress and continue learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentCourses.length > 0 ? (
                <div className="space-y-4">
                  {recentCourses.map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{enrollment.courses.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {enrollment.courses.category} • {enrollment.courses.difficulty_level}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Progress value={enrollment.progress_percentage} className="flex-1" />
                          <span className="text-sm text-muted-foreground">
                            {enrollment.progress_percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {enrollment.completed_at && (
                          <Badge className="bg-green-100 text-green-800">
                            <Award className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                        <Button variant="outline" size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          {enrollment.progress_percentage > 0 ? 'Continue' : 'Start'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start your learning journey by enrolling in a course
                  </p>
                  <Button>
                    Browse Courses
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <LearningPathProgress />
        </div>

        {/* Right Column - Notifications & Saved Content */}
        <div className="space-y-6">
          <NotificationCenter />
          <SavedContentGrid />
        </div>
      </div>
    </div>
  );
};
