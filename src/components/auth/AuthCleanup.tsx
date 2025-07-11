
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const cleanupAuthState = () => {
  console.log('Cleaning up auth state...');
  
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  localStorage.removeItem('session_token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      console.log('Removing auth key:', key);
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  if (typeof sessionStorage !== 'undefined') {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        console.log('Removing session auth key:', key);
        sessionStorage.removeItem(key);
      }
    });
  }
};

export const performGlobalSignOut = async () => {
  try {
    // Clean up existing state first
    cleanupAuthState();
    
    // Attempt global sign out
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) {
      console.error('Global sign out error:', error);
    }
    
    return { success: !error };
  } catch (error) {
    console.error('Sign out failed:', error);
    return { success: false, error };
  }
};

export const handleSessionExpiry = (showToast: boolean = true) => {
  if (showToast) {
    toast({
      title: "Session Expired",
      description: "Your session has expired. Please login again.",
      variant: "destructive",
    });
  }
  
  // Clean up auth state
  cleanupAuthState();
  
  // Redirect to auth page after a short delay
  setTimeout(() => {
    window.location.href = '/auth';
  }, showToast ? 1500 : 0);
};

export const handleSessionError = (error: string, showToast: boolean = true) => {
  if (showToast) {
    toast({
      title: "Authentication Error",
      description: error,
      variant: "destructive",
    });
  }
  
  // Clean up auth state
  cleanupAuthState();
  
  // Redirect to auth page after a short delay
  setTimeout(() => {
    window.location.href = '/auth';
  }, showToast ? 1500 : 0);
};
