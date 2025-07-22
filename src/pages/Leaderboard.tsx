import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Trophy, 
  Award, 
  Medal, 
  Star, 
  Search, 
  Filter, 
  Code, 
  Upload, 
  MessageSquare, 
  Heart, 
  BookOpen,
  Target,
  Zap,
  Crown,
  Loader2,
  ExternalLink,
  Users,
  Calendar
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';

interface LeaderboardUser {
  user_id: string;
  total_points: number;
  weekly_points: number;
  monthly_points: number;
  tool_uploads: number;
  code_shares: number;
  note_shares: number;
  challenge_participations: number;
  post_creations: number;
  comments: number;
  likes_given: number;
  courses_completed: number;
  badges: any;
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  };
  user_badges?: Array<{
    badge_type: string;
    badge_name: string;
    badge_icon: string;
  }>;
}

interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  points_earned: number;
  created_at: string;
  metadata: any;
  profiles?: {
    full_name?: string;
  };
}

const Leaderboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('total');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('leaderboard');

  useEffect(() => {
    fetchLeaderboardData();
    fetchRecentActivities();
  }, [timeFilter]);

  const fetchLeaderboardData = async () => {
    try {
      setIsLoading(true);
      
      let orderColumn = 'total_points';
      if (timeFilter === 'weekly') orderColumn = 'weekly_points';
      if (timeFilter === 'monthly') orderColumn = 'monthly_points';

      const { data, error } = await supabase
        .from('user_leaderboard_stats')
        .select(`
          *,
          profiles!user_leaderboard_stats_user_id_fkey (full_name, avatar_url)
        `)
        .order(orderColumn, { ascending: false })
        .limit(100);

      if (error) throw error;

      // Fetch badges separately to avoid relation issues
      const userIds = data?.map(d => d.user_id) || [];
      let badgesData: any[] = [];
      
      if (userIds.length > 0) {
        const { data: badges, error: badgesError } = await supabase
          .from('user_badges')
          .select('user_id, badge_type, badge_name, badge_icon')
          .in('user_id', userIds)
          .eq('is_active', true);
        
        if (!badgesError) {
          badgesData = badges || [];
        }
      }

      // Combine the data
      const leaderboardWithBadges = (data || []).map(user => ({
        ...user,
        user_badges: badgesData.filter(badge => badge.user_id === user.user_id)
      }));

      setLeaderboardData(leaderboardWithBadges as any);
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error);
      toast({
        title: "Error",
        description: "Failed to load leaderboard data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select(`
          *,
          profiles!user_activities_user_id_fkey (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setRecentActivities(data || [] as any);
    } catch (error: any) {
      console.error('Error fetching activities:', error);
    }
  };

  const filteredLeaderboard = leaderboardData.filter(user => {
    const matchesSearch = !searchTerm || 
      user.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (categoryFilter === 'all') return true;
    
    const categoryMap = {
      'tools': user.tool_uploads > 0,
      'code': user.code_shares > 0,
      'notes': user.note_shares > 0,
      'challenges': user.challenge_participations > 0,
      'posts': user.post_creations > 0,
      'courses': user.courses_completed > 0
    };
    
    return categoryMap[categoryFilter as keyof typeof categoryMap];
  });

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="h-6 w-6 text-yellow-500" />;
      case 1: return <Medal className="h-6 w-6 text-gray-400" />;
      case 2: return <Award className="h-6 w-6 text-amber-600" />;
      default: return <Trophy className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return 'border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-background';
      case 1: return 'border-l-gray-400 bg-gradient-to-r from-gray-50 to-background';
      case 2: return 'border-l-amber-600 bg-gradient-to-r from-amber-50 to-background';
      default: return 'border-l-primary/30';
    }
  };

  const getActivityIcon = (type: string) => {
    const icons = {
      tool_upload: Upload,
      code_share: Code,
      note_share: BookOpen,
      challenge_join: Target,
      post_create: MessageSquare,
      comment_create: MessageSquare,
      like_give: Heart,
      course_complete: BookOpen
    };
    const IconComponent = icons[type as keyof typeof icons] || Star;
    return <IconComponent className="h-4 w-4" />;
  };

  const getActivityPoints = (type: string) => {
    const points = {
      tool_upload: 10,
      code_share: 5,
      note_share: 7,
      challenge_join: 8,
      post_create: 3,
      comment_create: 2,
      like_give: 1,
      course_complete: 15
    };
    return points[type as keyof typeof points] || 0;
  };

  const getCurrentPoints = (userData: LeaderboardUser) => {
    switch (timeFilter) {
      case 'weekly': return userData.weekly_points;
      case 'monthly': return userData.monthly_points;
      default: return userData.total_points;
    }
  };

  const getScoreBreakdown = (userData: LeaderboardUser) => {
    const breakdown = [];
    if (userData.tool_uploads > 0) breakdown.push(`${userData.tool_uploads} tools`);
    if (userData.challenge_participations > 0) breakdown.push(`${userData.challenge_participations} challenges`);
    if (userData.code_shares > 0) breakdown.push(`${userData.code_shares} code`);
    if (userData.note_shares > 0) breakdown.push(`${userData.note_shares} notes`);
    if (userData.post_creations > 0) breakdown.push(`${userData.post_creations} posts`);
    return breakdown.join(' | ');
  };

  const getBadgeIcon = (badgeType: string) => {
    const badgeIcons = {
      featured_contributor: '⭐',
      creator_week: '🔥',
      most_insightful: '🧠',
      toolsmith: '🛠',
      challenger: '🎯',
      community_star: '✨'
    };
    return badgeIcons[badgeType as keyof typeof badgeIcons] || '🏆';
  };

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
              <Trophy className="h-10 w-10 text-yellow-500" />
              Contributors Leaderboard
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Celebrating our top contributors across challenges, tools, code sharing, and community engagement
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="leaderboard" className="space-y-6">
              {/* Filters */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by contributor name..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={timeFilter} onValueChange={setTimeFilter}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Time period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="total">All Time</SelectItem>
                        <SelectItem value="monthly">This Month</SelectItem>
                        <SelectItem value="weekly">This Week</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="tools">Tools</SelectItem>
                        <SelectItem value="code">Code</SelectItem>
                        <SelectItem value="notes">Notes</SelectItem>
                        <SelectItem value="challenges">Challenges</SelectItem>
                        <SelectItem value="posts">Posts</SelectItem>
                        <SelectItem value="courses">Courses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Top 3 Spotlight */}
              {filteredLeaderboard.length > 0 && (
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {filteredLeaderboard.slice(0, 3).map((userData, index) => (
                    <Card key={userData.user_id} className={`text-center ${getRankColor(index)} border-l-4 transform hover:scale-105 transition-all duration-200`}>
                      <CardContent className="pt-6">
                        <div className="flex justify-center mb-4">
                          {getRankIcon(index)}
                        </div>
                        <Avatar className="h-20 w-20 mx-auto mb-4">
                          <AvatarImage src={userData.profiles?.avatar_url} />
                          <AvatarFallback className="text-lg">
                            {userData.profiles?.full_name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="font-semibold text-lg mb-1">
                          {userData.profiles?.full_name || 'Anonymous'}
                        </h3>
                        <p className="text-3xl font-bold text-primary mb-2">
                          {getCurrentPoints(userData)}
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          {timeFilter === 'weekly' ? 'Weekly' : timeFilter === 'monthly' ? 'Monthly' : 'Total'} Points
                        </p>
                        <div className="flex flex-wrap justify-center gap-1 mb-3">
                          {userData.user_badges?.slice(0, 3).map((badge, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {getBadgeIcon(badge.badge_type)} {badge.badge_name}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {getScoreBreakdown(userData)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Full Leaderboard */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  All Contributors
                  <Badge variant="secondary">{filteredLeaderboard.length}</Badge>
                </h2>
                
                {filteredLeaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {filteredLeaderboard.map((userData, index) => (
                      <Card key={userData.user_id} className={`${getRankColor(index)} border-l-4 hover:shadow-md transition-all duration-200`}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="flex items-center gap-3">
                                {getRankIcon(index)}
                                <span className="font-bold text-lg text-muted-foreground">
                                  #{index + 1}
                                </span>
                              </div>
                              
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={userData.profiles?.avatar_url} />
                                <AvatarFallback>
                                  {userData.profiles?.full_name?.charAt(0) || '?'}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold">
                                    {userData.profiles?.full_name || 'Anonymous'}
                                  </h3>
                                  {userData.user_badges?.slice(0, 2).map((badge, idx) => (
                                    <span key={idx} title={badge.badge_name} className="text-sm">
                                      {getBadgeIcon(badge.badge_type)}
                                    </span>
                                  ))}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {getScoreBreakdown(userData)}
                                </p>
                                
                                {/* Activity Breakdown */}
                                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                  {userData.tool_uploads > 0 && (
                                    <span className="flex items-center gap-1">
                                      <Upload className="h-3 w-3" />
                                      {userData.tool_uploads}
                                    </span>
                                  )}
                                  {userData.code_shares > 0 && (
                                    <span className="flex items-center gap-1">
                                      <Code className="h-3 w-3" />
                                      {userData.code_shares}
                                    </span>
                                  )}
                                  {userData.challenge_participations > 0 && (
                                    <span className="flex items-center gap-1">
                                      <Target className="h-3 w-3" />
                                      {userData.challenge_participations}
                                    </span>
                                  )}
                                  {userData.courses_completed > 0 && (
                                    <span className="flex items-center gap-1">
                                      <BookOpen className="h-3 w-3" />
                                      {userData.courses_completed}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-2xl font-bold text-primary">
                                {getCurrentPoints(userData)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {timeFilter === 'weekly' ? 'Weekly' : timeFilter === 'monthly' ? 'Monthly' : 'Total'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="text-center py-12">
                    <CardContent>
                      <div className="text-6xl mb-4">🏆</div>
                      <h3 className="text-xl font-semibold mb-2">No Contributors Yet</h3>
                      <p className="text-muted-foreground">
                        Be the first to contribute and earn your place on the leaderboard!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Recent Platform Activity
                  </CardTitle>
                  <CardDescription>
                    Latest contributions from our community members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentActivities.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border">
                          <div className="p-2 rounded-full bg-primary/10">
                            {getActivityIcon(activity.activity_type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-medium">
                                {activity.profiles?.full_name || 'Anonymous'}
                              </span>
                              {' '}
                              {activity.activity_type === 'tool_upload' && 'uploaded a new tool'}
                              {activity.activity_type === 'code_share' && 'shared code'}
                              {activity.activity_type === 'note_share' && 'shared notes'}
                              {activity.activity_type === 'challenge_join' && 'joined a challenge'}
                              {activity.activity_type === 'post_create' && 'created a post'}
                              {activity.activity_type === 'comment_create' && 'added a comment'}
                              {activity.activity_type === 'like_give' && 'liked content'}
                              {activity.activity_type === 'course_complete' && 'completed a course'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.created_at).toLocaleDateString()} • 
                              +{activity.points_earned} points
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No recent activity to show</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Points System Info */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Points System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-3 rounded-lg bg-primary/5">
                  <Upload className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-medium">Tool Upload</p>
                  <p className="text-xs text-muted-foreground">+10 points</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-primary/5">
                  <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-medium">Challenge Join</p>
                  <p className="text-xs text-muted-foreground">+8 points</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-primary/5">
                  <BookOpen className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-medium">Note Share</p>
                  <p className="text-xs text-muted-foreground">+7 points</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-primary/5">
                  <Code className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-medium">Code Share</p>
                  <p className="text-xs text-muted-foreground">+5 points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
};

export default Leaderboard;