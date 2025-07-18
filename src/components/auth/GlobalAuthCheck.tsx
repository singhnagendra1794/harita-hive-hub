
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Component to ensure global authentication works properly
export const GlobalAuthCheck = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Test global connectivity and auth endpoints
    const testGlobalAuth = async () => {
      // Test Supabase connectivity with retry logic
      try {
        await supabase.auth.getSession();
        console.log('Global auth check - Supabase reachable: true');
      } catch (error) {
        console.error('Supabase connectivity error:', error);
        
        // Try one more time after a brief delay
        setTimeout(async () => {
          try {
            await supabase.auth.getSession();
            console.log('Global auth check - Supabase reachable on retry: true');
          } catch (retryError) {
            toast({
              title: "Connection Issue",
              description: "Having trouble connecting to our servers. Please refresh the page or try again later.",
              variant: "destructive",
            });
          }
        }, 2000);
        return;
      }

      // Test edge function connectivity with multiple endpoints
      const testEndpoints = [
        `https://uphgdwrwaizomnyuwfwr.supabase.co/functions/v1/test-connectivity`,
        // Fallback to direct Supabase REST API
        `https://uphgdwrwaizomnyuwfwr.supabase.co/rest/v1/`
      ];

      let connectivitySuccess = false;
      
      for (const endpoint of testEndpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwaGdkd3J3YWl6b21ueXV3ZndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MjQyNjAsImV4cCI6MjA2NjAwMDI2MH0.I5i-3wP4E6Q3355oY2ctXQM9MhYXKbj6wGVhiRUsqxI`,
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwaGdkd3J3YWl6b21ueXV3ZndyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MjQyNjAsImV4cCI6MjA2NjAwMDI2MH0.I5i-3wP4E6Q3355oY2ctXQM9MhYXKbj6wGVhiRUsqxI',
            },
            signal: AbortSignal.timeout(10000) // 10 second timeout
          });
          
          if (response.ok) {
            connectivitySuccess = true;
            
            // Try to get response data for location info
            try {
              const data = await response.json();
              if (data.country) {
                console.log(`User location detected: ${data.country}`);
                
                // Log for analytics but don't show intrusive messages
                if (data.country !== 'IN' && data.country !== 'India') {
                  console.log('International user - all services should work normally');
                }
              }
            } catch (parseError) {
              // Response might not be JSON, that's okay
              console.log('Connectivity test successful');
            }
            break;
          }
        } catch (error) {
          console.warn(`Failed to connect to ${endpoint}:`, error);
          continue;
        }
      }

      // Only show warning if all connectivity tests fail
      if (!connectivitySuccess) {
        toast({
          title: "Network Connectivity",
          description: "Some features may be limited due to network connectivity. Registration and core features should still work. Contact support if issues persist.",
          duration: 6000,
        });
      }
    };

    // Only run this check once on app load
    testGlobalAuth();
  }, [toast]);

  return null; // This is an invisible component
};

export default GlobalAuthCheck;
