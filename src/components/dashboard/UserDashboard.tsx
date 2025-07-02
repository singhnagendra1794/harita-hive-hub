
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, TrendingUp, Clock, Award, Play, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { LearningPathProgress } from './LearningPathProgress';
import { SavedContentGrid } from './SavedContentGrid';
import { NotificationCenter } from './NotificationCenter';

export const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    coursesEnrolled: 0,
    coursesCompleted: 0,
    totalHours: 0,
    currentStreak: 0
  });

  // Mock stats - in real app, these would come from the database
  useEffect(() => {
    // Simulate fetching user stats
    setStats({
      coursesEnrolled: 5,
      coursesCompleted: 2,
      totalHours: 24,
      currentStreak: 7
    });
  }, [user]);

  const achievements = [
    { title: 'First Course', description: 'Completed your first course', earned: true },
    { title: 'Week Warrior', description: '7-day learning streak', earned: true },
    { title: 'GIS Explorer', description: 'Completed 3 GIS courses', earned: false },
    { title: 'Knowledge Seeker', description: 'Spent 50+ hours learning', earned: false },
  ];

  const recentActivity = [
    { type: 'course_progress', title: 'Advanced GIS Analysis', description: 'Completed Module 2', time: '2 hours ago' },
    { type: 'achievement', title: 'Achievement Unlocked', description: 'Week Warrior badge earned', time: '1 day ago' },
    { type: 'course_enrolled', title: 'New Enrollment', description: 'Remote Sensing Fundamentals', time: '3 days ago' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.user_metadata?.full_name || 'Student'}!</h1>
          <p className="text-muted-foreground">Continue your learning journey</p>
        </div>
        <Button className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          Continue Learning
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Enrolled</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.coursesEnrolled}</div>
            <p className="text-xs text-muted-foreground">Active learning paths</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.coursesCompleted}</div>
            <p className="text-xs text-muted-foreground">Courses finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours}</div>
            <p className="text-xs text-muted-foreground">Total time invested</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentStreak}</div>
            <p className="text-xs text-muted-foreground">Days in a row</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="learning" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="learning">Learning</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="learning">
          <LearningPathProgress />
        </TabsContent>

        <TabsContent value="saved">
          <SavedContentGrid />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Your Achievements
              </CardTitle>
              <CardDescription>
                Unlock badges as you progress through your learning journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className={`p-4 border rounded-lg ${achievement.earned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${achievement.earned ? 'bg-green-500' : 'bg-gray-300'}`}>
                        <Award className={`h-6 w-6 ${achievement.earned ? 'text-white' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${achievement.earned ? 'text-green-800' : 'text-gray-600'}`}>
                          {achievement.title}
                        </h3>
                        <p className={`text-sm ${achievement.earned ? 'text-green-600' : 'text-gray-500'}`}>
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                    {achievement.earned && (
                      <Badge className="mt-2 bg-green-100 text-green-800">Earned</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest learning activities and milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'course_progress' ? 'bg-blue-500' :
                      activity.type === 'achievement' ? 'bg-green-500' : 'bg-orange-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Notifications */}
      <NotificationCenter />
    </div>
  );
};
