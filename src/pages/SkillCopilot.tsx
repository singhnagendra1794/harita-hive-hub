import Layout from '@/components/Layout';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, Target, BookOpen, Briefcase, Code, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { supabase } from '@/integrations/supabase/client';
import UpgradePrompt from '@/components/premium/UpgradePrompt';

interface UserSkill {
  id: string;
  skill_name: string;
  proficiency_level: number;
  verified: boolean;
}

interface Recommendation {
  id: string;
  recommendation_type: string;
  content_id: string;
  score: number;
  reason: string;
  dismissed: boolean;
}

const SkillCopilot = () => {
  const { user } = useAuth();
  const { hasAccess } = usePremiumAccess();
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const hasProAccess = hasAccess('pro');

  useEffect(() => {
    if (user && hasProAccess) {
      fetchUserData();
    }
  }, [user, hasProAccess]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user skills
      const { data: skillsData } = await supabase
        .from('user_skills')
        .select('*')
        .eq('user_id', user?.id)
        .order('proficiency_level', { ascending: false });

      // Fetch recommendations
      const { data: recommendationsData } = await supabase
        .from('skill_recommendations')
        .select('*')
        .eq('user_id', user?.id)
        .eq('dismissed', false)
        .order('score', { ascending: false })
        .limit(5);

      setSkills(skillsData || []);
      setRecommendations(recommendationsData || []);

      // Simulate AI analysis progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSkill = async (skillName: string, level: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_skills')
        .insert({
          user_id: user.id,
          skill_name: skillName,
          proficiency_level: level
        });

      if (!error) {
        fetchUserData();
      }
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  };

  const dismissRecommendation = async (recommendationId: string) => {
    try {
      await supabase
        .from('skill_recommendations')
        .update({ dismissed: true })
        .eq('id', recommendationId);

      setRecommendations(prev => prev.filter(r => r.id !== recommendationId));
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
    }
  };

  if (!hasProAccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <UpgradePrompt 
          feature="Skill Intelligence Engine"
          description="Get personalized AI-powered career recommendations, skill analysis, and learning pathways tailored to your geospatial journey."
        />
      </div>
    );
  }

  return (
    <Layout>
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          GeoGPT Career Copilot
        </h1>
        <p className="text-muted-foreground">
          AI-powered personalized recommendations for your geospatial career journey
        </p>
      </div>

      {/* AI Analysis Progress */}
      {loading && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Brain className="h-6 w-6 animate-pulse text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-2">Analyzing your profile...</p>
                <Progress value={analysisProgress} className="w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skills Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Your Skills
            </CardTitle>
            <CardDescription>
              Track your geospatial expertise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {skills.length > 0 ? (
                skills.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{skill.skill_name}</span>
                      {skill.verified && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={skill.proficiency_level * 20} className="w-16" />
                      <span className="text-xs text-muted-foreground">{skill.proficiency_level}/5</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">No skills added yet</p>
                  <Button 
                    size="sm" 
                    onClick={() => addSkill('Python', 3)}
                  >
                    Add First Skill
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              AI Recommendations
            </CardTitle>
            <CardDescription>
              Personalized suggestions for growth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.length > 0 ? (
                recommendations.map((rec) => (
                  <div key={rec.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {rec.recommendation_type}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissRecommendation(rec.id)}
                      >
                        ×
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.reason}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-xs text-muted-foreground">
                        Match: {Math.round(rec.score * 100)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Target className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No recommendations yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Learning Path */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Your Learning Path
            </CardTitle>
            <CardDescription>
              Recommended next steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm mb-1">Master Remote Sensing</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Build on your GIS foundation with satellite data analysis
                </p>
                <Progress value={30} className="w-full mb-2" />
                <span className="text-xs text-muted-foreground">30% complete</span>
              </div>

              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm mb-1">Python for Geospatial</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Advanced scripting and automation skills
                </p>
                <Progress value={60} className="w-full mb-2" />
                <span className="text-xs text-muted-foreground">60% complete</span>
              </div>

              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm mb-1">Machine Learning in GIS</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Next-generation spatial analysis techniques
                </p>
                <Progress value={10} className="w-full mb-2" />
                <span className="text-xs text-muted-foreground">10% complete</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Career Opportunities */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Career Opportunities
          </CardTitle>
          <CardDescription>
            Jobs matching your skillset
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">GIS Analyst</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Remote • $60k-80k • Entry Level
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                <Badge variant="secondary" className="text-xs">QGIS</Badge>
                <Badge variant="secondary" className="text-xs">Python</Badge>
                <Badge variant="secondary" className="text-xs">PostGIS</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-600">95% match</span>
                <Button size="sm" variant="outline">View Job</Button>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Remote Sensing Specialist</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Hybrid • $75k-95k • Mid Level
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                <Badge variant="secondary" className="text-xs">Google Earth Engine</Badge>
                <Badge variant="secondary" className="text-xs">Machine Learning</Badge>
                <Badge variant="secondary" className="text-xs">Sentinel</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-600">87% match</span>
                <Button size="sm" variant="outline">View Job</Button>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Geospatial Developer</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Remote • $85k-110k • Senior Level
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                <Badge variant="secondary" className="text-xs">React</Badge>
                <Badge variant="secondary" className="text-xs">Leaflet</Badge>
                <Badge variant="secondary" className="text-xs">Node.js</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-yellow-600">72% match</span>
                <Button size="sm" variant="outline">View Job</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </Layout>
  );
};

export default SkillCopilot;