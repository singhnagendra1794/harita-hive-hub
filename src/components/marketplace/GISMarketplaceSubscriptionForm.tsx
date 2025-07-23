import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, CheckCircle, Clock, Globe, ArrowRight } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const GISMarketplaceSubscriptionForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    occupation: "",
    intendedUse: ""
  });

  const detectUserRegion = () => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timezone.includes('Asia/Kolkata') || timezone.includes('Asia/Calcutta') ? 'IN' : 'INTL';
  };

  const region = detectUserRegion();
  const amount = region === 'IN' ? 1249 : 14.99;
  const currency = region === 'IN' ? 'INR' : 'USD';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe to the GIS marketplace.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (!formData.fullName || !formData.occupation || !formData.intendedUse) {
      toast({
        title: "Form Incomplete",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Load Razorpay script if not loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        await new Promise((resolve) => { script.onload = resolve; });
      }

      // Create subscription order
      const { data, error } = await supabase.functions.invoke('gis-marketplace-subscribe', {
        body: {
          fullName: formData.fullName,
          email: formData.email,
          occupation: formData.occupation,
          intendedUse: formData.intendedUse,
          amount: amount,
          currency: currency
        }
      });

      if (error) {
        throw error;
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Harita Hive',
        description: 'GIS Marketplace - 3 Month Access',
        order_id: data.orderId,
        prefill: {
          email: formData.email,
          name: formData.fullName,
        },
        theme: { color: '#3B82F6' },
        handler: async function (response: any) {
          try {
            toast({
              title: "Payment Successful!",
              description: "Welcome to the GIS Marketplace! You now have 3-month access to all premium tools.",
            });
            
            // Redirect to marketplace with success status
            navigate('/gis-marketplace?status=success');
            
          } catch (error) {
            console.error('Post-payment error:', error);
            toast({
              title: "Payment Successful",
              description: "Payment completed! Please visit the GIS marketplace to access your tools.",
            });
            navigate('/gis-marketplace');
          }
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            toast({
              title: "Payment Cancelled",
              description: "You can try again anytime to subscribe to the GIS marketplace.",
              variant: "destructive",
            });
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error: any) {
      console.error('Subscription error:', error);
      toast({
        title: "Subscription Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Subscribe to GIS Marketplace</h1>
        <p className="text-muted-foreground text-lg">
          Get 3-month access to premium GIS tools, scripts, and templates
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Subscription Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              GIS Marketplace Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-3xl font-bold">
                {currency} {amount.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">3-month access</div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">What's included:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Access to all premium GIS tools</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>QGIS plugins and scripts</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Web mapping templates</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Sample datasets and documentation</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Unlimited downloads</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Commercial license included</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>90 days access from subscription date</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Globe className="h-4 w-4" />
                <span>{region === 'IN' ? 'Indian pricing (INR)' : 'International pricing (USD)'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Information Form */}
        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed (from your account)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation/Role *</Label>
                <Select 
                  value={formData.occupation} 
                  onValueChange={(value) => handleInputChange('occupation', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your occupation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="researcher">Researcher</SelectItem>
                    <SelectItem value="gis-analyst">GIS Analyst</SelectItem>
                    <SelectItem value="geospatial-developer">Geospatial Developer</SelectItem>
                    <SelectItem value="urban-planner">Urban Planner</SelectItem>
                    <SelectItem value="environmental-scientist">Environmental Scientist</SelectItem>
                    <SelectItem value="consultant">Consultant</SelectItem>
                    <SelectItem value="government-employee">Government Employee</SelectItem>
                    <SelectItem value="private-sector">Private Sector Professional</SelectItem>
                    <SelectItem value="freelancer">Freelancer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="intendedUse">Intended Use *</Label>
                <Textarea
                  id="intendedUse"
                  value={formData.intendedUse}
                  onChange={(e) => handleInputChange('intendedUse', e.target.value)}
                  placeholder="Describe how you plan to use the GIS tools (e.g., research project, commercial work, learning, etc.)"
                  rows={3}
                  required
                />
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    "Processing..."
                  ) : (
                    <>
                      Subscribe for {currency} {amount.toLocaleString()}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-2">
                  Secure payment powered by Razorpay. You will be redirected to complete payment.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GISMarketplaceSubscriptionForm;