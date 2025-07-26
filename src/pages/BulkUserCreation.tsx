import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

const BulkUserCreation = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleBulkCreate = async () => {
    setLoading(true);
    try {
      // Call the bulk create function
      const response = await fetch('/api/bulk-create-professional-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'create' })
      });

      const data = await response.json();
      setResults(data);

      if (data.success) {
        toast({
          title: "Bulk Creation Successful!",
          description: `Created ${data.results?.filter((r: any) => r.success).length} professional users`,
        });
      } else {
        toast({
          title: "Bulk Creation Failed",
          description: data.error || "Unknown error occurred",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Bulk creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create bulk users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmails = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bulk-create-professional-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'send_emails' })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Emails Sent Successfully!",
          description: `Sent ${data.results?.filter((r: any) => r.success).length} password setup emails`,
        });
      } else {
        toast({
          title: "Email Sending Failed",
          description: data.error || "Unknown error occurred",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Email sending error:', error);
      toast({
        title: "Error",
        description: "Failed to send emails",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Bulk Professional User Creation</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Professional Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This will create professional accounts for all users in the list with:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Professional plan access (3 months validity)</li>
              <li>Course enrollment: "Geospatial Technology Unlocked"</li>
              <li>Active subscription status</li>
              <li>Email notifications enabled</li>
            </ul>
            
            <Button 
              onClick={handleBulkCreate} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creating Users...' : 'Create Professional Users'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Send Password Setup Emails</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Send password setup emails to all created professional users.
            </p>
            
            <Button 
              onClick={handleSendEmails} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? 'Sending Emails...' : 'Send Password Setup Emails'}
            </Button>
          </CardContent>
        </Card>

        {results && (
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96">
                {JSON.stringify(results, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BulkUserCreation;