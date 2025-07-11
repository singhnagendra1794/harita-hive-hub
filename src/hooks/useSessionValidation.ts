import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { handleSessionExpiry, handleSessionError } from '@/components/auth/AuthCleanup';

interface SessionValidationResult {
  isValid: boolean;
  isLoading: boolean;
  error: string | null;
  validateSession: () => Promise<boolean>;
}

export const useSessionValidation = (
  enableAutoValidation: boolean = true,
  showToastOnError: boolean = true
): SessionValidationResult => {
  const { user, session, loading } = useAuth();
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const validateSession = useCallback(async (): Promise<boolean> => {
    if (loading) return false;
    
    if (!user || !session) {
      setIsValid(false);
      setError('No active session');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Check if session is expired
      if (session.expires_at && session.expires_at * 1000 < Date.now()) {
        console.log('Session token expired');
        setIsValid(false);
        setError('Session expired');
        
        if (showToastOnError) {
          handleSessionExpiry();
        }
        return false;
      }

      // Validate with Supabase
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !currentUser) {
        console.log('Session validation failed:', userError?.message || 'No user found');
        setIsValid(false);
        setError(userError?.message || 'Session invalid');
        
        if (showToastOnError) {
          handleSessionError('Your session is no longer valid. Please login again.');
        }
        return false;
      }

      // Additional validation: Check if user ID matches
      if (currentUser.id !== user.id) {
        console.log('User ID mismatch in session validation');
        setIsValid(false);
        setError('User session mismatch');
        
        if (showToastOnError) {
          handleSessionError('Session validation failed. Please login again.');
        }
        return false;
      }

      setIsValid(true);
      setError(null);
      return true;
    } catch (error) {
      console.error('Error validating session:', error);
      setIsValid(false);
      setError('Session validation error');
      
      if (showToastOnError) {
        handleSessionError('There was an error validating your session. Please login again.');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, session, loading, showToastOnError]);

  // Auto-validate session on mount and when dependencies change
  useEffect(() => {
    if (enableAutoValidation) {
      validateSession();
    } else {
      setIsLoading(false);
    }
  }, [enableAutoValidation, validateSession]);

  // Set up periodic session validation (every 5 minutes)
  useEffect(() => {
    if (!enableAutoValidation || !isValid) return;

    const intervalId = setInterval(() => {
      validateSession();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(intervalId);
  }, [enableAutoValidation, isValid, validateSession]);

  return {
    isValid,
    isLoading,
    error,
    validateSession
  };
};