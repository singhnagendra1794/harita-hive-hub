import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Play, Pause, Settings, Plus, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface ScheduledJob {
  id: string;
  name: string;
  description: string;
  workflow_type: string;
  schedule_type: 'fixed' | 'event' | 'continuous';
  schedule_expression: string;
  next_run: string;
  last_run: string | null;
  status: 'active' | 'paused' | 'error';
  success_rate: number;
  total_runs: number;
  estimated_duration: number;
  priority: 'low' | 'medium' | 'high';
  output_destination: string;
  notifications: boolean;
}

interface JobExecution {
  id: string;
  job_id: string;
  job_name: string;
  started_at: string;
  completed_at: string | null;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  duration: number | null;
  output_size: number | null;
  error_message: string | null;
}

const WorkflowScheduler = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('scheduled-jobs');
  const [scheduledJobs, setScheduledJobs] = useState<ScheduledJob[]>([]);
  const [jobExecutions, setJobExecutions] = useState<JobExecution[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    // Mock scheduled jobs
    setScheduledJobs([
      {
        id: '1',
        name: 'Daily Crop Health Analysis',
        description: 'Automated crop health assessment using latest satellite imagery',
        workflow_type: 'agriculture_analysis',
        schedule_type: 'fixed',
        schedule_expression: '0 6 * * *', // Daily at 6 AM
        next_run: '2024-01-24T06:00:00Z',
        last_run: '2024-01-23T06:00:00Z',
        status: 'active',
        success_rate: 0.95,
        total_runs: 84,
        estimated_duration: 25,
        priority: 'medium',
        output_destination: 'Enterprise Storage',
        notifications: true
      },
      {
        id: '2',
        name: 'Flood Risk Monitoring',
        description: 'Continuous flood risk assessment during monsoon season',
        workflow_type: 'disaster_prediction',
        schedule_type: 'event',
        schedule_expression: 'rainfall > 50mm/24h',
        next_run: 'Event-triggered',
        last_run: '2024-01-22T14:30:00Z',
        status: 'active',
        success_rate: 0.92,
        total_runs: 12,
        estimated_duration: 15,
        priority: 'high',
        output_destination: 'Emergency Dashboard',
        notifications: true
      },
      {
        id: '3',
        name: 'Urban Growth Forecasting',
        description: 'Weekly urban development pattern analysis and forecasting',
        workflow_type: 'urban_planning',
        schedule_type: 'fixed',
        schedule_expression: '0 0 * * 0', // Weekly on Sunday
        next_run: '2024-01-28T00:00:00Z',
        last_run: '2024-01-21T00:00:00Z',
        status: 'active',
        success_rate: 0.89,
        total_runs: 26,
        estimated_duration: 45,
        priority: 'low',
        output_destination: 'Planning Portal',
        notifications: false
      },
      {
        id: '4',
        name: 'Air Quality Trend Analysis',
        description: 'Bi-hourly air quality monitoring and trend analysis',
        workflow_type: 'environmental_monitoring',
        schedule_type: 'fixed',
        schedule_expression: '0 */2 * * *', // Every 2 hours
        next_run: '2024-01-23T12:00:00Z',
        last_run: '2024-01-23T10:00:00Z',
        status: 'paused',
        success_rate: 0.88,
        total_runs: 156,
        estimated_duration: 8,
        priority: 'medium',
        output_destination: 'Environmental Dashboard',
        notifications: true
      }
    ]);

    // Mock job executions
    setJobExecutions([
      {
        id: '1',
        job_id: '1',
        job_name: 'Daily Crop Health Analysis',
        started_at: '2024-01-23T06:00:00Z',
        completed_at: '2024-01-23T06:23:00Z',
        status: 'completed',
        duration: 23,
        output_size: 2.4,
        error_message: null
      },
      {
        id: '2',
        job_id: '2',
        job_name: 'Flood Risk Monitoring',
        started_at: '2024-01-22T14:30:00Z',
        completed_at: '2024-01-22T14:42:00Z',
        status: 'completed',
        duration: 12,
        output_size: 1.1,
        error_message: null
      },
      {
        id: '3',
        job_id: '4',
        job_name: 'Air Quality Trend Analysis',
        started_at: '2024-01-23T08:00:00Z',
        completed_at: null,
        status: 'failed',
        duration: null,
        output_size: null,
        error_message: 'API timeout - data source unavailable'
      }
    ]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'running':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'error':
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const toggleJobStatus = async (jobId: string) => {
    try {
      setScheduledJobs(prev => 
        prev.map(job => 
          job.id === jobId 
            ? { ...job, status: job.status === 'active' ? 'paused' as const : 'active' as const }
            : job
        )
      );
      
      toast({
        title: "Job Updated",
        description: "Scheduled job status has been updated."
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update job status.",
        variant: "destructive"
      });
    }
  };

  const createNewJob = () => {
    setShowCreateForm(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'running':
        return <Play className="h-4 w-4" />;
      case 'error':
      case 'failed':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow Scheduler</h1>
          <p className="text-muted-foreground">
            Automate GeoAI workflows with fixed intervals and event triggers
          </p>
        </div>
        <Button onClick={createNewJob}>
          <Plus className="h-4 w-4 mr-2" />
          Create Schedule
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-sm font-medium">Active Jobs</p>
                <p className="text-2xl font-bold">{scheduledJobs.filter(j => j.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm font-medium">Jobs Today</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm font-medium">Success Rate</p>
                <p className="text-2xl font-bold">91%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-sm font-medium">Next Run</p>
                <p className="text-sm font-bold">6:00 AM Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="scheduled-jobs">Scheduled Jobs</TabsTrigger>
          <TabsTrigger value="execution-history">Execution History</TabsTrigger>
          <TabsTrigger value="templates">Workflow Templates</TabsTrigger>
          <TabsTrigger value="monitoring">System Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="scheduled-jobs" className="space-y-4">
          <div className="space-y-4">
            {scheduledJobs.map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-blue-400" />
                      <div>
                        <CardTitle className="text-lg">{job.name}</CardTitle>
                        <CardDescription>{job.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(job.priority)}>
                        {job.priority.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(job.status)}>
                        {getStatusIcon(job.status)}
                        <span className="ml-1">{job.status.toUpperCase()}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Schedule Type</p>
                      <p className="text-muted-foreground capitalize">{job.schedule_type}</p>
                    </div>
                    <div>
                      <p className="font-medium">Next Run</p>
                      <p className="text-muted-foreground">
                        {job.next_run === 'Event-triggered' ? 
                          'Event-triggered' : 
                          new Date(job.next_run).toLocaleString()
                        }
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Success Rate</p>
                      <p className="text-muted-foreground">{Math.round(job.success_rate * 100)}%</p>
                    </div>
                    <div>
                      <p className="font-medium">Avg Duration</p>
                      <p className="text-muted-foreground">{job.estimated_duration} min</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Schedule Expression</p>
                      <p className="text-muted-foreground font-mono text-xs">{job.schedule_expression}</p>
                    </div>
                    <div>
                      <p className="font-medium">Output Destination</p>
                      <p className="text-muted-foreground">{job.output_destination}</p>
                    </div>
                  </div>

                  {job.last_run && (
                    <div className="text-xs text-muted-foreground">
                      Last run: {new Date(job.last_run).toLocaleString()} ({job.total_runs} total runs)
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleJobStatus(job.id)}
                    >
                      {job.status === 'active' ? (
                        <>
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Resume
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Configure
                    </Button>
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4 mr-1" />
                      Run Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="execution-history" className="space-y-4">
          <div className="space-y-4">
            {jobExecutions.map((execution) => (
              <Card key={execution.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-blue-400" />
                      <div>
                        <CardTitle className="text-lg">{execution.job_name}</CardTitle>
                        <CardDescription>
                          Started: {new Date(execution.started_at).toLocaleString()}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(execution.status)}>
                      {getStatusIcon(execution.status)}
                      <span className="ml-1">{execution.status.toUpperCase()}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    {execution.duration && (
                      <div>
                        <p className="font-medium">Duration</p>
                        <p className="text-muted-foreground">{execution.duration} minutes</p>
                      </div>
                    )}
                    {execution.output_size && (
                      <div>
                        <p className="font-medium">Output Size</p>
                        <p className="text-muted-foreground">{execution.output_size} GB</p>
                      </div>
                    )}
                    {execution.completed_at && (
                      <div>
                        <p className="font-medium">Completed</p>
                        <p className="text-muted-foreground">
                          {new Date(execution.completed_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {execution.error_message && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded text-sm">
                      <p className="font-medium text-red-400">Error:</p>
                      <p className="text-red-300">{execution.error_message}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <p className="text-lg font-medium">Workflow Templates</p>
              <p className="text-muted-foreground">Pre-configured scheduling templates for common workflows</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <p className="text-lg font-medium">System Monitoring</p>
              <p className="text-muted-foreground">Real-time monitoring of scheduler performance and resource usage</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Job Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl m-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Create Scheduled Job</CardTitle>
                <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Job Name</label>
                  <Input placeholder="Enter job name..." />
                </div>
                <div>
                  <label className="text-sm font-medium">Workflow Type</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select workflow..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agriculture">Agriculture Analysis</SelectItem>
                      <SelectItem value="urban">Urban Planning</SelectItem>
                      <SelectItem value="disaster">Disaster Management</SelectItem>
                      <SelectItem value="climate">Climate Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Schedule Expression</label>
                <Input placeholder="0 6 * * * (cron expression)" />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button>
                  Create Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WorkflowScheduler;