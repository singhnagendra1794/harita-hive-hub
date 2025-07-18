import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface TestResult {
  email: string;
  found: boolean;
  subscription: string;
  plan: string;
}

const EmailCaseTestComponent: React.FC = () => {
  const [testEmail, setTestEmail] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const testEmailVariations = async () => {
    if (!testEmail) return;

    setIsLoading(true);
    const variations = [
      testEmail.toLowerCase(),
      testEmail.toUpperCase(),
      testEmail.charAt(0).toUpperCase() + testEmail.slice(1).toLowerCase(),
      testEmail.split('@').map((part, i) => 
        i === 0 ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : part.toLowerCase()
      ).join('@')
    ];

    const results: TestResult[] = [];

    for (const email of variations) {
      try {
        const { data, error } = await supabase
          .rpc('get_user_subscription_safe', { p_user_id: '00000000-0000-0000-0000-000000000000' })
          .single();

        // Since we can't directly query auth.users, we'll test the email function
        const { data: testData } = await supabase
          .rpc('is_professional_email', { email_to_check: email });

        results.push({
          email,
          found: testData === true,
          subscription: testData ? 'pro' : 'free',
          plan: testData ? 'professional' : 'free'
        });
      } catch (error) {
        results.push({
          email,
          found: false,
          subscription: 'unknown',
          plan: 'unknown'
        });
      }
    }

    setTestResults(results);
    setIsLoading(false);
  };

  const getStatusIcon = (found: boolean) => {
    return found ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (subscription: string) => {
    const variant = subscription === 'pro' ? 'default' : 
                    subscription === 'free' ? 'secondary' : 'outline';
    return <Badge variant={variant}>{subscription.toUpperCase()}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Email Case Sensitivity Test
        </CardTitle>
        <CardDescription>
          Test if email matching works with different case variations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter email to test (e.g., test@example.com)"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={testEmailVariations} 
            disabled={!testEmail || isLoading}
          >
            {isLoading ? 'Testing...' : 'Test Email'}
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Test Results:</h4>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.found)}
                  <code className="text-sm bg-white px-2 py-1 rounded">
                    {result.email}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(result.subscription)}
                  <span className="text-sm text-muted-foreground">
                    {result.plan}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-4">
          <p><strong>How it works:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Tests various case combinations of the email</li>
            <li>Checks if each variation is recognized as professional</li>
            <li>All variations should return the same result if case-insensitive matching works</li>
            <li>Green check = Email recognized, Red X = Not recognized</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailCaseTestComponent;