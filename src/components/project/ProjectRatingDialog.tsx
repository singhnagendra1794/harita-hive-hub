import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProjectRatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
  onRated?: () => void;
}

export const ProjectRatingDialog: React.FC<ProjectRatingDialogProps> = ({
  open,
  onOpenChange,
  projectId,
  projectTitle,
  onRated
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingRating, setExistingRating] = useState<any>(null);

  useEffect(() => {
    if (open && user) {
      fetchExistingRating();
    }
  }, [open, user, projectId]);

  const fetchExistingRating = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('project_ratings')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single();

      if (data) {
        setExistingRating(data);
        setRating(data.rating);
        setReview(data.review || '');
      }
    } catch (error) {
      // No existing rating - that's fine
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || rating === 0) return;

    setLoading(true);
    try {
      if (existingRating) {
        // Update existing rating
        const { error } = await supabase
          .from('project_ratings')
          .update({
            rating,
            review: review.trim() || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRating.id);

        if (error) throw error;
      } else {
        // Create new rating
        const { error } = await supabase
          .from('project_ratings')
          .insert({
            project_id: projectId,
            user_id: user.id,
            rating,
            review: review.trim() || null
          });

        if (error) throw error;
      }

      // Log activity
      await supabase.rpc('log_project_activity', {
        p_project_id: projectId,
        p_user_id: user.id,
        p_activity_type: 'project_rated',
        p_description: `Project rated ${rating} stars`,
        p_activity_data: { rating, review: review.trim() }
      });

      toast({
        title: "Success!",
        description: `Your ${existingRating ? 'updated ' : ''}rating has been submitted.`
      });

      onRated?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setHoverRating(0);
    setReview('');
    setExistingRating(null);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetForm();
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Project</DialogTitle>
          <DialogDescription>
            Share your feedback on "{projectTitle}"
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  className="p-1 hover:scale-110 transition-transform"
                  onMouseEnter={() => setHoverRating(i + 1)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(i + 1)}
                >
                  <Star
                    className={`h-6 w-6 ${
                      i < (hoverRating || rating)
                        ? 'fill-primary text-primary'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="review">Review (Optional)</Label>
            <Textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your thoughts about this project..."
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading || rating === 0}>
              {loading ? 'Submitting...' : existingRating ? 'Update Rating' : 'Submit Rating'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};