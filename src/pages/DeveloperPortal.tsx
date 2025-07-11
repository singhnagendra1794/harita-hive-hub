import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Code, 
  Key, 
  Book, 
  Download, 
  Copy,
  CheckCircle,
  ExternalLink,
  Terminal,
  Webhook,
  Database,
  Zap
} from 'lucide-react';

const DeveloperPortal = () => {
  const [apiKey, setApiKey] = useState('hh_sk_1234567890abcdef...');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sdkExamples = [
    {
      language: 'JavaScript',
      code: `import { HaritaHiveSDK } from '@haritahive/sdk';

const client = new HaritaHiveSDK({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.haritahive.com'
});

// Process GeoAI analysis
const result = await client.geoai.analyze({
  model: 'land-classification',
  imagery: 'path/to/satellite.tif',
  options: { confidence: 0.85 }
});

console.log(result.classification);`
    },
    {
      language: 'Python',
      code: `from haritahive import HaritaHiveSDK

client = HaritaHiveSDK(api_key='your-api-key')

# Run spatial analysis
analysis = client.spatial.weighted_overlay(
    criteria=['elevation', 'slope', 'landuse'],
    weights=[0.4, 0.3, 0.3],
    output_format='geotiff'
)

print(f"Analysis complete: {analysis.download_url}")`
    },
    {
      language: 'R',
      code: `library(haritahive)

# Initialize client
client <- HaritaHive$new(api_key = "your-api-key")

# Perform change detection
change_analysis <- client$change_detection(
  before_image = "2020_landsat.tif",
  after_image = "2024_landsat.tif",
  algorithm = "ndvi_difference"
)

plot(change_analysis$results)`
    }
  ];

  const apiEndpoints = [
    { method: 'POST', endpoint: '/api/v1/geoai/analyze', description: 'Run AI analysis on spatial data' },
    { method: 'GET', endpoint: '/api/v1/spatial/analysis/{id}', description: 'Get analysis results' },
    { method: 'POST', endpoint: '/api/v1/processing/raster', description: 'Process raster datasets' },
    { method: 'POST', endpoint: '/api/v1/processing/vector', description: 'Process vector datasets' },
    { method: 'GET', endpoint: '/api/v1/user/usage', description: 'Get API usage statistics' },
    { method: 'POST', endpoint: '/api/v1/webhooks', description: 'Create webhook endpoints' },
  ];

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Developer Portal & API Access</h1>
          <p className="text-xl text-muted-foreground">
            Integrate Harita Hive's geospatial intelligence into your applications
          </p>
          <Badge variant="secondary" className="mt-2">Enterprise Only</Badge>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="sdk">SDK & Code</TabsTrigger>
            <TabsTrigger value="docs">Documentation</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    API Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">2,847</div>
                    <div className="text-sm text-muted-foreground">Requests this month</div>
                    <div className="text-sm text-green-600">+15% vs last month</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Data Processed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">1.2 TB</div>
                    <div className="text-sm text-muted-foreground">Spatial data processed</div>
                    <div className="text-sm text-blue-600">24 active jobs</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">99.7%</div>
                    <div className="text-sm text-muted-foreground">API success rate</div>
                    <div className="text-sm text-green-600">Avg response: 1.2s</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Start</CardTitle>
                <CardDescription>Get started with the Harita Hive API in minutes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Key className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-medium mb-1">1. Get API Key</h3>
                    <p className="text-sm text-muted-foreground">Generate your secure API key</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Download className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-medium mb-1">2. Install SDK</h3>
                    <p className="text-sm text-muted-foreground">Choose your preferred language</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Code className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-medium mb-1">3. Start Building</h3>
                    <p className="text-sm text-muted-foreground">Integrate geospatial intelligence</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api-keys" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Key Management</CardTitle>
                <CardDescription>Manage your API keys for secure access to Harita Hive services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Production Key</h4>
                      <p className="text-sm text-muted-foreground">Created on Jan 15, 2024</p>
                      <p className="text-sm font-mono bg-muted p-1 rounded mt-1">hh_sk_1234...7890</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(apiKey)}
                      >
                        {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="sm">Regenerate</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Development Key</h4>
                      <p className="text-sm text-muted-foreground">Created on Jan 10, 2024</p>
                      <p className="text-sm font-mono bg-muted p-1 rounded mt-1">hh_sk_dev_...5678</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">Regenerate</Button>
                    </div>
                  </div>
                </div>

                <Button>Generate New API Key</Button>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Security Best Practices</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Never expose API keys in client-side code</li>
                    <li>• Store keys securely as environment variables</li>
                    <li>• Rotate keys regularly for enhanced security</li>
                    <li>• Use different keys for production and development</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sdk" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>SDK Installation</CardTitle>
                  <CardDescription>Install the Harita Hive SDK in your preferred language</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label>JavaScript/Node.js</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="bg-muted p-2 rounded flex-1 text-sm">npm install @haritahive/sdk</code>
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Python</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="bg-muted p-2 rounded flex-1 text-sm">pip install haritahive</code>
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label>R</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="bg-muted p-2 rounded flex-1 text-sm">install.packages("haritahive")</code>
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>cURL</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="bg-muted p-2 rounded flex-1 text-sm">Direct REST API calls</code>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API Endpoints</CardTitle>
                  <CardDescription>Available endpoints for enterprise integrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {apiEndpoints.map((endpoint, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>
                              {endpoint.method}
                            </Badge>
                            <code className="text-sm">{endpoint.endpoint}</code>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{endpoint.description}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Code Examples</CardTitle>
                <CardDescription>Ready-to-use code snippets for common operations</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="0">
                  <TabsList>
                    {sdkExamples.map((example, index) => (
                      <TabsTrigger key={index} value={index.toString()}>
                        {example.language}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {sdkExamples.map((example, index) => (
                    <TabsContent key={index} value={index.toString()}>
                      <div className="relative">
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{example.code}</code>
                        </pre>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="absolute top-2 right-2"
                          onClick={() => copyToClipboard(example.code)}
                        >
                          {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="docs" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Getting Started', description: 'Quick start guide and authentication', icon: Book },
                { title: 'GeoAI API', description: 'AI-powered geospatial analysis', icon: Zap },
                { title: 'Spatial Analysis', description: 'Advanced spatial processing tools', icon: Database },
                { title: 'Data Processing', description: 'Raster and vector data operations', icon: Terminal },
                { title: 'Webhooks', description: 'Real-time event notifications', icon: Webhook },
                { title: 'SDKs & Libraries', description: 'Official SDKs and community tools', icon: Code },
              ].map((doc, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <doc.icon className="h-5 w-5" />
                      {doc.title}
                    </CardTitle>
                    <CardDescription>{doc.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Documentation
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Interactive API Explorer</CardTitle>
                <CardDescription>Test API endpoints directly from your browser</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Endpoint</Label>
                      <select className="w-full p-2 border rounded mt-1">
                        <option>POST /api/v1/geoai/analyze</option>
                        <option>GET /api/v1/spatial/analysis/{id}</option>
                        <option>POST /api/v1/processing/raster</option>
                      </select>
                    </div>
                    <div>
                      <Label>Authentication</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input placeholder="Bearer token" />
                        <Button variant="outline" size="sm">
                          <Key className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Request Body</Label>
                    <textarea 
                      className="w-full mt-1 p-3 border rounded h-32 font-mono text-sm"
                      placeholder='{"model": "land-classification", "imagery": "base64_encoded_data"}'
                    />
                  </div>

                  <Button>
                    <Terminal className="h-4 w-4 mr-2" />
                    Send Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Management</CardTitle>
                <CardDescription>Set up real-time notifications for analysis completion and system events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Webhook URL</Label>
                      <Input placeholder="https://your-app.com/webhooks/haritahive" />
                    </div>
                    <div>
                      <Label>Events</Label>
                      <select className="w-full p-2 border rounded">
                        <option>Analysis Complete</option>
                        <option>Processing Error</option>
                        <option>All Events</option>
                      </select>
                    </div>
                  </div>

                  <Button>Create Webhook</Button>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Existing Webhooks</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">Production Webhook</p>
                        <p className="text-sm text-muted-foreground">https://api.company.com/haritahive</p>
                        <Badge variant="default" className="mt-1">Active</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Test</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">Development Webhook</p>
                        <p className="text-sm text-muted-foreground">https://dev.company.com/webhooks</p>
                        <Badge variant="secondary" className="mt-1">Inactive</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Test</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default DeveloperPortal;