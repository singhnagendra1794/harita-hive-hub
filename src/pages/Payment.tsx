
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UPIPayment from "../components/payment/UPIPayment";
import PayPalPayment from "../components/payment/PayPalPayment";
import { ArrowLeft, Shield, CreditCard, Smartphone } from "lucide-react";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get plan details from route state or use default
  const planDetails = location.state || {
    planName: "Professional Plan",
    amount: 29,
    features: ["Full access to Learn section", "QGIS Project integration", "Basic Geo-Dashboard features"]
  };

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'paypal'>('upi');

  const handlePaymentSuccess = () => {
    // Redirect to success page or dashboard
    navigate('/pricing', { 
      state: { 
        paymentSuccess: true, 
        planName: planDetails.planName 
      } 
    });
  };

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
            Secure payment for your HaritaHive subscription
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'upi' | 'paypal')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upi" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  UPI (India)
                </TabsTrigger>
                <TabsTrigger value="paypal" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  PayPal (International)
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upi" className="mt-6">
                <UPIPayment
                  amount={planDetails.amount}
                  planName={planDetails.planName}
                  onPaymentSuccess={handlePaymentSuccess}
                />
              </TabsContent>
              
              <TabsContent value="paypal" className="mt-6">
                <PayPalPayment
                  amount={planDetails.amount}
                  planName={planDetails.planName}
                  onPaymentSuccess={handlePaymentSuccess}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">{planDetails.planName}</h3>
                  {planDetails.features && (
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      {planDetails.features.map((feature: string, index: number) => (
                        <li key={index}>• {feature}</li>
                      ))}
                    </ul>
                  )}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold">
                      {paymentMethod === 'upi' ? `₹${planDetails.amount}` : `$${(planDetails.amount * 0.012).toFixed(2)}`}
                    </span>
                  </div>
                  {paymentMethod === 'paypal' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      ≈ ₹{planDetails.amount} INR
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Secure payment processing</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Payment;
