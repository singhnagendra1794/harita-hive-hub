import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Download,
  RefreshCw,
  Eye,
  Trash2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface JobQueueProps {
  jobStats: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
  onJobUpdate: () => void;
}

interface Job {
  id: string;
  job_type: string;
  status: string;
  progress: number;
  input_files: any[];
  output_files: any[];
  parameters: any;
  error_message?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

const JobQueue = ({ jobStats, onJobUpdate }: JobQueueProps) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    fetchJobs();
    
    // Subscribe to job updates
    const channel = supabase
      .channel('job_updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'geo_processing_jobs',
          filter: `user_id=eq.${user?.id}`
        }, 
        () => {
          fetchJobs();
          onJobUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, onJobUpdate]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('geo_processing_jobs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data?.map(job => ({
        ...job,
        input_files: Array.isArray(job.input_files) ? job.input_files : [],
        output_files: Array.isArray(job.output_files) ? job.output_files : [],
        parameters: typeof job.parameters === 'object' ? job.parameters : {}
      })) || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'processing': return 'default';
      case 'completed': return 'outline';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'processing': return Activity;
      case 'completed': return CheckCircle;
      case 'failed': return XCircle;
      default: return Clock;
    }
  };

  const formatJobType = (jobType: string) => {
    return jobType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const downloadFile = async (fileName: string, filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('geo-processing')
        .download(filePath);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);

    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const cancelJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('geo_processing_jobs')
        .update({ status: 'failed', error_message: 'Cancelled by user' })
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: "Job Cancelled",
        description: "The processing job has been cancelled",
      });

      fetchJobs();
    } catch (error: any) {
      toast({
        title: "Cancel Failed",
        description: error.message || "Failed to cancel job",
        variant: "destructive",
      });
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('geo_processing_jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: "Job Deleted",
        description: "The job has been removed from your queue",
      });

      fetchJobs();
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete job",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading jobs...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{jobStats.pending}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{jobStats.processing}</div>
                <div className="text-xs text-muted-foreground">Processing</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{jobStats.completed}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{jobStats.failed}</div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Processing Jobs
            </CardTitle>
            <Button variant="outline" size="sm" onClick={fetchJobs}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No processing jobs yet</p>
              <p className="text-sm">Upload files and start processing to see jobs here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
                const StatusIcon = getStatusIcon(job.status);
                return (
                  <Card key={job.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <StatusIcon className="h-5 w-5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{formatJobType(job.job_type)}</h3>
                              <Badge variant={getStatusColor(job.status)}>
                                {job.status}
                              </Badge>
                            </div>
                            
                            <div className="text-sm text-muted-foreground mb-2">
                              Created {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                              {job.completed_at && (
                                <span> • Completed {formatDistanceToNow(new Date(job.completed_at), { addSuffix: true })}</span>
                              )}
                            </div>

                            {job.status === 'processing' && (
                              <div className="mb-2">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>Progress</span>
                                  <span>{job.progress}%</span>
                                </div>
                                <Progress value={job.progress} className="w-full" />
                              </div>
                            )}

                            {job.error_message && (
                              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                {job.error_message}
                              </div>
                            )}

                            <div className="text-xs text-muted-foreground">
                              Input files: {job.input_files.length} • 
                              Output files: {job.output_files.length}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedJob(job)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {job.status === 'completed' && job.output_files.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                job.output_files.forEach((file: any) => {
                                  downloadFile(file.name || 'result.zip', file.path);
                                });
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}

                          {(job.status === 'pending' || job.status === 'processing') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => cancelJob(job.id)}
                            >
                              Cancel
                            </Button>
                          )}

                          {(job.status === 'completed' || job.status === 'failed') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteJob(job.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Details Modal */}
      {selectedJob && (
        <Card className="fixed inset-4 z-50 bg-background border shadow-lg overflow-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Job Details: {formatJobType(selectedJob.job_type)}</CardTitle>
              <Button variant="ghost" onClick={() => setSelectedJob(null)}>
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Status</h4>
                <Badge variant={getStatusColor(selectedJob.status)}>
                  {selectedJob.status}
                </Badge>
              </div>

              <div>
                <h4 className="font-medium mb-2">Parameters</h4>
                <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                  {JSON.stringify(selectedJob.parameters, null, 2)}
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-2">Input Files</h4>
                <div className="space-y-1">
                  {selectedJob.input_files.map((file, index) => (
                    <div key={index} className="text-sm bg-muted p-2 rounded">
                      {file}
                    </div>
                  ))}
                </div>
              </div>

              {selectedJob.output_files.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Output Files</h4>
                  <div className="space-y-1">
                    {selectedJob.output_files.map((file: any, index) => (
                      <div key={index} className="text-sm bg-muted p-2 rounded flex justify-between items-center">
                        <span>{file.name || file.path}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadFile(file.name || 'result', file.path)}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JobQueue;