import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Clock, 
  Plus, 
  Play, 
  Pause, 
  Settings, 
  Mail, 
  Database, 
  Code, 
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Timer,
  Globe,
  FileText,
  Bell
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AutomationEngineProps {
  projectId: string;
}

const AutomationEngine: React.FC<AutomationEngineProps> = ({ projectId }) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [zapierWebhookUrl, setZapierWebhookUrl] = useState('');
  const { toast } = useToast();

  const automations = [
    {
      id: '1',
      name: 'Daily Data Sync',
      type: 'scheduled',
      status: 'active',
      schedule: '0 6 * * *', // Daily at 6 AM
      nextRun: '6 hours',
      lastRun: '18 hours ago',
      success: true,
      description: 'Sync external datasets with internal database',
      actions: 3
    },
    {
      id: '2',
      name: 'Change Detection Alert',
      type: 'event',
      status: 'active',
      trigger: 'data_updated',
      nextRun: 'On trigger',
      lastRun: '2 hours ago',
      success: true,
      description: 'Notify team when significant changes detected',
      actions: 5
    },
    {
      id: '3',
      name: 'Weekly Report Generation',
      type: 'scheduled',
      status: 'paused',
      schedule: '0 9 * * 1', // Mondays at 9 AM
      nextRun: 'Paused',
      lastRun: '1 week ago',
      success: false,
      description: 'Generate and email weekly analysis reports',
      actions: 4
    }
  ];

  const triggers = [
    { id: 'schedule', name: 'Schedule', icon: Clock, description: 'Run at specific times' },
    { id: 'data_change', name: 'Data Change', icon: Database, description: 'When data is modified' },
    { id: 'webhook', name: 'Webhook', icon: Globe, description: 'External system triggers' },
    { id: 'file_upload', name: 'File Upload', icon: FileText, description: 'When files are uploaded' }
  ];

  const actions = [
    { id: 'email', name: 'Send Email', icon: Mail, description: 'Send notification emails' },
    { id: 'webhook', name: 'Call Webhook', icon: Globe, description: 'Trigger external services' },
    { id: 'export', name: 'Export Data', icon: FileText, description: 'Generate reports or files' },
    { id: 'analysis', name: 'Run Analysis', icon: Activity, description: 'Execute spatial analysis' },
    { id: 'script', name: 'Custom Script', icon: Code, description: 'Run Python/JavaScript code' }
  ];

  const recentExecutions = [
    {
      id: '1',
      automation: 'Daily Data Sync',
      startTime: '2024-02-15 06:00:00',
      duration: '2m 34s',
      status: 'success',
      recordsProcessed: 15420
    },
    {
      id: '2',
      automation: 'Change Detection Alert',
      startTime: '2024-02-15 14:23:15',
      duration: '45s',
      status: 'success',
      recordsProcessed: 892
    },
    {
      id: '3',
      automation: 'Weekly Report Generation',
      startTime: '2024-02-12 09:00:00',
      duration: '1m 12s',
      status: 'failed',
      error: 'Email service unavailable'
    }
  ];

  const getStatusIcon = (status: string, success?: boolean) => {
    if (status === 'active') {
      return success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />;
    } else if (status === 'paused') {
      return <Pause className="h-4 w-4 text-yellow-500" />;
    }
    return <Clock className="h-4 w-4 text-gray-500" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'running': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleTriggerZapier = async () => {
    if (!zapierWebhookUrl) {
      toast({
        title: "Error",
        description: "Please enter your Zapier webhook URL",
        variant: "destructive",
      });
      return;
    }

    try {
      await fetch(zapierWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          project_id: projectId,
          triggered_from: "WebGIS Automation Engine",
          data: {
            automation_type: "manual_trigger",
            message: "Automation test from WebGIS platform"
          }
        }),
      });

      toast({
        title: "Zapier Triggered",
        description: "The webhook was sent to Zapier. Check your Zap's history to confirm.",
      });
    } catch (error) {
      console.error("Error triggering webhook:", error);
      toast({
        title: "Error",
        description: "Failed to trigger the Zapier webhook.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Automation Engine</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Automate workflows, schedules, and integrations
                </p>
              </div>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Automation
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Automation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="auto-name">Automation Name</Label>
                    <Input id="auto-name" placeholder="Daily report generation" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Trigger</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trigger type" />
                      </SelectTrigger>
                      <SelectContent>
                        {triggers.map((trigger) => (
                          <SelectItem key={trigger.id} value={trigger.id}>
                            <div className="flex items-center gap-2">
                              <trigger.icon className="h-4 w-4" />
                              <span>{trigger.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="schedule">Schedule (Cron)</Label>
                    <Input id="schedule" placeholder="0 6 * * *" />
                    <p className="text-xs text-muted-foreground">
                      Use cron syntax. Example: "0 6 * * *" for daily at 6 AM
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Actions</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {actions.map((action) => (
                        <Button
                          key={action.id}
                          variant="outline"
                          className="h-auto p-3 justify-start"
                        >
                          <action.icon className="h-4 w-4 mr-2" />
                          <div className="text-left">
                            <div className="text-sm font-medium">{action.name}</div>
                            <div className="text-xs text-muted-foreground">{action.description}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <Button className="w-full">Create Automation</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="automations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="automations">Automations</TabsTrigger>
          <TabsTrigger value="executions">Execution History</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* Automations Tab */}
        <TabsContent value="automations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {automations.map((automation) => (
              <Card key={automation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(automation.status, automation.success)}
                      <h4 className="font-semibold text-sm">{automation.name}</h4>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {automation.type}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-3">
                    {automation.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Next run:</span>
                      <span className="font-medium">{automation.nextRun}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Last run:</span>
                      <span className="font-medium">{automation.lastRun}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Actions:</span>
                      <span className="font-medium">{automation.actions}</span>
                    </div>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm">
                      <Settings className="h-3 w-3" />
                    </Button>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <Play className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        {automation.status === 'active' ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Execution History Tab */}
        <TabsContent value="executions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentExecutions.map((execution) => (
                  <div key={execution.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        {execution.status === 'success' ? (
                          <CheckCircle className="h-8 w-8 text-green-500" />
                        ) : execution.status === 'failed' ? (
                          <XCircle className="h-8 w-8 text-red-500" />
                        ) : (
                          <Timer className="h-8 w-8 text-blue-500" />
                        )}
                        <div>
                          <h4 className="font-semibold">{execution.automation}</h4>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{execution.startTime}</span>
                            <span>•</span>
                            <span>Duration: {execution.duration}</span>
                            {execution.recordsProcessed && (
                              <>
                                <span>•</span>
                                <span>{execution.recordsProcessed.toLocaleString()} records</span>
                              </>
                            )}
                          </div>
                          {execution.status === 'failed' && execution.error && (
                            <div className="text-sm text-red-600 mt-1">
                              Error: {execution.error}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Badge className={getStatusColor(execution.status)}>
                      {execution.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>External Integrations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Zapier Integration */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="h-8 w-8 text-orange-500" />
                  <div>
                    <h4 className="font-semibold">Zapier Integration</h4>
                    <p className="text-sm text-muted-foreground">
                      Connect with 5000+ apps through Zapier
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="zapier-webhook">Zapier Webhook URL</Label>
                    <Input
                      id="zapier-webhook"
                      placeholder="https://hooks.zapier.com/hooks/catch/..."
                      value={zapierWebhookUrl}
                      onChange={(e) => setZapierWebhookUrl(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Create a Zap with a webhook trigger and paste the URL here
                    </p>
                  </div>
                  
                  <Button onClick={handleTriggerZapier} className="w-full">
                    <Zap className="h-4 w-4 mr-2" />
                    Test Zapier Connection
                  </Button>
                </div>
              </div>

              {/* Email Integration */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="h-8 w-8 text-blue-500" />
                  <div>
                    <h4 className="font-semibold">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Send automated email alerts and reports
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Email Service</div>
                    <div className="text-xs text-muted-foreground">Resend integration active</div>
                  </div>
                  <Badge variant="default">Connected</Badge>
                </div>
              </div>

              {/* Database Integration */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Database className="h-8 w-8 text-green-500" />
                  <div>
                    <h4 className="font-semibold">Database Connections</h4>
                    <p className="text-sm text-muted-foreground">
                      Connect to external databases for data sync
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">PostgreSQL</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">MySQL</span>
                    <Badge variant="outline">Available</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">MongoDB</span>
                    <Badge variant="outline">Available</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomationEngine;