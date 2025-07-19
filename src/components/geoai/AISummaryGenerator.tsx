import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { 
  Brain, 
  FileText, 
  TrendingUp, 
  BarChart3, 
  Eye, 
  Copy,
  Download,
  Sparkles,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface AnalysisInsight {
  id: string;
  type: 'statistic' | 'pattern' | 'recommendation' | 'alert';
  title: string;
  description: string;
  value?: string | number;
  confidence: number;
  icon: any;
}

interface AISummaryGeneratorProps {
  analysisResults: any[];
  selectedData: any;
  onSummaryGenerated: (summary: any) => void;
}

const AISummaryGenerator = ({
  analysisResults,
  selectedData,
  onSummaryGenerated
}: AISummaryGeneratorProps) => {
  const [generatedSummary, setGeneratedSummary] = useState<string>("");
  const [insights, setInsights] = useState<AnalysisInsight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [autoGenerate, setAutoGenerate] = useState(true);

  // Auto-generate summary when new results are available
  useEffect(() => {
    if (autoGenerate && analysisResults.length > 0) {
      generateSummary();
    }
  }, [analysisResults]);

  const generateSummary = async () => {
    if (analysisResults.length === 0) {
      toast({
        title: "No Results Available",
        description: "Run an AI analysis first to generate insights.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate AI summary generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const latestResult = analysisResults[analysisResults.length - 1];
      const summary = generateContextualSummary(latestResult);
      const generatedInsights = generateInsights(latestResult);

      setGeneratedSummary(summary);
      setInsights(generatedInsights);

      const summaryData = {
        id: `summary_${Date.now()}`,
        text: summary,
        insights: generatedInsights,
        analysisId: latestResult.id,
        generatedAt: new Date().toISOString(),
        confidence: calculateOverallConfidence(generatedInsights)
      };

      onSummaryGenerated(summaryData);

      toast({
        title: "Summary Generated",
        description: "AI insights have been generated successfully.",
      });

    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate AI summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateContextualSummary = (result: any) => {
    const modelName = result.modelName;
    const inputData = result.inputData;
    const results = result.results;

    switch (result.modelId) {
      case "lulc_classification":
        return `Land Use Land Cover analysis of ${inputData} identified ${results.classes_detected?.length || 4} distinct land cover classes across ${results.total_area}. Urban areas cover ${results.coverage?.Urban || '25.3'}% of the study area, while forest cover represents ${results.coverage?.Forest || '45.2'}%. The analysis achieved ${result.confidence}% accuracy using ${result.parameters?.model_type || 'U-Net'} classification model.`;

      case "ndvi_analysis":
        return `NDVI vegetation analysis reveals an average vegetation index of ${results.avg_ndvi} across the study area. ${results.healthy_vegetation_percent}% of the vegetation shows healthy growth patterns, with ${results.stressed_areas} of stressed vegetation requiring attention. The analysis indicates ${results.vegetation_health} overall vegetation health status.`;

      case "urban_change_detection":
        return `Urban change detection analysis identified ${results.urban_expansion} expansion over the selected time period. ${results.new_developments} new development sites were detected, resulting in ${results.lost_green_space} of green space conversion. ${results.change_hotspots} high-intensity change areas were identified for further monitoring.`;

      case "object_detection":
        return `Object detection analysis successfully identified ${results.buildings_detected} buildings across the study area with ${result.confidence}% confidence. Road network spans ${results.roads_length}, indicating ${results.infrastructure_density} infrastructure density. The detection model achieved ${results.coverage_accuracy} overall accuracy in feature identification.`;

      case "suitability_mapping":
        return `Multi-criteria suitability analysis evaluated the study area using weighted overlay methodology. Analysis incorporated multiple criteria including slope, proximity to roads, and land cover patterns. Results indicate optimal site locations with varying suitability scores ranging from low to high suitability zones.`;

      default:
        return `${modelName} analysis completed on ${inputData} with ${result.confidence}% confidence. The analysis processed the input data successfully and generated comprehensive results for spatial decision-making.`;
    }
  };

  const generateInsights = (result: any): AnalysisInsight[] => {
    const baseInsights: AnalysisInsight[] = [];

    // Add model-specific insights
    switch (result.modelId) {
      case "lulc_classification":
        baseInsights.push(
          {
            id: "coverage_stats",
            type: "statistic",
            title: "Land Cover Distribution",
            description: `Urban areas dominate at ${result.results.coverage?.Urban || '25.3'}%, followed by forest cover`,
            value: result.results.coverage?.Urban || "25.3%",
            confidence: 94,
            icon: BarChart3
          },
          {
            id: "pattern_detection",
            type: "pattern",
            title: "Spatial Pattern",
            description: "Urban development shows clustered distribution in the northwestern region",
            confidence: 87,
            icon: TrendingUp
          }
        );
        break;

      case "ndvi_analysis":
        baseInsights.push(
          {
            id: "vegetation_health",
            type: "statistic",
            title: "Vegetation Health",
            description: `${result.results.healthy_vegetation_percent}% of vegetation shows healthy growth patterns`,
            value: `${result.results.healthy_vegetation_percent}%`,
            confidence: 91,
            icon: TrendingUp
          },
          {
            id: "stress_alert",
            type: "alert",
            title: "Vegetation Stress",
            description: `${result.results.stressed_areas} of vegetation showing stress indicators`,
            confidence: 85,
            icon: AlertCircle
          }
        );
        break;

      case "urban_change_detection":
        baseInsights.push(
          {
            id: "expansion_rate",
            type: "statistic",
            title: "Urban Expansion",
            description: `${result.results.urban_expansion} growth rate indicates rapid development`,
            value: result.results.urban_expansion,
            confidence: 89,
            icon: TrendingUp
          },
          {
            id: "green_loss",
            type: "alert",
            title: "Green Space Loss",
            description: `${result.results.lost_green_space} of green space converted to urban use`,
            confidence: 92,
            icon: AlertCircle
          }
        );
        break;

      case "object_detection":
        baseInsights.push(
          {
            id: "building_count",
            type: "statistic",
            title: "Building Density",
            description: `${result.results.buildings_detected} buildings detected with high accuracy`,
            value: result.results.buildings_detected,
            confidence: 93,
            icon: BarChart3
          },
          {
            id: "infrastructure",
            type: "pattern",
            title: "Infrastructure Network",
            description: `Well-developed road network covering ${result.results.roads_length}`,
            confidence: 90,
            icon: TrendingUp
          }
        );
        break;
    }

    // Add general insights
    baseInsights.push(
      {
        id: "confidence_level",
        type: "statistic",
        title: "Analysis Confidence",
        description: `Model achieved ${result.confidence}% accuracy on the input dataset`,
        value: `${result.confidence}%`,
        confidence: result.confidence,
        icon: CheckCircle
      },
      {
        id: "recommendation",
        type: "recommendation",
        title: "Next Steps",
        description: "Consider running temporal analysis to track changes over time",
        confidence: 80,
        icon: Brain
      }
    );

    return baseInsights;
  };

  const calculateOverallConfidence = (insights: AnalysisInsight[]) => {
    const totalConfidence = insights.reduce((sum, insight) => sum + insight.confidence, 0);
    return Math.round(totalConfidence / insights.length);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedSummary);
    toast({
      title: "Copied to Clipboard",
      description: "Summary has been copied to your clipboard.",
    });
  };

  const exportSummary = () => {
    const exportData = {
      summary: generatedSummary,
      insights: insights,
      analysisResults: analysisResults,
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-summary-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getInsightIcon = (insight: AnalysisInsight) => {
    switch (insight.type) {
      case 'statistic':
        return <BarChart3 className="h-4 w-4 text-blue-500" />;
      case 'pattern':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'recommendation':
        return <Brain className="h-4 w-4 text-purple-500" />;
      case 'alert':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <insight.icon className="h-4 w-4" />;
    }
  };

  const getInsightBadgeColor = (type: string) => {
    switch (type) {
      case 'statistic':
        return 'bg-blue-100 text-blue-800';
      case 'pattern':
        return 'bg-green-100 text-green-800';
      case 'recommendation':
        return 'bg-purple-100 text-purple-800';
      case 'alert':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          AI Summary & Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {analysisResults.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Run AI analysis to generate insights</p>
          </div>
        ) : (
          <>
            {/* Generated Summary */}
            {generatedSummary && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">AI Generated Summary</h4>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyToClipboard}
                      className="h-7 w-7 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={exportSummary}
                      className="h-7 w-7 p-0"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-3 bg-muted/50 rounded-lg">
                  <Textarea
                    value={generatedSummary}
                    onChange={(e) => setGeneratedSummary(e.target.value)}
                    className="min-h-[80px] border-0 bg-transparent resize-none focus-visible:ring-0"
                    placeholder="AI summary will appear here..."
                  />
                </div>
              </div>
            )}

            {/* Key Insights */}
            {insights.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Key Insights</h4>
                <ScrollArea className="h-64">
                  <div className="space-y-3 pr-3">
                    {insights.map((insight) => (
                      <div key={insight.id} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-start gap-3">
                          {getInsightIcon(insight)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="text-sm font-medium">{insight.title}</h5>
                              <Badge className={`text-xs ${getInsightBadgeColor(insight.type)}`}>
                                {insight.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {insight.description}
                            </p>
                            <div className="flex items-center justify-between">
                              {insight.value && (
                                <Badge variant="outline" className="text-xs">
                                  {insight.value}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {insight.confidence}% confidence
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Generate Summary Button */}
            <Button
              onClick={generateSummary}
              disabled={isGenerating}
              variant={generatedSummary ? "outline" : "default"}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Generating insights...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  {generatedSummary ? "Regenerate Summary" : "Generate AI Summary"}
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AISummaryGenerator;