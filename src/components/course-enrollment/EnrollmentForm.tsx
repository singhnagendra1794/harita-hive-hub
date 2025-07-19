import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Phone, MapPin, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EnrollmentFormProps {
  courseId: string;
  courseTitle: string;
  price: string;
  currency: string;
  isInternational: boolean;
  onClose: () => void;
  onSuccess: (enrollmentId: string) => void;
}

export const EnrollmentForm = ({
  courseId,
  courseTitle,
  price,
  currency,
  isInternational,
  onClose,
  onSuccess
}: EnrollmentFormProps) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    location: "",
    howDidYouHear: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.mobileNumber || !formData.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Create enrollment
      const { data: enrollmentData, error: enrollmentError } = await supabase.functions.invoke('course-enrollment', {
        body: {
          courseId,
          fullName: formData.fullName,
          email: formData.email,
          mobileNumber: formData.mobileNumber,
          location: formData.location,
          howDidYouHear: formData.howDidYouHear,
          isInternational
        }
      });

      if (enrollmentError) throw enrollmentError;

      if (!enrollmentData.success) {
        throw new Error("Failed to create enrollment");
      }

      // Step 2: Create Razorpay order
      const paymentAmount = isInternational ? 150 : 11999;
      const paymentCurrency = isInternational ? "USD" : "INR";

      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: paymentAmount,
          currency: paymentCurrency,
          enrollmentId: enrollmentData.enrollmentId,
          isEmi: !isInternational // EMI only for Indian users
        }
      });

      if (paymentError) throw paymentError;

      // Step 3: Initialize Razorpay payment
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        const options = {
          key: paymentData.key_id,
          amount: paymentData.amount,
          currency: paymentData.currency,
          name: "Harita Hive",
          description: courseTitle,
          order_id: paymentData.order_id,
          prefill: {
            name: formData.fullName,
            email: formData.email,
            contact: formData.mobileNumber
          },
          notes: {
            enrollment_id: enrollmentData.enrollmentId
          },
          handler: function (response: any) {
            toast({
              title: "Payment Successful!",
              description: "Your enrollment is now complete."
            });
            onSuccess(enrollmentData.enrollmentId);
          },
          modal: {
            ondismiss: function() {
              toast({
                title: "Payment Cancelled",
                description: "Your enrollment is saved. You can complete payment later.",
                variant: "destructive"
              });
            }
          }
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      } else {
        // Fallback: redirect to Razorpay hosted checkout
        const checkoutUrl = `https://checkout.razorpay.com/v1/checkout.js`;
        window.open(checkoutUrl, '_blank');
      }

    } catch (error: any) {
      toast({
        title: "Enrollment Failed",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle>Enroll in {courseTitle}</CardTitle>
          <div className="text-2xl font-bold text-primary">
            {currency} {price}
            {!isInternational && (
              <span className="text-sm text-muted-foreground block">
                3 monthly payments of ₹3,999 available
              </span>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <Label htmlFor="mobile">Mobile Number *</Label>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="mobile"
                  required
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})}
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location (City, Country) *</Label>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g., Mumbai, India"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="source">How did you hear about this course?</Label>
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <Select onValueChange={(value) => setFormData({...formData, howDidYouHear: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social-media">Social Media</SelectItem>
                    <SelectItem value="google-search">Google Search</SelectItem>
                    <SelectItem value="friend-referral">Friend/Colleague Referral</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="blog">Blog/Article</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
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