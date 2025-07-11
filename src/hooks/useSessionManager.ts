import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useSessionManager = () => {
  const { user, session, loading } = useAuth();
  const navigate = useNavigate();

  const cleanupAuthState = useCallback(() => {
    // Remove all auth-related keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-') || key === 'session_token') {
        localStorage.removeItem(key);
      }
    });
    
    // Remove from sessionStorage if exists
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
  }, []);

  const handleSessionExpiry = useCallback(() => {
    toast({
      title: "Session Expired",
      description: "Your session has expired. Please login again.",
      variant: "destructive",
    });
    
    setTimeout(() => {
      cleanupAuthState();
      navigate('/auth', { replace: true });
    }, 1000);
  }, [cleanupAuthState, navigate]);

  const validateSession = useCallback(async () => {
    if (loading) return { isValid: false, isLoading: true };
    
    if (!user || !session) {
      return { isValid: false, isLoading: false };
    }

    try {
      // Check if the session is still valid with Supabase
      const { data: { user: currentUser }, error } = await supabase.auth.getUser();
      
      if (error || !currentUser) {
        console.log('Session validation failed:', error?.message || 'No user found');
        handleSessionExpiry();
        return { isValid: false, isLoading: false };
      }

      // Check if session token is expired
      if (session.expires_at && session.expires_at * 1000 < Date.now()) {
        console.log('Session token expired');
        handleSessionExpiry();
        return { isValid: false, isLoading: false };
      }

      return { isValid: true, isLoading: false };
    } catch (error) {
      console.error('Error validating session:', error);
      handleSessionExpiry();
      return { isValid: false, isLoading: false };
    }
  }, [user, session, loading, handleSessionExpiry]);

  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        handleSessionExpiry();
        return false;
      }
      
      return !!data.session;
    } catch (error) {
      console.error('Error in refreshSession:', error);
      handleSessionExpiry();
      return false;
    }
  }, [handleSessionExpiry]);

  // Auto-refresh session before expiry
  useEffect(() => {
    if (!session || !session.expires_at) return;

    const expiryTime = session.expires_at * 1000;
    const currentTime = Date.now();
    const timeUntilExpiry = expiryTime - currentTime;
    
    // Refresh 5 minutes before expiry
    const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0);

    if (refreshTime > 0) {
      const refreshTimer = setTimeout(() => {
        refreshSession();
      }, refreshTime);

      return () => clearTimeout(refreshTimer);
    }
  }, [session, refreshSession]);

  return {
    validateSession,
    refreshSession,
    handleSessionExpiry,
    cleanupAuthState,
    isAuthenticated: !!user && !!session,
    isLoading: loading
  };
};