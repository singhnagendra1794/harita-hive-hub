
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ThumbsUp, ThumbsDown, HelpCircle, MessageSquare } from 'lucide-react';
import { useFeedback } from '@/hooks/useFeedback';
import { useAuth } from '@/contexts/AuthContext';

interface FeedbackWidgetProps {
  contentType: string;
  contentId: string;
  className?: string;
}

export const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
  contentType,
  contentId,
  className = ''
}) => {
  const { user } = useAuth();
  const { userFeedback, feedbackStats, loading, submitFeedback } = useFeedback(contentType, contentId);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');

  if (!user) return null;

  const handleFeedback = async (type: 'thumbs_up' | 'thumbs_down' | 'helpful' | 'not_helpful') => {
    await submitFeedback(type, comment);
    if (comment) {
      setComment('');
      setShowComment(false);
    }
  };

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Was this helpful?</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComment(!showComment)}
            >
              <MessageSquare className="h-4 w-4" />
              Comment
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant={userFeedback?.feedback_type === 'thumbs_up' ? 'default' : 'outline'}
              size="sm"
              disabled={loading}
              onClick={() => handleFeedback('thumbs_up')}
              className="flex items-center gap-1"
            >
              <ThumbsUp className="h-4 w-4" />
              {feedbackStats.thumbs_up}
            </Button>

            <Button
              variant={userFeedback?.feedback_type === 'thumbs_down' ? 'default' : 'outline'}
              size="sm"
              disabled={loading}
              onClick={() => handleFeedback('thumbs_down')}
              className="flex items-center gap-1"
            >
              <ThumbsDown className="h-4 w-4" />
              {feedbackStats.thumbs_down}
            </Button>

            <Button
              variant={userFeedback?.feedback_type === 'helpful' ? 'default' : 'outline'}
              size="sm"
              disabled={loading}
              onClick={() => handleFeedback('helpful')}
              className="flex items-center gap-1"
            >
              <HelpCircle className="h-4 w-4" />
              Helpful ({feedbackStats.helpful})
            </Button>
          </div>

          {showComment && (
            <div className="space-y-2">
              <Textarea
                placeholder="Share your thoughts or suggestions..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleFeedback(userFeedback?.feedback_type || 'helpful')}
                  disabled={loading}
                >
                  Submit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowComment(false);
                    setComment('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {userFeedback?.comment && (
            <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
              <strong>Your comment:</strong> {userFeedback.comment}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
