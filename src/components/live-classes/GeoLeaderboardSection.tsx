import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award, Users, MessageSquare, Briefcase, TrendingUp, Crown, Star, Loader2 } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LeaderboardEntry {
  user_id: string;
  total_points: number;
  monthly_points: number;
  weekly_points: number;
  tool_uploads: number;
  code_shares: number;
  challenge_participations: number;
  post_creations: number;
  courses_completed: number;
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  };
}

const GeoLeaderboardSection: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'monthly' | 'allTime'>('monthly');
  const [category, setCategory] = useState<'overall' | 'tools' | 'challenges' | 'courses'>('overall');

  useEffect(() => {
    fetchLeaderboardData();
  }, [timeframe]);

  const fetchLeaderboardData = async () => {
    try {
      setIsLoading(true);
      
      let orderColumn = 'total_points';
      if (timeframe === 'monthly') orderColumn = 'monthly_points';

      const { data, error } = await supabase
        .from('user_leaderboard_stats')
        .select(`
          user_id,
          total_points,
          monthly_points,
          weekly_points,
          tool_uploads,
          code_shares,
          challenge_participations,
          post_creations,
          courses_completed
        `)
        .order(orderColumn, { ascending: false })
        .limit(10);

      if (error) throw error;

      // Fetch profiles separately
      if (data && data.length > 0) {
        const userIds = data.map(d => d.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);

        const enrichedData = data.map(stat => ({
          ...stat,
          profiles: profilesData?.find(p => p.id === stat.user_id)
        }));

        setLeaderboardData(enrichedData as LeaderboardEntry[]);
      } else {
        setLeaderboardData([]);
      }
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

  const getBadgeIcon = (badgeType: string) => {
    switch (badgeType) {
      case 'crown': return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'gold': return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'silver': return <Medal className="h-5 w-5 text-gray-400" />;  
      case 'bronze': return <Award className="h-5 w-5 text-amber-600" />;
      case 'star': return <Star className="h-5 w-5 text-blue-500" />;
      default: return null;
    }
  };

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getScoreForCategory = (leader: LeaderboardEntry) => {
    switch (category) {
      case 'tools': return leader.tool_uploads;
      case 'challenges': return leader.challenge_participations;
      case 'courses': return leader.courses_completed;
      default: 
        return timeframe === 'monthly' ? leader.monthly_points : leader.total_points;
    }
  };

  const getCategoryLabel = () => {
    switch (category) {
      case 'tools': return 'Tools Shared';
      case 'challenges': return 'Challenges';
      case 'courses': return 'Courses';
      default: return 'Points';
    }
  };

  const getTimeframeLabel = () => {
    return timeframe === 'monthly' ? 'This Month' : 'All Time';
  };

  const getBadgeType = (rank: number) => {
    if (rank === 1) return 'crown';
    if (rank === 2) return 'gold';
    if (rank === 3) return 'silver';
    if (rank === 4) return 'bronze';
    if (rank <= 10) return 'star';
    return 'none';
  };

  // Don't show if user is not logged in
  if (!user) return null;

  if (isLoading) {
    return (
      <div className="mb-12">
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="h-8 w-8 text-primary" />
          🎓 Geo Leaderboard
        </h2>
        <Badge variant="outline" className="text-sm">
          Updated Daily
        </Badge>
      </div>

      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Community Leaders - {getTimeframeLabel()}
            </CardTitle>
            
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <Button 
                  size="sm" 
                  variant={timeframe === 'monthly' ? 'default' : 'outline'}
                  onClick={() => setTimeframe('monthly')}
                >
                  Monthly
                </Button>
                <Button 
                  size="sm" 
                  variant={timeframe === 'allTime' ? 'default' : 'outline'}
                  onClick={() => setTimeframe('allTime')}
                >
                  All Time
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button 
              size="sm" 
              variant={category === 'overall' ? 'default' : 'outline'}
              onClick={() => setCategory('overall')}
            >
              Overall
            </Button>
            <Button 
              size="sm" 
              variant={category === 'tools' ? 'default' : 'outline'}
              onClick={() => setCategory('tools')}
            >
              <Users className="h-3 w-3 mr-1" />
              Tools
            </Button>
            <Button 
              size="sm" 
              variant={category === 'challenges' ? 'default' : 'outline'}
              onClick={() => setCategory('challenges')}
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Challenges
            </Button>
            <Button 
              size="sm" 
              variant={category === 'courses' ? 'default' : 'outline'}
              onClick={() => setCategory('courses')}
            >
              <Briefcase className="h-3 w-3 mr-1" />
              Courses
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {leaderboardData.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-semibold mb-2">No leaderboard data yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Be the first to contribute and climb the ranks!
              </p>
              <p className="text-xs text-muted-foreground">
                Earn points by sharing tools, participating in challenges, and completing courses
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboardData.map((leader, index) => {
                const rank = index + 1;
                const badgeType = getBadgeType(rank);
                
                return (
                  <div key={leader.user_id} className="flex items-center gap-4 p-4 bg-background rounded-lg border hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="relative">
                        <div className="text-xl font-bold min-w-[3rem] text-center">
                          {getRankDisplay(rank)}
                        </div>
                        {badgeType !== 'none' && (
                          <div className="absolute -top-1 -right-1">
                            {getBadgeIcon(badgeType)}
                          </div>
                        )}
                      </div>

                      <Avatar className="h-12 w-12">
                        <AvatarImage src={leader.profiles?.avatar_url} />
                        <AvatarFallback>
                          {leader.profiles?.full_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <h4 className="font-semibold">
                          {leader.profiles?.full_name || 'Anonymous'}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {leader.tool_uploads} tools • {leader.challenge_participations} challenges • {leader.courses_completed} courses
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {getScoreForCategory(leader)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getCategoryLabel()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Earn points by sharing tools, completing courses, and participating in challenges
            </p>
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/leaderboard'}>
              <Trophy className="h-4 w-4 mr-2" />
              View Full Rankings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeoLeaderboardSection;