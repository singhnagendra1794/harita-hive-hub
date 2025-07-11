
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, session, loading } = useAuth();
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      if (loading) return;
      
      if (!user || !session) {
        setIsValid(false);
        setIsValidating(false);
        return;
      }

      try {
        // Validate the session with Supabase
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        
        if (error || !currentUser) {
          console.log('Session validation failed:', error?.message || 'No user found');
          toast({
            title: "Session Invalid",
            description: "Your session is no longer valid. Please login again.",
            variant: "destructive",
          });
          setIsValid(false);
        } else if (session.expires_at && session.expires_at * 1000 < Date.now()) {
          console.log('Session expired');
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please login again.",
            variant: "destructive",
          });
          setIsValid(false);
        } else {
          setIsValid(true);
        }
      } catch (error) {
        console.error('Error validating session:', error);
        toast({
          title: "Authentication Error",
          description: "There was an error validating your session. Please login again.",
          variant: "destructive",
        });
        setIsValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateSession();
  }, [user, session, loading]);

  if (loading || isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Validating session...</p>
        </div>
      </div>
    );
  }

  if (!user || !session || !isValid) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
