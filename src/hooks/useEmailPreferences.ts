
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface EmailPreferences {
  id: string;
  class_reminders: boolean;
  newsletter_updates: boolean;
  onboarding_emails: boolean;
  marketing_emails: boolean;
  weekly_digest: boolean;
  unsubscribed_at: string | null;
}

export const useEmailPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<EmailPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_email_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) {
        // Create default preferences
        const defaultPrefs = {
          user_id: user.id,
          class_reminders: true,
          newsletter_updates: true,
          onboarding_emails: true,
          marketing_emails: false,
          weekly_digest: true,
        };

        const { data: newPrefs, error: insertError } = await supabase
          .from('user_email_preferences')
          .insert(defaultPrefs)
          .select()
          .single();

        if (insertError) throw insertError;
        setPreferences(newPrefs);
      } else {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error fetching email preferences:', error);
      toast.error('Failed to load email preferences');
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<EmailPreferences>) => {
    if (!user || !preferences) return;

    try {
      const { data, error } = await supabase
        .from('user_email_preferences')
        .update({
          ...newPreferences,
          updated_at: new Date().toISOString(),
          unsubscribed_at: null // Re-subscribe if they're updating preferences
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setPreferences(data);
      toast.success('Email preferences updated successfully');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    }
  };

  const unsubscribeAll = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_email_preferences')
        .update({
          unsubscribed_at: new Date().toISOString(),
          class_reminders: false,
          newsletter_updates: false,
          onboarding_emails: false,
          marketing_emails: false,
          weekly_digest: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;
      
      await fetchPreferences();
      toast.success('Unsubscribed from all emails');
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast.error('Failed to unsubscribe');
    }
  };

  return {
    preferences,
    loading,
    updatePreferences,
    unsubscribeAll,
    refetch: fetchPreferences,
  };
};
