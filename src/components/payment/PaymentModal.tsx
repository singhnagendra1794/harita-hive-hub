import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Upload, Copy, Check, CreditCard, Smartphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  priceUSD: number;
  priceINR: number;
  features: string[];
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  planName,
  priceUSD,
  priceINR,
  features
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'paypal' | null>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [upiIdCopied, setUpiIdCopied] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const UPI_ID = "cnsj05061993-3@okicici";
  const PAYPAL_LINK = "https://paypal.me/nagendrasingh1794";

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
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      setPaymentProof(file);
    }
  };

  const submitPaymentProof = async () => {
    if (!user || !selectedMethod || !paymentProof) {
      toast({
        title: "Missing Information",
        description: "Please select payment method and upload proof",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Upload payment proof to storage
      const fileExt = paymentProof.name.split('.').pop();
      const fileName = `payment-proof-${user.id}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('course-content')
        .upload(`payment-proofs/${fileName}`, paymentProof);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('course-content')
        .getPublicUrl(`payment-proofs/${fileName}`);

      // Save payment proof record
      const amount = selectedMethod === 'upi' ? priceINR : priceUSD;
      const currency = selectedMethod === 'upi' ? 'INR' : 'USD';

      const { error: insertError } = await supabase
        .from('payment_proofs')
        .insert({
          user_id: user.id,
          plan_name: planName,
          amount: amount,
          currency: currency,
          payment_method: selectedMethod,
          proof_image_url: urlData.publicUrl,
          status: 'pending'
        });

      if (insertError) throw insertError;

      toast({
        title: "Payment Proof Submitted!",
        description: "Your payment is under review. You'll get access after approval.",
      });

      onClose();
      setSelectedMethod(null);
      setPaymentProof(null);
    } catch (error: any) {
      console.error('Payment proof submission error:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "There was an issue submitting your payment proof.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const resetModal = () => {
    setSelectedMethod(null);
    setPaymentProof(null);
    setUpiIdCopied(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Your Subscription</DialogTitle>
          <DialogDescription>
            Choose your payment method for {planName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {planName}
                <Badge variant="outline">Selected Plan</Badge>
              </CardTitle>
              <div className="flex items-center space-x-4">
                <span className="text-2xl font-bold">₹{priceINR}</span>
                <span className="text-lg text-muted-foreground">or ${priceUSD}</span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          {!selectedMethod ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Payment Method</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center space-y-2"
                  onClick={() => setSelectedMethod('upi')}
                >
                  <Smartphone className="h-8 w-8" />
                  <div className="text-center">
                    <div className="font-semibold">UPI Payment</div>
                    <div className="text-sm text-muted-foreground">For Indian Clients</div>
                    <div className="text-lg font-bold">₹{priceINR}</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center space-y-2"
                  onClick={() => setSelectedMethod('paypal')}
                >
                  <CreditCard className="h-8 w-8" />
                  <div className="text-center">
                    <div className="font-semibold">PayPal</div>
                    <div className="text-sm text-muted-foreground">International Clients</div>
                    <div className="text-lg font-bold">${priceUSD}</div>
                  </div>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Payment Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {selectedMethod === 'upi' ? (
                      <>
                        <Smartphone className="h-5 w-5 mr-2" />
                        UPI Payment Instructions
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        PayPal Payment Instructions
                      </>
                    )}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedMethod(null)}
                  >
                    ← Change Method
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedMethod === 'upi' ? (
                    <>
                      <div className="text-center mb-4">
                        <img 
                          src="/lovable-uploads/upi-qr-code.png" 
                          alt="UPI QR Code for Payment" 
                          className="w-32 h-32 mx-auto object-contain bg-white rounded-lg p-2 border"
                        />
                        <p className="text-xs text-muted-foreground mt-2">Scan with any UPI app</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <Label className="text-sm font-medium">Send ₹{priceINR} to UPI ID:</Label>
                        <div className="flex items-center justify-between mt-2">
                          <code className="text-sm bg-background px-2 py-1 rounded flex-1 mr-2">
                            {UPI_ID}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={copyUPIId}
                          >
                            {upiIdCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Payee: Choudhary Nagendra Singh Jhund</p>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 bg-muted rounded-lg">
                      <Label className="text-sm font-medium">Send ${priceUSD} via PayPal:</Label>
                      <div className="mt-2">
                        <a
                          href={PAYPAL_LINK}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline font-medium"
                        >
                          {PAYPAL_LINK}
                        </a>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Secure payment via PayPal</p>
                    </div>
                  )}

                  <Separator />

                  {/* File Upload */}
                  <div className="space-y-3">
                    <Label htmlFor="payment-proof">Upload Payment Screenshot/Receipt</Label>
                    <Input
                      id="payment-proof"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                    {paymentProof && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {paymentProof.name}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Please upload a clear screenshot of your payment confirmation. Max file size: 5MB
                    </p>
                  </div>

                  <Button 
                    onClick={submitPaymentProof} 
                    disabled={uploading || !paymentProof} 
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? 'Submitting...' : 'Submit Payment Proof'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};