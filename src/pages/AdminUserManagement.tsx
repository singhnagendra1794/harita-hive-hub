import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { Loader2, Users, Mail, Trash2, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';

const AdminUserManagement = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleBulkAction = async (action: 'cleanup' | 'create' | 'send_emails') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('bulk-create-professional-users', {
        body: { action }
      });

      if (error) throw error;

      setResults(data);
      toast({
        title: "Success",
        description: data.message,
      });
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || 'An error occurred',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const professionalEmails = [
    'bhumip107@gmail.com', 'kondojukushi10@gmail.com', 'adityapipil35@gmail.com',
    'mukherjeejayita14@gmail.com', 'tanishkatyagi7500@gmail.com', 'kamakshiiit@gmail.com',
    'nareshkumar.tamada@gmail.com', 'geospatialshekhar@gmail.com', 'ps.priyankasingh26996@gmail.com',
    'madhubalapriya2@gmail.com', 'munmund66@gmail.com', 'sujansapkota27@gmail.com',
    'sanjanaharidasan@gmail.com', 'ajays301298@gmail.com', 'jeevanleo2310@gmail.com',
    'geoaiguru@gmail.com', 'rashidmsdian@gmail.com', 'bharath.viswakarma@gmail.com',
    'shaliniazh@gmail.com', 'sg17122004@gmail.com', 'veenapoovukal@gmail.com',
    'asadullahm031@gmail.com', 'moumitadas19996@gmail.com', 'javvad.rizvi@gmail.com',
    'mandadi.jyothi123@gmail.com', 'udaypbrn@gmail.com', 'anshumanavasthi1411@gmail.com',
    'sruthythulasi2017@gmail.com', 'nagendrasingh1794@gmail.com'
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Professional User Management</h1>
          <p className="text-muted-foreground">
            Bulk management system for professional users with automatic email notifications
          </p>
        </div>

        <Alert className="mb-6">
          <Users className="h-4 w-4" />
          <AlertDescription>
            This will manage {professionalEmails.length} professional users. 
            Each user will receive Professional Plan access and email notifications.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-destructive" />
                Step 1: Cleanup
              </CardTitle>
              <CardDescription>
                Remove existing professional users (except super admin)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleBulkAction('cleanup')}
                disabled={loading}
                variant="destructive"
                className="w-full"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Clean Users'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Step 2: Create Users
              </CardTitle>
              <CardDescription>
                Create new professional users with Pro subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleBulkAction('create')}
                disabled={loading}
                className="w-full"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Users'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-secondary" />
                Step 3: Send Emails
              </CardTitle>
              <CardDescription>
                Send password setup emails to all professional users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleBulkAction('send_emails')}
                disabled={loading}
                variant="secondary"
                className="w-full"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Emails'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {results && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(results, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Professional Email List ({professionalEmails.length} users)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm max-h-60 overflow-auto">
              {professionalEmails.map((email, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                  <span className="text-xs text-muted-foreground w-8">{index + 1}.</span>
                  <span>{email}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminUserManagement;