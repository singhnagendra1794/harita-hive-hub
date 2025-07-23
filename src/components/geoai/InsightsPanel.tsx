import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Target, 
  Zap,
  Download,
  Eye,
  Share,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface InsightsPanelProps {
  insights: any[];
  completedJobs: any[];
  onExport: (type: string, data: any) => void;
}

const InsightsPanel = ({ insights, completedJobs, onExport }: InsightsPanelProps) => {
  const [selectedInsight, setSelectedInsight] = useState<string>('overview');

  // Sample data for charts
  const accuracyData = [
    { name: 'Building Detection', accuracy: 94.5, f1Score: 0.92 },
    { name: 'Land Use Classification', accuracy: 88.2, f1Score: 0.85 },
    { name: 'NDVI Analysis', accuracy: 96.8, f1Score: 0.95 },
    { name: 'Road Extraction', accuracy: 91.3, f1Score: 0.89 },
  ];

  const classificationData = [
    { name: 'Urban', value: 35, color: '#F4D35E' },
    { name: 'Forest', value: 28, color: '#43AA8B' },
    { name: 'Agriculture', value: 22, color: '#1B998B' },
    { name: 'Water', value: 10, color: '#4A90E2' },
    { name: 'Other', value: 5, color: '#9B59B6' },
  ];

  const timeSeriesData = [
    { month: 'Jan', ndvi: 0.3, accuracy: 89 },
    { month: 'Feb', ndvi: 0.35, accuracy: 91 },
    { month: 'Mar', ndvi: 0.45, accuracy: 93 },
    { month: 'Apr', ndvi: 0.6, accuracy: 95 },
    { month: 'May', ndvi: 0.8, accuracy: 94 },
    { month: 'Jun', ndvi: 0.85, accuracy: 96 },
  ];

  const performanceMetrics = [
    { metric: 'Overall Accuracy', value: 94.2, unit: '%', trend: '+2.3%' },
    { metric: 'Processing Speed', value: 1.2, unit: 'min/km²', trend: '-15%' },
    { metric: 'Memory Usage', value: 2.8, unit: 'GB', trend: '-8%' },
    { metric: 'Model Confidence', value: 87.5, unit: '%', trend: '+5.1%' },
  ];

  const handleExportInsight = (type: string) => {
    onExport(type, {
      insights,
      completedJobs,
      exportedAt: new Date().toISOString()
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#0D1B2A] text-[#F9F9F9]">
      {/* Header */}
      <div className="p-6 bg-[#1B263B] border-b border-[#43AA8B]/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Analytics & Insights</h2>
            <p className="text-sm text-[#F9F9F9]/70">Model performance and analysis results</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-[#43AA8B] text-[#43AA8B]">
              {completedJobs.length} Analyses
            </Badge>
            <Button size="sm" variant="outline" className="border-[#F4D35E]/50 text-[#F4D35E]">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={selectedInsight} onValueChange={setSelectedInsight} className="h-full flex flex-col">
          {/* Tab Navigation */}
          <div className="bg-[#1B263B] border-b border-[#43AA8B]/20">
            <TabsList className="bg-transparent border-none h-12 justify-start gap-0 rounded-none">
              <TabsTrigger 
                value="overview" 
                className="bg-transparent data-[state=active]:bg-[#F4D35E] data-[state=active]:text-[#0D1B2A] text-[#F9F9F9] border-b-2 border-transparent data-[state=active]:border-[#F4D35E] rounded-none px-6"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="models" 
                className="bg-transparent data-[state=active]:bg-[#F4D35E] data-[state=active]:text-[#0D1B2A] text-[#F9F9F9] border-b-2 border-transparent data-[state=active]:border-[#F4D35E] rounded-none px-6"
              >
                <Target className="h-4 w-4 mr-2" />
                Model Performance
              </TabsTrigger>
              <TabsTrigger 
                value="trends" 
                className="bg-transparent data-[state=active]:bg-[#F4D35E] data-[state=active]:text-[#0D1B2A] text-[#F9F9F9] border-b-2 border-transparent data-[state=active]:border-[#F4D35E] rounded-none px-6"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Trends
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            <TabsContent value="overview" className="h-full m-0 p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Metrics Cards */}
                <div className="lg:col-span-2 grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {performanceMetrics.map((metric, index) => (
                    <Card key={index} className="bg-[#1B263B] border-[#43AA8B]/20">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#F4D35E] mb-1">
                            {metric.value}{metric.unit}
                          </div>
                          <div className="text-xs text-[#F9F9F9]/70 mb-2">{metric.metric}</div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              metric.trend.startsWith('+') || metric.trend.startsWith('-') && metric.metric.includes('Speed')
                                ? 'border-[#43AA8B] text-[#43AA8B]' 
                                : 'border-red-400 text-red-400'
                            }`}
                          >
                            {metric.trend}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Model Accuracy Chart */}
                <Card className="bg-[#1B263B] border-[#43AA8B]/20">
                  <CardHeader>
                    <CardTitle className="text-white text-base">Model Accuracy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={accuracyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#43AA8B20" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 12, fill: '#F9F9F9' }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis tick={{ fontSize: 12, fill: '#F9F9F9' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1B263B', 
                            border: '1px solid #43AA8B',
                            borderRadius: '8px',
                            color: '#F9F9F9'
                          }} 
                        />
                        <Bar dataKey="accuracy" fill="#F4D35E" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Land Use Distribution */}
                <Card className="bg-[#1B263B] border-[#43AA8B]/20">
                  <CardHeader>
                    <CardTitle className="text-white text-base">Land Use Classification</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={classificationData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {classificationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1B263B', 
                            border: '1px solid #43AA8B',
                            borderRadius: '8px',
                            color: '#F9F9F9'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Recent Jobs */}
                <Card className="lg:col-span-2 bg-[#1B263B] border-[#43AA8B]/20">
                  <CardHeader>
                    <CardTitle className="text-white text-base flex items-center gap-2">
                      <Clock className="h-5 w-5 text-[#F4D35E]" />
                      Recent Analysis Jobs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {completedJobs.length === 0 ? (
                        <div className="text-center py-8">
                          <CheckCircle className="h-12 w-12 text-[#F9F9F9]/30 mx-auto mb-4" />
                          <p className="text-sm text-[#F9F9F9]/50">No completed analyses yet</p>
                        </div>
                      ) : (
                        completedJobs.slice(0, 5).map((job, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-[#0D1B2A] rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-[#43AA8B]/10 rounded text-[#43AA8B]">
                                <CheckCircle className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">{job.workflowName}</p>
                                <p className="text-xs text-[#F9F9F9]/50">
                                  Completed {new Date(job.completedAt).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="border-[#43AA8B] text-[#43AA8B] text-xs">
                                {job.results?.accuracy?.toFixed(1)}% accuracy
                              </Badge>
                              <Button size="sm" variant="ghost" className="p-2 text-[#F9F9F9]">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="models" className="h-full m-0 p-6">
              <div className="space-y-6">
                {/* Confusion Matrix Placeholder */}
                <Card className="bg-[#1B263B] border-[#43AA8B]/20">
                  <CardHeader>
                    <CardTitle className="text-white text-base">Confusion Matrix</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
                      {[...Array(16)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`h-12 rounded flex items-center justify-center text-xs font-medium ${
                            i % 5 === 0 ? 'bg-[#43AA8B] text-white' : 'bg-[#0D1B2A] text-[#F9F9F9]/70'
                          }`}
                        >
                          {i % 5 === 0 ? Math.floor(Math.random() * 100) : Math.floor(Math.random() * 20)}
                        </div>
                      ))}
                    </div>
                    <div className="text-center mt-4">
                      <p className="text-xs text-[#F9F9F9]/70">
                        Overall Accuracy: 94.2% | Kappa: 0.91
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Feature Importance */}
                <Card className="bg-[#1B263B] border-[#43AA8B]/20">
                  <CardHeader>
                    <CardTitle className="text-white text-base">Feature Importance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: 'NDVI', importance: 85 },
                        { name: 'Red Band', importance: 72 },
                        { name: 'NIR Band', importance: 68 },
                        { name: 'Texture Features', importance: 45 },
                        { name: 'Slope', importance: 32 }
                      ].map((feature, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#F9F9F9]/70">{feature.name}</span>
                            <span className="text-[#F4D35E]">{feature.importance}%</span>
                          </div>
                          <Progress value={feature.importance} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="h-full m-0 p-6">
              <div className="space-y-6">
                {/* NDVI Time Series */}
                <Card className="bg-[#1B263B] border-[#43AA8B]/20">
                  <CardHeader>
                    <CardTitle className="text-white text-base">NDVI Trend Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#43AA8B20" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#F9F9F9' }} />
                        <YAxis tick={{ fontSize: 12, fill: '#F9F9F9' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1B263B', 
                            border: '1px solid #43AA8B',
                            borderRadius: '8px',
                            color: '#F9F9F9'
                          }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="ndvi" 
                          stroke="#43AA8B" 
                          fill="#43AA8B" 
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Model Performance Over Time */}
                <Card className="bg-[#1B263B] border-[#43AA8B]/20">
                  <CardHeader>
                    <CardTitle className="text-white text-base">Model Performance Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#43AA8B20" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#F9F9F9' }} />
                        <YAxis tick={{ fontSize: 12, fill: '#F9F9F9' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1B263B', 
                            border: '1px solid #43AA8B',
                            borderRadius: '8px',
                            color: '#F9F9F9'
                          }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="accuracy" 
                          stroke="#F4D35E" 
                          strokeWidth={3}
                          dot={{ fill: '#F4D35E', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default InsightsPanel;