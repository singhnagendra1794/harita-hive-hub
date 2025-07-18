import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CourseWaitlistFormProps {
  courseTitle: string;
  buttonText?: string;
  buttonClassName?: string;
}

export const CourseWaitlistForm: React.FC<CourseWaitlistFormProps> = ({
  courseTitle,
  buttonText = "Join Waitlist",
  buttonClassName = "w-full bg-slate-900 hover:bg-slate-800 text-white"
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Insert into waitlist table
      const { error: insertError } = await supabase
        .from('upcoming_course_waitlist')
        .insert({
          email: email.trim().toLowerCase(),
          full_name: null,
          phone: null,
          experience_level: 'beginner',
          motivation: `Interested in ${courseTitle}`,
          referral_source: 'course_card'
        });

      if (insertError) {
        if (insertError.code === '23505') { // Unique constraint violation
          toast({
            title: "✅ Already registered!",
            description: "You're already on our waitlist! We'll notify you when enrollment opens.",
          });
          setEmail(''); // Clear the form
          return;
        }
        throw insertError;
      }

      // Send confirmation email
      try {
        const { error: emailError } = await supabase.functions.invoke('send-waitlist-email', {
          body: {
            email: email.trim(),
            fullName: null,
            courseName: courseTitle
          }
        });

        if (emailError) {
          console.error('Email sending error:', emailError);
          // Don't fail the whole process if email fails
        }
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Continue with success message even if email fails
      }

      toast({
        title: "✅ You've been added to the waitlist!",
        description: "We'll notify you as soon as enrollment opens. Check your email for confirmation.",
      });

      // Clear the form
      setEmail('');

    } catch (error) {
      console.error('Error joining waitlist:', error);
      toast({
        title: "Error",
        description: "Failed to join waitlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input 
        type="email" 
        placeholder="Enter your email" 
        className="w-full"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isSubmitting}
      />
      <Button 
        type="submit"
        className={buttonClassName} 
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Adding...' : buttonText}
      </Button>
    </form>
  );
};