import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Play, 
  Bookmark, 
  BookmarkCheck, 
  Clock, 
  Eye, 
  MessageCircle, 
  Calendar,
  Users,
  ChevronDown,
  ChevronUp,
  Send,
  Bot,
  Lock
} from 'lucide-react';

interface Recording {
  id: string;
  day_number: number;
  topic_title: string;
  topic_description: string;
  recording_date: string;
  recording_url: string;
  thumbnail_url: string;
  duration_seconds: number;
  recording_status: string;
  hls_url: string;
  mp4_url: string;
  auto_generated_description: string;
  views_count: number;
}

interface Bookmark {
  id: string;
  recording_id: string;
  notes: string;
}

interface QAInteraction {
  id: string;
  question: string;
  ai_response: string;
  ai_responder: string;
  timestamp_seconds: number;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

interface NextClassInfo {
  next_class_date: string;
  next_class_time: string;
  next_class_topic: string;
  minutes_until_next: number;
}

const GEOVARecordingsList: React.FC = () => {
  const { toast } = useToast();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [nextClassInfo, setNextClassInfo] = useState<NextClassInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [expandedRecordings, setExpandedRecordings] = useState<Set<string>>(new Set());
  const [qaInteractions, setQAInteractions] = useState<Record<string, QAInteraction[]>>({});
  const [questionText, setQuestionText] = useState('');
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAccess();
    fetchNextClassInfo();
  }, []);

  useEffect(() => {
    if (hasAccess && user) {
      fetchRecordings();
      fetchBookmarks();
    }
  }, [hasAccess, user]);

  const checkAccess = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(currentUser);

    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Check if user has premium access and is enrolled in the course
    const { data: profile } = await supabase
      .from('profiles')
      .select('enrolled_courses')
      .eq('id', currentUser.id)
      .single();

    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('subscription_tier, status')
      .eq('user_id', currentUser.id)
      .single();

    const hasEnrollment = profile?.enrolled_courses?.includes('Geospatial Technology Unlocked');
    const hasPremium = subscription?.subscription_tier === 'pro' && subscription?.status === 'active';

    setHasAccess(hasEnrollment && hasPremium);
    setLoading(false);
  };

  const fetchRecordings = async () => {
    try {
      const { data, error } = await supabase
        .from('geova_recordings')
        .select('*')
        .order('day_number', { ascending: false });

      if (error) throw error;
      setRecordings(data || []);
    } catch (error) {
      console.error('Error fetching recordings:', error);
      toast({
        title: "Error",
        description: "Failed to load recordings",
        variant: "destructive",
      });
    }
  };

  const fetchBookmarks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('student_recording_bookmarks')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const fetchNextClassInfo = async () => {
    try {
      const { data, error } = await supabase.rpc('get_next_geova_class_time');
      if (error) throw error;
      
      if (data && data.length > 0) {
        setNextClassInfo(data[0]);
      }
    } catch (error) {
      console.error('Error fetching next class info:', error);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatTimeUntilNext = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)} minutes`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = Math.round(minutes % 60);
      return `${hours}h ${remainingMinutes}m`;
    } else {
      const days = Math.floor(minutes / 1440);
      const hours = Math.floor((minutes % 1440) / 60);
      return `${days}d ${hours}h`;
    }
  };

  const toggleBookmark = async (recording: Recording) => {
    if (!user) return;

    const existingBookmark = bookmarks.find(b => b.recording_id === recording.id);

    try {
      if (existingBookmark) {
        await supabase.functions.invoke('geova-recording-manager', {
          body: {
            action: 'remove_bookmark',
            recordingId: recording.id,
            data: { userId: user.id }
          }
        });
        setBookmarks(bookmarks.filter(b => b.id !== existingBookmark.id));
        toast({
          title: "Bookmark removed",
          description: `Removed ${recording.topic_title} from bookmarks`,
        });
      } else {
        const { data } = await supabase.functions.invoke('geova-recording-manager', {
          body: {
            action: 'bookmark_recording',
            recordingId: recording.id,
            data: { userId: user.id }
          }
        });
        if (data?.bookmark) {
          setBookmarks([...bookmarks, data.bookmark]);
          toast({
            title: "Bookmark added",
            description: `Added ${recording.topic_title} to bookmarks`,
          });
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
      });
    }
  };

  const trackView = async (recording: Recording) => {
    if (!user) return;

    try {
      await supabase.functions.invoke('geova-recording-manager', {
        body: {
          action: 'track_view',
          recordingId: recording.id,
          data: {
            userId: user.id,
            eventType: 'view_start'
          }
        }
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  const toggleExpanded = async (recording: Recording) => {
    const newExpanded = new Set(expandedRecordings);
    
    if (expandedRecordings.has(recording.id)) {
      newExpanded.delete(recording.id);
    } else {
      newExpanded.add(recording.id);
      // Fetch Q&A interactions for this recording
      await fetchQAInteractions(recording.id);
    }
    
    setExpandedRecordings(newExpanded);
  };

  const fetchQAInteractions = async (recordingId: string) => {
    try {
      const { data } = await supabase.functions.invoke('geova-qa-assistant', {
        body: {
          action: 'get_recording_qa',
          recordingId
        }
      });

      if (data?.qaInteractions) {
        setQAInteractions(prev => ({
          ...prev,
          [recordingId]: data.qaInteractions
        }));
      }
    } catch (error) {
      console.error('Error fetching Q&A interactions:', error);
    }
  };

  const askQuestion = async (recording: Recording) => {
    if (!user || !questionText.trim()) return;

    setIsAskingQuestion(true);
    try {
      const { data } = await supabase.functions.invoke('geova-qa-assistant', {
        body: {
          action: 'ask_question',
          recordingId: recording.id,
          userId: user.id,
          question: questionText.trim(),
          aiResponder: 'GEOVA'
        }
      });

      if (data?.qaInteraction) {
        setQAInteractions(prev => ({
          ...prev,
          [recording.id]: [...(prev[recording.id] || []), data.qaInteraction]
        }));
        setQuestionText('');
        toast({
          title: "Question submitted",
          description: "GEOVA has provided an answer below",
        });
      }
    } catch (error) {
      console.error('Error asking question:', error);
      toast({
        title: "Error",
        description: "Failed to submit question",
        variant: "destructive",
      });
    } finally {
      setIsAskingQuestion(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Premium Access Required</h3>
        <p className="text-muted-foreground mb-6">
          You need a Pro subscription and enrollment in "Geospatial Technology Unlocked" to access GEOVA recordings.
        </p>
        <Button onClick={() => window.location.href = '/pricing'}>
          Upgrade to Pro
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Next Class Timer */}
      {nextClassInfo && nextClassInfo.minutes_until_next > 0 && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Next GEOVA Class</h3>
                  <p className="text-muted-foreground">{nextClassInfo.next_class_topic}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {formatTimeUntilNext(nextClassInfo.minutes_until_next)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(`${nextClassInfo.next_class_date}T${nextClassInfo.next_class_time}`).toLocaleDateString()} at 5:00 AM IST
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold">📚 GEOVA – Daily AI Classes</h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Access recordings of GEOVA's live teaching sessions for the Geospatial Technology Unlocked course. 
          Each session includes theory, demos, and hands-on activities.
        </p>
      </div>

      {/* Recordings Grid */}
      <div className="grid gap-6">
        {recordings.map((recording) => {
          const isBookmarked = bookmarks.some(b => b.recording_id === recording.id);
          const isExpanded = expandedRecordings.has(recording.id);
          const interactions = qaInteractions[recording.id] || [];

          return (
            <Card key={recording.id} className="overflow-hidden">
              <div className="flex">
                {/* Thumbnail */}
                <div className="relative w-48 h-28 bg-gradient-to-br from-primary/20 to-purple-50 flex-shrink-0">
                  {recording.thumbnail_url ? (
                    <img 
                      src={recording.thumbnail_url} 
                      alt={`Day ${recording.day_number} thumbnail`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="h-8 w-8 text-primary" />
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(recording.duration_seconds)}
                  </div>
                  <Badge 
                    variant={recording.recording_status === 'completed' ? 'default' : 'secondary'}
                    className="absolute top-2 left-2"
                  >
                    {recording.recording_status}
                  </Badge>
                </div>

                {/* Content */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">Day {recording.day_number}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(recording.recording_date).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        Day {recording.day_number} – {recording.topic_title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-3">
                        {recording.auto_generated_description}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBookmark(recording)}
                        className="text-muted-foreground hover:text-primary"
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="h-4 w-4" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                      
                      {recording.recording_status === 'completed' && (
                        <Button
                          onClick={() => {
                            trackView(recording);
                            // Open video player
                            window.open(recording.mp4_url || recording.hls_url, '_blank');
                          }}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Watch Now
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {recording.views_count} views
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(recording.recording_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDuration(recording.duration_seconds)}
                    </div>
                  </div>

                  {/* Expand/Collapse */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(recording)}
                    className="w-full justify-center"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Hide Q&A
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Ask a doubt from this class
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Expanded Q&A Section */}
              {isExpanded && (
                <div className="border-t p-6 bg-muted/30">
                  <div className="space-y-4">
                    {/* Ask Question */}
                    <div className="flex gap-3">
                      <Textarea
                        placeholder="Ask GEOVA a question about this class..."
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        className="flex-1"
                        rows={2}
                      />
                      <Button
                        onClick={() => askQuestion(recording)}
                        disabled={!questionText.trim() || isAskingQuestion}
                        className="self-end"
                      >
                        {isAskingQuestion ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Q&A History */}
                    {interactions.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          Class Q&A ({interactions.length})
                        </h4>
                        {interactions.map((interaction) => (
                          <div key={interaction.id} className="space-y-2">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={interaction.profiles?.avatar_url} />
                                <AvatarFallback>
                                  {interaction.profiles?.full_name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="bg-white rounded-lg p-3">
                                  <p className="text-sm">{interaction.question}</p>
                                  {interaction.timestamp_seconds && (
                                    <span className="text-xs text-muted-foreground">
                                      @ {Math.floor(interaction.timestamp_seconds / 60)}:{(interaction.timestamp_seconds % 60).toString().padStart(2, '0')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {interaction.ai_response && (
                              <div className="flex items-start gap-3 ml-8">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Bot className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <div className="bg-primary/5 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-medium text-primary">
                                        {interaction.ai_responder}
                                      </span>
                                    </div>
                                    <p className="text-sm">{interaction.ai_response}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {recordings.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No recordings yet</h3>
          <p className="text-muted-foreground">
            GEOVA recordings will appear here after the first class session.
          </p>
        </div>
      )}
    </div>
  );
};

export default GEOVARecordingsList;