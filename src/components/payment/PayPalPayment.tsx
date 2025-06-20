
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

interface PayPalPaymentProps {
  amount: number;
  planName: string;
  onPaymentSuccess: () => void;
}

const PayPalPayment = ({ amount, planName, onPaymentSuccess }: PayPalPaymentProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Convert INR to USD (approximate rate for demo)
  const usdAmount = (amount * 0.012).toFixed(2);

  const handlePayPalPayment = () => {
    setIsProcessing(true);
    
    // In a real implementation, this would integrate with PayPal SDK
    // For now, we'll simulate the PayPal payment process
    
    // Simulate PayPal redirect
    const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=your-paypal-email@example.com&item_name=${encodeURIComponent(planName)}&amount=${usdAmount}&currency_code=USD`;
    
    // Open PayPal in new window
    const paypalWindow = window.open(paypalUrl, 'paypal', 'width=800,height=600');
    
    // Simulate payment completion
    setTimeout(() => {
      setIsProcessing(false);
      if (paypalWindow) {
        paypalWindow.close();
      }
      alert("PayPal payment completed successfully!");
      onPaymentSuccess();
    }, 5000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          PayPal Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Payment Details:</p>
          <p className="font-medium">{planName}</p>
          <p className="text-lg font-bold">${usdAmount} USD</p>
          <p className="text-sm text-muted-foreground">(≈ ₹{amount} INR)</p>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>• Secure payment through PayPal</p>
          <p>• Supports credit cards, debit cards, and PayPal balance</p>
          <p>• International payment accepted</p>
        </div>

        <Button 
          onClick={handlePayPalPayment}
          disabled={isProcessing}
          className="w-full bg-[#0070ba] hover:bg-[#005ea6]"
          size="lg"
        >
          {isProcessing ? "Processing..." : "Pay with PayPal"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PayPalPayment;
