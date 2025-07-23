import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCurrencyPricing } from "@/hooks/useCurrencyPricing";
import { Loader2, Clock, DollarSign } from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookingModal = ({ isOpen, onClose }: BookingModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    queryDescription: "",
    sessionDuration: "60"
  });
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currency, symbol } = useCurrencyPricing();

  const sessionPrices = {
    "60": currency === 'INR' ? 499 : 9.99,
    "90": currency === 'INR' ? 799 : 14.99
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book a session.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.fullName || !formData.email || !formData.queryDescription) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const sessionPrice = sessionPrices[formData.sessionDuration as keyof typeof sessionPrices];
      
      // Create booking record
      const { data: booking, error } = await supabase
        .from('mentor_bookings')
        .insert({
          user_id: user.id,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          query_description: formData.queryDescription,
          session_duration: parseInt(formData.sessionDuration),
          session_price: sessionPrice,
          currency: currency,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Navigate to payment page with booking details
      navigate('/payment', {
        state: {
          planName: `${formData.sessionDuration}-Minute Mentorship Session`,
          amount: sessionPrice,
          currency: currency,
          bookingId: booking.id,
          mentorName: 'Nagendra Singh',
          sessionDetails: {
            duration: formData.sessionDuration,
            fullName: formData.fullName,
            email: formData.email,
            query: formData.queryDescription
          }
        }
      });

      onClose();
      
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: "Unable to create booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Book Mentorship Session</DialogTitle>
          <DialogDescription>
            Schedule a personalized 1-on-1 session with Nagendra Singh
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Contact Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {/* Session Duration Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Session Duration *</Label>
            <RadioGroup
              value={formData.sessionDuration}
              onValueChange={(value) => handleInputChange('sessionDuration', value)}
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="60" id="session-60" />
                  <Label htmlFor="session-60" className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          60 Minutes Session
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Career guidance & personalized advice
                        </div>
                      </div>
                      <div className="font-bold text-primary flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {symbol}{sessionPrices["60"]}
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="90" id="session-90" />
                  <Label htmlFor="session-90" className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          90 Minutes Session
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Technical deep dive & hands-on coding
                        </div>
                      </div>
                      <div className="font-bold text-primary flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {symbol}{sessionPrices["90"]}
                      </div>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Query Description */}
          <div>
            <Label htmlFor="queryDescription">What would you like to discuss? *</Label>
            <Textarea
              id="queryDescription"
              value={formData.queryDescription}
              onChange={(e) => handleInputChange('queryDescription', e.target.value)}
              placeholder="Describe your goals, challenges, or specific topics you'd like to cover in this session..."
              rows={4}
              required
            />
          </div>

          {/* Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Session Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>{formData.sessionDuration} minutes</span>
              </div>
              <div className="flex justify-between">
                <span>Mentor:</span>
                <span>Nagendra Singh</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total Price:</span>
                <span>{symbol}{sessionPrices[formData.sessionDuration as keyof typeof sessionPrices]}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
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
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Proceed to Payment'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};