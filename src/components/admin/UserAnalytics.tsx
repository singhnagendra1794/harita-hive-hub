
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, BookOpen, TrendingUp, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserEngagement {
  user_id: string;
  course_id: string;
  course_title: string;
  progress_percentage: number;
  enrolled_at: string;
  completed_at: string | null;
  user_email: string;
}

export const UserAnalytics = () => {
  const [userEngagements, setUserEngagements] = useState<UserEngagement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserAnalytics();
  }, []);

  const fetchUserAnalytics = async () => {
    try {
      // This would typically join with auth.users to get email, but for now we'll use mock data
      const { data: enrollments, error } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          courses(title)
        `);

      if (error) throw error;

      // Mock user data since we can't directly query auth.users
      const mockUserData = enrollments?.map(enrollment => ({
        user_id: enrollment.user_id,
        course_id: enrollment.course_id,
        course_title: enrollment.courses?.title || 'Unknown Course',
        progress_percentage: enrollment.progress_percentage || 0,
        enrolled_at: enrollment.enrolled_at,
        completed_at: enrollment.completed_at,
        user_email: `user${enrollment.user_id.slice(-4)}@example.com`
      })) || [];

      setUserEngagements(mockUserData);
    } catch (error) {
      console.error('Error fetching user analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalUsers = new Set(userEngagements.map(u => u.user_id)).size;
    const totalEnrollments = userEngagements.length;
    const completedCourses = userEngagements.filter(u => u.completed_at).length;
    const averageProgress = userEngagements.reduce((sum, u) => sum + u.progress_percentage, 0) / userEngagements.length || 0;

    return {
      totalUsers,
      totalEnrollments,
      completedCourses,
      averageProgress: Math.round(averageProgress),
      completionRate: totalEnrollments > 0 ? Math.round((completedCourses / totalEnrollments) * 100) : 0
    };
  };

  const stats = calculateStats();

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">User Analytics</h2>
        <p className="text-muted-foreground">Track user engagement and course performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Active learners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">Course enrollments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">Courses completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageProgress}%</div>
            <p className="text-xs text-muted-foreground">Overall progress</p>
          </CardContent>
        </Card>
      </div>

      {/* User Engagement Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Engagement Details</CardTitle>
          <CardDescription>
            Detailed view of user progress across courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userEngagements.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No enrollment data yet</h3>
                <p className="text-muted-foreground">
                  User engagement data will appear here once users start enrolling in courses
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {userEngagements.map((engagement, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{engagement.user_email}</p>
                          <p className="text-sm text-muted-foreground">{engagement.course_title}</p>
                        </div>
                        {engagement.completed_at && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right min-w-[100px]">
                        <p className="text-sm font-medium">{engagement.progress_percentage}%</p>
                        <Progress value={engagement.progress_percentage} className="w-16 h-2" />
                      </div>
                      <div className="text-right text-sm text-muted-foreground min-w-[100px]">
                        <p>Enrolled:</p>
                        <p>{new Date(engagement.enrolled_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Course Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Course Performance</CardTitle>
          <CardDescription>
            Performance metrics for each course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Course analytics coming soon</h3>
              <p className="text-muted-foreground">
                Detailed course performance metrics will be available here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
