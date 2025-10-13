import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Lab {
  id: string;
  name: string;
  description: string;
  lab_type: string;
  difficulty: string;
  duration_minutes: number;
  tools: string[];
  topics: string[];
}

interface LaunchSessionResponse {
  success: boolean;
  session: {
    id: string;
    token: string;
    expiresAt: string;
    launchUrl: string;
  };
  lab: {
    name: string;
    type: string;
    duration: number;
  };
  quota: {
    remaining: number;
    total: number;
  };
  error?: string;
  message?: string;
}

export const useLabSession = () => {
  const [loading, setLoading] = useState(false);
  const [launching, setLaunching] = useState<string | null>(null);

  const launchLab = async (lab: Lab): Promise<boolean> => {
    setLoading(true);
    setLaunching(lab.id);

    try {
      const { data, error } = await supabase.functions.invoke('create-lab-session', {
        body: { labId: lab.id }
      });

      if (error) {
        console.error('Launch error:', error);
        toast({
          title: "Launch Failed",
          description: error.message || "Failed to launch lab session",
          variant: "destructive"
        });
        return false;
      }

      const response = data as LaunchSessionResponse;

      if (response.error) {
        toast({
          title: "Cannot Launch Lab",
          description: response.message || response.error,
          variant: "destructive"
        });
        return false;
      }

      // Show success message
      toast({
        title: "🚀 Launching Lab",
        description: `${lab.name} is starting up. This may take 30 seconds...`,
      });

      // Redirect to session
      window.location.href = response.session.launchUrl;
      return true;

    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
      setLaunching(null);
    }
  };

  const checkQuota = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase.rpc('check_lab_quota', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Quota check error:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Quota check failed:', err);
      return null;
    }
  };

  return {
    launchLab,
    checkQuota,
    loading,
    launching
  };
};