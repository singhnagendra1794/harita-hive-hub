import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const BulkUserCreator = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const createProfessionalUsers = async () => {
    setLoading(true);
    try {
      console.log('🚀 Starting bulk professional user creation...');
      
      // Call Supabase function directly
      const { data, error } = await supabase.functions.invoke('bulk-create-professional-users', {
        body: { action: 'create' }
      });

      if (error) {
        console.error('❌ Function error:', error);
        throw error;
      }

      console.log('✅ Function response:', data);
      setResults(data);

      if (data.success) {
        toast({
          title: "Success!",
          description: `Created ${data.results?.filter((r: any) => r.success).length} professional users with course enrollments`,
        });
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('💥 Error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create professional users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordEmails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('bulk-create-professional-users', {
        body: { action: 'send_emails' }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Emails Sent!",
          description: `Sent ${data.results?.filter((r: any) => r.success).length} password setup emails`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send emails",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Professional Users + Course Enrollment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Creates 37 professional users with:
          </p>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Professional plan (3 months validity)</li>
            <li>Course: "Geospatial Technology Unlocked"</li>
            <li>Active subscription status</li>
            <li>Course enrollment count: 1</li>
          </ul>
          
          <Button 
            onClick={createProfessionalUsers} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Creating Users...' : 'Create 37 Professional Users'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Send Password Setup Emails</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={sendPasswordEmails} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? 'Sending...' : 'Send Password Setup Emails'}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-96">
              {JSON.stringify(results, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BulkUserCreator;