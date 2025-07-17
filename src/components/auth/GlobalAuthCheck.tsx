
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
        
        if (error) {
          console.error('Global auth connectivity issue:', error);
          
          // Show user-friendly message for common issues
          if (error.message.includes('network') || error.message.includes('fetch')) {
            toast({
              title: "Connection Issue",
              description: "Having trouble connecting to our servers. If you're outside India, please try again in a few moments or contact support.",
              variant: "destructive",
            });
          }
        }

        // Log successful connection for debugging
        console.log('Global auth check - Supabase reachable:', !!data);
        
        // Test edge function connectivity
        try {
          const response = await fetch(`https://uphgdwrwaizomnyuwfwr.supabase.co/functions/v1/test-connectivity`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${supabase.supabaseKey}`,
            },
          });
          
          if (!response.ok) {
            console.warn('Edge function connectivity test failed:', response.status);
          }
        } catch (edgeError) {
          console.warn('Edge function connectivity test error:', edgeError);
        }
        
      } catch (error) {
        console.error('Global auth connectivity test failed:', error);
        
        toast({
          title: "Global Access Issue",
          description: "If you're experiencing login issues from outside India, please contact support at contact@haritahive.com",
          variant: "destructive",
        });
      }
    };

    // Only run this check once on app load
    testGlobalAuth();
  }, [toast]);

  return null; // This is an invisible component
};

export default GlobalAuthCheck;
