import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SubscriptionRouteProps {
  children: React.ReactNode;
  requiredTier?: 'free' | 'premium' | 'pro' | 'enterprise';
  redirectTo?: string;
}

const SubscriptionRoute: React.FC<SubscriptionRouteProps> = ({ 
  children, 
  requiredTier = 'pro',
  redirectTo = '/premium-upgrade'
}) => {
  const { user, session, loading: authLoading } = useAuth();
  const { hasAccess, loading: subscriptionLoading, subscription } = usePremiumAccess();
  const { isSuperAdmin, loading: rolesLoading } = useUserRoles();
  // Simplified - rely on AuthContext and ProtectedRoute for session validation

  if (authLoading || subscriptionLoading || rolesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">
            {authLoading ? "Loading user data..." : rolesLoading ? "Loading user roles..." : "Loading subscription details..."}
          </p>
        </div>
      </div>
    );
  }

  if (!user || !session) {
    return <Navigate to="/auth" replace />;
  }

  // Super admin bypasses all subscription checks
  if (isSuperAdmin()) {
    return <>{children}</>;
  }

  // If no subscription exists yet, redirect to plan selection
  if (!subscription) {
    return <Navigate to="/choose-plan" replace />;
  }

  // Check if user has required access level
  if (!hasAccess(requiredTier)) {
    const subscriptionName = requiredTier === 'pro' ? 'Professional' : requiredTier === 'enterprise' ? 'Enterprise' : requiredTier;
    toast({
      title: "Professional Subscription Required",
      description: `This premium feature requires a ${subscriptionName} or Enterprise subscription. Please upgrade your plan.`,
      variant: "destructive",
    });
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default SubscriptionRoute;