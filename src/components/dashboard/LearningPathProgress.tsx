
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Clock, Star, Plus } from 'lucide-react';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  estimated_hours: number;
  tags: string[];
  is_premium: boolean;
}

interface UserLearningPath {
  id: string;
  learning_path_id: string;
  progress_percentage: number;
  started_at: string;
  completed_at: string | null;
  learning_paths: LearningPath;
}

export const LearningPathProgress = () => {
  const { user } = useAuth();
  const [userPaths, setUserPaths] = useState<UserLearningPath[]>([]);
  const [availablePaths, setAvailablePaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserLearningPaths();
      fetchAvailablePaths();
    }
  }, [user]);

  const fetchUserLearningPaths = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_learning_paths')
        .select(`
          *,
          learning_paths (
            id,
            title,
            description,
            difficulty_level,
            estimated_hours,
            tags,
            is_premium
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setUserPaths(data || []);
    } catch (error) {
      console.error('Error fetching user learning paths:', error);
    }
  };

  const fetchAvailablePaths = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_paths')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvailablePaths(data || []);
    } catch (error) {
      console.error('Error fetching available paths:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinLearningPath = async (pathId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_learning_paths')
        .insert({
          user_id: user.id,
          learning_path_id: pathId,
          progress_percentage: 0,
        });

      if (error) throw error;
      fetchUserLearningPaths();
    } catch (error) {
      console.error('Error joining learning path:', error);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-500';
      case 'intermediate':
        return 'bg-yellow-500';
      case 'advanced':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-6 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded mb-4"></div>
              <div className="h-2 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const enrolledPathIds = userPaths.map(up => up.learning_path_id);
  const suggestedPaths = availablePaths.filter(path => !enrolledPathIds.includes(path.id));

  return (
    <div className="space-y-6">
      {/* Active Learning Paths */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Your Learning Paths</h3>
        {userPaths.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h4 className="text-lg font-medium mb-2">No learning paths yet</h4>
              <p className="text-muted-foreground mb-4">
                Join a learning path to track your progress and get structured guidance.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {userPaths.map((userPath) => (
              <Card key={userPath.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-xl font-semibold">{userPath.learning_paths.title}</h4>
                        {userPath.learning_paths.is_premium && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            <Star className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-3">
                        {userPath.learning_paths.description}
                      </p>
                      <div className="flex gap-2 mb-4">
                        <Badge className={getDifficultyColor(userPath.learning_paths.difficulty_level)}>
                          {userPath.learning_paths.difficulty_level}
                        </Badge>
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {userPath.learning_paths.estimated_hours}h
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-primary">
                        {userPath.progress_percentage}%
                      </p>
                      <p className="text-sm text-muted-foreground">Complete</p>
                    </div>
                  </div>
                  
                  <Progress value={userPath.progress_percentage} className="mb-4" />
                  
                  <div className="flex flex-wrap gap-2">
                    {userPath.learning_paths.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Suggested Learning Paths */}
      {suggestedPaths.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Suggested Learning Paths</h3>
          <div className="grid gap-4">
            {suggestedPaths.slice(0, 3).map((path) => (
              <Card key={path.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-semibold">{path.title}</h4>
                        {path.is_premium && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            <Star className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-3">{path.description}</p>
                      <div className="flex gap-2 mb-4">
                        <Badge className={getDifficultyColor(path.difficulty_level)}>
                          {path.difficulty_level}
                        </Badge>
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {path.estimated_hours}h
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {path.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button onClick={() => joinLearningPath(path.id)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Join Path
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
