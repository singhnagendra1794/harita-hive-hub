import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Crown, Users, Zap } from 'lucide-react';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';


const ChoosePlan: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { upgradeSubscription } = usePremiumAccess();
  const [upgrading, setUpgrading] = useState(false);

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

  const handlePlanSelection = async (tier: 'free' | 'professional' | 'enterprise') => {
    if (tier === 'free') {
      if (!user) {
        navigate('/auth');
      } else {
        navigate('/dashboard');
      }
      return;
    }

    setUpgrading(true);
    try {
      await upgradeSubscription(tier === 'professional' ? 'premium' : 'enterprise');
      toast.success(`Successfully upgraded to ${tier} plan!`);
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to upgrade subscription. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  const handlePayment = (planName: string, priceUSD: number, priceINR: number, features: string[]) => {
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

  const region = detectUserRegion();
  const pricing = getPricingForRegion(region);

  return (
    <Layout>
      <div className="container max-w-6xl py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Welcome to Harita Hive! Please select a plan to get started with your GIS learning journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <Card className="border-muted">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-xl">Free</CardTitle>
              </div>
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
                <li className="flex items-center">
                  <X className="h-4 w-4 mr-2 text-red-500" />
                  <span className="text-muted-foreground">No GeoAI Lab access</span>
                </li>
                <li className="flex items-center">
                  <X className="h-4 w-4 mr-2 text-red-500" />
                  <span className="text-muted-foreground">No Web GIS Builder</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handlePlanSelection('free')}
                disabled={upgrading}
              >
                Continue with Free
              </Button>
            </CardFooter>
          </Card>

          {/* Professional Plan */}
          <Card className="border-primary relative scale-105 shadow-lg">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-3 py-1">Popular</Badge>
            </div>
            <CardHeader className="pt-8">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">Professional</CardTitle>
              </div>
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
                  <span>GeoAI Lab & Tools</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>Web GIS Builder</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>Post up to 5 job listings</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>Priority support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={() => handlePayment("Professional Plan", 49, 3999, [
                  "Full access to Learn section",
                  "QGIS Project integration", 
                  "Basic Geo-Dashboard features",
                  "GeoAI Lab & Tools",
                  "Web GIS Builder",
                  "Post up to 5 job listings",
                  "Priority support"
                ])}
                disabled={upgrading}
              >
                Subscribe Now
              </Button>
            </CardFooter>
          </Card>

          {/* Enterprise Plan */}
          <Card className="border-muted">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-500" />
                <CardTitle className="text-xl">Enterprise</CardTitle>
              </div>
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
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handlePayment("Enterprise Plan", 99, 7999, [
                  "Everything in Professional",
                  "Team collaboration features",
                  "Advanced Geo-Dashboard",
                  "Unlimited job postings",
                  "API access",
                  "Dedicated support",
                  "Custom integration options"
                ])}
                disabled={upgrading}
              >
                Contact Sales
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            You can always upgrade or change your plan later in your dashboard settings.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ChoosePlan;