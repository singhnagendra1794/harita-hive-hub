import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, User, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WaitlistFormProps {
  courseId: string;
  courseTitle: string;
  onClose: () => void;
}

export const WaitlistForm = ({
  courseId,
  courseTitle,
  onClose
}: WaitlistFormProps) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('course-waitlist', {
        body: {
          courseId,
          courseTitle,
          fullName: formData.fullName,
          email: formData.email
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Successfully Joined Waitlist!",
          description: "We'll notify you when enrollment opens for the next cohort."
        });
        onClose();
      }
    } catch (error: any) {
      toast({
        title: "Failed to Join Waitlist",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle>Join Waitlist</CardTitle>
          <p className="text-sm text-muted-foreground">
            Get notified when <strong>{courseTitle}</strong> enrollment opens
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Joining...' : 'Join Waitlist'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={onClose}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};