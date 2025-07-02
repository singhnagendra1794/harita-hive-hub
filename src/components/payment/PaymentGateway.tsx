
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, Smartphone, Upload, Copy, Check } from 'lucide-react';

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
  courseId,
  subscriptionType,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi_manual' | 'paypal'>('razorpay');
  const [manualPaymentProof, setManualPaymentProof] = useState<File | null>(null);
  const [upiIdCopied, setUpiIdCopied] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const UPI_ID = "cnsj05061993-3@okicici";

  const createPaymentRecord = async (method: string, gatewayId?: string) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        amount: amount,
        currency: currency,
        payment_method: method,
        payment_gateway_id: gatewayId,
        course_id: courseId,
        subscription_type: subscriptionType,
        status: method === 'upi_manual' ? 'pending' : 'completed'
      })
      .select()
      .single();

    if (error) {
      console.error('Payment record error:', error);
      return null;
    }

    return data;
  };

  const handleRazorpayPayment = async () => {
    setLoading(true);
    try {
      // In a real implementation, you would:
      // 1. Create order on your backend
      // 2. Initialize Razorpay with order details
      // 3. Handle payment success/failure
      
      // For now, we'll simulate a successful payment
      const paymentRecord = await createPaymentRecord('razorpay', 'rzp_' + Date.now());
      
      if (paymentRecord) {
        toast({
          title: "Payment Successful!",
          description: "Your payment has been processed successfully.",
        });
        onSuccess?.();
      }
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an issue processing your payment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayPalPayment = async () => {
    setLoading(true);
    try {
      // In a real implementation, you would integrate with PayPal SDK
      const paymentRecord = await createPaymentRecord('paypal', 'pp_' + Date.now());
      
      if (paymentRecord) {
        toast({
          title: "Payment Successful!",
          description: "Your PayPal payment has been processed.",
        });
        onSuccess?.();
      }
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an issue with PayPal payment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualUPIPayment = async () => {
    if (!manualPaymentProof) {
      toast({
        title: "Upload Required",
        description: "Please upload payment proof to proceed.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Upload payment proof to Supabase storage
      const fileExt = manualPaymentProof.name.split('.').pop();
      const fileName = `payment-proof-${user?.id}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('course-content')
        .upload(`payments/${fileName}`, manualPaymentProof);

      if (uploadError) throw uploadError;

      const paymentRecord = await createPaymentRecord('upi_manual');
      
      if (paymentRecord) {
        toast({
          title: "Payment Submitted!",
          description: "Your payment proof has been submitted for verification.",
        });
        onSuccess?.();
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "There was an issue uploading your payment proof.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyUPIId = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setUpiIdCopied(true);
      toast({
        title: "Copied!",
        description: "UPI ID copied to clipboard",
      });
      setTimeout(() => setUpiIdCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please copy the UPI ID manually",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setManualPaymentProof(file);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Complete Payment</CardTitle>
        <CardDescription>
          Choose your preferred payment method
        </CardDescription>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">
            {currency === 'INR' ? '₹' : '$'}{amount}
          </span>
          <Badge variant="outline">{currency}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Razorpay Payment */}
        <div className="space-y-4">
          <Button
            onClick={() => setPaymentMethod('razorpay')}
            variant={paymentMethod === 'razorpay' ? 'default' : 'outline'}
            className="w-full justify-start"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Cards, UPI, NetBanking (Razorpay)
          </Button>
          
          {paymentMethod === 'razorpay' && (
            <div className="pl-6 space-y-2">
              <p className="text-sm text-muted-foreground">
                Secure payment via Razorpay - supports all major payment methods
              </p>
              <Button onClick={handleRazorpayPayment} disabled={loading} className="w-full">
                {loading ? 'Processing...' : 'Pay Now'}
              </Button>
            </div>
          )}
        </div>

        <Separator />

        {/* PayPal Payment */}
        <div className="space-y-4">
          <Button
            onClick={() => setPaymentMethod('paypal')}
            variant={paymentMethod === 'paypal' ? 'default' : 'outline'}
            className="w-full justify-start"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.252-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9L7.6 21.425h4.87c.435 0 .81-.316.88-.74l.036-.156.673-3.352.043-.186c.07-.424.444-.74.88-.74h.553c3.585 0 6.39-1.455 7.208-5.66.342-1.756.166-3.226-.607-4.27z"/>
            </svg>
            PayPal
          </Button>
          
          {paymentMethod === 'paypal' && (
            <div className="pl-6 space-y-2">
              <p className="text-sm text-muted-foreground">
                International payments via PayPal
              </p>
              <Button onClick={handlePayPalPayment} disabled={loading} className="w-full">
                {loading ? 'Processing...' : 'Pay with PayPal'}
              </Button>
            </div>
          )}
        </div>

        <Separator />

        {/* Manual UPI Payment */}
        <div className="space-y-4">
          <Button
            onClick={() => setPaymentMethod('upi_manual')}
            variant={paymentMethod === 'upi_manual' ? 'default' : 'outline'}
            className="w-full justify-start"
          >
            <Smartphone className="mr-2 h-4 w-4" />
            Direct UPI Transfer
          </Button>
          
          {paymentMethod === 'upi_manual' && (
            <div className="pl-6 space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <Label className="text-sm font-medium">Pay to UPI ID:</Label>
                <div className="flex items-center justify-between mt-2">
                  <code className="text-sm bg-background px-2 py-1 rounded">
                    {UPI_ID}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyUPIId}
                    className="ml-2"
                  >
                    {upiIdCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payment-proof">Upload Payment Screenshot</Label>
                <Input
                  id="payment-proof"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
                {manualPaymentProof && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {manualPaymentProof.name}
                  </p>
                )}
              </div>
              
              <Button 
                onClick={handleManualUPIPayment} 
                disabled={loading || !manualPaymentProof} 
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {loading ? 'Uploading...' : 'Submit Payment Proof'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
