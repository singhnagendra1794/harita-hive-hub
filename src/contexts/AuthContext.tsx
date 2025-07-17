
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const cleanupAuthState = () => {
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
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        return false;
      }
      
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error in refreshSession:', error);
      return false;
    }
  };

  useEffect(() => {
    let sessionTimer: NodeJS.Timeout;
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        // Clear any existing session timer
        if (sessionTimer) {
          clearTimeout(sessionTimer);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Handle different auth events
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in successfully');
          
          // Set up auto-refresh timer
          if (session.expires_at) {
            const expiryTime = session.expires_at * 1000;
            const currentTime = Date.now();
            const timeUntilExpiry = expiryTime - currentTime;
            
            // Refresh 5 minutes before expiry
            const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0);
            
            if (refreshTime > 0) {
              sessionTimer = setTimeout(async () => {
                const refreshed = await refreshSession();
                if (!refreshed) {
                  toast({
                    title: "Session Expired",
                    description: "Your session has expired. Please login again.",
                    variant: "destructive",
                  });
                  
                  setTimeout(() => {
                    cleanupAuthState();
                    window.location.href = '/auth';
                  }, 1000);
                }
              }, refreshTime);
            }
          }
          
        } else if (event === 'SIGNED_OUT') {
          // User signed out
          cleanupAuthState();
          setSession(null);
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Token refreshed successfully
          setSession(session);
          setUser(session.user);
        }
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          
          // Check if this is a network/connectivity issue that might affect international users
          if (error.message?.includes('network') || error.message?.includes('fetch')) {
            console.warn('Network connectivity issue - may affect international users');
          }
          
          cleanupAuthState();
        } else {
          console.log('Initial session:', session?.user?.email || 'No session');
          
          // Validate session expiry
          if (session && session.expires_at && session.expires_at * 1000 < Date.now()) {
            console.log('Initial session expired, clearing...');
            cleanupAuthState();
            setSession(null);
            setUser(null);
          } else {
            setSession(session);
            setUser(session?.user ?? null);
          }
        }
      } catch (error) {
        console.error('Error in getSession:', error);
        cleanupAuthState();
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      subscription.unsubscribe();
      if (sessionTimer) {
        clearTimeout(sessionTimer);
      }
    };
  }, []);

  const logout = async () => {
    try {
      setLoading(true);
      
      // Clear local state first
      setUser(null);
      setSession(null);
      
      // Clean up auth state
      cleanupAuthState();
      
      // Sign out from Supabase with global scope
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.error('Error signing out:', error);
        // Don't throw error, still redirect user
      }
      
      console.log('Logout successful');
      
      // Force page reload to ensure clean state
      setTimeout(() => {
        window.location.href = '/auth';
      }, 100);
    } catch (error) {
      console.error('Error in logout:', error);
      // Still redirect user even if logout fails
      window.location.href = '/auth';
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    logout,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
