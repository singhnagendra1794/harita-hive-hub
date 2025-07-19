import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Eye, Download, Clock, MapPin, Activity, Zap } from 'lucide-react';

interface AnalyticsDashboardProps {
  projectId: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ projectId }) => {
  // Mock analytics data - in real implementation, this would come from API
  const usageData = [
    { month: 'Jan', views: 1200, interactions: 800, exports: 45 },
    { month: 'Feb', views: 1800, interactions: 1200, exports: 67 },
    { month: 'Mar', views: 2100, interactions: 1500, exports: 89 },
    { month: 'Apr', views: 2400, interactions: 1800, exports: 123 },
    { month: 'May', views: 2800, interactions: 2100, exports: 156 },
    { month: 'Jun', views: 3200, interactions: 2400, exports: 198 }
  ];

  const deviceData = [
    { name: 'Desktop', value: 65, color: 'hsl(var(--primary))' },
    { name: 'Mobile', value: 25, color: 'hsl(var(--secondary))' },
    { name: 'Tablet', value: 10, color: 'hsl(var(--accent))' }
  ];

  const performanceMetrics = [
    { metric: 'Load Time', value: '2.3s', status: 'good', improvement: '+15%' },
    { metric: 'Render Speed', value: '850ms', status: 'excellent', improvement: '+22%' },
    { metric: 'Memory Usage', value: '45MB', status: 'good', improvement: '+8%' },
    { metric: 'Error Rate', value: '0.02%', status: 'excellent', improvement: '+35%' }
  ];

  const realtimeStats = {
    activeUsers: 47,
    currentViews: 156,
    dataProcessed: '2.3GB',
    apiCalls: 1847
  };

  return (
    <div className="space-y-6">
      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-primary">{realtimeStats.activeUsers}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+12% from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Views</p>
                <p className="text-2xl font-bold text-primary">{realtimeStats.currentViews}</p>
              </div>
              <Eye className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center mt-2">
              <Activity className="h-3 w-3 text-blue-500 mr-1" />
              <span className="text-xs text-blue-500">Live tracking</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Data Processed</p>
                <p className="text-2xl font-bold text-primary">{realtimeStats.dataProcessed}</p>
              </div>
              <Download className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center mt-2">
              <Zap className="h-3 w-3 text-purple-500 mr-1" />
              <span className="text-xs text-purple-500">High efficiency</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">API Calls</p>
                <p className="text-2xl font-bold text-primary">{realtimeStats.apiCalls}</p>
              </div>
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center mt-2">
              <Clock className="h-3 w-3 text-orange-500 mr-1" />
              <span className="text-xs text-orange-500">Today</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Usage Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={3} />
                <Line type="monotone" dataKey="interactions" stroke="hsl(var(--secondary))" strokeWidth={3} />
                <Line type="monotone" dataKey="exports" stroke="hsl(var(--accent))" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{metric.metric}</span>
                  <Badge variant={metric.status === 'excellent' ? 'default' : 'secondary'}>
                    {metric.status}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-primary">{metric.value}</div>
                <div className="flex items-center">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-500">{metric.improvement}</span>
                </div>
                <Progress 
                  value={metric.status === 'excellent' ? 90 : 75} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interaction Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Interactions</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="interactions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;