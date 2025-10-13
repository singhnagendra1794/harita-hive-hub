import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Target, 
  Loader2,
  Sparkles,
  Award
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ATSScoreCardProps {
  personalInfo: any;
  projects: any[];
  skills: any[];
  certificates: any[];
}

interface ATSAnalysis {
  overall_score: number;
  breakdown: {
    content_quality: number;
    keyword_optimization: number;
    formatting: number;
    completeness: number;
    industry_relevance: number;
  };
  strengths: string[];
  improvements: Array<{
    area: string;
    suggestion: string;
    impact: string;
  }>;
  missing_keywords: string[];
  ats_friendly_score: number;
  recommendations: string[];
}

export const ATSScoreCard = ({ personalInfo, projects, skills, certificates }: ATSScoreCardProps) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null);
  const { toast } = useToast();

  const calculateScore = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('calculate-ats-score', {
        body: { personalInfo, projects, skills, certificates }
      });

      if (error) throw error;

      if (data?.success && data?.atsAnalysis) {
        setAnalysis(data.atsAnalysis);
        toast({
          title: "ATS Score Calculated",
          description: `Your portfolio scored ${data.atsAnalysis.overall_score}/100`,
        });
      }
    } catch (error) {
      console.error('Error calculating ATS score:', error);
      toast({
        title: "Calculation Failed",
        description: "Unable to calculate ATS score. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return "default";
    if (score >= 75) return "secondary";
    return "destructive";
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle>ATS Compatibility Score</CardTitle>
          </div>
          <Button 
            onClick={calculateScore} 
            disabled={loading}
            size="sm"
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Calculate Score
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!analysis && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Click "Calculate Score" to analyze your portfolio's ATS compatibility</p>
            <p className="text-sm mt-2">Get actionable insights to improve your chances with recruiters</p>
          </div>
        )}

        {analysis && (
          <>
            {/* Overall Score */}
            <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-lg">
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(analysis.overall_score)}`}>
                {analysis.overall_score}
              </div>
              <div className="text-muted-foreground mb-4">out of 100</div>
              <Badge variant={getScoreBadgeVariant(analysis.overall_score)} className="text-sm">
                {analysis.overall_score >= 90 ? "Excellent" : analysis.overall_score >= 75 ? "Good" : "Needs Improvement"}
              </Badge>
            </div>

            {/* Score Breakdown */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Score Breakdown</h3>
              {Object.entries(analysis.breakdown).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="font-medium">{value}%</span>
                  </div>
                  <Progress value={value} className="h-2" />
                </div>
              ))}
            </div>

            {/* Strengths */}
            {analysis.strengths.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Strengths
                </h3>
                <div className="space-y-1">
                  {analysis.strengths.map((strength, index) => (
                    <div key={index} className="text-sm text-muted-foreground pl-6">
                      • {strength}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improvements */}
            {analysis.improvements.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-yellow-600" />
                  Improvement Opportunities
                </h3>
                <div className="space-y-3">
                  {analysis.improvements.slice(0, 3).map((improvement, index) => (
                    <div key={index} className="border-l-2 border-yellow-500 pl-3 py-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{improvement.area}</span>
                        <Badge variant="outline" className="text-xs">
                          {improvement.impact} impact
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{improvement.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Keywords */}
            {analysis.missing_keywords.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  Missing Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.missing_keywords.slice(0, 8).map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <h3 className="font-semibold text-sm">Quick Recommendations</h3>
                <ul className="space-y-1">
                  {analysis.recommendations.slice(0, 3).map((rec, index) => (
                    <li key={index} className="text-sm text-muted-foreground pl-4">
                      {index + 1}. {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
