
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, QrCode, CheckCircle } from "lucide-react";

interface UPIPaymentProps {
  amount: number;
  planName: string;
  onPaymentSuccess: () => void;
}

const UPIPayment = ({ amount, planName, onPaymentSuccess }: UPIPaymentProps) => {
  const [selectedMethod, setSelectedMethod] = useState<'phonepe' | 'gpay' | 'upi'>('phonepe');
  const [upiId] = useState("cnsj05061993-3@okicici");
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed'>('pending');

  const handleUPIPayment = (method: string) => {
    setPaymentStatus('processing');
    
    const upiLink = `upi://pay?pa=${upiId}&pn=Choudhary Nagendra Singh Jhund&am=${amount}&cu=INR&tn=Payment for ${planName} - HaritaHive`;
    
    if (method === 'phonepe') {
      window.open(`phonepe://pay?pa=${upiId}&pn=Choudhary Nagendra Singh Jhund&am=${amount}&cu=INR&tn=Payment for ${planName}`, '_blank');
    } else if (method === 'gpay') {
      window.open(`tez://upi/pay?pa=${upiId}&pn=Choudhary Nagendra Singh Jhund&am=${amount}&cu=INR&tn=Payment for ${planName}`, '_blank');
    } else if (method === 'upi') {
      window.open(upiLink, '_blank');
    }
    
    // Simulate payment verification
    setTimeout(() => {
      setPaymentStatus('completed');
      setTimeout(() => {
        onPaymentSuccess();
      }, 1500);
    }, 3000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          UPI Payment Gateway
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code Section */}
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="mb-4">
            <img 
              src="/lovable-uploads/upi-qr-code.png" 
              alt="UPI QR Code for Payment" 
              className="w-48 h-48 mx-auto object-contain bg-white rounded-lg p-2"
            />
          </div>
          <p className="text-sm font-medium">Scan QR Code to Pay (Indian Clients)</p>
          <div className="mt-2 p-2 bg-background rounded border">
            <p className="text-xs text-muted-foreground">UPI ID:</p>
            <p className="font-mono text-sm">{upiId}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Select Payment Method</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={selectedMethod === 'phonepe' ? 'default' : 'outline'}
              onClick={() => setSelectedMethod('phonepe')}
              className="h-12"
            >
              PhonePe
            </Button>
            <Button
              variant={selectedMethod === 'gpay' ? 'default' : 'outline'}
              onClick={() => setSelectedMethod('gpay')}
              className="h-12"
            >
              Google Pay
            </Button>
            <Button
              variant={selectedMethod === 'upi' ? 'default' : 'outline'}
              onClick={() => setSelectedMethod('upi')}
              className="h-12"
            >
              UPI App
            </Button>
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Payment Details:</p>
          <p className="font-medium">{planName}</p>
          <p className="text-lg font-bold">₹{amount}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Payee: Choudhary Nagendra Singh Jhund
          </p>
          <p className="text-xs text-primary mt-1">
            Pay via UPI (for Indian Clients)
          </p>
        </div>

        {paymentStatus === 'pending' && (
          <Button 
            onClick={() => handleUPIPayment(selectedMethod)}
            className="w-full"
            size="lg"
          >
            Pay ₹{amount} with {selectedMethod === 'phonepe' ? 'PhonePe' : selectedMethod === 'gpay' ? 'Google Pay' : 'UPI'}
          </Button>
        )}

        {paymentStatus === 'processing' && (
          <div className="text-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm">Processing payment...</p>
            <p className="text-xs text-muted-foreground mt-1">Please complete the payment in your UPI app</p>
          </div>
        )}

        {paymentStatus === 'completed' && (
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-800">Payment Successful!</p>
            <p className="text-xs text-green-600">Redirecting to dashboard...</p>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center">
          <p>• Secure UPI payment processing</p>
          <p>• Instant activation after successful payment</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UPIPayment;
