

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const detectUserRegion = () => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timezone.includes('Asia/Kolkata') || timezone.includes('Asia/Calcutta') ? 'IN' : 'INTL';
  };

  const getPricingForRegion = (region: string) => {
    if (region === 'IN') {
      return {
        currency: 'INR',
        symbol: '₹',
        professional: 3999,
        enterprise: 7999
      };
    } else {
      return {
        currency: 'USD',
        symbol: '$',
        professional: 49,
        enterprise: 99
      };
    }
  };

  const handleFreeStart = () => {
    if (!user) {
      navigate('/auth');
    } else {
      navigate('/dashboard');
    }
  };

  const handleSubscribe = (planName: string, priceUSD: number, priceINR: number, features: string[]) => {
    const region = detectUserRegion();
    const pricing = getPricingForRegion(region);
    const amount = planName.toLowerCase().includes('enterprise') ? pricing.enterprise : pricing.professional;

    navigate('/checkout', {
      state: {
        planName,
        amount,
        currency: pricing.currency,
        features
      }
    });
  };

  const handleGetInTouch = () => {
    navigate('/contact');
  };

  const region = detectUserRegion();
  const pricing = getPricingForRegion(region);

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
              <Button variant="outline" className="w-full" onClick={handleFreeStart}>
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
                <div className="text-3xl font-bold">{pricing.symbol}{pricing.professional.toLocaleString()}<span className="text-lg text-muted-foreground font-normal">/month</span></div>
                {region === 'IN' ? (
                  <div className="text-lg text-muted-foreground">$49<span className="text-sm font-normal">/month</span></div>
                ) : (
                  <div className="text-lg text-muted-foreground">₹3,999<span className="text-sm font-normal">/month</span></div>
                )}
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
                  <span>Apply recommended jobs based on your profile</span>
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
                  "Apply recommended jobs based on your profile",
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
                <div className="text-3xl font-bold">{pricing.symbol}{pricing.enterprise.toLocaleString()}<span className="text-lg text-muted-foreground font-normal">/month</span></div>
                {region === 'IN' ? (
                  <div className="text-lg text-muted-foreground">$99<span className="text-sm font-normal">/month</span></div>
                ) : (
                  <div className="text-lg text-muted-foreground">₹7,999<span className="text-sm font-normal">/month</span></div>
                )}
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
                  <span>Geodashboard share, project sharing, reporting</span>
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
                  "Geodashboard share, project sharing, reporting",
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
          <Button variant="secondary" onClick={handleGetInTouch}>Get in Touch</Button>
        </div>

      </div>
  );
};

export default Pricing;
