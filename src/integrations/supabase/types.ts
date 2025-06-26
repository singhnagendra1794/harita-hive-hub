export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      automated_tasks: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          last_run: string | null
          next_run: string | null
          schedule_expression: string | null
          status: string | null
          task_name: string
          task_type: string
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id?: string
          last_run?: string | null
          next_run?: string | null
          schedule_expression?: string | null
          status?: string | null
          task_name: string
          task_type: string
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          last_run?: string | null
          next_run?: string | null
          schedule_expression?: string | null
          status?: string | null
          task_name?: string
          task_type?: string
        }
        Relationships: []
      }
      class_enrollments: {
        Row: {
          class_date: string
          class_id: string
          class_title: string
          enrolled_at: string | null
          id: string
          instructor: string | null
          user_id: string
        }
        Insert: {
          class_date: string
          class_id: string
          class_title: string
          enrolled_at?: string | null
          id?: string
          instructor?: string | null
          user_id: string
        }
        Update: {
          class_date?: string
          class_id?: string
          class_title?: string
          enrolled_at?: string | null
          id?: string
          instructor?: string | null
          user_id?: string
        }
        Relationships: []
      }
      community_notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean | null
          related_content_id: string | null
          related_user_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          related_content_id?: string | null
          related_user_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          related_content_id?: string | null
          related_user_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      content_feedback: {
        Row: {
          comment: string | null
          content_id: string
          content_type: string
          created_at: string
          feedback_type: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          content_id: string
          content_type: string
          created_at?: string
          feedback_type: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          content_id?: string
          content_type?: string
          created_at?: string
          feedback_type?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_recommendations: {
        Row: {
          clicked: boolean | null
          content_id: string
          content_type: string
          dismissed: boolean | null
          id: string
          reason: string | null
          recommended_at: string | null
          score: number | null
          user_id: string
        }
        Insert: {
          clicked?: boolean | null
          content_id: string
          content_type: string
          dismissed?: boolean | null
          id?: string
          reason?: string | null
          recommended_at?: string | null
          score?: number | null
          user_id: string
        }
        Update: {
          clicked?: boolean | null
          content_id?: string
          content_type?: string
          dismissed?: boolean | null
          id?: string
          reason?: string | null
          recommended_at?: string | null
          score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      creator_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          follower_count: number | null
          id: string
          is_verified: boolean | null
          social_links: Json | null
          specialties: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          follower_count?: number | null
          id?: string
          is_verified?: boolean | null
          social_links?: Json | null
          specialties?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          follower_count?: number | null
          id?: string
          is_verified?: boolean | null
          social_links?: Json | null
          specialties?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      discussion_likes: {
        Row: {
          created_at: string
          discussion_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          discussion_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          discussion_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_likes_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          },
        ]
      }
      discussions: {
        Row: {
          content: string
          content_id: string
          content_type: string
          created_at: string
          id: string
          is_deleted: boolean | null
          is_pinned: boolean | null
          likes_count: number | null
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          is_deleted?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          is_deleted?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_queue: {
        Row: {
          created_at: string | null
          email_data: Json | null
          error_message: string | null
          id: string
          recipient_email: string
          scheduled_for: string
          sent_at: string | null
          status: string | null
          template_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_data?: Json | null
          error_message?: string | null
          id?: string
          recipient_email: string
          scheduled_for: string
          sent_at?: string | null
          status?: string | null
          template_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_data?: Json | null
          error_message?: string | null
          id?: string
          recipient_email?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string | null
          template_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_queue_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          created_at: string | null
          html_content: string
          id: string
          is_active: boolean | null
          name: string
          subject: string
          template_type: string
          text_content: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          html_content: string
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          template_type: string
          text_content?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          html_content?: string
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          template_type?: string
          text_content?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      learning_paths: {
        Row: {
          content_order: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: string | null
          estimated_hours: number | null
          id: string
          is_premium: boolean | null
          tags: string[] | null
          title: string
        }
        Insert: {
          content_order?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_hours?: number | null
          id?: string
          is_premium?: boolean | null
          tags?: string[] | null
          title: string
        }
        Update: {
          content_order?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_hours?: number | null
          id?: string
          is_premium?: boolean | null
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          class_reminders: boolean | null
          content_updates: boolean | null
          created_at: string | null
          email_notifications: boolean | null
          id: string
          marketing: boolean | null
          newsletter: boolean | null
          push_notifications: boolean | null
          user_id: string
        }
        Insert: {
          class_reminders?: boolean | null
          content_updates?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          marketing?: boolean | null
          newsletter?: boolean | null
          push_notifications?: boolean | null
          user_id: string
        }
        Update: {
          class_reminders?: boolean | null
          content_updates?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          marketing?: boolean | null
          newsletter?: boolean | null
          push_notifications?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          read: boolean | null
          sent_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          sent_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          sent_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      premium_content: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          created_by: string | null
          id: string
          is_premium: boolean | null
          premium_tier: string | null
          updated_at: string | null
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_premium?: boolean | null
          premium_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_premium?: boolean | null
          premium_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      saved_content: {
        Row: {
          collection_name: string | null
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          collection_name?: string | null
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          collection_name?: string | null
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      search_index: {
        Row: {
          content: string | null
          content_id: string
          content_type: string
          created_at: string | null
          embedding: string | null
          id: string
          tags: string[] | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          content_id: string
          content_type: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          content_id?: string
          content_type?: string
          created_at?: string | null
          embedding?: string | null
          id?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string | null
          expires_at: string | null
          id: string
          payment_method: string | null
          plan_name: string
          plan_type: string
          started_at: string | null
          status: string | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          payment_method?: string | null
          plan_name: string
          plan_type: string
          started_at?: string | null
          status?: string | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          payment_method?: string | null
          plan_name?: string
          plan_type?: string
          started_at?: string | null
          status?: string | null
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_analytics: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          session_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          session_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_email_preferences: {
        Row: {
          class_reminders: boolean | null
          created_at: string | null
          id: string
          marketing_emails: boolean | null
          newsletter_updates: boolean | null
          onboarding_emails: boolean | null
          unsubscribed_at: string | null
          updated_at: string | null
          user_id: string
          weekly_digest: boolean | null
        }
        Insert: {
          class_reminders?: boolean | null
          created_at?: string | null
          id?: string
          marketing_emails?: boolean | null
          newsletter_updates?: boolean | null
          onboarding_emails?: boolean | null
          unsubscribed_at?: string | null
          updated_at?: string | null
          user_id: string
          weekly_digest?: boolean | null
        }
        Update: {
          class_reminders?: boolean | null
          created_at?: string | null
          id?: string
          marketing_emails?: boolean | null
          newsletter_updates?: boolean | null
          onboarding_emails?: boolean | null
          unsubscribed_at?: string | null
          updated_at?: string | null
          user_id?: string
          weekly_digest?: boolean | null
        }
        Relationships: []
      }
      user_engagement: {
        Row: {
          content_consumed: number | null
          content_created: number | null
          engagement_score: number | null
          id: string
          last_activity: string | null
          streak_days: number | null
          total_time_spent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content_consumed?: number | null
          content_created?: number | null
          engagement_score?: number | null
          id?: string
          last_activity?: string | null
          streak_days?: number | null
          total_time_spent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content_consumed?: number | null
          content_created?: number | null
          engagement_score?: number | null
          id?: string
          last_activity?: string | null
          streak_days?: number | null
          total_time_spent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      user_interactions: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          interaction_type: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          interaction_type: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          interaction_type?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_learning_paths: {
        Row: {
          completed_at: string | null
          id: string
          learning_path_id: string
          progress_percentage: number | null
          started_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          learning_path_id: string
          progress_percentage?: number | null
          started_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          learning_path_id?: string
          progress_percentage?: number | null
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_learning_paths_learning_path_id_fkey"
            columns: ["learning_path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      user_onboarding: {
        Row: {
          completed_at: string | null
          completed_steps: Json | null
          current_step: number | null
          id: string
          last_email_sent: string | null
          started_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_steps?: Json | null
          current_step?: number | null
          id?: string
          last_email_sent?: string | null
          started_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_steps?: Json | null
          current_step?: number | null
          id?: string
          last_email_sent?: string | null
          started_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          difficulty_level: string | null
          id: string
          language_preference: string | null
          learning_style: string | null
          notification_frequency: string | null
          preferred_topics: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          difficulty_level?: string | null
          id?: string
          language_preference?: string | null
          learning_style?: string | null
          notification_frequency?: string | null
          preferred_topics?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          difficulty_level?: string | null
          id?: string
          language_preference?: string | null
          learning_style?: string | null
          notification_frequency?: string | null
          preferred_topics?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed_at: string | null
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          last_accessed: string | null
          progress_percentage: number | null
          time_spent: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          last_accessed?: string | null
          progress_percentage?: number | null
          time_spent?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          last_accessed?: string | null
          progress_percentage?: number | null
          time_spent?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          referee_id: string | null
          referral_code: string
          referrer_id: string
          reward_granted: boolean | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referee_id?: string | null
          referral_code: string
          referrer_id: string
          reward_granted?: boolean | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referee_id?: string | null
          referral_code?: string
          referrer_id?: string
          reward_granted?: boolean | null
          status?: string | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          payment_method: string | null
          started_at: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_tier: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          payment_method?: string | null
          started_at?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_tier?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          payment_method?: string | null
          started_at?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_tier?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      generate_referral_code: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_recommendations: {
        Args: { p_user_id: string; p_limit?: number }
        Returns: {
          content_type: string
          content_id: string
          score: number
          reason: string
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      track_user_interaction: {
        Args: {
          p_user_id: string
          p_content_type: string
          p_content_id: string
          p_interaction_type: string
          p_metadata?: Json
        }
        Returns: undefined
      }
      user_has_premium_access: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
