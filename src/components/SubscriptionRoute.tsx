import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface SubscriptionRouteProps {
  children: React.ReactNode;
  requiredTier?: 'free' | 'premium' | 'pro' | 'enterprise';
  redirectTo?: string;
}

const SubscriptionRoute: React.FC<SubscriptionRouteProps> = ({ 
  children, 
  requiredTier = 'premium',
  redirectTo = '/choose-plan'
}) => {
  const { user, loading: authLoading } = useAuth();
  const { hasAccess, loading: subscriptionLoading, subscription } = usePremiumAccess();

  if (authLoading || subscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If no subscription exists yet, redirect to plan selection
  if (!subscription) {
    return <Navigate to="/choose-plan" replace />;
  }

  // Check if user has required access level
  if (!hasAccess(requiredTier)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default SubscriptionRoute;