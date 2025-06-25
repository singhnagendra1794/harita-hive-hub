
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Bell, Calendar } from 'lucide-react';

interface EmailSettings {
  newsletter: boolean;
  courseUpdates: boolean;
  newContent: boolean;
  weeklyDigest: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  digestDay: string;
}

export const EmailNotificationSettings = () => {
  const [settings, setSettings] = useState<EmailSettings>({
    newsletter: true,
    courseUpdates: true,
    newContent: false,
    weeklyDigest: true,
    frequency: 'weekly',
    digestDay: 'monday'
  });

  const [saving, setSaving] = useState(false);

  const updateSetting = (key: keyof EmailSettings, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    // Show success toast or feedback
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Mail className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Email Notifications</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Email Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Newsletter</Label>
                <p className="text-sm text-muted-foreground">
                  Receive our weekly GIS newsletter with tips and updates
                </p>
              </div>
              <Switch
                checked={settings.newsletter}
                onCheckedChange={(checked) => updateSetting('newsletter', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Course Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when new courses or lessons are added
                </p>
              </div>
              <Switch
                checked={settings.courseUpdates}
                onCheckedChange={(checked) => updateSetting('courseUpdates', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">New Content Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Immediate notifications for new content in your followed topics
                </p>
              </div>
              <Switch
                checked={settings.newContent}
                onCheckedChange={(checked) => updateSetting('newContent', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Weekly Digest</Label>
                <p className="text-sm text-muted-foreground">
                  Summary of your learning progress and recommendations
                </p>
              </div>
              <Switch
                checked={settings.weeklyDigest}
                onCheckedChange={(checked) => updateSetting('weeklyDigest', checked)}
              />
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-base">Email Frequency</Label>
              <Select
                value={settings.frequency}
                onValueChange={(value) => updateSetting('frequency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {settings.frequency === 'weekly' && (
              <div className="space-y-2">
                <Label className="text-base">Digest Day</Label>
                <Select
                  value={settings.digestDay}
                  onValueChange={(value) => updateSetting('digestDay', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="thursday">Thursday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                    <SelectItem value="saturday">Saturday</SelectItem>
                    <SelectItem value="sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Button onClick={saveSettings} disabled={saving} className="w-full">
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
