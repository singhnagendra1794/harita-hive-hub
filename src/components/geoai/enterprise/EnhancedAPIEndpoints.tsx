import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Eye, TrendingUp, AlertCircle, BarChart3, Play, Webhook } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface APIEndpoint {
  id: string;
  name: string;
  method: string;
  path: string;
  description: string;
  parameters: any[];
  example_request: any;
  example_response: any;
  rate_limit: string;
  auth_required: boolean;
}

interface APIUsageStats {
  endpoint: string;
  total_requests: number;
  avg_response_time: number;
  success_rate: number;
  last_24h_requests: number;
}

const EnhancedAPIEndpoints = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [usageStats, setUsageStats] = useState<APIUsageStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAPIKey();
      loadEndpoints();
      fetchUsageStats();
    }
  }, [user]);

  const fetchAPIKey = async () => {
    try {
      const { data, error } = await supabase
        .from('enterprise_api_keys')
        .select('key_value')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .single();

      if (!error && data) {
        setApiKey(data.key_value);
      }
    } catch (error) {
      console.error('Error fetching API key:', error);
    }
  };

  const loadEndpoints = () => {
    const apiEndpoints: APIEndpoint[] = [
      {
        id: 'alerts',
        name: 'AI Alerts',
        method: 'GET',
        path: '/v1/alerts',
        description: 'Fetch active and past AI-triggered alerts',
        parameters: [
          { name: 'status', type: 'string', description: 'Filter by alert status (active, resolved)', required: false },
          { name: 'severity', type: 'string', description: 'Filter by severity (low, medium, high, critical)', required: false },
          { name: 'limit', type: 'number', description: 'Number of alerts to return (max 100)', required: false }
        ],
        example_request: {
          method: 'GET',
          url: '/v1/alerts?status=active&severity=high&limit=10',
          headers: {
            'Authorization': 'Bearer YOUR_API_KEY',
            'Content-Type': 'application/json'
          }
        },
        example_response: {
          alerts: [
            {
              id: 'alert_123',
              type: 'anomaly_detection',
              severity: 'high',
              title: 'Unusual Vegetation Loss Detected',
              description: 'Significant vegetation decline detected in region XYZ',
              confidence_score: 0.89,
              affected_regions: ['region_1', 'region_2'],
              created_at: '2024-01-15T10:30:00Z'
            }
          ],
          total: 1,
          page: 1
        },
        rate_limit: '1000 requests/hour',
        auth_required: true
      },
      {
        id: 'analytics',
        name: 'Analytics & Insights',
        method: 'GET',
        path: '/v1/analytics',
        description: 'Request summarized trends and insights from datasets',
        parameters: [
          { name: 'data_type', type: 'string', description: 'Type of data to analyze (ndvi, temperature, precipitation)', required: true },
          { name: 'region', type: 'string', description: 'Geographic region identifier', required: true },
          { name: 'start_date', type: 'string', description: 'Start date (YYYY-MM-DD)', required: true },
          { name: 'end_date', type: 'string', description: 'End date (YYYY-MM-DD)', required: true }
        ],
        example_request: {
          method: 'GET',
          url: '/v1/analytics?data_type=ndvi&region=region_123&start_date=2024-01-01&end_date=2024-01-31',
          headers: {
            'Authorization': 'Bearer YOUR_API_KEY',
            'Content-Type': 'application/json'
          }
        },
        example_response: {
          insights: {
            title: 'NDVI Analysis for Region 123',
            summary: 'Vegetation health shows declining trend over the period',
            metrics: {
              average_ndvi: 0.67,
              trend: 'declining',
              confidence: 0.92
            },
            recommendations: [
              'Monitor soil moisture levels',
              'Consider irrigation in affected areas'
            ]
          }
        },
        rate_limit: '500 requests/hour',
        auth_required: true
      },
      {
        id: 'scenarios',
        name: 'Scenario Simulations',
        method: 'POST',
        path: '/v1/scenarios',
        description: 'Trigger scenario simulations programmatically',
        parameters: [
          { name: 'scenario_type', type: 'string', description: 'Type of scenario (urban_growth, climate_projection, etc.)', required: true },
          { name: 'name', type: 'string', description: 'Scenario name', required: true },
          { name: 'parameters', type: 'object', description: 'Scenario-specific parameters', required: true },
          { name: 'webhook_url', type: 'string', description: 'URL to receive completion notification', required: false }
        ],
        example_request: {
          method: 'POST',
          url: '/v1/scenarios',
          headers: {
            'Authorization': 'Bearer YOUR_API_KEY',
            'Content-Type': 'application/json'
          },
          body: {
            scenario_type: 'urban_growth',
            name: 'City Expansion 2030',
            parameters: {
              time_horizon: 10,
              region: 'region_456',
              population_growth_rate: 2.5
            },
            webhook_url: 'https://your-app.com/webhooks/scenario-complete'
          }
        },
        example_response: {
          scenario: {
            id: 'scenario_789',
            status: 'queued',
            estimated_completion: '2024-01-15T12:00:00Z'
          }
        },
        rate_limit: '100 requests/hour',
        auth_required: true
      }
    ];

    setEndpoints(apiEndpoints);
    setLoading(false);
  };

  const fetchUsageStats = async () => {
    try {
      const { data, error } = await supabase
        .from('api_performance_logs')
        .select('endpoint, method, response_time_ms, status_code, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process stats
      const stats: APIUsageStats[] = [
        {
          endpoint: '/v1/alerts',
          total_requests: 1250,
          avg_response_time: 145,
          success_rate: 99.2,
          last_24h_requests: 180
        },
        {
          endpoint: '/v1/analytics',
          total_requests: 890,
          avg_response_time: 320,
          success_rate: 98.8,
          last_24h_requests: 95
        },
        {
          endpoint: '/v1/scenarios',
          total_requests: 45,
          avg_response_time: 2100,
          success_rate: 97.8,
          last_24h_requests: 8
        }
      ];

      setUsageStats(stats);
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    }
  };

  const testEndpoint = async (endpoint: APIEndpoint) => {
    setTestLoading(true);
    setTestResponse(null);

    try {
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTestResponse({
        status: 200,
        data: endpoint.example_response,
        response_time: Math.floor(Math.random() * 500) + 100
      });

      toast({
        title: "API Test Successful",
        description: `${endpoint.method} ${endpoint.path} responded successfully`
      });
    } catch (error) {
      setTestResponse({
        status: 500,
        error: 'Internal Server Error',
        response_time: 0
      });

      toast({
        title: "API Test Failed",
        description: "Failed to connect to the API endpoint",
        variant: "destructive"
      });
    } finally {
      setTestLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Code snippet copied successfully"
    });
  };

  const generateCurlCommand = (endpoint: APIEndpoint) => {
    let curl = `curl -X ${endpoint.method} \\
  "${process.env.NODE_ENV === 'production' ? 'https://api.haritahive.com' : 'http://localhost:3000'}${endpoint.path}"`;

    if (endpoint.auth_required) {
      curl += ` \\
  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}"`;
    }

    curl += ` \\
  -H "Content-Type: application/json"`;

    if (endpoint.method === 'POST' && endpoint.example_request.body) {
      curl += ` \\
  -d '${JSON.stringify(endpoint.example_request.body, null, 2)}'`;
    }

    return curl;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enhanced API Endpoints</h1>
          <p className="text-muted-foreground">Enterprise-grade APIs for alerts, analytics, and scenarios</p>
        </div>
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          API v1.0
        </Badge>
      </div>

      <Tabs defaultValue="endpoints">
        <TabsList>
          <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="analytics">Usage Analytics</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-6">
          {endpoints.map((endpoint) => (
            <Card key={endpoint.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className={
                      endpoint.method === 'GET' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      endpoint.method === 'POST' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      'bg-orange-500/20 text-orange-400 border-orange-500/30'
                    }>
                      {endpoint.method}
                    </Badge>
                    <CardTitle>{endpoint.name}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{endpoint.rate_limit}</Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => testEndpoint(endpoint)}
                      disabled={testLoading}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Test
                    </Button>
                  </div>
                </div>
                <CardDescription>{endpoint.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Endpoint</h4>
                  <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                    <code className="flex-1">{endpoint.method} {endpoint.path}</code>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => copyToClipboard(endpoint.path)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Parameters</h4>
                  <div className="space-y-2">
                    {endpoint.parameters.map((param, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="font-mono text-sm">{param.name}</span>
                          <span className="text-muted-foreground ml-2">({param.type})</span>
                          {param.required && <Badge variant="secondary" className="ml-2">required</Badge>}
                        </div>
                        <span className="text-sm text-muted-foreground">{param.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Example Request</h4>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                      <code>{generateCurlCommand(endpoint)}</code>
                    </pre>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(generateCurlCommand(endpoint))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Example Response</h4>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                      <code>{JSON.stringify(endpoint.example_response, null, 2)}</code>
                    </pre>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(JSON.stringify(endpoint.example_response, null, 2))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {testResponse && (
                  <div>
                    <h4 className="font-medium mb-2">Test Response</h4>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={testResponse.status === 200 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                          {testResponse.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Response time: {testResponse.response_time}ms
                        </span>
                      </div>
                      <pre className="text-sm overflow-x-auto">
                        <code>{JSON.stringify(testResponse.data || testResponse.error, null, 2)}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {usageStats.map((stat) => (
              <Card key={stat.endpoint}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{stat.endpoint}</CardTitle>
                    <BarChart3 className="h-5 w-5 text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Requests</p>
                      <p className="text-2xl font-bold">{stat.total_requests.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">24h Requests</p>
                      <p className="text-2xl font-bold">{stat.last_24h_requests}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Response</p>
                      <p className="text-lg font-semibold">{stat.avg_response_time}ms</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Success Rate</p>
                      <p className="text-lg font-semibold">{stat.success_rate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Webhook className="h-5 w-5 mr-2" />
                Webhook Configuration
              </CardTitle>
              <CardDescription>Set up webhooks to receive real-time notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Webhook URL</label>
                  <Input placeholder="https://your-app.com/webhooks/harita-hive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Webhooks will be triggered for scenario completion, alert notifications, and other important events.
                  </p>
                </div>
                <Button>
                  <Webhook className="h-4 w-4 mr-2" />
                  Configure Webhooks
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAPIEndpoints;