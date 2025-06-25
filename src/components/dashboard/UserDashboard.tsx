
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, TrendingUp, BookOpen, Settings, Bot } from 'lucide-react';
import ContinueLearningDashboard from '@/components/personalization/ContinueLearningDashboard';
import AITutorPlaceholder from '@/components/ai/AITutorPlaceholder';
import NotificationCenter from './NotificationCenter';
import SavedContentGrid from './SavedContentGrid';
import LearningPathProgress from './LearningPathProgress';
import EmailNotificationSettings from './EmailNotificationSettings';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  const { hasPremiumAccess, subscription } = usePremiumAccess();

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Continue your GIS learning journey.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={hasPremiumAccess ? "default" : "secondary"}>
            <Crown className="h-3 w-3 mr-1" />
            {subscription?.subscription_tier || 'Free'} Plan
          </Badge>
          {!hasPremiumAccess && (
            <Link to="/premium">
              <Button>
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Premium
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Tabs defaultValue="continue-learning" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="continue-learning" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Continue
          </TabsTrigger>
          <TabsTrigger value="ai-tutor" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Tutor
          </TabsTrigger>
          <TabsTrigger value="learning-paths" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Learning
          </TabsTrigger>
          <TabsTrigger value="saved-content" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Saved
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="email-settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Email
          </TabsTrigger>
        </TabsList>

        <TabsContent value="continue-learning" className="space-y-6">
          <ContinueLearningDashboard />
        </TabsContent>

        <TabsContent value="ai-tutor" className="space-y-6">
          <AITutorPlaceholder />
        </TabsContent>

        <TabsContent value="learning-paths" className="space-y-6">
          <LearningPathProgress />
        </TabsContent>

        <TabsContent value="saved-content" className="space-y-6">
          <SavedContentGrid />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationCenter />
        </TabsContent>

        <TabsContent value="email-settings" className="space-y-6">
          <EmailNotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;
