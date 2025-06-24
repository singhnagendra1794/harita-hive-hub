
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const EmailSchedulerSetup: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [stats, setStats] = useState({ pending: 0, sent: 0, failed: 0 });

  useEffect(() => {
    fetchEmailStats();
    // Set up interval to check email queue status
    const interval = setInterval(fetchEmailStats, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchEmailStats = async () => {
    try {
      const { data: pending } = await supabase
        .from('email_queue')
        .select('id', { count: 'exact' })
        .eq('status', 'pending');

      const { data: sent } = await supabase
        .from('email_queue')
        .select('id', { count: 'exact' })
        .eq('status', 'sent');

      const { data: failed } = await supabase
        .from('email_queue')
        .select('id', { count: 'exact' })
        .eq('status', 'failed');

      setStats({
        pending: pending?.length || 0,
        sent: sent?.length || 0,
        failed: failed?.length || 0,
      });

      // Get last successful run
      const { data: lastEmail } = await supabase
        .from('email_queue')
        .select('sent_at')
        .eq('status', 'sent')
        .order('sent_at', { ascending: false })
        .limit(1)
        .single();

      if (lastEmail?.sent_at) {
        setLastRun(lastEmail.sent_at);
      }
    } catch (error) {
      console.error('Error fetching email stats:', error);
    }
  };

  const runEmailScheduler = async () => {
    setIsRunning(true);
    try {
      const response = await supabase.functions.invoke('email-scheduler', {
        body: {}
      });

      if (response.error) {
        throw response.error;
      }

      const result = response.data;
      toast.success(`Email scheduler completed: ${result.processed} sent, ${result.failed} failed`);
      await fetchEmailStats();
    } catch (error) {
      console.error('Error running email scheduler:', error);
      toast.error('Failed to run email scheduler');
    } finally {
      setIsRunning(false);
    }
  };

  const testWelcomeEmail = async () => {
    try {
      // This would typically be triggered by user signup, but we can test it manually
      const response = await supabase.functions.invoke('send-email', {
        body: {
          template_name: 'welcome_email',
          recipient_email: 'test@example.com', // Replace with actual email for testing
          user_id: 'test-user-id',
          template_data: {
            user_name: 'Test User',
            dashboard_url: `${window.location.origin}/dashboard`,
          }
        }
      });

      if (response.error) {
        throw response.error;
      }

      toast.success('Test email sent successfully');
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Automation System
          </CardTitle>
          <CardDescription>
            Monitor and manage automated email delivery
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
              <p className="text-sm text-yellow-600">Pending</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-800">{stats.sent}</p>
              <p className="text-sm text-green-600">Sent</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-800">{stats.failed}</p>
              <p className="text-sm text-red-600">Failed</p>
            </div>
          </div>

          {lastRun && (
            <div className="text-sm text-muted-foreground">
              Last email sent: {new Date(lastRun).toLocaleString()}
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={runEmailScheduler} 
              disabled={isRunning}
              className="flex-1"
            >
              {isRunning ? 'Processing...' : 'Run Email Scheduler'}
            </Button>
            <Button 
              onClick={testWelcomeEmail} 
              variant="outline"
            >
              Test Welcome Email
            </Button>
          </div>

          <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded">
            <p className="font-medium mb-1">Automation Features:</p>
            <ul className="space-y-1">
              <li>• Welcome emails sent immediately on signup</li>
              <li>• Class reminders sent 24h and 1h before classes</li>
              <li>• Onboarding sequence over 7 days for new users</li>
              <li>• Newsletter notifications for new content</li>
              <li>• Respects user email preferences and unsubscribe requests</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailSchedulerSetup;
