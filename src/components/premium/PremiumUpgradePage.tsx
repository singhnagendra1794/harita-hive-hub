
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, Crown, Star, Zap, Shield, Users } from 'lucide-react';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { toast } from 'sonner';

interface PricingTier {
  id: 'pro' | 'enterprise';
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
}

const PremiumUpgradePage: React.FC = () => {
  const { subscription, hasPremiumAccess, upgradeSubscription, loading } = usePremiumAccess();
  const [selectedTier, setSelectedTier] = useState<'pro' | 'enterprise'>('pro');
  const [upgrading, setUpgrading] = useState(false);

  const pricingTiers: PricingTier[] = [
    {
      id: 'pro',
      name: 'Professional',
      price: '₹3,999/month ($49)',
      description: 'Perfect for GIS professionals and freelancers',
      icon: <Star className="h-6 w-6 text-blue-500" />,
      popular: true,
      features: [
        'Full access to Learn Section',
        'Map Playground & Spatial Analysis',
        'GeoAI Lab & Geo Processing Lab', 
        'WebGIS Builder & QGIS Integration',
        'Plugin Marketplace access',
        'Job posting & talent pool',
        'Live classes & premium content',
        'Community support'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '₹7,999/month ($99)',
      description: 'For organizations and enterprise teams',
      icon: <Shield className="h-6 w-6 text-purple-500" />,
      features: [
        'Everything in Professional',
        'Enterprise Data Integration',
        'Real-time IoT Data Processing',
        'Advanced GeoAI Engine',
        'Regulatory Compliance Toolkit',
        'Spatial Risk Analysis Engine',
        'Developer API & SDK Access',
        'White-label portal options',
        'Dedicated support & SLA',
        'Custom integrations'
      ]
    }
  ];

  const handleUpgrade = async (tier: 'pro' | 'enterprise') => {
    setUpgrading(true);
    try {
      await upgradeSubscription(tier);
      toast.success(`Successfully upgraded to ${tier} plan!`);
    } catch (error) {
      toast.error('Failed to upgrade subscription. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  const getCurrentPlanStatus = () => {
    if (!subscription) return 'Free';
    return subscription.subscription_tier.charAt(0).toUpperCase() + subscription.subscription_tier.slice(1);
  };

  if (loading) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="animate-pulse space-y-8">
          <div className="text-center">
            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Zap className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Upgrade to Premium</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Unlock the full potential of HaritaHive with premium features, exclusive content, and personalized learning experiences.
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-muted-foreground">Current Plan:</span>
          <Badge variant={hasPremiumAccess ? "default" : "secondary"}>
            {getCurrentPlanStatus()}
          </Badge>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pricingTiers.map((tier) => (
          <Card 
            key={tier.id} 
            className={`relative transition-all duration-200 hover:shadow-lg ${
              tier.popular ? 'border-primary scale-105 z-10' : 'hover:scale-102'
            } ${selectedTier === tier.id ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedTier(tier.id)}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-2">
                {tier.icon}
              </div>
              <CardTitle className="text-2xl">{tier.name}</CardTitle>
              <div className="text-3xl font-bold text-primary">
                {tier.price}
              </div>
              <CardDescription className="text-sm">
                {tier.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Separator />
              
              <ul className="space-y-3">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Separator />

              <Button 
                className="w-full" 
                variant={tier.popular ? "default" : "outline"}
                onClick={() => handleUpgrade(tier.id)}
                disabled={
                  upgrading || 
                  (subscription?.subscription_tier === tier.id && subscription?.status === 'active')
                }
              >
                {upgrading ? 'Processing...' : 
                 (subscription?.subscription_tier === tier.id && subscription?.status === 'active') ? 
                 'Current Plan' : 
                 `Upgrade to ${tier.name}`}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-4">Why Go Premium?</h2>
          <p className="text-muted-foreground">
            Join thousands of professionals who have accelerated their GIS careers with HaritaHive Premium
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Expert Community</h3>
            <p className="text-sm text-muted-foreground">
              Connect with industry experts and get personalized guidance
            </p>
          </div>
          
          <div className="text-center">
            <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Advanced Tools</h3>
            <p className="text-sm text-muted-foreground">
              Access premium analysis tools and downloadable resources
            </p>
          </div>
          
          <div className="text-center">
            <Crown className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Exclusive Content</h3>
            <p className="text-sm text-muted-foreground">
              Get early access to new courses and premium tutorials
            </p>
          </div>
        </div>
      </div>

      {/* FAQ or Additional Info */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold">Need Help Choosing?</h3>
            <p className="text-sm text-muted-foreground">
              Contact our team for personalized recommendations
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <Button variant="outline">Contact Sales</Button>
            <Button variant="outline">Schedule Demo</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PremiumUpgradePage;
