import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  X, 
  Heart,
  Bug,
  Lightbulb,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const FeedbackWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [feedbackType, setFeedbackType] = useState<'suggestion' | 'bug' | 'feature'>('suggestion');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      toast({
        title: "Missing Feedback",
        description: "Please enter your feedback before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate feedback submission - replace with actual submission logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Thank You!",
        description: "Your feedback has been submitted successfully. We appreciate your input!",
      });
      
      setFeedback('');
      setEmail('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Submission Failed",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFeedbackIcon = () => {
    switch (feedbackType) {
      case 'bug':
        return <Bug className="h-4 w-4" />;
      case 'feature':
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <Heart className="h-4 w-4" />;
    }
  };

  const getFeedbackLabel = () => {
    switch (feedbackType) {
      case 'bug':
        return 'Bug Report';
      case 'feature':
        return 'Feature Request';
      default:
        return 'General Feedback';
    }
  };

  return (
    <>
      {/* Floating Feedback Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-12 w-12 shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
          size="sm"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="sr-only">Open feedback widget</span>
        </Button>
      </div>

      {/* Feedback Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-background border shadow-xl">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">Share Your Feedback</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Help us improve Harita Hive with your suggestions, bug reports, or feature requests.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Feedback Type Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Feedback Type</label>
                  <div className="flex gap-2">
                    {[
                      { value: 'suggestion', label: 'Suggestion', icon: Heart },
                      { value: 'bug', label: 'Bug Report', icon: Bug },
                      { value: 'feature', label: 'Feature Request', icon: Lightbulb }
                    ].map(({ value, label, icon: Icon }) => (
                      <Button
                        key={value}
                        type="button"
                        variant={feedbackType === value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFeedbackType(value as any)}
                        className="flex items-center gap-1"
                      >
                        <Icon className="h-3 w-3" />
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Feedback Text */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Your {getFeedbackLabel()}
                  </label>
                  <Textarea
                    placeholder="Tell us what's on your mind..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="min-h-[100px] resize-none"
                    required
                  />
                </div>

                {/* Email (Optional) */}
                {!user && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email (Optional)</label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave your email if you'd like us to follow up with you.
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Feedback
                      </>
                    )}
                  </Button>
                </div>

                {/* Community Links */}
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-3">
                    Join our community for support and discussions:
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('https://discord.gg/haritahive', '_blank')}
                      className="flex-1"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Discord
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('https://t.me/haritahive', '_blank')}
                      className="flex-1"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Telegram
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default FeedbackWidget;