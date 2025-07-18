import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Database, Users, Award } from 'lucide-react';

const LeaderboardSeeder = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const sampleActivities = [
    { type: 'tool_upload', count: 15, description: 'QGIS Plugin uploads' },
    { type: 'code_share', count: 25, description: 'Python script shares' },
    { type: 'note_share', count: 20, description: 'Tutorial notes' },
    { type: 'challenge_join', count: 30, description: 'Challenge participations' },
    { type: 'post_create', count: 40, description: 'Community posts' },
    { type: 'comment_create', count: 50, description: 'Comments on posts' },
    { type: 'like_give', count: 100, description: 'Likes given' },
    { type: 'course_complete', count: 12, description: 'Course completions' }
  ];

  const sampleBadges = [
    { type: 'featured_contributor', name: 'Featured Contributor', icon: '⭐' },
    { type: 'creator_week', name: 'Creator of the Week', icon: '🔥' },
    { type: 'most_insightful', name: 'Most Insightful', icon: '🧠' },
    { type: 'toolsmith', name: 'Toolsmith', icon: '🛠' },
    { type: 'challenger', name: 'Challenger', icon: '🎯' },
    { type: 'community_star', name: 'Community Star', icon: '✨' }
  ];

  const seedSampleData = async () => {
    setIsSeeding(true);
    try {
      // Get all users to create realistic data
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .limit(20);

      if (usersError) throw usersError;

      if (!users || users.length === 0) {
        toast({
          title: "No Users Found",
          description: "Please ensure there are user profiles in the system first.",
          variant: "destructive"
        });
        return;
      }

      let totalActivities = 0;

      // Create sample activities for each user
      for (const user of users) {
        // Random number of activities per user (1-10)
        const activityCount = Math.floor(Math.random() * 10) + 1;
        
        for (let i = 0; i < activityCount; i++) {
          const activityType = sampleActivities[Math.floor(Math.random() * sampleActivities.length)].type;
          
          const { error } = await supabase.rpc('track_user_activity', {
            p_user_id: user.id,
            p_activity_type: activityType,
            p_metadata: JSON.stringify({
              sample_data: true,
              user_name: user.full_name,
              created_by: 'seeder'
            })
          });

          if (error) {
            console.error('Error creating activity:', error);
          } else {
            totalActivities++;
          }

          // Small delay to avoid overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Randomly assign badges to some users
        if (Math.random() > 0.7) {
          const randomBadge = sampleBadges[Math.floor(Math.random() * sampleBadges.length)];
          
          const { error: badgeError } = await supabase
            .from('user_badges')
            .insert({
              user_id: user.id,
              badge_type: randomBadge.type,
              badge_name: randomBadge.name,
              badge_description: `Earned through outstanding contributions`,
              badge_icon: randomBadge.icon,
              metadata: JSON.stringify({ sample_data: true })
            });

          if (badgeError) {
            console.error('Error creating badge:', badgeError);
          }
        }
      }

      toast({
        title: "Sample Data Created! 🎉",
        description: `Generated ${totalActivities} activities across ${users.length} users`,
      });
      
    } catch (error: any) {
      console.error('Error seeding data:', error);
      toast({
        title: "Error",
        description: "Failed to create sample data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const clearSampleData = async () => {
    try {
      // Clear sample activities by checking metadata for sample_data
      const { data: activitiesToDelete } = await supabase
        .from('user_activities')
        .select('id')
        .textSearch('metadata', 'sample_data');

      if (activitiesToDelete && activitiesToDelete.length > 0) {
        const activityIds = activitiesToDelete.map(a => a.id);
        await supabase
          .from('user_activities')
          .delete()
          .in('id', activityIds);
      }

      // Clear sample badges by checking metadata for sample_data
      const { data: badgesToDelete } = await supabase
        .from('user_badges')
        .select('id')
        .textSearch('metadata', 'sample_data');

      if (badgesToDelete && badgesToDelete.length > 0) {
        const badgeIds = badgesToDelete.map(b => b.id);
        await supabase
          .from('user_badges')
          .delete()
          .in('id', badgeIds);
      }

      toast({
        title: "Sample Data Cleared",
        description: "All sample activities and badges have been removed.",
      });
    } catch (error: any) {
      console.error('Error clearing data:', error);
      toast({
        title: "Error",
        description: "Failed to clear sample data.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Leaderboard Data Seeder
        </CardTitle>
        <CardDescription>
          Generate sample activities and badges to test the leaderboard functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {sampleActivities.slice(0, 4).map((activity, index) => (
            <div key={index} className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-sm font-medium">{activity.description}</p>
              <p className="text-xs text-muted-foreground">
                ~{activity.count} samples
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">⭐ Featured Contributor</Badge>
          <Badge variant="secondary" className="text-xs">🔥 Creator of the Week</Badge>
          <Badge variant="secondary" className="text-xs">🛠 Toolsmith</Badge>
          <Badge variant="secondary" className="text-xs">🎯 Challenger</Badge>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={seedSampleData} 
            disabled={isSeeding}
            className="flex-1"
          >
            {isSeeding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Sample Data...
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Generate Sample Data
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={clearSampleData}
            disabled={isSeeding}
          >
            Clear Sample Data
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>• This will create random activities for existing users</p>
          <p>• Sample data is marked and can be cleared separately</p>
          <p>• Use this to test leaderboard functionality</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaderboardSeeder;