import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, ThumbsUp, Calendar, ExternalLink, Award, Target, Users, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';

interface Challenge {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface Submission {
  id: string;
  user_id: string;
  submission_link: string;
  description: string;
  votes: number;
  created_at: string;
  profiles?: {
    full_name?: string;
  };
  hasVoted?: boolean;
}

const Leaderboard = () => {
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [newSubmission, setNewSubmission] = useState({
    link: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrentChallenge();
    fetchUser();
  }, []);

  useEffect(() => {
    if (currentChallenge) {
      fetchSubmissions();
    }
  }, [currentChallenge]);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchCurrentChallenge = async () => {
    try {
      const { data, error } = await supabase
        .from('weekly_challenges')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setCurrentChallenge(data);
    } catch (error: any) {
      console.error('Error fetching challenge:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    if (!currentChallenge) return;

    try {
      const { data, error } = await supabase
        .from('challenge_submissions')
        .select(`
          *,
          profiles:user_id (full_name)
        `)
        .eq('challenge_id', currentChallenge.id)
        .order('votes', { ascending: false });

      if (error) throw error;

      // Check if current user has voted for each submission
      if (user) {
        const { data: votes, error: votesError } = await supabase
          .from('challenge_votes')
          .select('submission_id')
          .eq('user_id', user.id);

        if (!votesError && votes) {
          const votedSubmissionIds = new Set(votes.map(v => v.submission_id));
          const submissionsWithVoteStatus = (data || []).map(sub => ({
            ...sub,
            hasVoted: votedSubmissionIds.has(sub.id)
          }));
          setSubmissions(submissionsWithVoteStatus);
        } else {
          setSubmissions(data || []);
        }
      } else {
        setSubmissions(data || []);
      }
    } catch (error: any) {
      console.error('Error fetching submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load submissions.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit your solution.",
        variant: "destructive"
      });
      return;
    }

    if (!newSubmission.link || !newSubmission.description) {
      toast({
        title: "Missing Information",
        description: "Please provide both a link and description.",
        variant: "destructive"
      });
      return;
    }

    if (!currentChallenge) {
      toast({
        title: "No Active Challenge",
        description: "There's no active challenge to submit to.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('challenge_submissions')
        .insert({
          user_id: user.id,
          challenge_id: currentChallenge.id,
          submission_link: newSubmission.link,
          description: newSubmission.description
        });

      if (error) throw error;

      setNewSubmission({ link: '', description: '' });
      fetchSubmissions();
      toast({
        title: "Submission Successful!",
        description: "Your solution has been submitted to the challenge.",
      });
    } catch (error: any) {
      console.error('Error submitting:', error);
      toast({
        title: "Submission Failed",
        description: error.message === 'duplicate key value violates unique constraint "challenge_submissions_user_id_challenge_id_key"' 
          ? "You have already submitted a solution for this challenge."
          : "Failed to submit your solution. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (submissionId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to vote.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('challenge_votes')
        .insert({
          user_id: user.id,
          submission_id: submissionId
        });

      if (error) throw error;

      fetchSubmissions();
      toast({
        title: "Vote Cast!",
        description: "Your vote has been recorded.",
      });
    } catch (error: any) {
      if (error.message.includes('duplicate key')) {
        toast({
          title: "Already Voted",
          description: "You have already voted for this submission.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Vote Failed",
          description: "Failed to cast your vote. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1: return <Award className="h-5 w-5 text-gray-400" />;
      case 2: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <Target className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return 'border-l-yellow-500 bg-yellow-50';
      case 1: return 'border-l-gray-400 bg-gray-50';
      case 2: return 'border-l-amber-600 bg-amber-50';
      default: return 'border-l-primary';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading challenge data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Student Leaderboard
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Participate in weekly challenges and showcase your geospatial skills
            </p>
          </div>

          {currentChallenge ? (
            <div className="space-y-8">
              {/* Current Challenge */}
              <Card className="border-primary/20 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <Badge variant="default">Challenge of the Week</Badge>
                  </div>
                  <CardTitle className="text-2xl">{currentChallenge.title}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {currentChallenge.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="text-sm text-muted-foreground">
                      <strong>Challenge Period:</strong> {new Date(currentChallenge.start_date).toLocaleDateString()} - {new Date(currentChallenge.end_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4" />
                      {submissions.length} submissions
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Solution */}
              {user && (
                <Card>
                  <CardHeader>
                    <CardTitle>Submit Your Solution</CardTitle>
                    <CardDescription>
                      Share your approach to this week's challenge
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="link">GitHub/Colab Link</Label>
                      <Input
                        id="link"
                        placeholder="https://github.com/yourname/project or https://colab.research.google.com/..."
                        value={newSubmission.link}
                        onChange={(e) => setNewSubmission(prev => ({ ...prev, link: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Briefly describe your approach and methodology..."
                        value={newSubmission.description}
                        onChange={(e) => setNewSubmission(prev => ({ ...prev, description: e.target.value }))}
                        className="min-h-[100px]"
                      />
                    </div>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Solution'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Leaderboard */}
              <div>
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  Current Rankings
                </h2>
                
                {submissions.length > 0 ? (
                  <div className="space-y-4">
                    {submissions.map((submission, index) => (
                      <Card key={submission.id} className={`border-l-4 ${getRankColor(index)} hover:shadow-md transition-shadow`}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                {getRankIcon(index)}
                                <div>
                                  <h3 className="font-semibold">
                                    {submission.profiles?.full_name || 'Anonymous Student'}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    Rank #{index + 1} • {submission.votes} votes
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm mb-3 text-muted-foreground">
                                {submission.description}
                              </p>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(submission.submission_link, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  View Solution
                                </Button>
                                {user && user.id !== submission.user_id && (
                                  <Button
                                    variant={submission.hasVoted ? "secondary" : "default"}
                                    size="sm"
                                    onClick={() => handleVote(submission.id)}
                                    disabled={submission.hasVoted}
                                  >
                                    <ThumbsUp className="h-4 w-4 mr-1" />
                                    {submission.hasVoted ? 'Voted' : 'Vote'}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="text-center py-12">
                    <CardContent>
                      <div className="text-6xl mb-4">🚀</div>
                      <h3 className="text-xl font-semibold mb-2">Be the First!</h3>
                      <p className="text-muted-foreground">
                        No submissions yet. Be the first to submit your solution and lead the leaderboard!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold mb-2">No Active Challenge</h3>
                <p className="text-muted-foreground">
                  Stay tuned for the next weekly challenge! New challenges are posted every Monday.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Leaderboard;