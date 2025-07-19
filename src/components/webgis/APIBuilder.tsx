import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Code, 
  Plus, 
  Play, 
  Globe, 
  Key, 
  Database, 
  Webhook, 
  Copy,
  ExternalLink,
  Settings,
  TestTube
} from 'lucide-react';

interface APIBuilderProps {
  projectId: string;
}

const APIBuilder: React.FC<APIBuilderProps> = ({ projectId }) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);

  const endpoints = [
    {
      id: '1',
      name: 'Get Map Data',
      method: 'GET',
      path: '/api/maps/{id}/data',
      description: 'Retrieve GeoJSON data for a specific map',
      status: 'active',
      calls: 1247,
      lastCalled: '2 minutes ago'
    },
    {
      id: '2',
      name: 'Create Layer',
      method: 'POST',
      path: '/api/layers',
      description: 'Create a new map layer with data',
      status: 'active',
      calls: 89,
      lastCalled: '1 hour ago'
    },
    {
      id: '3',
      name: 'Spatial Query',
      method: 'POST',
      path: '/api/query/spatial',
      description: 'Execute spatial queries on datasets',
      status: 'beta',
      calls: 45,
      lastCalled: '3 hours ago'
    }
  ];

  const webhooks = [
    {
      id: '1',
      name: 'Data Updated',
      url: 'https://webhook.site/abc123',
      events: ['layer.created', 'layer.updated', 'layer.deleted'],
      status: 'active',
      lastTriggered: '5 minutes ago'
    },
    {
      id: '2',
      name: 'Zapier Integration',
      url: 'https://hooks.zapier.com/hooks/catch/123456/abc123/',
      events: ['analysis.completed', 'export.finished'],
      status: 'active',
      lastTriggered: '2 hours ago'
    }
  ];

  const apiKeys = [
    {
      id: '1',
      name: 'Production Key',
      key: 'wgis_prod_abc123...',
      permissions: ['read', 'write'],
      lastUsed: '2 minutes ago',
      created: '2024-01-15'
    },
    {
      id: '2',
      name: 'Development Key',
      key: 'wgis_dev_xyz789...',
      permissions: ['read'],
      lastUsed: '1 day ago',
      created: '2024-02-01'
    }
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'POST': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'PUT': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'beta': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'deprecated': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleCreateEndpoint = () => {
    setShowCreateDialog(false);
    // Handle endpoint creation
  };

  const testEndpoint = (endpoint: any) => {
    console.log('Testing endpoint:', endpoint);
    // Implement endpoint testing
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Code className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>API Builder</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Create and manage custom API endpoints and webhooks
                </p>
              </div>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Endpoint
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create API Endpoint</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Endpoint Name</Label>
                      <Input id="name" placeholder="Get User Data" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="method">HTTP Method</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="path">API Path</Label>
                    <Input id="path" placeholder="/api/users/{id}" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="What does this endpoint do?" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="code">Function Code</Label>
                    <Textarea 
                      id="code" 
                      className="font-mono text-sm"
                      rows={10}
                      placeholder={`// TypeScript/JavaScript function
export async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  // Your logic here
  const data = await getData(id);
  
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
}`}
                    />
                  </div>
                  
                  <Button onClick={handleCreateEndpoint} className="w-full">
                    Create Endpoint
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="endpoints" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
        </TabsList>

        {/* API Endpoints Tab */}
        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints ({endpoints.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {endpoints.map((endpoint) => (
                  <div key={endpoint.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <Badge className={getMethodColor(endpoint.method)}>
                          {endpoint.method}
                        </Badge>
                        <div>
                          <h4 className="font-semibold">{endpoint.name}</h4>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <code className="bg-muted px-2 py-1 rounded text-xs">
                              {endpoint.path}
                            </code>
                            <span>•</span>
                            <span>{endpoint.calls} calls</span>
                            <span>•</span>
                            <span>Last: {endpoint.lastCalled}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(endpoint.status)}>
                        {endpoint.status}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => testEndpoint(endpoint)}
                      >
                        <TestTube className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Webhooks ({webhooks.length})</CardTitle>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Webhook
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Webhook className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h4 className="font-semibold">{webhook.name}</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <code className="bg-muted px-2 py-1 rounded text-xs">
                            {webhook.url}
                          </code>
                          <span>•</span>
                          <span>Last: {webhook.lastTriggered}</span>
                        </div>
                        <div className="flex gap-1 mt-2">
                          {webhook.events.map((event) => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(webhook.status)}>
                        {webhook.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="keys" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>API Keys ({apiKeys.length})</CardTitle>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Generate Key
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Key className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h4 className="font-semibold">{apiKey.name}</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <code className="bg-muted px-2 py-1 rounded text-xs">
                            {apiKey.key}
                          </code>
                          <span>•</span>
                          <span>Created: {apiKey.created}</span>
                          <span>•</span>
                          <span>Last used: {apiKey.lastUsed}</span>
                        </div>
                        <div className="flex gap-1 mt-2">
                          {apiKey.permissions.map((permission) => (
                            <Badge key={permission} variant="outline" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* API Documentation Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            API Documentation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded p-4">
            <p className="text-sm text-muted-foreground mb-4">
              Auto-generated API documentation for your custom endpoints:
            </p>
            <div className="flex items-center gap-2">
              <code className="bg-background px-3 py-2 rounded text-sm flex-1">
                https://api.webgis.com/projects/{projectId}/docs
              </code>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default APIBuilder;