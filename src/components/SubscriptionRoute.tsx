import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { useAuth } from '@/contexts/AuthContext';
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
  requiredTier = 'premium',
  redirectTo = '/choose-plan'
}) => {
  const { user, session, loading: authLoading } = useAuth();
  const { hasAccess, loading: subscriptionLoading, subscription } = usePremiumAccess();
  const [isValidating, setIsValidating] = useState(true);
  const [isSessionValid, setIsSessionValid] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      if (authLoading || subscriptionLoading) return;
      
      if (!user || !session) {
        setIsSessionValid(false);
        setIsValidating(false);
        return;
      }

      try {
        // Validate the session with Supabase
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        
        if (error || !currentUser) {
          console.log('Session validation failed in SubscriptionRoute:', error?.message || 'No user found');
          toast({
            title: "Session Invalid",
            description: "Your session is no longer valid. Please login again.",
            variant: "destructive",
          });
          setIsSessionValid(false);
        } else if (session.expires_at && session.expires_at * 1000 < Date.now()) {
          console.log('Session expired in SubscriptionRoute');
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please login again.",
            variant: "destructive",
          });
          setIsSessionValid(false);
        } else {
          setIsSessionValid(true);
        }
      } catch (error) {
        console.error('Error validating session in SubscriptionRoute:', error);
        toast({
          title: "Authentication Error",
          description: "There was an error validating your session. Please login again.",
          variant: "destructive",
        });
        setIsSessionValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateSession();
  }, [user, session, authLoading, subscriptionLoading]);

  if (authLoading || subscriptionLoading || isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">
            {authLoading || isValidating ? "Validating session..." : "Loading subscription details..."}
          </p>
        </div>
      </div>
    );
  }

  if (!user || !session || !isSessionValid) {
    return <Navigate to="/auth" replace />;
  }

  // If no subscription exists yet, redirect to plan selection
  if (!subscription) {
    return <Navigate to="/choose-plan" replace />;
  }

  // Check if user has required access level
  if (!hasAccess(requiredTier)) {
    toast({
      title: "Access Denied",
      description: `This feature requires a ${requiredTier} subscription. Please upgrade your plan.`,
      variant: "destructive",
    });
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default SubscriptionRoute;