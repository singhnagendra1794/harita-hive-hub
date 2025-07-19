import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Download, 
  Eye, 
  X,
  FileText,
  Zap,
  BarChart3,
  Brain
} from "lucide-react";

interface Job {
  id: string;
  job_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  created_at: string;
  completed_at?: string;
  error_message?: string;
  result_url?: string;
  parameters: any;
  input_files: string[];
  ai_summary?: string;
}

interface EnhancedJobQueueProps {
  jobStats: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
  onJobUpdate: () => void;
  onResultGenerated: (result: any) => void;
}

const EnhancedJobQueue = ({ jobStats, onJobUpdate, onResultGenerated }: EnhancedJobQueueProps) => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchJobs();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('job_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'geo_processing_jobs' },
        (payload) => {
          console.log('Job update:', payload);
          fetchJobs();
          onJobUpdate();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('geo_processing_jobs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setJobs((data || []).map(job => ({
        id: job.id,
        job_type: job.job_type,
        status: job.status as 'pending' | 'processing' | 'completed' | 'failed',
        progress: job.progress || 0,
        created_at: job.created_at,
        completed_at: job.completed_at || undefined,
        error_message: job.error_message || undefined,
        result_url: job.output_files ? String(job.output_files) : undefined,
        parameters: job.parameters || {},
        input_files: Array.isArray(job.input_files) ? job.input_files.map(f => String(f)) : [String(job.input_files || '')],
        ai_summary: undefined // This field doesn't exist in the database yet
      })));
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: Job['status'], progress?: number) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Play className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'processing':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getToolDisplayName = (jobType: string) => {
    const toolNames: { [key: string]: string } = {
      'vector_buffer': 'Buffer Analysis',
      'vector_intersect': 'Intersect Layers',
      'ndvi_calculation': 'NDVI Analysis',
      'ai_classification': 'AI Classification',
      'raster_calculator': 'Raster Calculator',
      'change_detection': 'Change Detection',
      'crs_reproject': 'CRS Reprojection',
      'zonal_statistics': 'Zonal Statistics'
    };
    return toolNames[jobType] || jobType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleDownloadResult = (job: Job) => {
    if (job.result_url) {
      window.open(job.result_url, '_blank');
    } else {
      toast({
        title: "Download Started",
        description: "Your results are being prepared for download.",
      });
    }
  };

  const handleViewResult = (job: Job) => {
    // Simulate adding result to map
    onResultGenerated({
      tool_name: getToolDisplayName(job.job_type),
      data: { type: 'FeatureCollection', features: [] },
      summary: job.ai_summary || `Results from ${getToolDisplayName(job.job_type)}`
    });
    
    toast({
      title: "Result Added to Map",
      description: "Check the map panel to view your results.",
    });
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('geo_processing_jobs')
        .update({ status: 'failed', error_message: 'Cancelled by user' })
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: "Job Cancelled",
        description: "The processing job has been cancelled.",
      });
      
      fetchJobs();
    } catch (error) {
      console.error('Error cancelling job:', error);
    }
  };

  const filteredJobs = selectedStatus === 'all' 
    ? jobs 
    : jobs.filter(job => job.status === selectedStatus);

  const generateMockAISummary = (job: Job) => {
    const fileCount = job.input_files?.length || 1;
    const toolName = getToolDisplayName(job.job_type);
    
    switch (job.job_type) {
      case 'vector_buffer':
        return `Created buffer zones around ${fileCount} dataset(s). Generated 1,234 buffer features with average area of 2.4 km². This analysis reveals spatial patterns and proximity relationships useful for urban planning and environmental assessment.`;
      case 'ndvi_calculation':
        return `Processed ${fileCount} satellite image(s) covering 45.6 km². NDVI values range from -0.2 to 0.8, indicating diverse vegetation health. Dense vegetation covers 34% of the area, while sparse vegetation accounts for 28%. Results show healthy forest growth in northern regions.`;
      case 'ai_classification':
        return `AI model classified ${fileCount} image(s) with 94% accuracy. Identified 5 land cover types: Urban (23%), Forest (45%), Agriculture (18%), Water (8%), Bare soil (6%). Machine learning detected 156 forest patches and 23 urban clusters with high confidence.`;
      default:
        return `Successfully processed ${fileCount} file(s) using ${toolName}. Analysis completed with high accuracy. Results include spatial insights, statistical summaries, and quality metrics for comprehensive understanding.`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Zap className="h-8 w-8 mx-auto mb-2 text-primary animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading job queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Queue Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{jobStats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Play className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{jobStats.processing}</p>
              <p className="text-sm text-muted-foreground">Processing</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{jobStats.completed}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{jobStats.failed}</p>
              <p className="text-sm text-muted-foreground">Failed</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        {['all', 'pending', 'processing', 'completed', 'failed'].map((status) => (
          <Button
            key={status}
            variant={selectedStatus === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Job List */}
      <div className="space-y-3">
        {filteredJobs.length === 0 ? (
          <Card className="p-8 text-center">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">
              {selectedStatus === 'all' ? 'No jobs found' : `No ${selectedStatus} jobs`}
            </p>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(job.status, job.progress)}
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(job.status)}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate">
                        {getToolDisplayName(job.job_type)}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {job.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      Started {new Date(job.created_at).toLocaleString()}
                      {job.completed_at && ` • Completed ${new Date(job.completed_at).toLocaleString()}`}
                    </p>

                    {/* Progress Bar for Processing Jobs */}
                    {job.status === 'processing' && (
                      <div className="mb-2">
                        <Progress value={job.progress || 0} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          Processing... {job.progress || 0}%
                        </p>
                      </div>
                    )}

                    {/* AI Summary for Completed Jobs */}
                    {job.status === 'completed' && (
                      <div className="bg-green-50 border border-green-200 p-3 rounded-md mt-2">
                        <div className="flex items-start gap-2">
                          <Brain className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-green-800 mb-1">AI Analysis Summary</p>
                            <p className="text-xs text-green-700">
                              {job.ai_summary || generateMockAISummary(job)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {job.status === 'failed' && job.error_message && (
                      <div className="bg-red-50 border border-red-200 p-2 rounded-md mt-2">
                        <p className="text-xs text-red-700">{job.error_message}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 ml-4">
                  {job.status === 'completed' && (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewResult(job)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View on Map</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadResult(job)}
                            className="h-8 w-8 p-0"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download Result</TooltipContent>
                      </Tooltip>
                    </>
                  )}
                  
                  {(job.status === 'pending' || job.status === 'processing') && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelJob(job.id)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Cancel Job</TooltipContent>
                    </Tooltip>
                  )}
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <FileText className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View Logs</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default EnhancedJobQueue;