import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Send, 
  ThumbsUp, 
  Pin, 
  Clock,
  CheckCircle,
  User,
  MessageCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface QAItem {
  id: string;
  question: string;
  answer: string | null;
  user_id: string;
  answered_by: string | null;
  answered_at: string | null;
  is_highlighted: boolean;
  votes: number;
  created_at: string;
  updated_at: string;
  user_profiles?: {
    full_name: string;
  };
  instructor_profiles?: {
    full_name: string;
  };
}

interface ClassQAWidgetProps {
  classId: string;
  isInstructor?: boolean;
  isRegistered?: boolean;
}

export const ClassQAWidget: React.FC<ClassQAWidgetProps> = ({
  classId,
  isInstructor = false,
  isRegistered = false
}) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QAItem[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [answerText, setAnswerText] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (classId) {
      fetchQuestions();
      subscribeToQuestions();
    }
  }, [classId]);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('class_qa')
        .select(`
          *,
          user_profiles:profiles!class_qa_user_id_fkey(full_name),
          instructor_profiles:profiles!class_qa_answered_by_fkey(full_name)
        `)
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions((data || []) as QAItem[]);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Error",
        description: "Failed to load Q&A",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToQuestions = () => {
    const subscription = supabase
      .channel(`class_qa_${classId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'class_qa',
          filter: `class_id=eq.${classId}`,
        },
        () => {
          fetchQuestions();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const submitQuestion = async () => {
    if (!newQuestion.trim() || !user || !isRegistered) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('class_qa')
        .insert([{
          class_id: classId,
          user_id: user.id,
          question: newQuestion.trim(),
        }]);

      if (error) throw error;

      setNewQuestion('');
      toast({
        title: "Question Submitted",
        description: "Your question has been added to the Q&A",
      });
    } catch (error) {
      console.error('Error submitting question:', error);
      toast({
        title: "Error",
        description: "Failed to submit question",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const submitAnswer = async (questionId: string) => {
    const answer = answerText[questionId];
    if (!answer?.trim() || !user || !isInstructor) return;

    try {
      const { error } = await supabase
        .from('class_qa')
        .update({
          answer: answer.trim(),
          answered_by: user.id,
          answered_at: new Date().toISOString(),
        })
        .eq('id', questionId);

      if (error) throw error;

      setAnswerText(prev => ({ ...prev, [questionId]: '' }));
      toast({
        title: "Answer Posted",
        description: "Your answer has been posted",
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: "Error",
        description: "Failed to submit answer",
        variant: "destructive",
      });
    }
  };

  const toggleHighlight = async (questionId: string, currentStatus: boolean) => {
    if (!isInstructor) return;

    try {
      const { error } = await supabase
        .from('class_qa')
        .update({ is_highlighted: !currentStatus })
        .eq('id', questionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling highlight:', error);
      toast({
        title: "Error",
        description: "Failed to update question",
        variant: "destructive",
      });
    }
  };

  const voteQuestion = async (questionId: string) => {
    if (!user || !isRegistered) return;

    try {
      // For simplicity, just increment votes (in a real app, you'd track user votes)
      const question = questions.find(q => q.id === questionId);
      if (!question) return;

      const { error } = await supabase
        .from('class_qa')
        .update({ votes: question.votes + 1 })
        .eq('id', questionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error voting on question:', error);
      toast({
        title: "Error",
        description: "Failed to vote on question",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="h-[600px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Live Q&A
        </CardTitle>
        <CardDescription>
          {isInstructor 
            ? "Answer student questions during the live session"
            : isRegistered 
              ? "Ask questions during the live session"
              : "Register for the class to participate in Q&A"
          }
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Question Input */}
        {isRegistered && (
          <div className="space-y-2">
            <Textarea
              placeholder="Ask a question..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              rows={2}
              disabled={!isRegistered}
            />
            <Button
              onClick={submitQuestion}
              disabled={!newQuestion.trim() || submitting || !isRegistered}
              size="sm"
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {submitting ? 'Submitting...' : 'Ask Question'}
            </Button>
          </div>
        )}

        <Separator />

        {/* Questions List */}
        <ScrollArea className="flex-1">
          <div className="space-y-4">
            {questions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No questions yet</p>
                <p className="text-sm">Be the first to ask a question!</p>
              </div>
            ) : (
              questions.map((qa) => (
                <div
                  key={qa.id}
                  className={`border rounded-lg p-4 space-y-3 ${
                    qa.is_highlighted ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {qa.user_profiles?.full_name || 'Anonymous'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(qa.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {qa.is_highlighted && (
                        <Badge variant="secondary" className="text-xs">
                          <Pin className="h-3 w-3 mr-1" />
                          Pinned
                        </Badge>
                      )}
                      {qa.answer && (
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Answered
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <p className="text-sm">{qa.question}</p>

                  {/* Answer */}
                  {qa.answer && (
                    <div className="bg-accent/50 rounded-md p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Answer
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          by {qa.instructor_profiles?.full_name || 'Instructor'}
                        </span>
                        {qa.answered_at && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(qa.answered_at), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm">{qa.answer}</p>
                    </div>
                  )}

                  {/* Answer Input (Instructor Only) */}
                  {isInstructor && !qa.answer && (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Write your answer..."
                        value={answerText[qa.id] || ''}
                        onChange={(e) => setAnswerText(prev => ({
                          ...prev,
                          [qa.id]: e.target.value
                        }))}
                        rows={2}
                      />
                      <Button
                        onClick={() => submitAnswer(qa.id)}
                        disabled={!answerText[qa.id]?.trim()}
                        size="sm"
                      >
                        Post Answer
                      </Button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isRegistered && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => voteQuestion(qa.id)}
                          className="h-auto p-1"
                        >
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          {qa.votes}
                        </Button>
                      )}
                    </div>
                    
                    {isInstructor && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleHighlight(qa.id, qa.is_highlighted)}
                        className="h-auto p-1"
                      >
                        <Pin className={`h-3 w-3 ${qa.is_highlighted ? 'text-primary' : ''}`} />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ClassQAWidget;