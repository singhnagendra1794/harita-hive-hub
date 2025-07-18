
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, Award, TrendingUp, TrendingDown, Minus, ExternalLink, RefreshCw } from 'lucide-react';
import { DiscussionThread } from '@/components/discussions/DiscussionThread';
import { CreatorProfileCard } from '@/components/creator/CreatorProfileCard';
import { ReferralDashboard } from '@/components/referral/ReferralDashboard';
import { useTrendingData } from '@/hooks/useTrendingData';
import { formatDistanceToNow } from 'date-fns';
export const CommunityHub: React.FC = () => {
  const { data: trendingData, loading: trendingLoading, error: trendingError, refetch } = useTrendingData();

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-500" />;
      default: return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
    <div className="container py-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Community Hub</h1>
          <p className="text-muted-foreground">
            Connect, learn, and grow with fellow GIS enthusiasts
          </p>
        </div>

        <Tabs defaultValue="discussions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="discussions" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Discussions
            </TabsTrigger>
            <TabsTrigger value="creators" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Creators
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Referrals
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discussions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Discussions</CardTitle>
              </CardHeader>
              <CardContent>
                <DiscussionThread 
                  contentType="general" 
                  contentId="community-hub"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="creators" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Featured Creators</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Discover amazing GIS educators and content creators
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Become a Creator</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Share your knowledge and build a following in the GIS community.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="referrals" className="space-y-6">
            <ReferralDashboard />
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Trending Now</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={refetch}
                disabled={trendingLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${trendingLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {trendingError && (
              <Card className="border-destructive">
                <CardContent className="p-4">
                  <p className="text-destructive text-sm">
                    Error loading trending data: {trendingError}
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Trending Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Hot Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {trendingLoading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between animate-pulse">
                          <div className="h-4 bg-muted rounded w-24"></div>
                          <div className="h-4 bg-muted rounded w-8"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {trendingData?.skills.map((skill, index) => (
                        <div key={skill.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">#{index + 1}</span>
                            <span className="text-sm">{skill.name}</span>
                            {getTrendIcon(skill.trend)}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {skill.count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Latest Jobs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Latest Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {trendingLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-2 animate-pulse">
                          <div className="h-4 bg-muted rounded w-32"></div>
                          <div className="h-3 bg-muted rounded w-24"></div>
                          <div className="h-3 bg-muted rounded w-20"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {trendingData?.jobs.slice(0, 4).map((job) => (
                        <div key={`${job.company}-${job.title}`} className="space-y-1 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                          <h4 className="font-medium text-sm line-clamp-1">{job.title}</h4>
                          <p className="text-xs text-muted-foreground">{job.company}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">{job.location}</p>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(job.posted), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Geospatial News */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    GIS News
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {trendingLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-2 animate-pulse">
                          <div className="h-4 bg-muted rounded w-full"></div>
                          <div className="h-3 bg-muted rounded w-20"></div>
                          <div className="h-3 bg-muted rounded w-full"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {trendingData?.news.slice(0, 3).map((article) => (
                        <div key={article.url} className="space-y-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-sm line-clamp-2 flex-1">{article.title}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-auto"
                              onClick={() => window.open(article.url, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {article.source}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(article.published), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {article.summary}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
  );
};
