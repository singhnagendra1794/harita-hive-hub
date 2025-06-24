
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useEmailPreferences } from '@/hooks/useEmailPreferences';
import { Loader2, Mail, Bell, BookOpen, Newspaper, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const EmailPreferences: React.FC = () => {
  const { preferences, loading, updatePreferences, unsubscribeAll } = useEmailPreferences();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!preferences) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Unable to load email preferences
          </p>
        </CardContent>
      </Card>
    );
  }

  const isUnsubscribed = !!preferences.unsubscribed_at;

  const handleToggle = (key: string, value: boolean) => {
    updatePreferences({ [key]: value });
  };

  const handleUnsubscribeAll = () => {
    if (window.confirm('Are you sure you want to unsubscribe from all emails?')) {
      unsubscribeAll();
    }
  };

  const handleResubscribe = () => {
    updatePreferences({
      class_reminders: true,
      newsletter_updates: true,
      onboarding_emails: true,
      weekly_digest: true,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Preferences
        </CardTitle>
        <CardDescription>
          Manage your email notification preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isUnsubscribed && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <p className="text-yellow-800 font-medium">
                You're currently unsubscribed from all emails
              </p>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              You can re-enable specific email types below or resubscribe to all emails.
            </p>
            <Button 
              onClick={handleResubscribe}
              variant="outline" 
              size="sm" 
              className="mt-3 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
            >
              Resubscribe to All
            </Button>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-blue-600" />
              <div>
                <Label htmlFor="class_reminders" className="text-sm font-medium">
                  Class Reminders
                </Label>
                <p className="text-xs text-muted-foreground">
                  Get notified 24h and 1h before your enrolled classes
                </p>
              </div>
            </div>
            <Switch
              id="class_reminders"
              checked={preferences.class_reminders}
              onCheckedChange={(checked) => handleToggle('class_reminders', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Newspaper className="h-4 w-4 text-green-600" />
              <div>
                <Label htmlFor="newsletter_updates" className="text-sm font-medium">
                  Newsletter Updates
                </Label>
                <p className="text-xs text-muted-foreground">
                  Weekly digest of new content and platform updates
                </p>
              </div>
            </div>
            <Switch
              id="newsletter_updates"
              checked={preferences.newsletter_updates}
              onCheckedChange={(checked) => handleToggle('newsletter_updates', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-4 w-4 text-purple-600" />
              <div>
                <Label htmlFor="onboarding_emails" className="text-sm font-medium">
                  Onboarding Emails
                </Label>
                <p className="text-xs text-muted-foreground">
                  Helpful tips and feature introductions for new users
                </p>
              </div>
            </div>
            <Switch
              id="onboarding_emails"
              checked={preferences.onboarding_emails}
              onCheckedChange={(checked) => handleToggle('onboarding_emails', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-orange-600" />
              <div>
                <Label htmlFor="weekly_digest" className="text-sm font-medium">
                  Weekly Digest
                </Label>
                <p className="text-xs text-muted-foreground">
                  Summary of your progress and new content recommendations
                </p>
              </div>
            </div>
            <Switch
              id="weekly_digest"
              checked={preferences.weekly_digest}
              onCheckedChange={(checked) => handleToggle('weekly_digest', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-600" />
              <div>
                <Label htmlFor="marketing_emails" className="text-sm font-medium">
                  Marketing Emails
                </Label>
                <p className="text-xs text-muted-foreground">
                  Special offers, new courses, and promotional content
                </p>
              </div>
            </div>
            <Switch
              id="marketing_emails"
              checked={preferences.marketing_emails}
              onCheckedChange={(checked) => handleToggle('marketing_emails', checked)}
            />
          </div>
        </div>

        <Separator />

        <div className="pt-4">
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleUnsubscribeAll}
            className="w-full"
          >
            Unsubscribe from All Emails
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            You can always resubscribe later from your account settings
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailPreferences;
