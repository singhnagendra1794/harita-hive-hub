
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, QrCode } from "lucide-react";

interface UPIPaymentProps {
  amount: number;
  planName: string;
  onPaymentSuccess: () => void;
}

const UPIPayment = ({ amount, planName, onPaymentSuccess }: UPIPaymentProps) => {
  const [selectedMethod, setSelectedMethod] = useState<'phonepe' | 'gpay' | 'upi'>('phonepe');
  const [upiId, setUpiId] = useState("cnsj05061993-3@okicici");

  const handleUPIPayment = (method: string) => {
    // In a real implementation, this would integrate with actual payment gateways
    const upiLink = `upi://pay?pa=${upiId}&pn=HaritaHive&am=${amount}&cu=INR&tn=Payment for ${planName}`;
    
    if (method === 'phonepe') {
      // PhonePe deep link
      window.open(`phonepe://pay?pa=${upiId}&pn=HaritaHive&am=${amount}&cu=INR&tn=Payment for ${planName}`, '_blank');
    } else if (method === 'gpay') {
      // Google Pay deep link
      window.open(`tez://upi/pay?pa=${upiId}&pn=HaritaHive&am=${amount}&cu=INR&tn=Payment for ${planName}`, '_blank');
    }
    
    // Simulate payment success for demo
    setTimeout(() => {
      alert("Payment initiated! Please complete the payment in your UPI app.");
      onPaymentSuccess();
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          UPI Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="upi-id">UPI ID</Label>
          <Input
            id="upi-id"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="Enter UPI ID"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Payment Method</Label>
          <div className="grid grid-cols-2 gap-2">
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
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Payment Details:</p>
          <p className="font-medium">{planName}</p>
          <p className="text-lg font-bold">₹{amount}</p>
        </div>

        <Button 
          onClick={() => handleUPIPayment(selectedMethod)}
          className="w-full"
          size="lg"
        >
          Pay with {selectedMethod === 'phonepe' ? 'PhonePe' : 'Google Pay'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UPIPayment;
