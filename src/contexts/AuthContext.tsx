
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { PostSignupCourseModal } from '@/components/auth/PostSignupCourseModal';

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

const sendAdminNotification = async (user: User) => {
  try {
    // Get user profile to get full name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const userName = profile?.full_name || user.user_metadata?.full_name || 'Unknown User';
    
    await supabase.functions.invoke('send-email', {
      body: {
        templateName: 'admin_new_user_notification',
        to: 'contact@haritahive.com',
        templateData: {
          user_name: userName,
          user_email: user.email,
          user_id: user.id,
          registration_date: new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }
      }
    });
    
    console.log('Admin notification sent for new user:', user.email);
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    // Don't throw error as this shouldn't block user signup
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPostSignupModal, setShowPostSignupModal] = useState(false);
  const [newUserName, setNewUserName] = useState<string>('');

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

          // Check if this is a new user signup by checking if user was just created
          const isNewUser = session.user.created_at && 
            new Date(session.user.created_at).getTime() > (Date.now() - 60000); // Within last minute

          // Send admin notification for new users
          if (isNewUser) {
            setTimeout(() => {
              sendAdminNotification(session.user);
            }, 1000); // Delay to ensure user profile is created
            
            // Show post-signup course modal for new users
            const userName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '';
            setNewUserName(userName);
            setTimeout(() => {
              setShowPostSignupModal(true);
            }, 2000); // Small delay to let welcome message show first
          }
          
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
      <PostSignupCourseModal
        isOpen={showPostSignupModal}
        onClose={() => setShowPostSignupModal(false)}
        userName={newUserName}
      />
    </AuthContext.Provider>
  );
};
