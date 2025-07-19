import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, CheckCircle, XCircle, AlertCircle, Play, 
  Pause, Trash2, RotateCcw, Eye, Download
} from 'lucide-react';

interface AnalysisJob {
  id: string;
  toolName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  inputFiles: string[];
  outputFiles: string[];
  parameters: Record<string, any>;
  createdAt: Date;
  completedAt?: Date;
  errorMessage?: string;
}

interface JobQueueProps {
  jobs: AnalysisJob[];
  onJobUpdate: (jobId: string, updates: Partial<AnalysisJob>) => void;
}

const JobQueue: React.FC<JobQueueProps> = ({ jobs, onJobUpdate }) => {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const getStatusIcon = (status: AnalysisJob['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'processing':
        return <Play className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: AnalysisJob['status']) => {
    const variants = {
      pending: 'secondary',
      processing: 'default',
      completed: 'default',
      failed: 'destructive'
    } as const;

    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleRetryJob = (jobId: string) => {
    onJobUpdate(jobId, {
      status: 'pending',
      progress: 0,
      errorMessage: undefined
    });
  };

  const handleCancelJob = (jobId: string) => {
    onJobUpdate(jobId, {
      status: 'failed',
      errorMessage: 'Cancelled by user'
    });
  };

  const handleDeleteJob = (jobId: string) => {
    // In a real implementation, this would remove the job from the list
    console.log('Deleting job:', jobId);
  };

  const formatDuration = (startDate: Date, endDate?: Date) => {
    const end = endDate || new Date();
    const diffMs = end.getTime() - startDate.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    
    if (diffMins === 0) {
      return `${diffSecs}s`;
    } else if (diffMins < 60) {
      return `${diffMins}m ${diffSecs % 60}s`;
    } else {
      const diffHours = Math.floor(diffMins / 60);
      return `${diffHours}h ${diffMins % 60}m`;
    }
  };

  const groupedJobs = {
    active: jobs.filter(job => job.status === 'pending' || job.status === 'processing'),
    completed: jobs.filter(job => job.status === 'completed'),
    failed: jobs.filter(job => job.status === 'failed')
  };

  const totalJobs = jobs.length;
  const runningJobs = groupedJobs.active.filter(job => job.status === 'processing').length;

  return (
    <div className="space-y-6">
      {/* Queue Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Analysis Queue</CardTitle>
              <CardDescription>
                Track your spatial analysis jobs
              </CardDescription>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold">{totalJobs}</div>
                <div className="text-muted-foreground text-xs">Total</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-600">{runningJobs}</div>
                <div className="text-muted-foreground text-xs">Running</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">{groupedJobs.completed.length}</div>
                <div className="text-muted-foreground text-xs">Completed</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Job List */}
      {totalJobs === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium text-lg mb-2">No Analysis Jobs</h3>
            <p className="text-muted-foreground">
              Run spatial analysis tools to see job progress here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Active Jobs */}
          {groupedJobs.active.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Active Jobs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {groupedJobs.active.map((job) => (
                  <div key={job.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(job.status)}
                        <div>
                          <h4 className="font-medium text-sm">{job.toolName}</h4>
                          <p className="text-xs text-muted-foreground">
                            Started {formatDuration(job.createdAt)} ago
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(job.status)}
                        {job.status === 'processing' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelJob(job.id)}
                          >
                            <Pause className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {job.status === 'processing' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{job.progress}%</span>
                        </div>
                        <Progress value={job.progress} className="h-2" />
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      Input: {job.inputFiles.length} file(s) • 
                      Output: {job.outputFiles.length} file(s)
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Completed Jobs */}
          {groupedJobs.completed.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Completed Jobs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {groupedJobs.completed.map((job) => (
                  <div key={job.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(job.status)}
                        <div>
                          <h4 className="font-medium text-sm">{job.toolName}</h4>
                          <p className="text-xs text-muted-foreground">
                            Completed in {formatDuration(job.createdAt, job.completedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(job.status)}
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Generated {job.outputFiles.length} output file(s)
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Failed Jobs */}
          {groupedJobs.failed.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Failed Jobs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {groupedJobs.failed.map((job) => (
                  <div key={job.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(job.status)}
                        <div>
                          <h4 className="font-medium text-sm">{job.toolName}</h4>
                          <p className="text-xs text-muted-foreground">
                            Failed after {formatDuration(job.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(job.status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRetryJob(job.id)}
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteJob(job.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {job.errorMessage && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                        {job.errorMessage}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default JobQueue;