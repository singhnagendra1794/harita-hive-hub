export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      about_sections: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean | null
          order_index: number | null
          section_type: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          order_index?: number | null
          section_type: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          order_index?: number | null
          section_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string | null
          id: string
          new_value: Json | null
          old_value: Json | null
          target_user_id: string
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          target_user_id: string
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          target_user_id?: string
        }
        Relationships: []
      }
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
      beta_analytics: {
        Row: {
          date_bucket: string | null
          id: string
          metric_data: Json | null
          metric_name: string
          metric_value: number
          recorded_at: string | null
        }
        Insert: {
          date_bucket?: string | null
          id?: string
          metric_data?: Json | null
          metric_name: string
          metric_value?: number
          recorded_at?: string | null
        }
        Update: {
          date_bucket?: string | null
          id?: string
          metric_data?: Json | null
          metric_name?: string
          metric_value?: number
          recorded_at?: string | null
        }
        Relationships: []
      }
      beta_waitlist: {
        Row: {
          converted_at: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          invited_at: string | null
          referral_source: string | null
          signup_data: Json | null
          status: string | null
        }
        Insert: {
          converted_at?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          invited_at?: string | null
          referral_source?: string | null
          signup_data?: Json | null
          status?: string | null
        }
        Update: {
          converted_at?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          invited_at?: string | null
          referral_source?: string | null
          signup_data?: Json | null
          status?: string | null
        }
        Relationships: []
      }
      bookmarked_lessons: {
        Row: {
          created_at: string | null
          id: string
          lesson_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookmarked_lessons_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          certificate_hash: string
          certificate_type: string
          completion_date: string
          course_id: string | null
          course_name: string
          id: string
          is_valid: boolean | null
          issued_at: string
          learning_path_id: string | null
          student_name: string
          user_id: string
        }
        Insert: {
          certificate_hash: string
          certificate_type: string
          completion_date: string
          course_id?: string | null
          course_name: string
          id?: string
          is_valid?: boolean | null
          issued_at?: string
          learning_path_id?: string | null
          student_name: string
          user_id: string
        }
        Update: {
          certificate_hash?: string
          certificate_type?: string
          completion_date?: string
          course_id?: string | null
          course_name?: string
          id?: string
          is_valid?: boolean | null
          issued_at?: string
          learning_path_id?: string | null
          student_name?: string
          user_id?: string
        }
        Relationships: []
      }
      certifications: {
        Row: {
          badge_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_blockchain_verified: boolean | null
          price: number | null
          requirements: Json | null
          title: string
        }
        Insert: {
          badge_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_blockchain_verified?: boolean | null
          price?: number | null
          requirements?: Json | null
          title: string
        }
        Update: {
          badge_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_blockchain_verified?: boolean | null
          price?: number | null
          requirements?: Json | null
          title?: string
        }
        Relationships: []
      }
      challenge_participants: {
        Row: {
          challenge_name: string
          created_at: string
          email: string
          full_name: string | null
          id: string
          registered_at: string
          status: string
          submission_url: string | null
          submitted_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          challenge_name?: string
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          registered_at?: string
          status?: string
          submission_url?: string | null
          submitted_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          challenge_name?: string
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          registered_at?: string
          status?: string
          submission_url?: string | null
          submitted_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      challenge_submissions: {
        Row: {
          challenge_id: string
          created_at: string
          description: string
          id: string
          submission_link: string
          updated_at: string
          user_id: string
          votes: number | null
        }
        Insert: {
          challenge_id: string
          created_at?: string
          description: string
          id?: string
          submission_link: string
          updated_at?: string
          user_id: string
          votes?: number | null
        }
        Update: {
          challenge_id?: string
          created_at?: string
          description?: string
          id?: string
          submission_link?: string
          updated_at?: string
          user_id?: string
          votes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "weekly_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_votes: {
        Row: {
          created_at: string
          id: string
          submission_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          submission_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          submission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_votes_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "challenge_submissions"
            referencedColumns: ["id"]
          },
        ]
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
      company_profiles: {
        Row: {
          account_status: string | null
          company_name: string
          company_size: string | null
          created_at: string
          description: string | null
          id: string
          industry: string | null
          logo_url: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          account_status?: string | null
          company_name: string
          company_size?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          account_status?: string | null
          company_name?: string
          company_size?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      company_subscriptions: {
        Row: {
          company_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          monthly_fee: number | null
          starts_at: string | null
          status: string | null
          subscription_type: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          monthly_fee?: number | null
          starts_at?: string | null
          status?: string | null
          subscription_type: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          monthly_fee?: number | null
          starts_at?: string | null
          status?: string | null
          subscription_type?: string
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
      content_shares: {
        Row: {
          content_id: string
          content_type: string
          id: string
          share_data: Json | null
          share_platform: string
          shared_at: string | null
          user_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          id?: string
          share_data?: Json | null
          share_platform: string
          shared_at?: string | null
          user_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          id?: string
          share_data?: Json | null
          share_platform?: string
          shared_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_shares_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_analytics: {
        Row: {
          course_id: string | null
          created_at: string | null
          date_recorded: string | null
          id: string
          metric_name: string
          metric_value: number | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          date_recorded?: string | null
          id?: string
          metric_name: string
          metric_value?: number | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          date_recorded?: string | null
          id?: string
          metric_name?: string
          metric_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "course_analytics_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_cohorts: {
        Row: {
          created_at: string
          current_enrollments: number | null
          end_date: string | null
          enrollment_deadline: string | null
          id: string
          max_students: number | null
          name: string
          price: number | null
          start_date: string
          status: string | null
        }
        Insert: {
          created_at?: string
          current_enrollments?: number | null
          end_date?: string | null
          enrollment_deadline?: string | null
          id?: string
          max_students?: number | null
          name: string
          price?: number | null
          start_date: string
          status?: string | null
        }
        Update: {
          created_at?: string
          current_enrollments?: number | null
          end_date?: string | null
          enrollment_deadline?: string | null
          id?: string
          max_students?: number | null
          name?: string
          price?: number | null
          start_date?: string
          status?: string | null
        }
        Relationships: []
      }
      course_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string | null
          enrolled_at: string | null
          id: string
          progress_percentage: number | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          course_id?: string | null
          enrolled_at?: string | null
          id?: string
          progress_percentage?: number | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          course_id?: string | null
          enrolled_at?: string | null
          id?: string
          progress_percentage?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          course_id: string | null
          created_at: string | null
          description: string | null
          id: string
          order_index: number
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          order_index: number
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          order_index?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: string | null
          id: string
          is_free: boolean | null
          price: number | null
          published_at: string | null
          status: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          id?: string
          is_free?: boolean | null
          price?: number | null
          published_at?: string | null
          status?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          id?: string
          is_free?: boolean | null
          price?: number | null
          published_at?: string | null
          status?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
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
      event_registrations: {
        Row: {
          attended: boolean | null
          event_id: string
          id: string
          registered_at: string | null
          user_id: string
        }
        Insert: {
          attended?: boolean | null
          event_id: string
          id?: string
          registered_at?: string | null
          user_id: string
        }
        Update: {
          attended?: boolean | null
          event_id?: string
          id?: string
          registered_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "geo_events"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          id: string
          is_active: boolean | null
          order_index: number | null
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      freelance_projects: {
        Row: {
          applications_count: number | null
          budget_max: number | null
          budget_min: number | null
          client_id: string
          created_at: string | null
          deadline: string | null
          description: string
          difficulty_level: string | null
          id: string
          required_skills: string[] | null
          status: string | null
          title: string
        }
        Insert: {
          applications_count?: number | null
          budget_max?: number | null
          budget_min?: number | null
          client_id: string
          created_at?: string | null
          deadline?: string | null
          description: string
          difficulty_level?: string | null
          id?: string
          required_skills?: string[] | null
          status?: string | null
          title: string
        }
        Update: {
          applications_count?: number | null
          budget_max?: number | null
          budget_min?: number | null
          client_id?: string
          created_at?: string | null
          deadline?: string | null
          description?: string
          difficulty_level?: string | null
          id?: string
          required_skills?: string[] | null
          status?: string | null
          title?: string
        }
        Relationships: []
      }
      geo_events: {
        Row: {
          ai_summary: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          event_type: string | null
          host_id: string | null
          id: string
          is_recorded: boolean | null
          max_participants: number | null
          recording_url: string | null
          registration_required: boolean | null
          scheduled_at: string | null
          title: string
          youtube_url: string | null
        }
        Insert: {
          ai_summary?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          event_type?: string | null
          host_id?: string | null
          id?: string
          is_recorded?: boolean | null
          max_participants?: number | null
          recording_url?: string | null
          registration_required?: boolean | null
          scheduled_at?: string | null
          title: string
          youtube_url?: string | null
        }
        Update: {
          ai_summary?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          event_type?: string | null
          host_id?: string | null
          id?: string
          is_recorded?: boolean | null
          max_participants?: number | null
          recording_url?: string | null
          registration_required?: boolean | null
          scheduled_at?: string | null
          title?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      geo_processing_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          estimated_completion_at: string | null
          id: string
          input_files: Json
          job_type: string
          output_files: Json | null
          parameters: Json
          progress: number | null
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          estimated_completion_at?: string | null
          id?: string
          input_files?: Json
          job_type: string
          output_files?: Json | null
          parameters?: Json
          progress?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          estimated_completion_at?: string | null
          id?: string
          input_files?: Json
          job_type?: string
          output_files?: Json | null
          parameters?: Json
          progress?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      geo_processing_usage: {
        Row: {
          created_at: string
          file_size_mb: number | null
          id: string
          job_type: string
          processing_time_seconds: number | null
          subscription_tier: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_size_mb?: number | null
          id?: string
          job_type: string
          processing_time_seconds?: number | null
          subscription_tier: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_size_mb?: number | null
          id?: string
          job_type?: string
          processing_time_seconds?: number | null
          subscription_tier?: string
          user_id?: string
        }
        Relationships: []
      }
      geoai_experiments: {
        Row: {
          completed_at: string | null
          confusion_matrix: Json | null
          created_at: string | null
          experiment_name: string
          id: string
          input_files: Json
          model_type: string
          output_files: Json | null
          parameters: Json | null
          results: Json | null
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          confusion_matrix?: Json | null
          created_at?: string | null
          experiment_name: string
          id?: string
          input_files: Json
          model_type: string
          output_files?: Json | null
          parameters?: Json | null
          results?: Json | null
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          confusion_matrix?: Json | null
          created_at?: string | null
          experiment_name?: string
          id?: string
          input_files?: Json
          model_type?: string
          output_files?: Json | null
          parameters?: Json | null
          results?: Json | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      gis_profiles: {
        Row: {
          available_for_hire: boolean | null
          bio: string | null
          created_at: string | null
          experience_level: string | null
          github_url: string | null
          hourly_rate: number | null
          id: string
          linkedin_url: string | null
          location: string | null
          portfolio_url: string | null
          skills: string[] | null
          title: string | null
          tools: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          available_for_hire?: boolean | null
          bio?: string | null
          created_at?: string | null
          experience_level?: string | null
          github_url?: string | null
          hourly_rate?: number | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          portfolio_url?: string | null
          skills?: string[] | null
          title?: string | null
          tools?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          available_for_hire?: boolean | null
          bio?: string | null
          created_at?: string | null
          experience_level?: string | null
          github_url?: string | null
          hourly_rate?: number | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          portfolio_url?: string | null
          skills?: string[] | null
          title?: string | null
          tools?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      gis_tools: {
        Row: {
          category: string | null
          compatible_software: string[] | null
          created_at: string | null
          creator_id: string
          description: string | null
          download_url: string | null
          downloads_count: number | null
          id: string
          is_featured: boolean | null
          price: number | null
          programming_language: string | null
          rating: number | null
          title: string
          tool_type: string | null
        }
        Insert: {
          category?: string | null
          compatible_software?: string[] | null
          created_at?: string | null
          creator_id: string
          description?: string | null
          download_url?: string | null
          downloads_count?: number | null
          id?: string
          is_featured?: boolean | null
          price?: number | null
          programming_language?: string | null
          rating?: number | null
          title: string
          tool_type?: string | null
        }
        Update: {
          category?: string | null
          compatible_software?: string[] | null
          created_at?: string | null
          creator_id?: string
          description?: string | null
          download_url?: string | null
          downloads_count?: number | null
          id?: string
          is_featured?: boolean | null
          price?: number | null
          programming_language?: string | null
          rating?: number | null
          title?: string
          tool_type?: string | null
        }
        Relationships: []
      }
      interview_invitations: {
        Row: {
          company_id: string
          created_at: string
          id: string
          interview_date: string | null
          job_id: string | null
          message: string | null
          status: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          interview_date?: string | null
          job_id?: string | null
          message?: string | null
          status?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          interview_date?: string | null
          job_id?: string | null
          message?: string | null
          status?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_invitations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_listings: {
        Row: {
          apply_url: string
          company: string
          created_at: string
          description: string
          experience_level: string | null
          expires_at: string | null
          id: string
          job_type: string | null
          location: string | null
          posted_by: string | null
          requirements: string | null
          salary_range: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          apply_url: string
          company: string
          created_at?: string
          description: string
          experience_level?: string | null
          expires_at?: string | null
          id?: string
          job_type?: string | null
          location?: string | null
          posted_by?: string | null
          requirements?: string | null
          salary_range?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          apply_url?: string
          company?: string
          created_at?: string
          description?: string
          experience_level?: string | null
          expires_at?: string | null
          id?: string
          job_type?: string | null
          location?: string | null
          posted_by?: string | null
          requirements?: string | null
          salary_range?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      job_postings: {
        Row: {
          company_id: string
          created_at: string | null
          description: string
          employment_type: string | null
          experience_level: string | null
          expires_at: string | null
          id: string
          is_premium: boolean | null
          location: string | null
          remote_allowed: boolean | null
          required_skills: string[] | null
          salary_max: number | null
          salary_min: number | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          description: string
          employment_type?: string | null
          experience_level?: string | null
          expires_at?: string | null
          id?: string
          is_premium?: boolean | null
          location?: string | null
          remote_allowed?: boolean | null
          required_skills?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          description?: string
          employment_type?: string | null
          experience_level?: string | null
          expires_at?: string | null
          id?: string
          is_premium?: boolean | null
          location?: string | null
          remote_allowed?: boolean | null
          required_skills?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      job_postings_ai: {
        Row: {
          company: string
          created_at: string | null
          description: string | null
          employment_type: string | null
          experience_level: string | null
          expires_at: string | null
          id: string
          is_verified: boolean | null
          location: string | null
          posted_date: string | null
          remote_allowed: boolean | null
          requirements: string | null
          salary_max: number | null
          salary_min: number | null
          skills_required: string[] | null
          source_platform: string | null
          source_url: string | null
          title: string
        }
        Insert: {
          company: string
          created_at?: string | null
          description?: string | null
          employment_type?: string | null
          experience_level?: string | null
          expires_at?: string | null
          id?: string
          is_verified?: boolean | null
          location?: string | null
          posted_date?: string | null
          remote_allowed?: boolean | null
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skills_required?: string[] | null
          source_platform?: string | null
          source_url?: string | null
          title: string
        }
        Update: {
          company?: string
          created_at?: string | null
          description?: string | null
          employment_type?: string | null
          experience_level?: string | null
          expires_at?: string | null
          id?: string
          is_verified?: boolean | null
          location?: string | null
          posted_date?: string | null
          remote_allowed?: boolean | null
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          skills_required?: string[] | null
          source_platform?: string | null
          source_url?: string | null
          title?: string
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
      lesson_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          lesson_id: string | null
          notes: string | null
          updated_at: string | null
          user_id: string | null
          watch_time: number | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          notes?: string | null
          updated_at?: string | null
          user_id?: string | null
          watch_time?: number | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          lesson_id?: string | null
          notes?: string | null
          updated_at?: string | null
          user_id?: string | null
          watch_time?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string | null
          created_at: string | null
          document_url: string | null
          id: string
          is_free: boolean | null
          lesson_type: string | null
          module_id: string | null
          order_index: number
          title: string
          updated_at: string | null
          video_duration: number | null
          video_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          document_url?: string | null
          id?: string
          is_free?: boolean | null
          lesson_type?: string | null
          module_id?: string | null
          order_index: number
          title: string
          updated_at?: string | null
          video_duration?: number | null
          video_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          document_url?: string | null
          id?: string
          is_free?: boolean | null
          lesson_type?: string | null
          module_id?: string | null
          order_index?: number
          title?: string
          updated_at?: string | null
          video_duration?: number | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      live_classes: {
        Row: {
          access_tier: string
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string | null
          id: string
          instructor: string | null
          is_live: boolean
          rtmp_endpoint: string | null
          starts_at: string
          stream_key: string | null
          stream_type: string | null
          stream_url: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string
          youtube_video_id: string
        }
        Insert: {
          access_tier?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          instructor?: string | null
          is_live?: boolean
          rtmp_endpoint?: string | null
          starts_at: string
          stream_key?: string | null
          stream_type?: string | null
          stream_url?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url: string
          youtube_video_id: string
        }
        Update: {
          access_tier?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          instructor?: string | null
          is_live?: boolean
          rtmp_endpoint?: string | null
          starts_at?: string
          stream_key?: string | null
          stream_type?: string | null
          stream_url?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string
          youtube_video_id?: string
        }
        Relationships: []
      }
      missing_search_queries: {
        Row: {
          created_at: string
          id: string
          query: string
          resolved_at: string | null
          resolved_with: Json | null
          search_filters: Json | null
          status: string | null
          times_requested: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          query: string
          resolved_at?: string | null
          resolved_with?: Json | null
          search_filters?: Json | null
          status?: string | null
          times_requested?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          query?: string
          resolved_at?: string | null
          resolved_with?: Json | null
          search_filters?: Json | null
          status?: string | null
          times_requested?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      newsletter_posts: {
        Row: {
          content: string | null
          created_at: string
          featured_image_url: string | null
          id: string
          is_featured: boolean | null
          linkedin_url: string | null
          published_date: string
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          linkedin_url?: string | null
          published_date: string
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          content?: string | null
          created_at?: string
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          linkedin_url?: string | null
          published_date?: string
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          preferences: Json | null
          status: string
          subscribed_at: string
          unsubscribed_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          preferences?: Json | null
          status?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          preferences?: Json | null
          status?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
          user_id?: string | null
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
      payment_proofs: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          currency: string
          id: string
          payment_method: string
          plan_name: string
          proof_image_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string
          currency?: string
          id?: string
          payment_method: string
          plan_name: string
          proof_image_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          payment_method?: string
          plan_name?: string
          proof_image_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          completed_at: string | null
          course_id: string | null
          created_at: string | null
          currency: string | null
          id: string
          payment_data: Json | null
          payment_gateway_id: string | null
          payment_method: string
          status: string | null
          subscription_type: string | null
          user_id: string
          webhook_data: Json | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          course_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_data?: Json | null
          payment_gateway_id?: string | null
          payment_method: string
          status?: string | null
          subscription_type?: string | null
          user_id: string
          webhook_data?: Json | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          course_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_data?: Json | null
          payment_gateway_id?: string | null
          payment_method?: string
          status?: string | null
          subscription_type?: string | null
          user_id?: string
          webhook_data?: Json | null
        }
        Relationships: []
      }
      platform_analytics: {
        Row: {
          created_at: string | null
          dimensions: Json | null
          id: string
          metric_name: string
          metric_value: number
          recorded_date: string | null
        }
        Insert: {
          created_at?: string | null
          dimensions?: Json | null
          id?: string
          metric_name: string
          metric_value: number
          recorded_date?: string | null
        }
        Update: {
          created_at?: string | null
          dimensions?: Json | null
          id?: string
          metric_name?: string
          metric_value?: number
          recorded_date?: string | null
        }
        Relationships: []
      }
      platform_status: {
        Row: {
          component_name: string
          created_at: string | null
          details: Json | null
          id: string
          last_checked: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          component_name: string
          created_at?: string | null
          details?: Json | null
          id?: string
          last_checked?: string | null
          status: string
          updated_at?: string | null
        }
        Update: {
          component_name?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          last_checked?: string | null
          status?: string
          updated_at?: string | null
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
          community_posts: number | null
          course_count: number | null
          created_at: string
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          plan: string | null
          projects_completed: number | null
          spatial_analyses: number | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          community_posts?: number | null
          course_count?: number | null
          created_at?: string
          first_name?: string | null
          full_name?: string | null
          id: string
          last_name?: string | null
          plan?: string | null
          projects_completed?: number | null
          spatial_analyses?: number | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          community_posts?: number | null
          course_count?: number | null
          created_at?: string
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          plan?: string | null
          projects_completed?: number | null
          spatial_analyses?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      project_applications: {
        Row: {
          created_at: string | null
          estimated_days: number | null
          freelancer_id: string
          id: string
          project_id: string
          proposal: string
          quoted_price: number | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          estimated_days?: number | null
          freelancer_id: string
          id?: string
          project_id: string
          proposal: string
          quoted_price?: number | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          estimated_days?: number | null
          freelancer_id?: string
          id?: string
          project_id?: string
          proposal?: string
          quoted_price?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_applications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "freelance_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          parent_id: string | null
          project_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          project_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          project_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "project_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      project_submissions: {
        Row: {
          colab_url: string | null
          created_at: string | null
          demo_url: string | null
          description: string | null
          github_url: string | null
          id: string
          is_team_project: boolean | null
          status: string | null
          team_members: Json | null
          thumbnail_url: string | null
          title: string
          tools_used: string[] | null
          updated_at: string | null
          upvotes: number | null
          user_id: string
        }
        Insert: {
          colab_url?: string | null
          created_at?: string | null
          demo_url?: string | null
          description?: string | null
          github_url?: string | null
          id?: string
          is_team_project?: boolean | null
          status?: string | null
          team_members?: Json | null
          thumbnail_url?: string | null
          title: string
          tools_used?: string[] | null
          updated_at?: string | null
          upvotes?: number | null
          user_id: string
        }
        Update: {
          colab_url?: string | null
          created_at?: string | null
          demo_url?: string | null
          description?: string | null
          github_url?: string | null
          id?: string
          is_team_project?: boolean | null
          status?: string | null
          team_members?: Json | null
          thumbnail_url?: string | null
          title?: string
          tools_used?: string[] | null
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string
        }
        Relationships: []
      }
      project_templates: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string
          difficulty_level: string | null
          download_count: number | null
          id: string
          is_featured: boolean | null
          preview_url: string | null
          resource_url: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          description: string
          difficulty_level?: string | null
          download_count?: number | null
          id?: string
          is_featured?: boolean | null
          preview_url?: string | null
          resource_url?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          difficulty_level?: string | null
          download_count?: number | null
          id?: string
          is_featured?: boolean | null
          preview_url?: string | null
          resource_url?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_votes: {
        Row: {
          created_at: string | null
          id: string
          project_id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_votes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      sandbox_sessions: {
        Row: {
          code_content: string | null
          created_at: string | null
          id: string
          output_data: string | null
          session_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          code_content?: string | null
          created_at?: string | null
          id?: string
          output_data?: string | null
          session_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          code_content?: string | null
          created_at?: string | null
          id?: string
          output_data?: string | null
          session_type?: string
          updated_at?: string | null
          user_id?: string
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
      sharing_analytics: {
        Row: {
          content_id: string
          content_type: string
          id: string
          metadata: Json | null
          platform: string
          shared_at: string | null
          user_id: string | null
        }
        Insert: {
          content_id: string
          content_type: string
          id?: string
          metadata?: Json | null
          platform: string
          shared_at?: string | null
          user_id?: string | null
        }
        Update: {
          content_id?: string
          content_type?: string
          id?: string
          metadata?: Json | null
          platform?: string
          shared_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      showcase_likes: {
        Row: {
          created_at: string | null
          id: string
          showcase_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          showcase_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          showcase_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "showcase_likes_showcase_id_fkey"
            columns: ["showcase_id"]
            isOneToOne: false
            referencedRelation: "tool_showcases"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_recommendations: {
        Row: {
          content_id: string
          created_at: string | null
          dismissed: boolean | null
          id: string
          reason: string | null
          recommendation_type: string
          score: number | null
          user_id: string
        }
        Insert: {
          content_id: string
          created_at?: string | null
          dismissed?: boolean | null
          id?: string
          reason?: string | null
          recommendation_type: string
          score?: number | null
          user_id: string
        }
        Update: {
          content_id?: string
          created_at?: string | null
          dismissed?: boolean | null
          id?: string
          reason?: string | null
          recommendation_type?: string
          score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      stream_sessions: {
        Row: {
          created_at: string | null
          ended_at: string | null
          id: string
          is_active: boolean | null
          live_class_id: string | null
          rtmp_endpoint: string
          started_at: string | null
          stream_key: string
          updated_at: string | null
          viewer_count: number | null
        }
        Insert: {
          created_at?: string | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          live_class_id?: string | null
          rtmp_endpoint: string
          started_at?: string | null
          stream_key: string
          updated_at?: string | null
          viewer_count?: number | null
        }
        Update: {
          created_at?: string | null
          ended_at?: string | null
          id?: string
          is_active?: boolean | null
          live_class_id?: string | null
          rtmp_endpoint?: string
          started_at?: string | null
          stream_key?: string
          updated_at?: string | null
          viewer_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stream_sessions_live_class_id_fkey"
            columns: ["live_class_id"]
            isOneToOne: false
            referencedRelation: "live_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      student_portfolios: {
        Row: {
          achievements: Json | null
          availability: string | null
          bio: string | null
          created_at: string
          github_url: string | null
          id: string
          linkedin_url: string | null
          portfolio_url: string | null
          projects: Json | null
          resume_url: string | null
          skills: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          achievements?: Json | null
          availability?: string | null
          bio?: string | null
          created_at?: string
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          portfolio_url?: string | null
          projects?: Json | null
          resume_url?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          achievements?: Json | null
          availability?: string | null
          bio?: string | null
          created_at?: string
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          portfolio_url?: string | null
          projects?: Json | null
          resume_url?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_portfolios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      talent_searches: {
        Row: {
          candidates_shortlisted: string[] | null
          company_id: string
          created_at: string | null
          id: string
          search_criteria: Json
          updated_at: string | null
        }
        Insert: {
          candidates_shortlisted?: string[] | null
          company_id: string
          created_at?: string | null
          id?: string
          search_criteria: Json
          updated_at?: string | null
        }
        Update: {
          candidates_shortlisted?: string[] | null
          company_id?: string
          created_at?: string | null
          id?: string
          search_criteria?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "talent_searches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          rating: number | null
          testimonial: string
          title: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          rating?: number | null
          testimonial: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          rating?: number | null
          testimonial?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tool_showcases: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_featured: boolean | null
          likes_count: number | null
          project_url: string | null
          screenshot_url: string | null
          tags: string[] | null
          title: string
          tool_id: string
          updated_at: string | null
          user_id: string
          views_count: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          likes_count?: number | null
          project_url?: string | null
          screenshot_url?: string | null
          tags?: string[] | null
          title: string
          tool_id: string
          updated_at?: string | null
          user_id: string
          views_count?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          likes_count?: number | null
          project_url?: string | null
          screenshot_url?: string | null
          tags?: string[] | null
          title?: string
          tool_id?: string
          updated_at?: string | null
          user_id?: string
          views_count?: number | null
        }
        Relationships: []
      }
      toolkit_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      toolkits: {
        Row: {
          category_id: string | null
          created_at: string | null
          created_by: string | null
          demo_video_url: string | null
          description: string | null
          download_count: number | null
          download_url: string | null
          id: string
          is_featured: boolean | null
          license_type: string | null
          rating: number | null
          sample_project_url: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          demo_video_url?: string | null
          description?: string | null
          download_count?: number | null
          download_url?: string | null
          id?: string
          is_featured?: boolean | null
          license_type?: string | null
          rating?: number | null
          sample_project_url?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          demo_video_url?: string | null
          description?: string | null
          download_count?: number | null
          download_url?: string | null
          id?: string
          is_featured?: boolean | null
          license_type?: string | null
          rating?: number | null
          sample_project_url?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "toolkits_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "toolkit_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      training_modules: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          duration_hours: number | null
          id: string
          is_custom: boolean | null
          price: number | null
          syllabus: Json | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          is_custom?: boolean | null
          price?: number | null
          syllabus?: Json | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          is_custom?: boolean | null
          price?: number | null
          syllabus?: Json | null
          title?: string
        }
        Relationships: []
      }
      upcoming_course_schedule: {
        Row: {
          created_at: string
          day: number
          description: string | null
          estimated_duration: string | null
          id: string
          is_active: boolean | null
          learning_goal: string | null
          phase: string
          topic: string
          updated_at: string
          week: number
        }
        Insert: {
          created_at?: string
          day: number
          description?: string | null
          estimated_duration?: string | null
          id?: string
          is_active?: boolean | null
          learning_goal?: string | null
          phase: string
          topic: string
          updated_at?: string
          week: number
        }
        Update: {
          created_at?: string
          day?: number
          description?: string | null
          estimated_duration?: string | null
          id?: string
          is_active?: boolean | null
          learning_goal?: string | null
          phase?: string
          topic?: string
          updated_at?: string
          week?: number
        }
        Relationships: []
      }
      upcoming_course_waitlist: {
        Row: {
          created_at: string
          email: string
          experience_level: string | null
          full_name: string | null
          id: string
          motivation: string | null
          notified: boolean | null
          phone: string | null
          referral_source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          experience_level?: string | null
          full_name?: string | null
          id?: string
          motivation?: string | null
          notified?: boolean | null
          phone?: string | null
          referral_source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          experience_level?: string | null
          full_name?: string | null
          id?: string
          motivation?: string | null
          notified?: boolean | null
          phone?: string | null
          referral_source?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_description: string | null
          achievement_name: string
          achievement_type: string
          earned_at: string | null
          icon_url: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          achievement_description?: string | null
          achievement_name: string
          achievement_type: string
          earned_at?: string | null
          icon_url?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          achievement_description?: string | null
          achievement_name?: string
          achievement_type?: string
          earned_at?: string | null
          icon_url?: string | null
          id?: string
          metadata?: Json | null
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
      user_certifications: {
        Row: {
          blockchain_hash: string | null
          certificate_url: string | null
          certification_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          blockchain_hash?: string | null
          certificate_url?: string | null
          certification_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          blockchain_hash?: string | null
          certificate_url?: string | null
          certification_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_certifications_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_email_preferences: {
        Row: {
          class_reminders: boolean | null
          created_at: string | null
          id: string
          marketing_emails: boolean | null
          newsletter_updates: boolean | null
          onboarding_emails: boolean | null
          unsubscribe_token: string | null
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
          unsubscribe_token?: string | null
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
          unsubscribe_token?: string | null
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
      user_followers: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
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
      user_learning_roadmaps: {
        Row: {
          career_goal: string
          created_at: string
          field_of_interest: string
          id: string
          input_data: Json
          roadmap_json: Json
          skill_level: string
          updated_at: string
          user_id: string
        }
        Insert: {
          career_goal: string
          created_at?: string
          field_of_interest: string
          id?: string
          input_data?: Json
          roadmap_json?: Json
          skill_level: string
          updated_at?: string
          user_id: string
        }
        Update: {
          career_goal?: string
          created_at?: string
          field_of_interest?: string
          id?: string
          input_data?: Json
          roadmap_json?: Json
          skill_level?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      user_profiles: {
        Row: {
          avatar_url: string | null
          badge_count: number | null
          bio: string | null
          courses_completed: number | null
          created_at: string | null
          display_name: string | null
          follower_count: number | null
          following_count: number | null
          github_url: string | null
          id: string
          linkedin_url: string | null
          location: string | null
          public_profile: boolean | null
          tools_contributed: number | null
          twitter_url: string | null
          updated_at: string | null
          user_id: string
          username: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          badge_count?: number | null
          bio?: string | null
          courses_completed?: number | null
          created_at?: string | null
          display_name?: string | null
          follower_count?: number | null
          following_count?: number | null
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          public_profile?: boolean | null
          tools_contributed?: number | null
          twitter_url?: string | null
          updated_at?: string | null
          user_id: string
          username: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          badge_count?: number | null
          bio?: string | null
          courses_completed?: number | null
          created_at?: string | null
          display_name?: string | null
          follower_count?: number | null
          following_count?: number | null
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          public_profile?: boolean | null
          tools_contributed?: number | null
          twitter_url?: string | null
          updated_at?: string | null
          user_id?: string
          username?: string
          website?: string | null
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
      user_resumes: {
        Row: {
          created_at: string | null
          file_url: string | null
          id: string
          match_scores: Json | null
          resume_data: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_url?: string | null
          id?: string
          match_scores?: Json | null
          resume_data: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_url?: string | null
          id?: string
          match_scores?: Json | null
          resume_data?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_role_audit: {
        Row: {
          action: string
          created_at: string | null
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          expires_at: string
          id: string
          is_active: boolean | null
          session_token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          expires_at: string
          id?: string
          is_active?: boolean | null
          session_token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          session_token?: string
          user_id?: string
        }
        Relationships: []
      }
      user_skills: {
        Row: {
          created_at: string | null
          id: string
          proficiency_level: number | null
          skill_name: string
          updated_at: string | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          proficiency_level?: number | null
          skill_name: string
          updated_at?: string | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          proficiency_level?: number | null
          skill_name?: string
          updated_at?: string | null
          user_id?: string
          verified?: boolean | null
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
      user_uploads: {
        Row: {
          coordinate_system: string | null
          created_at: string
          file_format: string
          file_name: string
          file_size: number
          file_type: string
          id: string
          metadata: Json | null
          status: string | null
          storage_url: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          coordinate_system?: string | null
          created_at?: string
          file_format: string
          file_name: string
          file_size: number
          file_type: string
          id?: string
          metadata?: Json | null
          status?: string | null
          storage_url: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          coordinate_system?: string | null
          created_at?: string
          file_format?: string
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          metadata?: Json | null
          status?: string | null
          storage_url?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      weekly_challenges: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          end_date: string
          id: string
          image_url: string | null
          is_active: boolean | null
          start_date: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          end_date: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          start_date: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          end_date?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          start_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_geo_processing_limits: {
        Args: { p_user_id: string; p_job_type: string }
        Returns: Json
      }
      ensure_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_referral_code: {
        Args: { user_id: string }
        Returns: string
      }
      generate_stream_key: {
        Args: { user_id: string }
        Returns: string
      }
      get_auth_users_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          last_sign_in_at: string
          created_at: string
        }[]
      }
      get_top_missing_queries: {
        Args: { p_limit?: number; p_status?: string }
        Returns: {
          id: string
          query: string
          times_requested: number
          status: string
          created_at: string
          updated_at: string
          days_old: number
        }[]
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
      get_user_roles_bypass_rls: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          user_id: string
          role: Database["public"]["Enums"]["app_role"]
          granted_at: string
          granted_by: string
        }[]
      }
      get_user_subscription_safe: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          user_id: string
          subscription_tier: string
          status: string
          started_at: string
          expires_at: string
          payment_method: string
          stripe_customer_id: string
          stripe_subscription_id: string
          created_at: string
          updated_at: string
        }[]
      }
      has_role_bypass_rls: {
        Args: {
          p_user_id: string
          p_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      increment_download_count: {
        Args: { template_id: string }
        Returns: undefined
      }
      invalidate_previous_sessions: {
        Args: { p_user_id: string; p_new_session_token: string }
        Returns: undefined
      }
      is_session_valid: {
        Args: { p_user_id: string; p_session_token: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never> | { user_id: string }
        Returns: boolean
      }
      is_super_admin_bypass_rls: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          p_target_user_id: string
          p_action: string
          p_old_value?: Json
          p_new_value?: Json
        }
        Returns: undefined
      }
      start_stream_session: {
        Args: { user_id: string }
        Returns: string
      }
      stop_stream_session: {
        Args: { session_id: string }
        Returns: undefined
      }
      track_missing_search_query: {
        Args: { p_user_id: string; p_query: string; p_filters?: Json }
        Returns: string
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
      update_user_stats: {
        Args: { p_user_id: string; p_stat_type: string; p_increment?: number }
        Returns: undefined
      }
      user_has_premium_access: {
        Args: { p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "beta_tester" | "user" | "super_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "beta_tester", "user", "super_admin"],
    },
  },
} as const
