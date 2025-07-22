import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface TestResult {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'warning';
  description: string;
  details?: string;
}

const QATestSuite = () => {
  const { user } = useAuth();
  const { hasAccess, subscription } = usePremiumAccess();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    // Test 1: Check for duplicate headers
    const headerTest = (): TestResult => {
      const navElements = document.querySelectorAll('nav');
      const headerElements = document.querySelectorAll('header');
      const navbarElements = document.querySelectorAll('[class*="navbar"]');
      const totalHeaders = navElements.length + headerElements.length + navbarElements.length;
      
      return {
        id: 'header-check',
        name: 'Header Duplication Test',
        status: totalHeaders === 1 ? 'pass' : 'fail',
        description: `Should have exactly 1 header, found ${totalHeaders}`,
        details: `Nav: ${navElements.length}, Header: ${headerElements.length}, Navbar: ${navbarElements.length}`
      };
    };

    // Test 2: Check user authentication state
    const authTest = (): TestResult => ({
      id: 'auth-check',
      name: 'Authentication State',
      status: user ? 'pass' : 'warning',
      description: user ? `Logged in as ${user.email}` : 'Not authenticated',
    });

    // Test 3: Check premium access logic
    const premiumTest = (): TestResult => {
      const hasProAccess = hasAccess('pro');
      const userEmail = user?.email || '';
      const isProfessionalEmail = [
        'bhumip107@gmail.com', 'kondojukushi10@gmail.com', 'adityapipil35@gmail.com',
        'mukherjeejayita14@gmail.com', 'tanishkatyagi7500@gmail.com', 'kamakshiiit@gmail.com',
        'nareshkumar.tamada@gmail.com', 'geospatialshekhar@gmail.com', 'ps.priyankasingh26996@gmail.com',
        'madhubalapriya2@gmail.com', 'munmund66@gmail.com', 'sujansapkota27@gmail.com',
        'sanjanaharidasan@gmail.com', 'ajays301298@gmail.com', 'jeevanleo2310@gmail.com',
        'geoaiguru@gmail.com', 'rashidmsdian@gmail.com', 'bharath.viswakarma@gmail.com',
        'shaliniazh@gmail.com', 'sg17122004@gmail.com', 'veenapoovukal@gmail.com',
        'asadullahm031@gmail.com', 'moumitadas19996@gmail.com', 'javvad.rizvi@gmail.com',
        'mandadi.jyothi123@gmail.com', 'udaypbrn@gmail.com'
      ].includes(userEmail.toLowerCase());

      return {
        id: 'premium-access',
        name: 'Premium Access Logic',
        status: (isProfessionalEmail && hasProAccess) || (!isProfessionalEmail && !user) ? 'pass' : 
                isProfessionalEmail && !hasProAccess ? 'fail' : 'pass',
        description: `Professional email: ${isProfessionalEmail}, Pro access: ${hasProAccess}`,
        details: `Subscription tier: ${subscription?.subscription_tier || 'none'}`
      };
    };

    // Test 4: Check button functionality
    const buttonTest = (): TestResult => {
      const buttons = document.querySelectorAll('button');
      const disabledButtons = document.querySelectorAll('button:disabled');
      const unclickableButtons = Array.from(buttons).filter(btn => {
        const style = window.getComputedStyle(btn);
        return style.pointerEvents === 'none' && !btn.disabled;
      });

      return {
        id: 'button-functionality',
        name: 'Button Functionality',
        status: unclickableButtons.length === 0 ? 'pass' : 'warning',
        description: `${buttons.length} total buttons, ${disabledButtons.length} disabled, ${unclickableButtons.length} unclickable`,
      };
    };

    // Test 5: Check for JavaScript errors
    const errorTest = (): TestResult => {
      const errorCount = (window as any).__errorCount || 0;
      return {
        id: 'js-errors',
        name: 'JavaScript Errors',
        status: errorCount === 0 ? 'pass' : 'fail',
        description: `${errorCount} JavaScript errors detected`,
      };
    };

    // Run all tests
    results.push(headerTest());
    results.push(authTest());
    results.push(premiumTest());
    results.push(buttonTest());
    results.push(errorTest());

    setTestResults(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runTests();
  }, [user, hasAccess, subscription]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'fail': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass': return <Badge className="bg-green-100 text-green-800">PASS</Badge>;
      case 'fail': return <Badge variant="destructive">FAIL</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">WARNING</Badge>;
      default: return null;
    }
  };

  const passCount = testResults.filter(t => t.status === 'pass').length;
  const failCount = testResults.filter(t => t.status === 'fail').length;
  const warningCount = testResults.filter(t => t.status === 'warning').length;

  // Only show in development or for admins
  if (process.env.NODE_ENV === 'production' && user?.email !== 'contact@haritahive.com') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 z-50">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">QA Test Suite</CardTitle>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={runTests}
              disabled={isRunning}
            >
              {isRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-green-100 text-green-800">{passCount} Pass</Badge>
            <Badge variant="destructive">{failCount} Fail</Badge>
            <Badge className="bg-yellow-100 text-yellow-800">{warningCount} Warning</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 max-h-64 overflow-y-auto">
          {testResults.map((test) => (
            <div key={test.id} className="flex items-start gap-2 p-2 rounded border">
              {getStatusIcon(test.status)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{test.name}</span>
                  {getStatusBadge(test.status)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{test.description}</p>
                {test.details && (
                  <p className="text-xs text-muted-foreground mt-1 opacity-70">{test.details}</p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default QATestSuite;