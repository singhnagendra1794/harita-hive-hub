
import { supabase } from '@/integrations/supabase/client';

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
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      console.log('Removing session auth key:', key);
      sessionStorage.removeItem(key);
    }
  });
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
