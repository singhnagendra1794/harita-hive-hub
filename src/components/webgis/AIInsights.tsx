import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target, Zap, ChartBar, FileText } from 'lucide-react';

interface AIInsightsProps {
  projectId: string;
}

const AIInsights: React.FC<AIInsightsProps> = ({ projectId }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(true);

  const insights = [
    {
      type: 'performance',
      severity: 'high',
      title: 'Spatial Query Optimization',
      description: 'Your spatial queries can be optimized by 45% using spatial indexing on the coordinates column.',
      recommendation: 'Add a spatial index to improve query performance',
      impact: 'High',
      effort: 'Low',
      icon: Zap
    },
    {
      type: 'usage',
      severity: 'medium',
      title: 'User Engagement Pattern',
      description: 'Users spend 67% more time on interactive visualizations compared to static maps.',
      recommendation: 'Convert 3 static visualizations to interactive format',
      impact: 'Medium',
      effort: 'Medium',
      icon: TrendingUp
    },
    {
      type: 'data',
      severity: 'low',
      title: 'Data Freshness Alert',
      description: 'Some datasets haven\'t been updated in 30+ days. Fresh data improves user engagement by 23%.',
      recommendation: 'Set up automated data refresh for 5 key datasets',
      impact: 'Medium',
      effort: 'High',
      icon: AlertTriangle
    }
  ];

  const spatialPatterns = [
    {
      pattern: 'Cluster Analysis',
      confidence: 92,
      description: 'Detected 3 major clustering patterns in your point data',
      suggestion: 'Consider adding cluster visualization layer'
    },
    {
      pattern: 'Temporal Trends',
      confidence: 87,
      description: 'Strong seasonal patterns in data usage (Dec-Feb peak)',
      suggestion: 'Implement seasonal color schemes and data highlights'
    },
    {
      pattern: 'User Hotspots',
      confidence: 95,
      description: 'Users focus on metropolitan areas 73% of the time',
      suggestion: 'Pre-load metro area data for faster performance'
    }
  ];

  const aiRecommendations = [
    {
      category: 'Performance',
      items: [
        'Enable vector tile caching for 23% faster load times',
        'Implement progressive data loading for large datasets',
        'Use WebGL rendering for better performance with 10k+ features'
      ]
    },
    {
      category: 'User Experience',
      items: [
        'Add search functionality - 68% of users attempt to search',
        'Implement drawing tools - high user request',
        'Enable layer comparison mode for analysis workflows'
      ]
    },
    {
      category: 'Data Quality',
      items: [
        'Validate coordinate system consistency across layers',
        'Add data source attribution for transparency',
        'Implement error handling for missing geometries'
      ]
    }
  ];

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsAnalyzing(false);
    setAnalysisComplete(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Analysis Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>AI-Powered Insights</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Machine learning analysis of your WebGIS project
                </p>
              </div>
            </div>
            <Button 
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Run Analysis
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {analysisComplete && (
        <>
          {/* Key Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {insights.map((insight, index) => {
                const IconComponent = insight.icon;
                return (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent className={`h-5 w-5 ${getSeverityColor(insight.severity)}`} />
                        <div>
                          <h4 className="font-semibold">{insight.title}</h4>
                          <p className="text-sm text-muted-foreground">{insight.description}</p>
                        </div>
                      </div>
                      <Badge variant={insight.severity === 'high' ? 'destructive' : insight.severity === 'medium' ? 'default' : 'secondary'}>
                        {insight.severity}
                      </Badge>
                    </div>
                    
                    <div className="bg-muted/50 rounded p-3">
                      <p className="text-sm font-medium text-primary mb-2">Recommendation:</p>
                      <p className="text-sm">{insight.recommendation}</p>
                      <div className="flex gap-4 mt-3">
                        <span className="text-xs">
                          <strong>Impact:</strong> {insight.impact}
                        </span>
                        <span className="text-xs">
                          <strong>Effort:</strong> {insight.effort}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Spatial Patterns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Detected Spatial Patterns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {spatialPatterns.map((pattern, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{pattern.pattern}</h4>
                    <Badge variant="outline">{pattern.confidence}% confidence</Badge>
                  </div>
                  <Progress value={pattern.confidence} className="h-2" />
                  <p className="text-sm text-muted-foreground">{pattern.description}</p>
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded p-3">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Suggestion:</strong> {pattern.suggestion}
                    </p>
                  </div>
                  {index < spatialPatterns.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartBar className="h-5 w-5" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {aiRecommendations.map((category, index) => (
                <div key={index} className="space-y-3">
                  <h4 className="font-semibold text-primary">{category.category}</h4>
                  <div className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start gap-3 p-3 bg-muted/30 rounded">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                        <p className="text-sm">{item}</p>
                      </div>
                    ))}
                  </div>
                  {index < aiRecommendations.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Generate Report */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-primary" />
                  <div>
                    <h4 className="font-semibold">Generate AI Analysis Report</h4>
                    <p className="text-sm text-muted-foreground">
                      Get a comprehensive PDF report with all insights and recommendations
                    </p>
                  </div>
                </div>
                <Button className="gap-2">
                  <FileText className="h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AIInsights;