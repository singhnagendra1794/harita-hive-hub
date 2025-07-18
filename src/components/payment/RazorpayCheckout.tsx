import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayCheckoutProps {
  amount: number;
  currency: string;
  planName: string;
  planType: string;
  onSuccess: () => void;
  onError?: (error: string) => void;
}

export const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  amount,
  currency,
  planName,
  planType,
  onSuccess,
  onError
}) => {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to load payment system. Please try again.",
        variant: "destructive",
      });
    };
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [toast]);

  const handlePayment = async () => {
    if (!scriptLoaded || !user) {
      const error = "Payment system not ready or user not authenticated";
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      onError?.(error);
      return;
    }

    setLoading(true);

    try {
      // Create Razorpay order
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: amount,
          currency: currency,
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
        description: `${planName} Subscription`,
        order_id: data.order_id,
        prefill: {
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        },
        theme: {
          color: '#3B82F6'
        },
        handler: async function (response: any) {
          toast({
            title: "Payment Successful!",
            description: `Welcome to Harita Hive ${planType === 'pro' ? 'Professional' : 'Enterprise'}!`,
          });
          onSuccess();
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            toast({
              title: "Payment Cancelled",
              description: "You can try again anytime",
            });
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMessage = error.message || "Something went wrong. Please try again.";
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });
      onError?.(errorMessage);
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Secure Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Payment Summary</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Plan:</span>
              <span>{planName}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="font-semibold">{currency} {amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          Secured by Razorpay - 256-bit SSL encryption
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Supports all major credit/debit cards</p>
          <p>• Net banking, UPI, and digital wallets</p>
          <p>• International payments accepted</p>
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
            `Pay ${currency} ${amount.toLocaleString()}`
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          By proceeding, you agree to our Terms of Service and Privacy Policy
        </p>
      </CardContent>
    </Card>
  );
};