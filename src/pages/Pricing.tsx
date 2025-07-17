

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { PaymentModal } from "@/components/payment/PaymentModal";

const Pricing = () => {

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    planName: string;
    priceUSD: number;
    priceINR: number;
    features: string[];
  } | null>(null);

  const handleSubscribe = (planName: string, priceUSD: number, priceINR: number, features: string[]) => {
    setSelectedPlan({ planName, priceUSD, priceINR, features });
    setPaymentModalOpen(true);
  };

  return (
    <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include access to our community and basic features.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border-muted">
            <CardHeader>
              <CardTitle className="text-xl">Free</CardTitle>
              <div className="text-3xl font-bold">₹0<span className="text-lg text-muted-foreground font-normal">/month</span></div>
              <CardDescription>Get started with basic community features</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>1-day trial of QGIS Project</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>1-day trial of Geo-Dashboard</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>Browse job postings</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>Community forum access</span>
                </li>
                <li className="flex items-center">
                  <X className="h-4 w-4 mr-2 text-red-500" />
                  <span className="text-muted-foreground">No access to Learn section</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Get Started Free
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="border-primary relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-3 py-1">Popular</Badge>
            </div>
            <CardHeader className="pt-8">
              <CardTitle className="text-xl">Professional</CardTitle>
              <div className="space-y-1">
                <div className="text-3xl font-bold">$49<span className="text-lg text-muted-foreground font-normal">/month</span></div>
                <div className="text-xl font-semibold text-muted-foreground">₹3,999<span className="text-sm font-normal">/month</span></div>
              </div>
              <CardDescription>For serious GIS professionals</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>Full access to Learn section</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>QGIS Project integration</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>Basic Geo-Dashboard features</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>Post up to 5 job listings</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>Enhanced profile features</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>Priority support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="space-y-3">
              <Button 
                className="w-full"
                onClick={() => handleSubscribe("Professional Plan", 49, 3999, [
                  "Full access to Learn section",
                  "QGIS Project integration", 
                  "Basic Geo-Dashboard features",
                  "Post up to 5 job listings",
                  "Enhanced profile features",
                  "Priority support"
                ])}
              >
                Subscribe Now
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="border-muted">
            <CardHeader>
              <CardTitle className="text-xl">Enterprise</CardTitle>
              <div className="space-y-1">
                <div className="text-3xl font-bold">$99<span className="text-lg text-muted-foreground font-normal">/month</span></div>
                <div className="text-xl font-semibold text-muted-foreground">₹7,999<span className="text-sm font-normal">/month</span></div>
              </div>
              <CardDescription>For teams and organizations</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>Everything in Professional</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>Team collaboration features</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>Advanced Geo-Dashboard</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>Unlimited job postings</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>API access</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>Dedicated support</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>Custom integration options</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleSubscribe("Enterprise Plan", 99, 7999, [
                  "Everything in Professional",
                  "Team collaboration features",
                  "Advanced Geo-Dashboard",
                  "Unlimited job postings",
                  "API access",
                  "Dedicated support",
                  "Custom integration options"
                ])}
              >
                Subscribe Now
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Need a custom solution?</h2>
          <p className="text-muted-foreground mb-6">
            We offer tailored plans for large organizations and special requirements.
          </p>
          <Button variant="secondary">Get in Touch</Button>
        </div>

        {/* Payment Modal */}
        {selectedPlan && (
          <PaymentModal
            isOpen={paymentModalOpen}
            onClose={() => {
              setPaymentModalOpen(false);
              setSelectedPlan(null);
            }}
            planName={selectedPlan.planName}
            priceUSD={selectedPlan.priceUSD}
            priceINR={selectedPlan.priceINR}
            features={selectedPlan.features}
          />
        )}
      </div>
  );
};

export default Pricing;
