import { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, CreditCard, Globe, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PlanDetails {
  planName: string;
  amount: number;
  currency: string;
  features: string[];
}

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  
  // Get plan details from route state or search params
  const planDetails: PlanDetails = location.state || {
    planName: searchParams.get('plan') || "Professional Plan",
    amount: parseInt(searchParams.get('amount') || "2999"),
    currency: searchParams.get('currency') || "INR",
    features: ["Full access to Learn section", "QGIS Project integration", "Advanced Geo-Dashboard features", "Priority support"]
  };

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const detectUserRegion = () => {
    // Simple region detection - can be enhanced with IP geolocation
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timezone.includes('Asia/Kolkata') || timezone.includes('Asia/Calcutta') ? 'IN' : 'INTL';
  };

  const getPricingForRegion = (region: string) => {
    if (region === 'IN') {
      return {
        currency: 'INR',
        professional: 2999,
        enterprise: 9999
      };
    } else {
      return {
        currency: 'USD',
        professional: 39,
        enterprise: 129
      };
    }
  };

  const handlePayment = async () => {
    if (!scriptLoaded || !user) {
      toast({
        title: "Error",
        description: "Payment system not ready or user not authenticated",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const region = detectUserRegion();
      const pricing = getPricingForRegion(region);
      
      const planType = planDetails.planName.toLowerCase().includes('enterprise') ? 'enterprise' : 'pro';
      const amount = planType === 'enterprise' ? pricing.enterprise : pricing.professional;

      // Create Razorpay order
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: amount,
          currency: pricing.currency,
          plan_type: planType
        }
      });

      if (error) {
        throw error;
      }

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: 'Harita Hive',
        description: `${planDetails.planName} Subscription`,
        order_id: data.order_id,
        prefill: {
          email: user.email,
          name: user.user_metadata?.full_name || '',
        },
        theme: {
          color: '#3B82F6'
        },
        handler: async function (response: any) {
          toast({
            title: "Payment Successful!",
            description: `Welcome to Harita Hive ${planType === 'pro' ? 'Professional' : 'Enterprise'}!`,
          });
          
          // Redirect to dashboard
          navigate('/dashboard', { 
            state: { 
              paymentSuccess: true, 
              planName: planDetails.planName 
            } 
          });
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            toast({
              title: "Payment Cancelled",
              description: "You can try again anytime",
              variant: "destructive",
            });
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const region = detectUserRegion();
  const pricing = getPricingForRegion(region);
  const planType = planDetails.planName.toLowerCase().includes('enterprise') ? 'enterprise' : 'pro';
  const displayAmount = planType === 'enterprise' ? pricing.enterprise : pricing.professional;

  return (
    <Layout>
      <div className="container max-w-4xl py-12">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Complete Your Payment</h1>
          <p className="text-muted-foreground">
            Secure payment powered by Razorpay - Trusted by millions worldwide
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Plan Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {planDetails.planName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">
                {pricing.currency} {displayAmount.toLocaleString()}
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">What's included:</h4>
                {planDetails.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    {feature}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  {region === 'IN' ? 'Indian pricing (INR)' : 'International pricing (USD)'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Customer Information</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Email: </span>
                    {user?.email}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Plan: </span>
                    {planDetails.planName}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount: </span>
                    {pricing.currency} {displayAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  Secured by Razorpay - 256-bit SSL encryption
                </div>
                
                <div className="text-xs text-muted-foreground">
                  <p>• Accepts all major credit/debit cards</p>
                  <p>• Net banking, UPI, and digital wallets supported</p>
                  <p>• International cards accepted</p>
                  <p>• Instant activation after successful payment</p>
                </div>
              </div>

              <Button 
                onClick={handlePayment}
                disabled={loading || !scriptLoaded}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  "Processing..."
                ) : (
                  `Pay ${pricing.currency} ${displayAmount.toLocaleString()}`
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By clicking "Pay", you agree to our Terms of Service and Privacy Policy.
                You will be redirected to Razorpay's secure payment gateway.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;