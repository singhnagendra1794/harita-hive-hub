import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, TrendingUp, ExternalLink, Download } from 'lucide-react';
import { QuizResult, SkillRecommendation } from '@/types/skill-assessment';

interface SkillRecommendationsProps {
  results: QuizResult[];
  onDownloadReport: () => void;
}

export const SkillRecommendations: React.FC<SkillRecommendationsProps> = ({ 
  results, 
  onDownloadReport 
}) => {
  // Generate recommendations based on results
  const generateRecommendations = (): SkillRecommendation[] => {
    const recommendations: SkillRecommendation[] = [];
    
    results.forEach(result => {
      if (result.score < 70) {
        const courses = getCourseRecommendations(result.category);
        recommendations.push({
          skill: result.category,
          currentLevel: result.level,
          targetLevel: result.level === 'Beginner' ? 'Intermediate' : 'Advanced',
          courses,
          priority: result.score < 50 ? 'High' : 'Medium'
        });
      }
    });
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const getCourseRecommendations = (category: string) => {
    const courseMap: Record<string, any[]> = {
      'GIS Basics': [
        {
          id: '1',
          title: 'Introduction to GIS Fundamentals',
          description: 'Master the core concepts of Geographic Information Systems',
          duration: '4 weeks',
          difficulty: 'Beginner' as const,
          url: '/courses/gis-fundamentals'
        },
        {
          id: '2',
          title: 'Spatial Analysis Techniques',
          description: 'Learn advanced spatial analysis methods and applications',
          duration: '6 weeks',
          difficulty: 'Intermediate' as const,
          url: '/courses/spatial-analysis'
        }
      ],
      'Remote Sensing': [
        {
          id: '3',
          title: 'Satellite Image Analysis',
          description: 'Process and analyze satellite imagery for various applications',
          duration: '5 weeks',
          difficulty: 'Intermediate' as const,
          url: '/courses/satellite-analysis'
        }
      ],
      'Python': [
        {
          id: '4',
          title: 'Python for Geospatial Analysis',
          description: 'Learn Python programming for GIS and spatial data science',
          duration: '8 weeks',
          difficulty: 'Beginner' as const,
          url: '/courses/python-gis'
        }
      ],
      'SQL': [
        {
          id: '5',
          title: 'PostGIS and Spatial Databases',
          description: 'Master spatial SQL and database management',
          duration: '6 weeks',
          difficulty: 'Intermediate' as const,
          url: '/courses/postgis'
        }
      ],
      'QGIS': [
        {
          id: '6',
          title: 'QGIS Complete Course',
          description: 'Comprehensive QGIS training from basics to advanced',
          duration: '10 weeks',
          difficulty: 'Beginner' as const,
          url: '/courses/qgis-complete'
        }
      ],
      'GeoAI': [
        {
          id: '7',
          title: 'Machine Learning for Geospatial Data',
          description: 'Apply AI and ML techniques to spatial problems',
          duration: '12 weeks',
          difficulty: 'Advanced' as const,
          url: '/courses/geoai'
        }
      ]
    };
    
    return courseMap[category] || [];
  };

  const recommendations = generateRecommendations();
  const strengths = results.filter(r => r.score >= 80).map(r => r.category);
  const weaknesses = results.filter(r => r.score < 60).map(r => r.category);
  const overallScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);

  return (
    <div className="space-y-6">
      {/* Overall Score Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Assessment Summary
            </span>
            <Button onClick={onDownloadReport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{overallScore}%</div>
              <p className="text-sm text-muted-foreground">Overall Score</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Strengths</h4>
              <div className="space-y-1">
                {strengths.length > 0 ? (
                  strengths.map(strength => (
                    <Badge key={strength} variant="secondary" className="mr-1">
                      {strength}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Keep improving!</p>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Areas for Improvement</h4>
              <div className="space-y-1">
                {weaknesses.length > 0 ? (
                  weaknesses.map(weakness => (
                    <Badge key={weakness} variant="outline" className="mr-1">
                      {weakness}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Great job!</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.map(result => (
              <div key={result.category} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{result.category}</span>
                    <Badge variant={
                      result.level === 'Advanced' ? 'default' :
                      result.level === 'Intermediate' ? 'secondary' : 'outline'
                    }>
                      {result.level}
                    </Badge>
                  </div>
                  <Progress value={result.score} className="w-48" />
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{result.score}%</div>
                  <div className="text-sm text-muted-foreground">
                    {result.correctAnswers}/{result.totalQuestions}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Personalized Learning Recommendations
            </CardTitle>
            <CardDescription>
              Based on your assessment results, here are courses to help you improve
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recommendations.map(rec => (
                <div key={rec.skill} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{rec.skill}</h3>
                    <Badge variant={
                      rec.priority === 'High' ? 'destructive' :
                      rec.priority === 'Medium' ? 'default' : 'secondary'
                    }>
                      {rec.priority} Priority
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-4">
                    Current: {rec.currentLevel} → Target: {rec.targetLevel}
                  </div>
                  
                  <div className="space-y-3">
                    {rec.courses.map(course => (
                      <div key={course.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{course.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{course.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">{course.duration}</Badge>
                            <Badge variant="outline" className="text-xs">{course.difficulty}</Badge>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <a href={course.url}>
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};