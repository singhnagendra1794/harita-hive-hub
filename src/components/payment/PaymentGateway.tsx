import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentGatewayProps {
  amount: number;
  currency?: string;
  courseId?: string;
  subscriptionType?: string;
  onSuccess?: () => void;
}

export const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  amount,
  currency = 'INR',
  subscriptionType,
  onSuccess
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleRazorpayPayment = async () => {
    if (!scriptLoaded || !user) return;
    setLoading(true);

    try {
      const planType = subscriptionType?.toLowerCase().includes('enterprise') ? 'enterprise' : 'pro';
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: { amount, currency, plan_type: planType }
      });

      if (error) throw error;

      const options = {
        key: data.key_id,
        amount: data.amount,
        currency: data.currency,
        name: 'Harita Hive',
        description: `${subscriptionType || 'Subscription'} Payment`,
        order_id: data.order_id,
        prefill: { email: user.email },
        theme: { color: '#3B82F6' },
        handler: () => {
          toast({ title: "Payment Successful!" });
          onSuccess?.();
        }
      };

      new window.Razorpay(options).open();
    } catch (error: any) {
      toast({ title: "Payment Failed", description: error.message, variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Secure Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          Secured by Razorpay
        </div>
        <Button 
          onClick={handleRazorpayPayment}
          disabled={loading || !scriptLoaded}
          className="w-full"
          size="lg"
        >
          {loading ? "Processing..." : `Pay ${currency} ${amount.toLocaleString()}`}
        </Button>
      </CardContent>
    </Card>
  );
};