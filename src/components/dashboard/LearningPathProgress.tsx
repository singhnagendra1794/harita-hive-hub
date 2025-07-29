
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Play, CheckCircle, Clock, Bookmark } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  thumbnail_url: string;
  is_free: boolean;
  price: number;
}

interface Enrollment {
  id: string;
  course_id: string;
  user_id: string;
  progress_percentage: number;
  enrolled_at: string;
  completed_at: string | null;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export const LearningPathProgress = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProgress();
      fetchAvailableCourses();
    }
  }, [user]);

  const fetchUserProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;
      setEnrollments(data || []);
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setAvailableCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = async (courseId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('course_enrollments')
        .insert([{
          user_id: user.id,
          course_id: courseId
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully enrolled in course!",
      });

      fetchUserProgress();
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast({
        title: "Error",
        description: "Failed to enroll in course",
        variant: "destructive",
      });
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    return 'bg-orange-500';
  };

  if (loading) {
    return <div>Loading your learning progress...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Continue Learning Section */}
      {enrollments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Continue Learning
            </CardTitle>
            <CardDescription>
              Pick up where you left off
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {enrollments
                .filter(enrollment => !enrollment.completed_at)
                .slice(0, 3)
                .map(enrollment => (
                  <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Course {enrollment.course_id.slice(-8)}</h3>
                        <p className="text-sm text-muted-foreground">GIS Learning</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress 
                            value={enrollment.progress_percentage} 
                            className="w-32 h-2"
                          />
                          <span className="text-sm text-muted-foreground">
                            {enrollment.progress_percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button>Continue</Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            My Courses
          </CardTitle>
          <CardDescription>
            Track your progress across all enrolled courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
              <p className="text-muted-foreground mb-4">
                Enroll in your first course to start learning
              </p>
              <Button onClick={() => document.getElementById('available-courses')?.scrollIntoView()}>
                Browse Courses
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {enrollments.map(enrollment => (
                <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                      {enrollment.completed_at ? (
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      ) : (
                        <BookOpen className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Course {enrollment.course_id.slice(-8)}</h3>
                        {enrollment.completed_at && (
                          <Badge className="bg-green-100 text-green-800">Completed</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">GIS Learning</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress 
                          value={enrollment.progress_percentage}
                          className={`w-32 h-2 ${getProgressColor(enrollment.progress_percentage)}`}
                        />
                        <span className="text-sm text-muted-foreground">
                          {enrollment.progress_percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                    <Button size="sm">
                      {enrollment.completed_at ? 'Review' : 'Continue'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Courses */}
      <Card id="available-courses">
        <CardHeader>
          <CardTitle>Available Courses</CardTitle>
          <CardDescription>
            Discover new courses to expand your skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map(course => {
              const isEnrolled = enrollments.some(e => e.course_id === course.id);
              
              return (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center mb-4">
                      <BookOpen className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={getDifficultyColor(course.difficulty_level)}>
                        {course.difficulty_level}
                      </Badge>
                      <span className="font-semibold">
                        {course.is_free ? 'Free' : `₹${course.price}`}
                      </span>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => enrollInCourse(course.id)}
                      disabled={isEnrolled}
                    >
                      {isEnrolled ? 'Enrolled' : 'Enroll Now'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {availableCourses.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses available</h3>
              <p className="text-muted-foreground">
                New courses will appear here soon
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
