import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Mail, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SMTPStatus {
  configured: boolean;
  testEmailSuccess?: boolean;
  lastChecked: Date;
  error?: string;
}

const SMTPConfigChecker: React.FC = () => {
  const [smtpStatus, setSMTPStatus] = useState<SMTPStatus>({
    configured: false,
    lastChecked: new Date()
  });
  const [testing, setTesting] = useState(false);
  const [checking, setChecking] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const checkSMTPConfig = async () => {
    setChecking(true);
    try {
      // Check if SMTP secrets are configured by trying to send a test email
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: user?.email || 'test@example.com',
          subject: 'SMTP Configuration Test',
          html: '<p>This is a test email to verify SMTP configuration.</p>',
          test: true // Flag to indicate this is a test
        }
      });

      if (error) {
        setSMTPStatus({
          configured: false,
          lastChecked: new Date(),
          error: error.message
        });
      } else {
        setSMTPStatus({
          configured: true,
          testEmailSuccess: true,
          lastChecked: new Date()
        });
      }
    } catch (error: any) {
      setSMTPStatus({
        configured: false,
        lastChecked: new Date(),
        error: error.message || 'Failed to check SMTP configuration'
      });
    } finally {
      setChecking(false);
    }
  };

  const sendTestEmail = async () => {
    if (!user?.email) {
      toast({
        title: "Error",
        description: "No user email found for testing",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: user.email,
          subject: 'Test Email from Harita Hive',
          html: `
            <h2>SMTP Test Successful!</h2>
            <p>If you're reading this email, your SMTP configuration is working correctly.</p>
            <p>Sent at: ${new Date().toLocaleString()}</p>
            <p>Best regards,<br>Harita Hive Team</p>
          `
        }
      });

      if (error) throw error;

      setSMTPStatus(prev => ({
        ...prev,
        testEmailSuccess: true,
        lastChecked: new Date()
      }));

      toast({
        title: "Test email sent!",
        description: `Check your inbox at ${user.email}`,
      });
    } catch (error: any) {
      setSMTPStatus(prev => ({
        ...prev,
        testEmailSuccess: false,
        error: error.message,
        lastChecked: new Date()
      }));

      toast({
        title: "Test email failed",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    checkSMTPConfig();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          SMTP Configuration Status
        </CardTitle>
        <CardDescription>
          Monitor email service configuration and test functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {smtpStatus.configured ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            )}
            <span className="font-medium">
              SMTP Status
            </span>
          </div>
          <Badge variant={smtpStatus.configured ? "default" : "destructive"}>
            {smtpStatus.configured ? "Configured" : "Not Configured"}
          </Badge>
        </div>

        <div className="text-sm text-muted-foreground">
          Last checked: {smtpStatus.lastChecked.toLocaleString()}
        </div>

        {!smtpStatus.configured && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              SMTP is not configured properly. Email authentication (OTP) and notifications will not work.
              {smtpStatus.error && (
                <div className="mt-2 text-xs font-mono bg-muted p-2 rounded">
                  Error: {smtpStatus.error}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {smtpStatus.testEmailSuccess === false && smtpStatus.error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Last email test failed: {smtpStatus.error}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={checkSMTPConfig}
            disabled={checking}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
            Check Config
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={sendTestEmail}
            disabled={testing || !smtpStatus.configured}
          >
            <Mail className={`h-4 w-4 mr-2 ${testing ? 'animate-pulse' : ''}`} />
            {testing ? 'Sending...' : 'Send Test Email'}
          </Button>
        </div>

        {!smtpStatus.configured && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">How to configure SMTP:</h4>
            <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
              <li>Sign up for an email service (Resend, SendGrid, etc.)</li>
              <li>Get your API key from the service</li>
              <li>Add the API key to Supabase Edge Function secrets</li>
              <li>Restart the email service and test again</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SMTPConfigChecker;