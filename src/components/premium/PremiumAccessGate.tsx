import React from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, ArrowRight } from 'lucide-react';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAuth } from '@/contexts/AuthContext';

interface PremiumAccessGateProps {
  children: React.ReactNode;
  requiredTier?: 'free' | 'premium' | 'pro' | 'enterprise';
  fallbackPath?: string;
  showUpgradeCard?: boolean;
  featureName?: string;
  featureDescription?: string;
}

const PremiumAccessGate: React.FC<PremiumAccessGateProps> = ({
  children,
  requiredTier = 'pro',
  fallbackPath = '/choose-plan',
  showUpgradeCard = true,
  featureName = 'Premium Feature',
  featureDescription = 'This feature requires a premium subscription to access.'
}) => {
  const { user, loading: authLoading } = useAuth();
  const { hasAccess, loading: premiumLoading } = usePremiumAccess();
  const { isSuperAdmin, loading: rolesLoading } = useUserRoles();

  // Show loading state
  if (authLoading || premiumLoading || rolesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking access permissions...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Super admin bypass
  if (isSuperAdmin()) {
    return <>{children}</>;
  }

  // Check access level
  const userHasAccess = hasAccess(requiredTier);

  if (!userHasAccess) {
    if (showUpgradeCard) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center border-2 border-dashed border-primary/20">
              <CardHeader className="pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl mb-2 flex items-center justify-center gap-2">
                  <Crown className="w-6 h-6 text-primary" />
                  {featureName}
                </CardTitle>
                <CardDescription className="text-lg">
                  {featureDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  <Badge variant="outline" className="text-sm">
                    Enhanced Features
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    Priority Support
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    Advanced Tools
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    size="lg" 
                    className="w-full"
                    onClick={() => window.location.href = fallbackPath}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to {requiredTier === 'pro' ? 'Professional' : 'Premium'} Plan
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.history.back()}
                  >
                    Go Back
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground pt-4 border-t">
                  <p>
                    Need help choosing? <a href="/contact" className="text-primary hover:underline">Contact our team</a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    // Redirect to fallback path if no upgrade card
    return <Navigate to={fallbackPath} replace />;
  }

  // User has access, render children
  return <>{children}</>;
};

export default PremiumAccessGate;