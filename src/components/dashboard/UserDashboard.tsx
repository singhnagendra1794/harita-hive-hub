
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useNotifications } from '@/hooks/useNotifications';
import { BookOpen, Clock, Trophy, Target, Bell, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationCenter } from './NotificationCenter';
import { LearningPathProgress } from './LearningPathProgress';
import { SavedContentGrid } from './SavedContentGrid';

const UserDashboard = () => {
  const { progress, engagement, loading } = useUserProgress();
  const { unreadCount } = useNotifications();

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const completedContent = progress.filter(p => p.progress_percentage >= 100);
  const totalTimeHours = Math.round((engagement?.total_time_spent || 0) / 3600);
  const streakDays = engagement?.streak_days || 0;
  const engagementScore = engagement?.engagement_score || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Learning Dashboard</h1>
          <p className="text-muted-foreground">Track your progress and achievements</p>
        </div>
        <Button variant="outline" className="relative">
          <Bell className="h-4 w-4 mr-2" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{completedContent.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{totalTimeHours}h</p>
                <p className="text-sm text-muted-foreground">Time Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{streakDays}</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{engagementScore}</p>
                <p className="text-sm text-muted-foreground">Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="learning-paths">Learning Paths</TabsTrigger>
          <TabsTrigger value="saved">Saved Content</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Recent Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progress.slice(0, 5).map((item) => (
                  <div key={`${item.content_type}-${item.content_id}`} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{item.content_type}</Badge>
                        <h4 className="font-medium">{item.content_id}</h4>
                      </div>
                      <Progress value={item.progress_percentage} className="w-full" />
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold">{item.progress_percentage}%</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.round(item.time_spent / 60)}m spent
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning-paths">
          <LearningPathProgress />
        </TabsContent>

        <TabsContent value="saved">
          <SavedContentGrid />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationCenter />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;
