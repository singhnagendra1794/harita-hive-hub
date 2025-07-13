import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Target, Clock, BookOpen, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';

interface RoadmapStep {
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  category: string;
  resources: string[];
  order: number;
}

const SkillRoadmap = () => {
  const [formData, setFormData] = useState({
    fieldOfInterest: '',
    skillLevel: '',
    careerGoal: ''
  });
  const [roadmap, setRoadmap] = useState<RoadmapStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const { toast } = useToast();

  const fieldOptions = [
    'Urban Planning & Smart Cities',
    'Agricultural & Food Security',
    'Disaster Management & Emergency Response',
    'Climate Change & Environmental Monitoring',
    'Natural Resource Management',
    'Transportation & Logistics',
    'Public Health & Epidemiology',
    'Archaeology & Cultural Heritage'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateRoadmap = async () => {
    if (!formData.fieldOfInterest || !formData.skillLevel || !formData.careerGoal) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to generate your roadmap.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to generate your learning roadmap.",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-roadmap', {
        body: {
          fieldOfInterest: formData.fieldOfInterest,
          skillLevel: formData.skillLevel,
          careerGoal: formData.careerGoal,
          userId: user.id
        }
      });

      if (error) throw error;

      if (data.success) {
        setRoadmap(data.roadmap);
        setIsGenerated(true);
        toast({
          title: "Roadmap Generated!",
          description: "Your personalized learning roadmap is ready.",
        });
      } else {
        throw new Error(data.error || 'Failed to generate roadmap');
      }
    } catch (error: any) {
      console.error('Error generating roadmap:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate roadmap. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'theory': return <BookOpen className="h-4 w-4" />;
      case 'practical': return <Target className="h-4 w-4" />;
      case 'project': return <MapPin className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'theory': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'practical': return 'bg-green-100 text-green-800 border-green-200';
      case 'project': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'intermediate': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              AI-Powered Skill Assessment
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get a personalized learning roadmap tailored to your goals and current skill level
            </p>
          </div>

          {!isGenerated ? (
            /* Assessment Form */
            <div className="max-w-2xl mx-auto animate-fade-in">
              <Card className="shadow-lg border-0 bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Tell Us About Your Goals
                  </CardTitle>
                  <CardDescription>
                    Answer a few questions to get your personalized learning roadmap
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="field">Field of Interest</Label>
                    <Select onValueChange={(value) => handleInputChange('fieldOfInterest', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your area of interest" />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldOptions.map((field) => (
                          <SelectItem key={field} value={field}>
                            {field}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skill-level">Current Skill Level</Label>
                    <Select onValueChange={(value) => handleInputChange('skillLevel', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your current level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner - New to GIS/Geospatial</SelectItem>
                        <SelectItem value="intermediate">Intermediate - Some experience</SelectItem>
                        <SelectItem value="advanced">Advanced - Experienced professional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="career-goal">Career Goal</Label>
                    <Textarea
                      id="career-goal"
                      placeholder="Describe your career goals and what you want to achieve..."
                      value={formData.careerGoal}
                      onChange={(e) => handleInputChange('careerGoal', e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <Button 
                    onClick={generateRoadmap} 
                    disabled={isLoading}
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Your Roadmap...
                      </>
                    ) : (
                      <>
                        Generate My Roadmap
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Generated Roadmap */
            <div className="space-y-8 animate-fade-in">
              {/* Roadmap Header */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full mb-4 animate-scale-in">
                  <CheckCircle className="h-5 w-5" />
                  Your Personalized Learning Roadmap
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  {formData.fieldOfInterest} Learning Path
                </h2>
                <p className="text-muted-foreground">
                  Designed for {formData.skillLevel} level • {roadmap.length} learning steps
                </p>
              </div>

              {/* Roadmap Steps */}
              <div className="max-w-4xl mx-auto space-y-6">
                {roadmap.map((step, index) => (
                  <div key={index} className="animate-fade-in">
                    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
                                {step.order}
                              </div>
                              <CardTitle className="text-lg">{step.title}</CardTitle>
                            </div>
                            <CardDescription className="text-base">
                              {step.description}
                            </CardDescription>
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            <Badge variant="outline" className={getCategoryColor(step.category)}>
                              {getCategoryIcon(step.category)}
                              <span className="ml-1 capitalize">{step.category}</span>
                            </Badge>
                            <Badge variant="outline" className={getDifficultyColor(step.difficulty)}>
                              <span className="capitalize">{step.difficulty}</span>
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {step.duration}
                          </div>
                        </div>
                        
                        {step.resources && step.resources.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Recommended Resources:</h4>
                            <ul className="space-y-1">
                              {step.resources.map((resource, resourceIndex) => (
                                <li key={resourceIndex} className="text-sm text-muted-foreground flex items-center gap-2">
                                  <div className="w-1 h-1 bg-primary rounded-full" />
                                  {resource}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>

              {/* CTA Section */}
              <div className="text-center space-y-4 animate-fade-in">
                <Separator className="my-8" />
                <h3 className="text-xl font-semibold">Ready to Start Learning?</h3>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild>
                    <a href="/upcoming-course">Enroll in Courses</a>
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => setIsGenerated(false)}>
                    Generate New Roadmap
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SkillRoadmap;