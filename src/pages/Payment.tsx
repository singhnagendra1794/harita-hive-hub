import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, CreditCard, Smartphone } from "lucide-react";
import { PaymentGateway } from "@/components/payment/PaymentGateway";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get plan details from route state or use default
  const planDetails = location.state || {
    planName: "Professional Plan",
    amount: 29,
    features: ["Full access to Learn section", "QGIS Project integration", "Basic Geo-Dashboard features"]
  };

  const handlePaymentSuccess = () => {
    navigate('/dashboard', { 
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

        <div className="flex justify-center">
          <PaymentGateway
            amount={planDetails.amount}
            currency="INR"
            subscriptionType={planDetails.planName}
            onSuccess={handlePaymentSuccess}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Payment;
