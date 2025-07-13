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
          starts_at: string
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
          starts_at: string
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
          starts_at?: string
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
            isOneToOne: false
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      check_geo_processing_limits: {
        Args: { p_user_id: string; p_job_type: string }
        Returns: Json
      }
      generate_referral_code: {
        Args: { user_id: string }
        Returns: string
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
      invalidate_previous_sessions: {
        Args: { p_user_id: string; p_new_session_token: string }
        Returns: undefined
      }
      is_session_valid: {
        Args: { p_user_id: string; p_session_token: string }
        Returns: boolean
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
      app_role: "admin" | "moderator" | "beta_tester" | "user"
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
      app_role: ["admin", "moderator", "beta_tester", "user"],
    },
  },
} as const
