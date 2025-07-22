import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award, Users, MessageSquare, Briefcase, TrendingUp, Crown, Star } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import LazyImage from '@/components/ui/lazy-image';

// Mock leaderboard data
const mockLeaderboardData = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    avatar: '/api/placeholder/50/50',
    location: 'Mumbai, India',
    liveParticipation: 24,
    chatEngagement: 156,
    projectsSubmitted: 8,
    totalScore: 420,
    rank: 1,
    badgeType: 'crown',
    specialization: 'Urban Planning',
    joinedDate: '2023-08-15'
  },
  {
    id: '2', 
    name: 'Sarah Chen',
    avatar: '/api/placeholder/50/50',
    location: 'Singapore',
    liveParticipation: 22,
    chatEngagement: 189,
    projectsSubmitted: 6,
    totalScore: 385,
    rank: 2,
    badgeType: 'gold',
    specialization: 'Remote Sensing',
    joinedDate: '2023-09-10'
  },
  {
    id: '3',
    name: 'Ahmed Al-Farisi', 
    avatar: '/api/placeholder/50/50',
    location: 'Dubai, UAE',
    liveParticipation: 19,
    chatEngagement: 142,
    projectsSubmitted: 7,
    totalScore: 348,
    rank: 3,
    badgeType: 'silver',
    specialization: 'Smart Cities',
    joinedDate: '2023-07-22'
  },
  {
    id: '4',
    name: 'Maria Santos',
    avatar: '/api/placeholder/50/50',
    location: 'São Paulo, Brazil',
    liveParticipation: 18,
    chatEngagement: 134,
    projectsSubmitted: 5,
    totalScore: 312,
    rank: 4,
    badgeType: 'bronze',
    specialization: 'Environmental GIS',
    joinedDate: '2023-10-05'
  },
  {
    id: '5',
    name: 'David Thompson',
    avatar: '/api/placeholder/50/50',
    location: 'London, UK',
    liveParticipation: 16,
    chatEngagement: 98,
    projectsSubmitted: 6,
    totalScore: 289,
    rank: 5,
    badgeType: 'star',
    specialization: 'Web GIS',
    joinedDate: '2023-11-12'
  },
  {
    id: '6',
    name: 'Yuki Tanaka',
    avatar: '/api/placeholder/50/50',
    location: 'Tokyo, Japan',
    liveParticipation: 15,
    chatEngagement: 87,
    projectsSubmitted: 4,
    totalScore: 256,
    rank: 6,
    badgeType: 'none',
    specialization: 'Disaster Management',
    joinedDate: '2023-12-03'
  }
];

const GeoLeaderboardSection: React.FC = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<'monthly' | 'quarterly' | 'allTime'>('monthly');
  const [category, setCategory] = useState<'overall' | 'participation' | 'engagement' | 'projects'>('overall');

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

  const getScoreForCategory = (user: typeof mockLeaderboardData[0]) => {
    switch (category) {
      case 'participation': return user.liveParticipation;
      case 'engagement': return user.chatEngagement;
      case 'projects': return user.projectsSubmitted;
      default: return user.totalScore;
    }
  };

  const getCategoryLabel = () => {
    switch (category) {
      case 'participation': return 'Sessions Attended';
      case 'engagement': return 'Chat Messages';
      case 'projects': return 'Projects Shared';
      default: return 'Total Score';
    }
  };

  const getTimeframeLabel = () => {
    switch (timeframe) {
      case 'monthly': return 'This Month';
      case 'quarterly': return 'This Quarter';
      default: return 'All Time';
    }
  };

  // Don't show if user is not logged in
  if (!user) return null;

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
                  variant={timeframe === 'quarterly' ? 'default' : 'outline'}
                  onClick={() => setTimeframe('quarterly')}
                >
                  Quarterly
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
              variant={category === 'participation' ? 'default' : 'outline'}
              onClick={() => setCategory('participation')}
            >
              <Users className="h-3 w-3 mr-1" />
              Live Sessions
            </Button>
            <Button 
              size="sm" 
              variant={category === 'engagement' ? 'default' : 'outline'}
              onClick={() => setCategory('engagement')}
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Engagement
            </Button>
            <Button 
              size="sm" 
              variant={category === 'projects' ? 'default' : 'outline'}
              onClick={() => setCategory('projects')}
            >
              <Briefcase className="h-3 w-3 mr-1" />
              Projects
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {mockLeaderboardData.map((leader) => (
              <div key={leader.id} className="flex items-center gap-4 p-4 bg-background rounded-lg border hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative">
                    <div className="text-xl font-bold min-w-[3rem] text-center">
                      {getRankDisplay(leader.rank)}
                    </div>
                    {leader.badgeType !== 'none' && (
                      <div className="absolute -top-1 -right-1">
                        {getBadgeIcon(leader.badgeType)}
                      </div>
                    )}
                  </div>

                  <LazyImage
                    src={leader.avatar}
                    alt={leader.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                    width={48}
                    height={48}
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{leader.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {leader.specialization}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{leader.location}</p>
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
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Earn points by attending live sessions, engaging in chat, and sharing projects
            </p>
            <Button variant="outline" size="sm">
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