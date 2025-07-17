import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Component to ensure global authentication works properly
export const GlobalAuthCheck = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Test global connectivity and auth endpoints
    const testGlobalAuth = async () => {
      try {
        // Test if Supabase is reachable globally
        const { data, error } = await supabase.auth.getSession();
        
        if (error && error.message.includes('network')) {
          console.warn('Network connectivity issue detected:', error);
          toast({
            title: "Connection Issue",
            description: "If you're outside India and experiencing login issues, please try again or contact support.",
            variant: "destructive",
          });
        }

        // Log successful connection for debugging
        console.log('Global auth check - Supabase reachable:', !!data);
      } catch (error) {
        console.error('Global auth connectivity test failed:', error);
      }
    };

    // Only run this check once on app load
    testGlobalAuth();
  }, []);

  return null; // This is an invisible component
};

export default GlobalAuthCheck;