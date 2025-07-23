import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send } from "lucide-react";

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MessageModal = ({ isOpen, onClose }: MessageModalProps) => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to send a message.",
        variant: "destructive"
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message before sending.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('mentor_messages')
        .insert({
          user_id: user.id,
          sender_type: 'user',
          message: message.trim(),
          is_read: false,
          admin_replied: false
        });

      if (error) throw error;

      toast({
        title: "Message Sent Successfully!",
        description: "Nagendra will review your message and respond soon. You'll receive an email notification when he replies.",
      });

      setMessage("");
      onClose();
      
    } catch (error) {
      console.error('Message error:', error);
      toast({
        title: "Failed to Send Message",
        description: "Unable to send your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Send Message to Nagendra</DialogTitle>
          <DialogDescription>
            Send a direct message to Nagendra Singh for quick questions or mentorship inquiries.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi Nagendra, I have a question about..."
              rows={5}
              className="resize-none"
              required
            />
            <p className="text-xs text-muted-foreground mt-2">
              You'll receive an email notification when Nagendra responds to your message.
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !message.trim()}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};