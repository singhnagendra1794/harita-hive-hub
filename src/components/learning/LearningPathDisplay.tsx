import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  CheckCircle, 
  Circle, 
  ArrowRight,
  Target,
  Star,
  Users
} from 'lucide-react';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  estimated_hours: number;
  tags: string[] | null;
  content_order: any;
  is_premium: boolean;
  created_by: string;
  created_at: string;
}

interface UserProgress {
  id: string;
  learning_path_id: string;
  progress_percentage: number;
  started_at: string;
  completed_at: string | null;
}

interface LearningPathDisplayProps {
  showEnrolled?: boolean;
  limit?: number;
}

const LearningPathDisplay: React.FC<LearningPathDisplayProps> = ({ 
  showEnrolled = false, 
  limit 
}) => {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchLearningPaths();
    if (user && showEnrolled) {
      fetchUserProgress();
    }
  }, [user, showEnrolled]);

  const fetchLearningPaths = async () => {
    try {
      let query = supabase
        .from('learning_paths')
        .select('*')
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLearningPaths(data?.map(path => ({
        ...path,
        content_order: Array.isArray(path.content_order) ? path.content_order : [],
        tags: Array.isArray(path.tags) ? path.tags : []
      })) || []);
    } catch (error: any) {
      console.error('Error fetching learning paths:', error);
      toast({
        title: "Error loading learning paths",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_learning_paths')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserProgress(data || []);
    } catch (error: any) {
      console.error('Error fetching user progress:', error);
    }
  };

  const enrollInLearningPath = async (learningPathId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to enroll in learning paths.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_learning_paths')
        .insert({
          user_id: user.id,
          learning_path_id: learningPathId,
          progress_percentage: 0
        });

      if (error) throw error;

      toast({
        title: "Enrolled successfully!",
        description: "You've been enrolled in the learning path.",
      });

      fetchUserProgress();
    } catch (error: any) {
      console.error('Error enrolling in learning path:', error);
      toast({
        title: "Enrollment failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getProgressForPath = (pathId: string): UserProgress | null => {
    return userProgress.find(p => p.learning_path_id === pathId) || null;
  };

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderModuleProgress = (contentOrder: any[], progress: UserProgress | null) => {
    if (!Array.isArray(contentOrder) || contentOrder.length === 0) {
      return (
        <div className="text-sm text-muted-foreground">
          No modules configured yet
        </div>
      );
    }

    const progressPercentage = progress?.progress_percentage || 0;
    const completedModules = Math.floor((progressPercentage / 100) * contentOrder.length);

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Progress</span>
          <span>{progressPercentage}%</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <div className="grid grid-cols-1 gap-2 mt-3">
          {contentOrder.slice(0, 3).map((module, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              {index < completedModules ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={index < completedModules ? 'text-green-700' : 'text-muted-foreground'}>
                {module.title || `Module ${index + 1}`}
              </span>
            </div>
          ))}
          {contentOrder.length > 3 && (
            <div className="text-xs text-muted-foreground">
              +{contentOrder.length - 3} more modules
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (learningPaths.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Learning Paths Available</h3>
          <p className="text-muted-foreground">
            Learning paths are being prepared. Check back soon!
          </p>
        </CardContent>
      </Card>
    );
  }

  const filteredPaths = showEnrolled 
    ? learningPaths.filter(path => userProgress.some(p => p.learning_path_id === path.id))
    : learningPaths;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredPaths.map((path) => {
        const progress = getProgressForPath(path.id);
        const isEnrolled = !!progress;

        return (
          <Card key={path.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{path.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {path.description}
                  </CardDescription>
                </div>
                {path.is_premium && (
                  <Badge variant="secondary" className="ml-2">
                    <Star className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {path.estimated_hours}h
                </div>
                <Badge 
                  variant="outline" 
                  className={getDifficultyColor(path.difficulty_level)}
                >
                  {path.difficulty_level}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {path.tags && path.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {path.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {path.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{path.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {isEnrolled ? (
                renderModuleProgress(path.content_order, progress)
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" />
                    {Array.isArray(path.content_order) ? path.content_order.length : 0} modules
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Join thousands of learners
                  </div>
                </div>
              )}

              <div className="pt-2">
                {isEnrolled ? (
                  <div className="space-y-2">
                    {progress?.completed_at ? (
                      <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                        <Trophy className="h-4 w-4" />
                        Completed!
                      </div>
                    ) : (
                      <Button variant="outline" className="w-full">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Continue Learning
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button 
                    onClick={() => enrollInLearningPath(path.id)}
                    className="w-full"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Start Learning Path
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default LearningPathDisplay;