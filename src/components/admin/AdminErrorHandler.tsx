import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, Eye, Trash2, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminError {
  id: string;
  error_type: string;
  error_message: string;
  context_data: any;
  resolved: boolean;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

const AdminErrorHandler = () => {
  const [errors, setErrors] = useState<AdminError[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchErrors();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchErrors, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchErrors = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_errors')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setErrors(data || []);
    } catch (error) {
      console.error('Error fetching admin errors:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch error logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsResolved = async (errorId: string) => {
    try {
      const { error } = await supabase
        .from('admin_errors')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', errorId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Error marked as resolved',
      });

      fetchErrors();
    } catch (error) {
      console.error('Error marking as resolved:', error);
      toast({
        title: 'Error',
        description: 'Failed to update error status',
        variant: 'destructive',
      });
    }
  };

  const deleteError = async (errorId: string) => {
    try {
      const { error } = await supabase
        .from('admin_errors')
        .delete()
        .eq('id', errorId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Error log deleted',
      });

      fetchErrors();
    } catch (error) {
      console.error('Error deleting error log:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete error log',
        variant: 'destructive',
      });
    }
  };

  const sendAlertEmail = async (error: AdminError) => {
    try {
      const { error: emailError } = await supabase.functions.invoke('send-admin-alert', {
        body: {
          errorType: error.error_type,
          errorMessage: error.error_message,
          context: error.context_data,
          timestamp: error.created_at,
        },
      });

      if (emailError) throw emailError;

      toast({
        title: 'Success',
        description: 'Alert email sent to admin',
      });
    } catch (error) {
      console.error('Error sending alert email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send alert email',
        variant: 'destructive',
      });
    }
  };

  const getErrorSeverity = (errorType: string) => {
    const criticalTypes = ['youtube_api_failure', 'obs_sync_failure', 'auth_failure'];
    const warningTypes = ['recording_fetch_failure', 'thumbnail_upload_failure'];
    
    if (criticalTypes.includes(errorType)) return 'critical';
    if (warningTypes.includes(errorType)) return 'warning';
    return 'info';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-blue-500/20 text-blue-400';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading error logs...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Error Monitoring Dashboard
          </span>
          <Button onClick={fetchErrors} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {errors.length === 0 ? (
          <Alert>
            <AlertDescription>No errors found. System is running smoothly!</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {errors.map((error) => {
              const severity = getErrorSeverity(error.error_type);
              
              return (
                <div key={error.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getSeverityColor(severity)}>
                          {severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {error.error_type.replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                        {error.resolved && (
                          <Badge variant="secondary">RESOLVED</Badge>
                        )}
                      </div>
                      
                      <h4 className="font-medium mb-2">{error.error_message}</h4>
                      
                      <div className="text-sm text-muted-foreground">
                        <p>Time: {new Date(error.created_at).toLocaleString()}</p>
                        {error.context_data && (
                          <details className="mt-2">
                            <summary className="cursor-pointer hover:text-foreground">
                              View Context Data
                            </summary>
                            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                              {JSON.stringify(error.context_data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {severity === 'critical' && !error.resolved && (
                        <Button
                          onClick={() => sendAlertEmail(error)}
                          variant="destructive"
                          size="sm"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {!error.resolved && (
                        <Button
                          onClick={() => markAsResolved(error.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => deleteError(error.id)}
                        variant="ghost"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminErrorHandler;