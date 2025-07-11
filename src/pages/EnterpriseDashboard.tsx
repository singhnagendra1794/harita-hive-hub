import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Database, 
  Brain, 
  Shield, 
  BarChart3, 
  Settings, 
  Crown,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Zap,
  Globe,
  Code,
  FileText,
  AlertTriangle,
  Cloud,
  Layers
} from 'lucide-react';

const EnterpriseDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const enterpriseTools = [
    {
      title: 'Enterprise Data Integration',
      description: 'Connect Oracle Spatial, PostGIS, ESRI, GeoServer, and cloud storage',
      href: '/enterprise-data-integration',
      icon: Database,
      category: 'Data',
      status: 'ready'
    },
    {
      title: 'Real-Time IoT Processing',
      description: 'Live GPS/sensor data ingestion with time-series playback',
      href: '/iot-data-processing',
      icon: Zap,
      category: 'IoT',
      status: 'ready'
    },
    {
      title: 'Advanced GeoAI Engine',
      description: 'Pre-trained models and no-code custom AI training',
      href: '/geoai-engine',
      icon: Brain,
      category: 'AI',
      status: 'ready'
    },
    {
      title: 'Compliance Toolkit',
      description: 'Automated EIA reports, zoning checks, LULC dashboards',
      href: '/compliance-toolkit',
      icon: Shield,
      category: 'Compliance',
      status: 'ready'
    },
    {
      title: 'Spatial Risk Analysis',
      description: 'Multi-criteria analysis, weighted overlay, hazard mapping',
      href: '/spatial-risk-analysis',
      icon: AlertTriangle,
      category: 'Analysis',
      status: 'ready'
    },
    {
      title: 'Developer Portal',
      description: 'REST APIs, SDKs, and integration tools for custom apps',
      href: '/developer-portal',
      icon: Code,
      category: 'Development',
      status: 'ready'
    },
    {
      title: 'White-Label Portal',
      description: 'Private branded GIS portals with role-based access',
      href: '/white-label-portal',
      icon: Globe,
      category: 'Branding',
      status: 'in-development'
    },
    {
      title: 'Geo Processing Lab',
      description: 'Advanced raster/vector processing with enterprise limits',
      href: '/geo-processing-lab',
      icon: Layers,
      category: 'Processing',
      status: 'ready'
    }
  ];

  const usageStats = [
    { label: 'Data Processed', value: '2.4 TB', change: '+18%', icon: Database },
    { label: 'AI Models Deployed', value: '12', change: '+3', icon: Brain },
    { label: 'API Requests', value: '45.2K', change: '+25%', icon: Code },
    { label: 'Active Users', value: '147', change: '+12', icon: Users },
  ];

  const recentAnalyses = [
    { name: 'Urban Expansion Analysis', type: 'Change Detection', status: 'Completed', time: '2 hours ago' },
    { name: 'Flood Risk Assessment', type: 'Risk Analysis', status: 'Processing', time: '30 min remaining' },
    { name: 'Land Use Classification', type: 'GeoAI', status: 'Completed', time: '1 day ago' },
    { name: 'Infrastructure Suitability', type: 'Multi-Criteria', status: 'Queued', time: 'Pending' },
  ];

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Enterprise Command Center</h1>
              <p className="text-xl text-muted-foreground">
                Full-stack geospatial intelligence platform for enterprise teams
              </p>
            </div>
            <Badge variant="default" className="px-4 py-2">
              <Crown className="h-4 w-4 mr-2" />
              Enterprise Plan Active
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tools">Enterprise Tools</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="team">Team & Access</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Usage Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {usageStats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {stat.change}
                        </p>
                      </div>
                      <stat.icon className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Launch GeoAI Analysis
                  </CardTitle>
                  <CardDescription>Start AI-powered spatial analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/geoai-engine">
                    <Button className="w-full">
                      Start Analysis <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Connect Data Sources
                  </CardTitle>
                  <CardDescription>Integrate enterprise databases</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/enterprise-data-integration">
                    <Button className="w-full">
                      Connect Data <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    API Integration
                  </CardTitle>
                  <CardDescription>Access developer tools & SDKs</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/developer-portal">
                    <Button className="w-full">
                      View APIs <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Analyses</CardTitle>
                <CardDescription>Latest processing jobs and results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAnalyses.map((analysis, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{analysis.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{analysis.type}</Badge>
                          <span className="text-sm text-muted-foreground">{analysis.time}</span>
                        </div>
                      </div>
                      <Badge 
                        variant={
                          analysis.status === 'Completed' ? 'default' : 
                          analysis.status === 'Processing' ? 'secondary' : 
                          'outline'
                        }
                      >
                        {analysis.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enterpriseTools.map((tool, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <tool.icon className="h-5 w-5" />
                        {tool.title}
                      </span>
                      <Badge 
                        variant={tool.status === 'ready' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {tool.status === 'ready' ? 'Ready' : 'Coming Soon'}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {tool.category}
                      </Badge>
                      {tool.status === 'ready' ? (
                        <Link to={tool.href}>
                          <Button size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground">
                            Launch <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          In Development
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Usage Trends</CardTitle>
                  <CardDescription>30-day activity overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Usage trend chart placeholder</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold">156%</div>
                        <div className="text-sm text-muted-foreground">Growth</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">2.4TB</div>
                        <div className="text-sm text-muted-foreground">Data Processed</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">99.7%</div>
                        <div className="text-sm text-muted-foreground">Uptime</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost Analysis</CardTitle>
                  <CardDescription>Resource utilization and costs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Processing Credits</span>
                        <span>1,247 / 5,000</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Storage Used</span>
                        <span>847 GB / 2 TB</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '42%' }}></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>API Calls</span>
                        <span>45.2K / 100K</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>System performance and reliability stats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">99.7%</div>
                    <div className="text-sm text-muted-foreground">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">1.2s</div>
                    <div className="text-sm text-muted-foreground">Avg Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">94.2%</div>
                    <div className="text-sm text-muted-foreground">AI Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">15min</div>
                    <div className="text-sm text-muted-foreground">Avg Processing</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team Members
                  </CardTitle>
                  <CardDescription>Manage enterprise team access and roles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { name: 'John Smith', role: 'Admin', email: 'john@company.com', status: 'Active' },
                      { name: 'Sarah Johnson', role: 'Analyst', email: 'sarah@company.com', status: 'Active' },
                      { name: 'Mike Chen', role: 'Developer', email: 'mike@company.com', status: 'Active' },
                      { name: 'Lisa Brown', role: 'Viewer', email: 'lisa@company.com', status: 'Pending' },
                    ].map((member, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{member.name}</h4>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={member.status === 'Active' ? 'default' : 'secondary'}>
                            {member.status}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full">Invite Team Member</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Access Control
                  </CardTitle>
                  <CardDescription>Configure role-based permissions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { role: 'Admin', permissions: 'Full access to all enterprise tools', count: 1 },
                      { role: 'Analyst', permissions: 'Analysis tools and data access', count: 2 },
                      { role: 'Developer', permissions: 'API access and integration tools', count: 1 },
                      { role: 'Viewer', permissions: 'Read-only access to results', count: 3 },
                    ].map((role, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{role.role}</h4>
                          <span className="text-sm text-muted-foreground">{role.count} users</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{role.permissions}</p>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full">Configure Roles</Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Security & Compliance</CardTitle>
                <CardDescription>Enterprise security features and compliance tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 border rounded-lg">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <h3 className="font-medium mb-1">SOC 2 Compliant</h3>
                    <p className="text-sm text-muted-foreground">Enterprise security standards</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <h3 className="font-medium mb-1">Data Encryption</h3>
                    <p className="text-sm text-muted-foreground">End-to-end encryption</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                    <h3 className="font-medium mb-1">Audit Logs</h3>
                    <p className="text-sm text-muted-foreground">Complete activity tracking</p>
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

export default EnterpriseDashboard;