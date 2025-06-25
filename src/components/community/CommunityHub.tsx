
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users, Award, TrendingUp } from 'lucide-react';
import { DiscussionThread } from '@/components/discussions/DiscussionThread';
import { CreatorProfileCard } from '@/components/creator/CreatorProfileCard';
import { ReferralDashboard } from '@/components/referral/ReferralDashboard';

export const CommunityHub: React.FC = () => {
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
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Most Discussed Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">QGIS Best Practices</span>
                    <span className="text-sm text-muted-foreground">47 discussions</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Python for GIS</span>
                    <span className="text-sm text-muted-foreground">32 discussions</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Remote Sensing</span>
                    <span className="text-sm text-muted-foreground">28 discussions</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Highlights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm">Most Helpful Content</h4>
                    <p className="text-xs text-muted-foreground">
                      "Introduction to Spatial Analysis" - 89% positive feedback
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm">Rising Creator</h4>
                    <p className="text-xs text-muted-foreground">
                      @gis_expert gained 25 new followers this week
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
