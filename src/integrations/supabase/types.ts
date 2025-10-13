export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
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
      admin_actions: {
        Row: {
          action_data: Json | null
          action_type: string
          admin_user_id: string | null
          created_at: string | null
          id: string
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action_data?: Json | null
          action_type: string
          admin_user_id?: string | null
          created_at?: string | null
          id?: string
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action_data?: Json | null
          action_type?: string
          admin_user_id?: string | null
          created_at?: string | null
          id?: string
          target_id?: string | null
          target_table?: string | null
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
      admin_errors: {
        Row: {
          context_data: Json | null
          created_at: string | null
          error_message: string
          error_type: string
          id: string
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
        }
        Insert: {
          context_data?: Json | null
          created_at?: string | null
          error_message: string
          error_type: string
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Update: {
          context_data?: Json | null
          created_at?: string | null
          error_message?: string
          error_type?: string
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Relationships: []
      }
      admin_uploads: {
        Row: {
          assigned_page: string
          created_at: string
          created_by: string
          description: string | null
          download_count: number | null
          file_url: string
          id: string
          is_featured: boolean | null
          metadata: Json | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          assigned_page: string
          created_at?: string
          created_by: string
          description?: string | null
          download_count?: number | null
          file_url: string
          id?: string
          is_featured?: boolean | null
          metadata?: Json | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          assigned_page?: string
          created_at?: string
          created_by?: string
          description?: string | null
          download_count?: number | null
          file_url?: string
          id?: string
          is_featured?: boolean | null
          metadata?: Json | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
      ai_alerts: {
        Row: {
          affected_regions: Json | null
          ai_system: string
          alert_type: string
          confidence_score: number | null
          created_at: string
          data_sources: Json | null
          expires_at: string | null
          id: string
          message: string
          notified_admin: boolean | null
          organization_id: string | null
          resolved: boolean | null
          resolved_at: string | null
          severity: string
        }
        Insert: {
          affected_regions?: Json | null
          ai_system: string
          alert_type: string
          confidence_score?: number | null
          created_at?: string
          data_sources?: Json | null
          expires_at?: string | null
          id?: string
          message: string
          notified_admin?: boolean | null
          organization_id?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          severity: string
        }
        Update: {
          affected_regions?: Json | null
          ai_system?: string
          alert_type?: string
          confidence_score?: number | null
          created_at?: string
          data_sources?: Json | null
          expires_at?: string | null
          id?: string
          message?: string
          notified_admin?: boolean | null
          organization_id?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_health_status: {
        Row: {
          ai_system: string
          consecutive_failures: number | null
          created_at: string
          id: string
          last_health_check: string
          last_successful_response: string | null
          status: string
          updated_at: string
        }
        Insert: {
          ai_system: string
          consecutive_failures?: number | null
          created_at?: string
          id?: string
          last_health_check?: string
          last_successful_response?: string | null
          status: string
          updated_at?: string
        }
        Update: {
          ai_system?: string
          consecutive_failures?: number | null
          created_at?: string
          id?: string
          last_health_check?: string
          last_successful_response?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_interaction_logs: {
        Row: {
          ai_system: string
          context_type: string | null
          created_at: string
          error_message: string | null
          id: string
          message_text: string
          response_text: string | null
          response_time_ms: number | null
          retry_count: number | null
          status: string
          user_id: string
        }
        Insert: {
          ai_system: string
          context_type?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          message_text: string
          response_text?: string | null
          response_time_ms?: number | null
          retry_count?: number | null
          status: string
          user_id: string
        }
        Update: {
          ai_system?: string
          context_type?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          message_text?: string
          response_text?: string | null
          response_time_ms?: number | null
          retry_count?: number | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_portfolio_enhancements: {
        Row: {
          applied: boolean | null
          created_at: string | null
          enhanced_content: string
          enhancement_type: string
          id: string
          original_content: string | null
          portfolio_id: string | null
          user_id: string
        }
        Insert: {
          applied?: boolean | null
          created_at?: string | null
          enhanced_content: string
          enhancement_type: string
          id?: string
          original_content?: string | null
          portfolio_id?: string | null
          user_id: string
        }
        Update: {
          applied?: boolean | null
          created_at?: string | null
          enhanced_content?: string
          enhancement_type?: string
          id?: string
          original_content?: string | null
          portfolio_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_portfolio_enhancements_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "user_portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_notifications: {
        Row: {
          alert_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
          notification_type: string
          sent_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          alert_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          notification_type: string
          sent_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          alert_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          notification_type?: string
          sent_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_notifications_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "ai_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_insights: {
        Row: {
          confidence_level: number | null
          created_at: string | null
          data_period_end: string | null
          data_period_start: string | null
          id: string
          insight_type: string
          metrics: Json | null
          organization_id: string | null
          recommendations: Json | null
          summary: string
          title: string
          trends: Json | null
          updated_at: string | null
          user_id: string | null
          visualizations: Json | null
        }
        Insert: {
          confidence_level?: number | null
          created_at?: string | null
          data_period_end?: string | null
          data_period_start?: string | null
          id?: string
          insight_type: string
          metrics?: Json | null
          organization_id?: string | null
          recommendations?: Json | null
          summary: string
          title: string
          trends?: Json | null
          updated_at?: string | null
          user_id?: string | null
          visualizations?: Json | null
        }
        Update: {
          confidence_level?: number | null
          created_at?: string | null
          data_period_end?: string | null
          data_period_start?: string | null
          id?: string
          insight_type?: string
          metrics?: Json | null
          organization_id?: string | null
          recommendations?: Json | null
          summary?: string
          title?: string
          trends?: Json | null
          updated_at?: string | null
          user_id?: string | null
          visualizations?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_insights_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_performance_logs: {
        Row: {
          created_at: string | null
          endpoint: string
          error_details: Json | null
          id: string
          ip_address: unknown | null
          method: string
          organization_id: string | null
          payload_size_bytes: number | null
          response_time_ms: number | null
          status_code: number | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          error_details?: Json | null
          id?: string
          ip_address?: unknown | null
          method: string
          organization_id?: string | null
          payload_size_bytes?: number | null
          response_time_ms?: number | null
          status_code?: number | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          error_details?: Json | null
          id?: string
          ip_address?: unknown | null
          method?: string
          organization_id?: string | null
          payload_size_bytes?: number | null
          response_time_ms?: number | null
          status_code?: number | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_performance_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_usage_analytics: {
        Row: {
          api_key_id: string | null
          created_at: string
          endpoint: string
          id: string
          ip_address: unknown | null
          method: string
          request_size_bytes: number | null
          response_size_bytes: number | null
          response_time_ms: number | null
          status_code: number
          user_agent: string | null
          user_id: string
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string
          endpoint: string
          id?: string
          ip_address?: unknown | null
          method: string
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          status_code: number
          user_agent?: string | null
          user_id: string
        }
        Update: {
          api_key_id?: string | null
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: unknown | null
          method?: string
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          status_code?: number
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_analytics_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "enterprise_api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      application_tracking: {
        Row: {
          application_method: string | null
          applied_at: string | null
          id: string
          notes: string | null
          platform: string | null
          project_id: string
          project_type: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          application_method?: string | null
          applied_at?: string | null
          id?: string
          notes?: string | null
          platform?: string | null
          project_id: string
          project_type?: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          application_method?: string | null
          applied_at?: string | null
          id?: string
          notes?: string | null
          platform?: string | null
          project_id?: string
          project_type?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      automated_decision_rules: {
        Row: {
          action_definition: Json
          approvals_required: number | null
          auto_execute: boolean | null
          confidence_threshold: number | null
          created_at: string | null
          description: string
          id: string
          name: string
          organization_id: string | null
          priority: string | null
          status: string | null
          success_rate: number | null
          total_executions: number | null
          trigger_condition: string
          trigger_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_definition: Json
          approvals_required?: number | null
          auto_execute?: boolean | null
          confidence_threshold?: number | null
          created_at?: string | null
          description: string
          id?: string
          name: string
          organization_id?: string | null
          priority?: string | null
          status?: string | null
          success_rate?: number | null
          total_executions?: number | null
          trigger_condition: string
          trigger_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_definition?: Json
          approvals_required?: number | null
          auto_execute?: boolean | null
          confidence_threshold?: number | null
          created_at?: string | null
          description?: string
          id?: string
          name?: string
          organization_id?: string | null
          priority?: string | null
          status?: string | null
          success_rate?: number | null
          total_executions?: number | null
          trigger_condition?: string
          trigger_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automated_decision_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      ava_conversations: {
        Row: {
          assistant_response: string
          context_data: Json | null
          context_type: string | null
          conversation_id: string
          created_at: string
          feedback: number | null
          id: string
          updated_at: string
          user_id: string
          user_message: string
        }
        Insert: {
          assistant_response: string
          context_data?: Json | null
          context_type?: string | null
          conversation_id: string
          created_at?: string
          feedback?: number | null
          id?: string
          updated_at?: string
          user_id: string
          user_message: string
        }
        Update: {
          assistant_response?: string
          context_data?: Json | null
          context_type?: string | null
          conversation_id?: string
          created_at?: string
          feedback?: number | null
          id?: string
          updated_at?: string
          user_id?: string
          user_message?: string
        }
        Relationships: []
      }
      ava_user_memory: {
        Row: {
          context_type: string
          created_at: string
          frequency_count: number | null
          id: string
          key_topics: string[] | null
          last_accessed: string | null
          solution_provided: string | null
          user_id: string
          user_intent: string | null
        }
        Insert: {
          context_type: string
          created_at?: string
          frequency_count?: number | null
          id?: string
          key_topics?: string[] | null
          last_accessed?: string | null
          solution_provided?: string | null
          user_id: string
          user_intent?: string | null
        }
        Update: {
          context_type?: string
          created_at?: string
          frequency_count?: number | null
          id?: string
          key_topics?: string[] | null
          last_accessed?: string | null
          solution_provided?: string | null
          user_id?: string
          user_intent?: string | null
        }
        Relationships: []
      }
      aws_streaming_config: {
        Row: {
          cloudfront_distribution_id: string
          created_at: string
          hls_playback_url: string
          id: string
          is_active: boolean
          medialive_channel_id: string
          medialive_input_id: string
          rtmp_endpoint: string
          s3_bucket_name: string
          updated_at: string
        }
        Insert: {
          cloudfront_distribution_id: string
          created_at?: string
          hls_playback_url: string
          id?: string
          is_active?: boolean
          medialive_channel_id: string
          medialive_input_id: string
          rtmp_endpoint: string
          s3_bucket_name: string
          updated_at?: string
        }
        Update: {
          cloudfront_distribution_id?: string
          created_at?: string
          hls_playback_url?: string
          id?: string
          is_active?: boolean
          medialive_channel_id?: string
          medialive_input_id?: string
          rtmp_endpoint?: string
          s3_bucket_name?: string
          updated_at?: string
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
      career_match_scores: {
        Row: {
          calculated_at: string | null
          id: string
          job_role: string
          match_percentage: number
          missing_skills: Json | null
          portfolio_id: string | null
          recommendations: Json | null
          user_id: string
        }
        Insert: {
          calculated_at?: string | null
          id?: string
          job_role: string
          match_percentage: number
          missing_skills?: Json | null
          portfolio_id?: string | null
          recommendations?: Json | null
          user_id: string
        }
        Update: {
          calculated_at?: string | null
          id?: string
          job_role?: string
          match_percentage?: number
          missing_skills?: Json | null
          portfolio_id?: string | null
          recommendations?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_match_scores_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "user_portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      career_roadmaps: {
        Row: {
          created_at: string | null
          email_sent: boolean | null
          email_sent_at: string | null
          generation_status: string | null
          id: string
          pdf_path: string | null
          resume_id: string | null
          roadmap_data: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          generation_status?: string | null
          id?: string
          pdf_path?: string | null
          resume_id?: string | null
          roadmap_data?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          generation_status?: string | null
          id?: string
          pdf_path?: string | null
          resume_id?: string | null
          roadmap_data?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "career_roadmaps_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "user_resumes"
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
      certification_courses: {
        Row: {
          course_schedule_id: string | null
          created_at: string | null
          description: string | null
          difficulty: string | null
          duration: string | null
          estimated_launch: string | null
          features: string[] | null
          id: string
          is_active: boolean | null
          is_blockchain_verified: boolean | null
          price: number | null
          rating: number | null
          requirements: string[] | null
          students_enrolled: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          course_schedule_id?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration?: string | null
          estimated_launch?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          is_blockchain_verified?: boolean | null
          price?: number | null
          rating?: number | null
          requirements?: string[] | null
          students_enrolled?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          course_schedule_id?: string | null
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          duration?: string | null
          estimated_launch?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          is_blockchain_verified?: boolean | null
          price?: number | null
          rating?: number | null
          requirements?: string[] | null
          students_enrolled?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certification_courses_course_schedule_id_fkey"
            columns: ["course_schedule_id"]
            isOneToOne: false
            referencedRelation: "upcoming_course_schedule"
            referencedColumns: ["id"]
          },
        ]
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
      class_qa: {
        Row: {
          answer: string | null
          answered_at: string | null
          answered_by: string | null
          class_id: string
          created_at: string
          id: string
          is_highlighted: boolean | null
          question: string
          updated_at: string
          user_id: string
          votes: number | null
        }
        Insert: {
          answer?: string | null
          answered_at?: string | null
          answered_by?: string | null
          class_id: string
          created_at?: string
          id?: string
          is_highlighted?: boolean | null
          question: string
          updated_at?: string
          user_id: string
          votes?: number | null
        }
        Update: {
          answer?: string | null
          answered_at?: string | null
          answered_by?: string | null
          class_id?: string
          created_at?: string
          id?: string
          is_highlighted?: boolean | null
          question?: string
          updated_at?: string
          user_id?: string
          votes?: number | null
        }
        Relationships: []
      }
      class_recordings: {
        Row: {
          aws_url: string | null
          cloudfront_url: string | null
          created_at: string | null
          created_by: string
          description: string | null
          download_count: number | null
          duration_seconds: number | null
          file_size_bytes: number | null
          id: string
          is_public: boolean | null
          s3_key: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          view_count: number | null
          youtube_url: string | null
        }
        Insert: {
          aws_url?: string | null
          cloudfront_url?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          download_count?: number | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          id?: string
          is_public?: boolean | null
          s3_key?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          view_count?: number | null
          youtube_url?: string | null
        }
        Update: {
          aws_url?: string | null
          cloudfront_url?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          download_count?: number | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          id?: string
          is_public?: boolean | null
          s3_key?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      class_registrations: {
        Row: {
          attendance_status: string | null
          class_id: string
          id: string
          joined_at: string | null
          left_at: string | null
          registered_at: string
          user_id: string
        }
        Insert: {
          attendance_status?: string | null
          class_id: string
          id?: string
          joined_at?: string | null
          left_at?: string | null
          registered_at?: string
          user_id: string
        }
        Update: {
          attendance_status?: string | null
          class_id?: string
          id?: string
          joined_at?: string | null
          left_at?: string | null
          registered_at?: string
          user_id?: string
        }
        Relationships: []
      }
      code_snippet_favorites: {
        Row: {
          created_at: string | null
          id: string
          snippet_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          snippet_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          snippet_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "code_snippet_favorites_snippet_id_fkey"
            columns: ["snippet_id"]
            isOneToOne: false
            referencedRelation: "enhanced_code_snippets"
            referencedColumns: ["id"]
          },
        ]
      }
      code_snippet_feedback: {
        Row: {
          created_at: string | null
          description: string | null
          feedback_type: string
          id: string
          is_resolved: boolean | null
          rating: number | null
          resolved_at: string | null
          resolved_by: string | null
          snippet_id: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          feedback_type: string
          id?: string
          is_resolved?: boolean | null
          rating?: number | null
          resolved_at?: string | null
          resolved_by?: string | null
          snippet_id?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          feedback_type?: string
          id?: string
          is_resolved?: boolean | null
          rating?: number | null
          resolved_at?: string | null
          resolved_by?: string | null
          snippet_id?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "code_snippet_feedback_snippet_id_fkey"
            columns: ["snippet_id"]
            isOneToOne: false
            referencedRelation: "enhanced_code_snippets"
            referencedColumns: ["id"]
          },
        ]
      }
      code_snippet_tags: {
        Row: {
          created_at: string | null
          id: string
          snippet_id: string | null
          tag: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          snippet_id?: string | null
          tag: string
        }
        Update: {
          created_at?: string | null
          id?: string
          snippet_id?: string | null
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "code_snippet_tags_snippet_id_fkey"
            columns: ["snippet_id"]
            isOneToOne: false
            referencedRelation: "enhanced_code_snippets"
            referencedColumns: ["id"]
          },
        ]
      }
      code_snippet_tests: {
        Row: {
          error_message: string | null
          id: string
          snippet_id: string | null
          test_duration_ms: number | null
          test_environment: string
          test_output: string | null
          test_status: string
          tested_at: string | null
          tested_by: string | null
        }
        Insert: {
          error_message?: string | null
          id?: string
          snippet_id?: string | null
          test_duration_ms?: number | null
          test_environment: string
          test_output?: string | null
          test_status: string
          tested_at?: string | null
          tested_by?: string | null
        }
        Update: {
          error_message?: string | null
          id?: string
          snippet_id?: string | null
          test_duration_ms?: number | null
          test_environment?: string
          test_output?: string | null
          test_status?: string
          tested_at?: string | null
          tested_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "code_snippet_tests_snippet_id_fkey"
            columns: ["snippet_id"]
            isOneToOne: false
            referencedRelation: "enhanced_code_snippets"
            referencedColumns: ["id"]
          },
        ]
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
      community_posts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
          votes: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
          votes?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
          votes?: number | null
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
      corporate_inquiries: {
        Row: {
          additional_info: string | null
          areas_of_interest: string[] | null
          created_at: string
          email: string
          id: string
          name: string
          organization: string
          status: string | null
          team_size: string
          updated_at: string
        }
        Insert: {
          additional_info?: string | null
          areas_of_interest?: string[] | null
          created_at?: string
          email: string
          id?: string
          name: string
          organization: string
          status?: string | null
          team_size: string
          updated_at?: string
        }
        Update: {
          additional_info?: string | null
          areas_of_interest?: string[] | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          organization?: string
          status?: string | null
          team_size?: string
          updated_at?: string
        }
        Relationships: []
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
          is_certification: boolean | null
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
          is_certification?: boolean | null
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
          is_certification?: boolean | null
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
        Relationships: []
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
      course_schedule: {
        Row: {
          course_module_title: string
          course_summary: string | null
          created_at: string | null
          day_number: number
          day_of_week: string
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          scheduled_time: string | null
          updated_at: string | null
        }
        Insert: {
          course_module_title: string
          course_summary?: string | null
          created_at?: string | null
          day_number: number
          day_of_week: string
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          scheduled_time?: string | null
          updated_at?: string | null
        }
        Update: {
          course_module_title?: string
          course_summary?: string | null
          created_at?: string | null
          day_number?: number
          day_of_week?: string
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          scheduled_time?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      course_waitlist: {
        Row: {
          course_id: string
          created_at: string
          email: string
          full_name: string
          id: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      creator_applications: {
        Row: {
          areas_of_interest: string[] | null
          created_at: string | null
          email: string
          github_url: string | null
          id: string
          name: string
          phone: string | null
          portfolio_url: string | null
          status: string | null
        }
        Insert: {
          areas_of_interest?: string[] | null
          created_at?: string | null
          email: string
          github_url?: string | null
          id?: string
          name: string
          phone?: string | null
          portfolio_url?: string | null
          status?: string | null
        }
        Update: {
          areas_of_interest?: string[] | null
          created_at?: string | null
          email?: string
          github_url?: string | null
          id?: string
          name?: string
          phone?: string | null
          portfolio_url?: string | null
          status?: string | null
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
      creator_profiles_enhanced: {
        Row: {
          behance_url: string | null
          bio: string | null
          created_at: string | null
          experience_level: string | null
          featured_this_week: boolean | null
          github_url: string | null
          id: string
          is_verified: boolean | null
          linkedin_url: string | null
          location: string | null
          portfolio_url: string | null
          specialties: string[] | null
          tools_expertise: string[] | null
          total_likes: number | null
          total_views: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          behance_url?: string | null
          bio?: string | null
          created_at?: string | null
          experience_level?: string | null
          featured_this_week?: boolean | null
          github_url?: string | null
          id?: string
          is_verified?: boolean | null
          linkedin_url?: string | null
          location?: string | null
          portfolio_url?: string | null
          specialties?: string[] | null
          tools_expertise?: string[] | null
          total_likes?: number | null
          total_views?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          behance_url?: string | null
          bio?: string | null
          created_at?: string | null
          experience_level?: string | null
          featured_this_week?: boolean | null
          github_url?: string | null
          id?: string
          is_verified?: boolean | null
          linkedin_url?: string | null
          location?: string | null
          portfolio_url?: string | null
          specialties?: string[] | null
          tools_expertise?: string[] | null
          total_likes?: number | null
          total_views?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      creator_stats: {
        Row: {
          created_at: string | null
          engagement_score: number | null
          featured_week: string | null
          id: string
          posts_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          engagement_score?: number | null
          featured_week?: string | null
          id?: string
          posts_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          engagement_score?: number | null
          featured_week?: string | null
          id?: string
          posts_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          reference_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      data_streams: {
        Row: {
          created_at: string | null
          error_message: string | null
          frequency_seconds: number
          id: string
          last_update_at: string | null
          name: string
          organization_id: string | null
          processing_config: Json | null
          records_processed: number | null
          source_id: string | null
          source_type: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          frequency_seconds: number
          id?: string
          last_update_at?: string | null
          name: string
          organization_id?: string | null
          processing_config?: Json | null
          records_processed?: number | null
          source_id?: string | null
          source_type: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          frequency_seconds?: number
          id?: string
          last_update_at?: string | null
          name?: string
          organization_id?: string | null
          processing_config?: Json | null
          records_processed?: number | null
          source_id?: string | null
          source_type?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_streams_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      decision_executions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          confidence_score: number
          created_at: string | null
          error_message: string | null
          estimated_impact: string | null
          executed_at: string | null
          execution_result: Json | null
          expires_at: string | null
          id: string
          recommended_action: string
          rule_id: string
          status: string | null
          trigger_data: Json
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          confidence_score: number
          created_at?: string | null
          error_message?: string | null
          estimated_impact?: string | null
          executed_at?: string | null
          execution_result?: Json | null
          expires_at?: string | null
          id?: string
          recommended_action: string
          rule_id: string
          status?: string | null
          trigger_data: Json
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          confidence_score?: number
          created_at?: string | null
          error_message?: string | null
          estimated_impact?: string | null
          executed_at?: string | null
          execution_result?: Json | null
          expires_at?: string | null
          id?: string
          recommended_action?: string
          rule_id?: string
          status?: string | null
          trigger_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "decision_executions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "automated_decision_rules"
            referencedColumns: ["id"]
          },
        ]
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
      download_logs: {
        Row: {
          created_at: string
          download_completed: boolean | null
          download_timestamp: string
          id: string
          ip_address: unknown | null
          tool_id: string
          tool_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          download_completed?: boolean | null
          download_timestamp?: string
          id?: string
          ip_address?: unknown | null
          tool_id: string
          tool_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          download_completed?: boolean | null
          download_timestamp?: string
          id?: string
          ip_address?: unknown | null
          tool_id?: string
          tool_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      enhanced_code_snippets: {
        Row: {
          author_id: string | null
          author_name: string | null
          category: string
          code: string
          colab_url: string | null
          configuration: Json | null
          created_at: string | null
          description: string
          download_count: number | null
          github_url: string | null
          id: string
          inputs_required: Json | null
          is_active: boolean | null
          is_production_ready: boolean | null
          is_tested: boolean | null
          language: string
          last_tested_at: string | null
          notebook_url: string | null
          output_format: string | null
          preview_image_url: string | null
          rating_average: number | null
          rating_count: number | null
          summary: string
          title: string
          updated_at: string | null
          use_case: string
          version: string | null
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          category: string
          code: string
          colab_url?: string | null
          configuration?: Json | null
          created_at?: string | null
          description: string
          download_count?: number | null
          github_url?: string | null
          id?: string
          inputs_required?: Json | null
          is_active?: boolean | null
          is_production_ready?: boolean | null
          is_tested?: boolean | null
          language: string
          last_tested_at?: string | null
          notebook_url?: string | null
          output_format?: string | null
          preview_image_url?: string | null
          rating_average?: number | null
          rating_count?: number | null
          summary: string
          title: string
          updated_at?: string | null
          use_case: string
          version?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          category?: string
          code?: string
          colab_url?: string | null
          configuration?: Json | null
          created_at?: string | null
          description?: string
          download_count?: number | null
          github_url?: string | null
          id?: string
          inputs_required?: Json | null
          is_active?: boolean | null
          is_production_ready?: boolean | null
          is_tested?: boolean | null
          language?: string
          last_tested_at?: string | null
          notebook_url?: string | null
          output_format?: string | null
          preview_image_url?: string | null
          rating_average?: number | null
          rating_count?: number | null
          summary?: string
          title?: string
          updated_at?: string | null
          use_case?: string
          version?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      enhanced_dashboards: {
        Row: {
          ai_insights: Json | null
          created_at: string | null
          data_sources: Json | null
          description: string | null
          export_settings: Json | null
          id: string
          is_shared: boolean | null
          layout_config: Json | null
          name: string
          organization_id: string | null
          sharing_settings: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_insights?: Json | null
          created_at?: string | null
          data_sources?: Json | null
          description?: string | null
          export_settings?: Json | null
          id?: string
          is_shared?: boolean | null
          layout_config?: Json | null
          name: string
          organization_id?: string | null
          sharing_settings?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_insights?: Json | null
          created_at?: string | null
          data_sources?: Json | null
          description?: string | null
          export_settings?: Json | null
          id?: string
          is_shared?: boolean | null
          layout_config?: Json | null
          name?: string
          organization_id?: string | null
          sharing_settings?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enhanced_dashboards_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      enhanced_project_templates: {
        Row: {
          author_id: string | null
          blog_post_url: string | null
          changelog: Json | null
          contributor_email: string | null
          contributor_name: string | null
          created_at: string | null
          description: string
          documentation_external_url: string | null
          documentation_url: string | null
          download_count: number | null
          estimated_duration: string | null
          folder_structure: Json | null
          github_url: string | null
          id: string
          is_featured: boolean | null
          is_verified: boolean | null
          keywords: string[] | null
          last_verified_at: string | null
          learning_outcomes: string[] | null
          license_type: string | null
          main_script_file: string | null
          objectives: Json | null
          organization: string | null
          overview: string
          parent_template_id: string | null
          prerequisites: string[] | null
          preview_images: Json | null
          published_at: string | null
          quality_score: number | null
          rating_average: number | null
          rating_count: number | null
          requirements_file: string | null
          result_images: Json | null
          sample_data_description: string | null
          sample_data_url: string | null
          sector: Database["public"]["Enums"]["project_sector"]
          skill_level: Database["public"]["Enums"]["skill_level"]
          slug: string
          status: string | null
          tags: string[] | null
          template_files: Json | null
          title: string
          tools_required: Database["public"]["Enums"]["gis_tool"][]
          updated_at: string | null
          use_case: string
          version: string | null
          video_tutorial_url: string | null
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          blog_post_url?: string | null
          changelog?: Json | null
          contributor_email?: string | null
          contributor_name?: string | null
          created_at?: string | null
          description: string
          documentation_external_url?: string | null
          documentation_url?: string | null
          download_count?: number | null
          estimated_duration?: string | null
          folder_structure?: Json | null
          github_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          keywords?: string[] | null
          last_verified_at?: string | null
          learning_outcomes?: string[] | null
          license_type?: string | null
          main_script_file?: string | null
          objectives?: Json | null
          organization?: string | null
          overview: string
          parent_template_id?: string | null
          prerequisites?: string[] | null
          preview_images?: Json | null
          published_at?: string | null
          quality_score?: number | null
          rating_average?: number | null
          rating_count?: number | null
          requirements_file?: string | null
          result_images?: Json | null
          sample_data_description?: string | null
          sample_data_url?: string | null
          sector: Database["public"]["Enums"]["project_sector"]
          skill_level?: Database["public"]["Enums"]["skill_level"]
          slug: string
          status?: string | null
          tags?: string[] | null
          template_files?: Json | null
          title: string
          tools_required?: Database["public"]["Enums"]["gis_tool"][]
          updated_at?: string | null
          use_case: string
          version?: string | null
          video_tutorial_url?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          blog_post_url?: string | null
          changelog?: Json | null
          contributor_email?: string | null
          contributor_name?: string | null
          created_at?: string | null
          description?: string
          documentation_external_url?: string | null
          documentation_url?: string | null
          download_count?: number | null
          estimated_duration?: string | null
          folder_structure?: Json | null
          github_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          keywords?: string[] | null
          last_verified_at?: string | null
          learning_outcomes?: string[] | null
          license_type?: string | null
          main_script_file?: string | null
          objectives?: Json | null
          organization?: string | null
          overview?: string
          parent_template_id?: string | null
          prerequisites?: string[] | null
          preview_images?: Json | null
          published_at?: string | null
          quality_score?: number | null
          rating_average?: number | null
          rating_count?: number | null
          requirements_file?: string | null
          result_images?: Json | null
          sample_data_description?: string | null
          sample_data_url?: string | null
          sector?: Database["public"]["Enums"]["project_sector"]
          skill_level?: Database["public"]["Enums"]["skill_level"]
          slug?: string
          status?: string | null
          tags?: string[] | null
          template_files?: Json | null
          title?: string
          tools_required?: Database["public"]["Enums"]["gis_tool"][]
          updated_at?: string | null
          use_case?: string
          version?: string | null
          video_tutorial_url?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "enhanced_project_templates_parent_template_id_fkey"
            columns: ["parent_template_id"]
            isOneToOne: false
            referencedRelation: "enhanced_project_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          course_id: string
          created_at: string
          email: string
          emi_plan: string | null
          full_name: string
          how_did_you_hear: string | null
          id: string
          is_emi: boolean | null
          location: string
          mobile_number: string
          payment_amount: number
          payment_currency: string
          payment_status: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          email: string
          emi_plan?: string | null
          full_name: string
          how_did_you_hear?: string | null
          id?: string
          is_emi?: boolean | null
          location: string
          mobile_number: string
          payment_amount: number
          payment_currency: string
          payment_status?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          email?: string
          emi_plan?: string | null
          full_name?: string
          how_did_you_hear?: string | null
          id?: string
          is_emi?: boolean | null
          location?: string
          mobile_number?: string
          payment_amount?: number
          payment_currency?: string
          payment_status?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      enterprise_api_keys: {
        Row: {
          api_key: string
          created_at: string
          id: string
          is_active: boolean
          key_name: string
          last_used: string | null
          permissions: string[]
          rate_limit: number
          updated_at: string
          usage_count: number
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          is_active?: boolean
          key_name: string
          last_used?: string | null
          permissions?: string[]
          rate_limit?: number
          updated_at?: string
          usage_count?: number
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          is_active?: boolean
          key_name?: string
          last_used?: string | null
          permissions?: string[]
          rate_limit?: number
          updated_at?: string
          usage_count?: number
          user_id?: string
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
      external_projects: {
        Row: {
          applicants_count: number | null
          apply_url: string | null
          budget_max: number | null
          budget_min: number | null
          budget_type: string | null
          client_name: string | null
          client_rating: number | null
          created_at: string | null
          currency: string | null
          deadline: string | null
          description: string
          difficulty: string | null
          duration: string | null
          external_id: string
          id: string
          is_active: boolean | null
          is_remote: boolean | null
          is_verified: boolean | null
          last_updated: string | null
          location: string | null
          platform: string
          posted_date: string | null
          skills: string[] | null
          title: string
        }
        Insert: {
          applicants_count?: number | null
          apply_url?: string | null
          budget_max?: number | null
          budget_min?: number | null
          budget_type?: string | null
          client_name?: string | null
          client_rating?: number | null
          created_at?: string | null
          currency?: string | null
          deadline?: string | null
          description: string
          difficulty?: string | null
          duration?: string | null
          external_id: string
          id?: string
          is_active?: boolean | null
          is_remote?: boolean | null
          is_verified?: boolean | null
          last_updated?: string | null
          location?: string | null
          platform: string
          posted_date?: string | null
          skills?: string[] | null
          title: string
        }
        Update: {
          applicants_count?: number | null
          apply_url?: string | null
          budget_max?: number | null
          budget_min?: number | null
          budget_type?: string | null
          client_name?: string | null
          client_rating?: number | null
          created_at?: string | null
          currency?: string | null
          deadline?: string | null
          description?: string
          difficulty?: string | null
          duration?: string | null
          external_id?: string
          id?: string
          is_active?: boolean | null
          is_remote?: boolean | null
          is_verified?: boolean | null
          last_updated?: string | null
          location?: string | null
          platform?: string
          posted_date?: string | null
          skills?: string[] | null
          title?: string
        }
        Relationships: []
      }
      external_system_integrations: {
        Row: {
          authentication_type: string | null
          created_at: string | null
          credentials: Json | null
          data_flow: string | null
          description: string | null
          endpoint_url: string
          error_count: number | null
          id: string
          last_sync_at: string | null
          name: string
          organization_id: string | null
          status: string | null
          sync_frequency: number | null
          system_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          authentication_type?: string | null
          created_at?: string | null
          credentials?: Json | null
          data_flow?: string | null
          description?: string | null
          endpoint_url: string
          error_count?: number | null
          id?: string
          last_sync_at?: string | null
          name: string
          organization_id?: string | null
          status?: string | null
          sync_frequency?: number | null
          system_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          authentication_type?: string | null
          created_at?: string | null
          credentials?: Json | null
          data_flow?: string | null
          description?: string | null
          endpoint_url?: string
          error_count?: number | null
          id?: string
          last_sync_at?: string | null
          name?: string
          organization_id?: string | null
          status?: string | null
          sync_frequency?: number | null
          system_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_system_integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      geoai_data_layers: {
        Row: {
          access_permissions: Json | null
          bands_info: Json | null
          bounding_box: Json | null
          created_at: string
          data_source_id: string | null
          file_format: string | null
          file_path: string | null
          file_size_bytes: number | null
          id: string
          is_public: boolean | null
          layer_name: string
          layer_type: string
          metadata: Json | null
          processing_level: string | null
          spatial_reference: string | null
          temporal_info: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_permissions?: Json | null
          bands_info?: Json | null
          bounding_box?: Json | null
          created_at?: string
          data_source_id?: string | null
          file_format?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          id?: string
          is_public?: boolean | null
          layer_name: string
          layer_type: string
          metadata?: Json | null
          processing_level?: string | null
          spatial_reference?: string | null
          temporal_info?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_permissions?: Json | null
          bands_info?: Json | null
          bounding_box?: Json | null
          created_at?: string
          data_source_id?: string | null
          file_format?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          id?: string
          is_public?: boolean | null
          layer_name?: string
          layer_type?: string
          metadata?: Json | null
          processing_level?: string | null
          spatial_reference?: string | null
          temporal_info?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "geoai_data_layers_data_source_id_fkey"
            columns: ["data_source_id"]
            isOneToOne: false
            referencedRelation: "geoai_data_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      geoai_data_sources: {
        Row: {
          api_endpoint: string | null
          authentication_config: Json | null
          bands_available: Json | null
          coverage_area: Json | null
          created_at: string
          data_formats: Json | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          resolution_meters: number | null
          source_type: string
          temporal_range: Json | null
          update_frequency: string | null
          updated_at: string
          usage_limits: Json | null
        }
        Insert: {
          api_endpoint?: string | null
          authentication_config?: Json | null
          bands_available?: Json | null
          coverage_area?: Json | null
          created_at?: string
          data_formats?: Json | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          resolution_meters?: number | null
          source_type: string
          temporal_range?: Json | null
          update_frequency?: string | null
          updated_at?: string
          usage_limits?: Json | null
        }
        Update: {
          api_endpoint?: string | null
          authentication_config?: Json | null
          bands_available?: Json | null
          coverage_area?: Json | null
          created_at?: string
          data_formats?: Json | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          resolution_meters?: number | null
          source_type?: string
          temporal_range?: Json | null
          update_frequency?: string | null
          updated_at?: string
          usage_limits?: Json | null
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
      geoai_jobs: {
        Row: {
          completed_at: string | null
          computational_cost: number | null
          created_at: string
          error_message: string | null
          id: string
          input_data: Json | null
          job_name: string
          output_data: Json | null
          processing_logs: Json | null
          processing_time: number | null
          progress: number | null
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
          workflow_id: string | null
        }
        Insert: {
          completed_at?: string | null
          computational_cost?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_data?: Json | null
          job_name: string
          output_data?: Json | null
          processing_logs?: Json | null
          processing_time?: number | null
          progress?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
          workflow_id?: string | null
        }
        Update: {
          completed_at?: string | null
          computational_cost?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_data?: Json | null
          job_name?: string
          output_data?: Json | null
          processing_logs?: Json | null
          processing_time?: number | null
          progress?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "geoai_jobs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "geoai_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      geoai_models: {
        Row: {
          accuracy_metrics: Json | null
          category: string
          computational_requirements: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          input_requirements: Json | null
          is_active: boolean | null
          is_gpu_required: boolean | null
          model_config: Json | null
          model_file_path: string | null
          model_type: string
          model_version: string | null
          name: string
          output_format: Json | null
          processing_time_estimate: number | null
          updated_at: string
        }
        Insert: {
          accuracy_metrics?: Json | null
          category: string
          computational_requirements?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          input_requirements?: Json | null
          is_active?: boolean | null
          is_gpu_required?: boolean | null
          model_config?: Json | null
          model_file_path?: string | null
          model_type: string
          model_version?: string | null
          name: string
          output_format?: Json | null
          processing_time_estimate?: number | null
          updated_at?: string
        }
        Update: {
          accuracy_metrics?: Json | null
          category?: string
          computational_requirements?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          input_requirements?: Json | null
          is_active?: boolean | null
          is_gpu_required?: boolean | null
          model_config?: Json | null
          model_file_path?: string | null
          model_type?: string
          model_version?: string | null
          name?: string
          output_format?: Json | null
          processing_time_estimate?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      geoai_results: {
        Row: {
          accuracy_metrics: Json | null
          confidence_scores: Json | null
          created_at: string
          download_count: number | null
          export_formats: Json | null
          id: string
          is_public: boolean | null
          job_id: string | null
          output_files: Json | null
          result_data: Json
          result_type: string
          user_id: string
          visualization_config: Json | null
        }
        Insert: {
          accuracy_metrics?: Json | null
          confidence_scores?: Json | null
          created_at?: string
          download_count?: number | null
          export_formats?: Json | null
          id?: string
          is_public?: boolean | null
          job_id?: string | null
          output_files?: Json | null
          result_data?: Json
          result_type: string
          user_id: string
          visualization_config?: Json | null
        }
        Update: {
          accuracy_metrics?: Json | null
          confidence_scores?: Json | null
          created_at?: string
          download_count?: number | null
          export_formats?: Json | null
          id?: string
          is_public?: boolean | null
          job_id?: string | null
          output_files?: Json | null
          result_data?: Json
          result_type?: string
          user_id?: string
          visualization_config?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "geoai_results_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "geoai_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      geoai_usage_tracking: {
        Row: {
          admin_notes: string | null
          api_calls_made: number | null
          compute_minutes_used: number | null
          created_at: string
          data_processed_gb: number | null
          id: string
          jobs_executed: number | null
          last_admin_review: string | null
          limits: Json | null
          month_year: string
          plan_tier: string
          priority_level: string | null
          reviewed_by: string | null
          storage_used_gb: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          api_calls_made?: number | null
          compute_minutes_used?: number | null
          created_at?: string
          data_processed_gb?: number | null
          id?: string
          jobs_executed?: number | null
          last_admin_review?: string | null
          limits?: Json | null
          month_year: string
          plan_tier?: string
          priority_level?: string | null
          reviewed_by?: string | null
          storage_used_gb?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          api_calls_made?: number | null
          compute_minutes_used?: number | null
          created_at?: string
          data_processed_gb?: number | null
          id?: string
          jobs_executed?: number | null
          last_admin_review?: string | null
          limits?: Json | null
          month_year?: string
          plan_tier?: string
          priority_level?: string | null
          reviewed_by?: string | null
          storage_used_gb?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      geoai_workflows: {
        Row: {
          average_rating: number | null
          created_at: string
          data_sources: Json | null
          description: string | null
          estimated_runtime: number | null
          id: string
          is_public: boolean | null
          is_template: boolean | null
          models_used: Json | null
          name: string
          output_config: Json | null
          processing_steps: Json | null
          tags: string[] | null
          updated_at: string
          usage_count: number | null
          user_id: string
          workflow_config: Json
          workflow_type: string
        }
        Insert: {
          average_rating?: number | null
          created_at?: string
          data_sources?: Json | null
          description?: string | null
          estimated_runtime?: number | null
          id?: string
          is_public?: boolean | null
          is_template?: boolean | null
          models_used?: Json | null
          name: string
          output_config?: Json | null
          processing_steps?: Json | null
          tags?: string[] | null
          updated_at?: string
          usage_count?: number | null
          user_id: string
          workflow_config?: Json
          workflow_type: string
        }
        Update: {
          average_rating?: number | null
          created_at?: string
          data_sources?: Json | null
          description?: string | null
          estimated_runtime?: number | null
          id?: string
          is_public?: boolean | null
          is_template?: boolean | null
          models_used?: Json | null
          name?: string
          output_config?: Json | null
          processing_steps?: Json | null
          tags?: string[] | null
          updated_at?: string
          usage_count?: number | null
          user_id?: string
          workflow_config?: Json
          workflow_type?: string
        }
        Relationships: []
      }
      geova_avatar_settings: {
        Row: {
          accent: string
          avatar_id: string | null
          avatar_name: string
          avatar_provider: string
          avatar_video_url: string | null
          created_at: string
          created_by: string | null
          gender: string
          id: string
          is_active: boolean | null
          personality_traits: Json | null
          updated_at: string
          voice_id: string | null
          voice_provider: string
        }
        Insert: {
          accent?: string
          avatar_id?: string | null
          avatar_name?: string
          avatar_provider?: string
          avatar_video_url?: string | null
          created_at?: string
          created_by?: string | null
          gender?: string
          id?: string
          is_active?: boolean | null
          personality_traits?: Json | null
          updated_at?: string
          voice_id?: string | null
          voice_provider?: string
        }
        Update: {
          accent?: string
          avatar_id?: string | null
          avatar_name?: string
          avatar_provider?: string
          avatar_video_url?: string | null
          created_at?: string
          created_by?: string | null
          gender?: string
          id?: string
          is_active?: boolean | null
          personality_traits?: Json | null
          updated_at?: string
          voice_id?: string | null
          voice_provider?: string
        }
        Relationships: []
      }
      geova_class_schedule: {
        Row: {
          class_description: string | null
          class_title: string
          created_at: string
          curriculum_data: Json
          id: string
          is_active: boolean
          scheduled_time: string
          timezone: string
          updated_at: string
        }
        Insert: {
          class_description?: string | null
          class_title: string
          created_at?: string
          curriculum_data?: Json
          id?: string
          is_active?: boolean
          scheduled_time?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          class_description?: string | null
          class_title?: string
          created_at?: string
          curriculum_data?: Json
          id?: string
          is_active?: boolean
          scheduled_time?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      geova_live_sessions: {
        Row: {
          avatar_config: Json | null
          chat_messages: Json | null
          created_at: string
          created_by: string | null
          current_participants: number | null
          description: string | null
          duration_minutes: number | null
          ended_at: string | null
          hls_endpoint: string | null
          id: string
          instructor_name: string | null
          max_participants: number | null
          recording_duration: number | null
          recording_url: string | null
          rtmp_endpoint: string | null
          session_type: string
          started_at: string | null
          status: string
          title: string
          updated_at: string
          whiteboard_data: Json | null
          youtube_stream_key: string | null
          youtube_url: string | null
        }
        Insert: {
          avatar_config?: Json | null
          chat_messages?: Json | null
          created_at?: string
          created_by?: string | null
          current_participants?: number | null
          description?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          hls_endpoint?: string | null
          id?: string
          instructor_name?: string | null
          max_participants?: number | null
          recording_duration?: number | null
          recording_url?: string | null
          rtmp_endpoint?: string | null
          session_type?: string
          started_at?: string | null
          status?: string
          title: string
          updated_at?: string
          whiteboard_data?: Json | null
          youtube_stream_key?: string | null
          youtube_url?: string | null
        }
        Update: {
          avatar_config?: Json | null
          chat_messages?: Json | null
          created_at?: string
          created_by?: string | null
          current_participants?: number | null
          description?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          hls_endpoint?: string | null
          id?: string
          instructor_name?: string | null
          max_participants?: number | null
          recording_duration?: number | null
          recording_url?: string | null
          rtmp_endpoint?: string | null
          session_type?: string
          started_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          whiteboard_data?: Json | null
          youtube_stream_key?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      geova_recordings: {
        Row: {
          auto_generated_description: string | null
          created_at: string
          day_number: number
          duration_seconds: number | null
          file_size_bytes: number | null
          hls_url: string | null
          id: string
          mp4_url: string | null
          recording_date: string
          recording_status: string | null
          recording_url: string | null
          thumbnail_url: string | null
          topic_description: string | null
          topic_title: string
          updated_at: string
          views_count: number | null
        }
        Insert: {
          auto_generated_description?: string | null
          created_at?: string
          day_number: number
          duration_seconds?: number | null
          file_size_bytes?: number | null
          hls_url?: string | null
          id?: string
          mp4_url?: string | null
          recording_date: string
          recording_status?: string | null
          recording_url?: string | null
          thumbnail_url?: string | null
          topic_description?: string | null
          topic_title: string
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          auto_generated_description?: string | null
          created_at?: string
          day_number?: number
          duration_seconds?: number | null
          file_size_bytes?: number | null
          hls_url?: string | null
          id?: string
          mp4_url?: string | null
          recording_date?: string
          recording_status?: string | null
          recording_url?: string | null
          thumbnail_url?: string | null
          topic_description?: string | null
          topic_title?: string
          updated_at?: string
          views_count?: number | null
        }
        Relationships: []
      }
      geova_session_interactions: {
        Row: {
          content: string
          geova_response: string | null
          id: string
          interaction_type: string
          is_highlighted: boolean | null
          metadata: Json | null
          schedule_id: string | null
          session_id: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          geova_response?: string | null
          id?: string
          interaction_type: string
          is_highlighted?: boolean | null
          metadata?: Json | null
          schedule_id?: string | null
          session_id?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          geova_response?: string | null
          id?: string
          interaction_type?: string
          is_highlighted?: boolean | null
          metadata?: Json | null
          schedule_id?: string | null
          session_id?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "geova_session_interactions_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "geova_teaching_schedule"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "geova_session_interactions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      geova_session_participants: {
        Row: {
          created_at: string
          id: string
          interaction_count: number | null
          joined_at: string | null
          left_at: string | null
          participation_duration: number | null
          questions_asked: number | null
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_count?: number | null
          joined_at?: string | null
          left_at?: string | null
          participation_duration?: number | null
          questions_asked?: number | null
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_count?: number | null
          joined_at?: string | null
          left_at?: string | null
          participation_duration?: number | null
          questions_asked?: number | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "geova_session_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "geova_live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      geova_student_progress: {
        Row: {
          attendance_count: number | null
          completed_days: number[] | null
          course_title: string
          created_at: string | null
          current_day: number | null
          id: string
          last_attended: string | null
          progress_percentage: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          attendance_count?: number | null
          completed_days?: number[] | null
          course_title?: string
          created_at?: string | null
          current_day?: number | null
          id?: string
          last_attended?: string | null
          progress_percentage?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          attendance_count?: number | null
          completed_days?: number[] | null
          course_title?: string
          created_at?: string | null
          current_day?: number | null
          id?: string
          last_attended?: string | null
          progress_percentage?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      geova_teaching_schedule: {
        Row: {
          course_title: string
          created_at: string | null
          day_number: number
          duration_minutes: number | null
          id: string
          learning_objectives: string[] | null
          practical_exercises: string[] | null
          scheduled_date: string
          scheduled_time: string | null
          session_id: string | null
          status: string | null
          tools_used: string[] | null
          topic_description: string | null
          topic_title: string
          updated_at: string | null
        }
        Insert: {
          course_title?: string
          created_at?: string | null
          day_number: number
          duration_minutes?: number | null
          id?: string
          learning_objectives?: string[] | null
          practical_exercises?: string[] | null
          scheduled_date: string
          scheduled_time?: string | null
          session_id?: string | null
          status?: string | null
          tools_used?: string[] | null
          topic_description?: string | null
          topic_title: string
          updated_at?: string | null
        }
        Update: {
          course_title?: string
          created_at?: string | null
          day_number?: number
          duration_minutes?: number | null
          id?: string
          learning_objectives?: string[] | null
          practical_exercises?: string[] | null
          scheduled_date?: string
          scheduled_time?: string | null
          session_id?: string | null
          status?: string | null
          tools_used?: string[] | null
          topic_description?: string | null
          topic_title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "geova_teaching_schedule_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      gis_marketplace_subscriptions: {
        Row: {
          amount_paid: number | null
          created_at: string | null
          currency: string | null
          expires_at: string | null
          id: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          started_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_paid?: number | null
          created_at?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      gis_marketplace_user_info: {
        Row: {
          email: string
          full_name: string
          id: string
          intended_use: string | null
          occupation: string | null
          submitted_at: string | null
          user_id: string
        }
        Insert: {
          email: string
          full_name: string
          id?: string
          intended_use?: string | null
          occupation?: string | null
          submitted_at?: string | null
          user_id: string
        }
        Update: {
          email?: string
          full_name?: string
          id?: string
          intended_use?: string | null
          occupation?: string | null
          submitted_at?: string | null
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
      gis_tool_creators: {
        Row: {
          average_rating: number | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string
          portfolio_url: string | null
          total_downloads: number | null
          total_tools: number | null
          updated_at: string | null
          user_id: string
          verification_status: string | null
        }
        Insert: {
          average_rating?: number | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          portfolio_url?: string | null
          total_downloads?: number | null
          total_tools?: number | null
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
        }
        Update: {
          average_rating?: number | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          portfolio_url?: string | null
          total_downloads?: number | null
          total_tools?: number | null
          updated_at?: string | null
          user_id?: string
          verification_status?: string | null
        }
        Relationships: []
      }
      gis_tool_downloads: {
        Row: {
          download_type: string | null
          downloaded_at: string | null
          id: string
          tool_id: string
          user_id: string
        }
        Insert: {
          download_type?: string | null
          downloaded_at?: string | null
          id?: string
          tool_id: string
          user_id: string
        }
        Update: {
          download_type?: string | null
          downloaded_at?: string | null
          id?: string
          tool_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gis_tool_downloads_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "gis_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      gis_tool_ratings: {
        Row: {
          created_at: string | null
          id: string
          rating: number
          review: string | null
          tool_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          rating: number
          review?: string | null
          tool_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          rating?: number
          review?: string | null
          tool_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gis_tool_ratings_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "gis_tools"
            referencedColumns: ["id"]
          },
        ]
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
      industry_intelligence_packs: {
        Row: {
          category: string
          color_scheme: string | null
          created_at: string | null
          datasets_count: number
          description: string
          features: Json | null
          icon_url: string | null
          id: string
          is_featured: boolean | null
          long_description: string | null
          models_count: number
          name: string
          rating: number | null
          templates_count: number
          tier: string
          updated_at: string | null
          use_cases: Json | null
          users_count: number | null
        }
        Insert: {
          category: string
          color_scheme?: string | null
          created_at?: string | null
          datasets_count?: number
          description: string
          features?: Json | null
          icon_url?: string | null
          id?: string
          is_featured?: boolean | null
          long_description?: string | null
          models_count?: number
          name: string
          rating?: number | null
          templates_count?: number
          tier?: string
          updated_at?: string | null
          use_cases?: Json | null
          users_count?: number | null
        }
        Update: {
          category?: string
          color_scheme?: string | null
          created_at?: string | null
          datasets_count?: number
          description?: string
          features?: Json | null
          icon_url?: string | null
          id?: string
          is_featured?: boolean | null
          long_description?: string | null
          models_count?: number
          name?: string
          rating?: number | null
          templates_count?: number
          tier?: string
          updated_at?: string | null
          use_cases?: Json | null
          users_count?: number | null
        }
        Relationships: []
      }
      installation_instructions: {
        Row: {
          created_at: string | null
          id: string
          instruction_text: string
          screenshot_url: string | null
          step_number: number
          tool_id: string
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          instruction_text: string
          screenshot_url?: string | null
          step_number: number
          tool_id: string
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          instruction_text?: string
          screenshot_url?: string | null
          step_number?: number
          tool_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "installation_instructions_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "marketplace_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      instructor_stream_settings: {
        Row: {
          backup_recording: boolean | null
          created_at: string
          default_stream_type: string | null
          enable_chat: boolean | null
          enable_recording: boolean | null
          id: string
          instructor_id: string
          obs_stream_key: string | null
          stream_quality: string | null
          updated_at: string
          youtube_channel_id: string | null
        }
        Insert: {
          backup_recording?: boolean | null
          created_at?: string
          default_stream_type?: string | null
          enable_chat?: boolean | null
          enable_recording?: boolean | null
          id?: string
          instructor_id: string
          obs_stream_key?: string | null
          stream_quality?: string | null
          updated_at?: string
          youtube_channel_id?: string | null
        }
        Update: {
          backup_recording?: boolean | null
          created_at?: string
          default_stream_type?: string | null
          enable_chat?: boolean | null
          enable_recording?: boolean | null
          id?: string
          instructor_id?: string
          obs_stream_key?: string | null
          stream_quality?: string | null
          updated_at?: string
          youtube_channel_id?: string | null
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
      iot_sensors: {
        Row: {
          battery_level: number | null
          configuration: Json | null
          coordinates: unknown | null
          created_at: string | null
          current_value: number | null
          id: string
          last_reading_at: string | null
          location: string
          name: string
          organization_id: string | null
          sensor_type: string
          status: string | null
          unit: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          battery_level?: number | null
          configuration?: Json | null
          coordinates?: unknown | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          last_reading_at?: string | null
          location: string
          name: string
          organization_id?: string | null
          sensor_type: string
          status?: string | null
          unit?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          battery_level?: number | null
          configuration?: Json | null
          coordinates?: unknown | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          last_reading_at?: string | null
          location?: string
          name?: string
          organization_id?: string | null
          sensor_type?: string
          status?: string | null
          unit?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "iot_sensors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          access_tier: string | null
          actual_end_time: string | null
          actual_start_time: string | null
          auto_start: boolean | null
          auto_start_enabled: boolean | null
          aws_stream_id: string | null
          cloudfront_url: string | null
          course_title: string | null
          created_at: string
          created_by: string | null
          current_live_video_id: string | null
          custom_day_label: string | null
          day_number: number | null
          description: string | null
          duration_minutes: number | null
          embed_url: string | null
          end_time: string | null
          geova_session_data: Json | null
          hls_manifest_url: string | null
          id: string
          instructor: string | null
          is_ai_generated: boolean | null
          is_free_access: boolean | null
          recording_s3_key: string | null
          recording_url: string | null
          rtmp_endpoint: string | null
          scheduled_start_time: string | null
          start_time: string | null
          starts_at: string | null
          status: Database["public"]["Enums"]["stream_status"]
          stream_key: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          viewer_count: number | null
          youtube_broadcast_id: string | null
          youtube_stream_id: string | null
          youtube_stream_key: string | null
          youtube_url: string | null
        }
        Insert: {
          access_tier?: string | null
          actual_end_time?: string | null
          actual_start_time?: string | null
          auto_start?: boolean | null
          auto_start_enabled?: boolean | null
          aws_stream_id?: string | null
          cloudfront_url?: string | null
          course_title?: string | null
          created_at?: string
          created_by?: string | null
          current_live_video_id?: string | null
          custom_day_label?: string | null
          day_number?: number | null
          description?: string | null
          duration_minutes?: number | null
          embed_url?: string | null
          end_time?: string | null
          geova_session_data?: Json | null
          hls_manifest_url?: string | null
          id?: string
          instructor?: string | null
          is_ai_generated?: boolean | null
          is_free_access?: boolean | null
          recording_s3_key?: string | null
          recording_url?: string | null
          rtmp_endpoint?: string | null
          scheduled_start_time?: string | null
          start_time?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["stream_status"]
          stream_key: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          viewer_count?: number | null
          youtube_broadcast_id?: string | null
          youtube_stream_id?: string | null
          youtube_stream_key?: string | null
          youtube_url?: string | null
        }
        Update: {
          access_tier?: string | null
          actual_end_time?: string | null
          actual_start_time?: string | null
          auto_start?: boolean | null
          auto_start_enabled?: boolean | null
          aws_stream_id?: string | null
          cloudfront_url?: string | null
          course_title?: string | null
          created_at?: string
          created_by?: string | null
          current_live_video_id?: string | null
          custom_day_label?: string | null
          day_number?: number | null
          description?: string | null
          duration_minutes?: number | null
          embed_url?: string | null
          end_time?: string | null
          geova_session_data?: Json | null
          hls_manifest_url?: string | null
          id?: string
          instructor?: string | null
          is_ai_generated?: boolean | null
          is_free_access?: boolean | null
          recording_s3_key?: string | null
          recording_url?: string | null
          rtmp_endpoint?: string | null
          scheduled_start_time?: string | null
          start_time?: string | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["stream_status"]
          stream_key?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          viewer_count?: number | null
          youtube_broadcast_id?: string | null
          youtube_stream_id?: string | null
          youtube_stream_key?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_classes_aws_stream_id_fkey"
            columns: ["aws_stream_id"]
            isOneToOne: false
            referencedRelation: "aws_streaming_config"
            referencedColumns: ["id"]
          },
        ]
      }
      live_recordings: {
        Row: {
          class_id: string | null
          cloudfront_url: string | null
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          end_time: string | null
          file_size_bytes: number | null
          id: string
          recording_status: string | null
          s3_url: string | null
          speaker: string | null
          start_time: string
          stream_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          class_id?: string | null
          cloudfront_url?: string | null
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          file_size_bytes?: number | null
          id?: string
          recording_status?: string | null
          s3_url?: string | null
          speaker?: string | null
          start_time: string
          stream_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          class_id?: string | null
          cloudfront_url?: string | null
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          file_size_bytes?: number | null
          id?: string
          recording_status?: string | null
          s3_url?: string | null
          speaker?: string | null
          start_time?: string
          stream_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_recordings_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "live_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      live_stream_detection: {
        Row: {
          description: string | null
          detected_at: string | null
          embed_url: string
          id: string
          is_live: boolean | null
          last_checked: string | null
          thumbnail_url: string | null
          title: string
          viewer_count: number | null
          youtube_id: string
        }
        Insert: {
          description?: string | null
          detected_at?: string | null
          embed_url: string
          id?: string
          is_live?: boolean | null
          last_checked?: string | null
          thumbnail_url?: string | null
          title: string
          viewer_count?: number | null
          youtube_id: string
        }
        Update: {
          description?: string | null
          detected_at?: string | null
          embed_url?: string
          id?: string
          is_live?: boolean | null
          last_checked?: string | null
          thumbnail_url?: string | null
          title?: string
          viewer_count?: number | null
          youtube_id?: string
        }
        Relationships: []
      }
      live_streams: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          duration_minutes: number | null
          embed_url: string
          end_time: string | null
          id: string
          is_free: boolean | null
          is_home_featured: boolean | null
          platform: string | null
          start_time: string
          status: string | null
          stream_key: string | null
          stream_server_url: string | null
          title: string
          updated_at: string | null
          viewer_count: number | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          duration_minutes?: number | null
          embed_url: string
          end_time?: string | null
          id?: string
          is_free?: boolean | null
          is_home_featured?: boolean | null
          platform?: string | null
          start_time: string
          status?: string | null
          stream_key?: string | null
          stream_server_url?: string | null
          title: string
          updated_at?: string | null
          viewer_count?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          duration_minutes?: number | null
          embed_url?: string
          end_time?: string | null
          id?: string
          is_free?: boolean | null
          is_home_featured?: boolean | null
          platform?: string | null
          start_time?: string
          status?: string | null
          stream_key?: string | null
          stream_server_url?: string | null
          title?: string
          updated_at?: string | null
          viewer_count?: number | null
        }
        Relationships: []
      }
      map_projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          project_data: Json
          thumbnail_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          project_data?: Json
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          project_data?: Json
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      marketplace_items: {
        Row: {
          accuracy_score: number | null
          category: string
          created_at: string | null
          currency: string | null
          description: string
          documentation_url: string | null
          download_count: number | null
          download_url: string | null
          features: Json | null
          file_format: string | null
          file_size_bytes: number | null
          id: string
          is_featured: boolean | null
          is_free: boolean | null
          name: string
          preview_image_url: string | null
          price: number
          provider_id: string | null
          provider_name: string
          purchase_count: number | null
          rating: number | null
          status: string | null
          tags: Json | null
          updated_at: string | null
        }
        Insert: {
          accuracy_score?: number | null
          category: string
          created_at?: string | null
          currency?: string | null
          description: string
          documentation_url?: string | null
          download_count?: number | null
          download_url?: string | null
          features?: Json | null
          file_format?: string | null
          file_size_bytes?: number | null
          id?: string
          is_featured?: boolean | null
          is_free?: boolean | null
          name: string
          preview_image_url?: string | null
          price?: number
          provider_id?: string | null
          provider_name: string
          purchase_count?: number | null
          rating?: number | null
          status?: string | null
          tags?: Json | null
          updated_at?: string | null
        }
        Update: {
          accuracy_score?: number | null
          category?: string
          created_at?: string | null
          currency?: string | null
          description?: string
          documentation_url?: string | null
          download_count?: number | null
          download_url?: string | null
          features?: Json | null
          file_format?: string | null
          file_size_bytes?: number | null
          id?: string
          is_featured?: boolean | null
          is_free?: boolean | null
          name?: string
          preview_image_url?: string | null
          price?: number
          provider_id?: string | null
          provider_name?: string
          purchase_count?: number | null
          rating?: number | null
          status?: string | null
          tags?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      marketplace_purchases: {
        Row: {
          amount: number
          currency: string
          download_url: string | null
          expires_at: string | null
          id: string
          item_id: string
          payment_method: string | null
          purchased_at: string | null
          status: string | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          currency: string
          download_url?: string | null
          expires_at?: string | null
          id?: string
          item_id: string
          payment_method?: string | null
          purchased_at?: string | null
          status?: string | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          currency?: string
          download_url?: string | null
          expires_at?: string | null
          id?: string
          item_id?: string
          payment_method?: string | null
          purchased_at?: string | null
          status?: string | null
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_purchases_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "marketplace_items"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_tools: {
        Row: {
          author_id: string | null
          base_price_inr: number | null
          base_price_usd: number | null
          category: string
          compatibility_notes: string | null
          created_at: string | null
          created_by: string | null
          demo_url: string | null
          dependencies: string[] | null
          description: string | null
          documentation_url: string | null
          download_count: number | null
          download_url: string | null
          file_size_mb: number | null
          github_url: string | null
          id: string
          installation_guide: string | null
          installation_verified: boolean | null
          is_featured: boolean | null
          is_free: boolean | null
          is_verified: boolean | null
          license_type: string | null
          metadata: Json | null
          minimum_requirements: Json | null
          plugin_icon_url: string | null
          plugin_id: string | null
          python_version: string | null
          qgis_min_version: string | null
          rating: number | null
          rating_count: number | null
          scan_results: Json | null
          security_scanned: boolean | null
          status: string | null
          subcategory: string | null
          tags: string[] | null
          tech_stack: string[] | null
          title: string
          tool_type: string
          updated_at: string | null
          version: string | null
        }
        Insert: {
          author_id?: string | null
          base_price_inr?: number | null
          base_price_usd?: number | null
          category: string
          compatibility_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          demo_url?: string | null
          dependencies?: string[] | null
          description?: string | null
          documentation_url?: string | null
          download_count?: number | null
          download_url?: string | null
          file_size_mb?: number | null
          github_url?: string | null
          id?: string
          installation_guide?: string | null
          installation_verified?: boolean | null
          is_featured?: boolean | null
          is_free?: boolean | null
          is_verified?: boolean | null
          license_type?: string | null
          metadata?: Json | null
          minimum_requirements?: Json | null
          plugin_icon_url?: string | null
          plugin_id?: string | null
          python_version?: string | null
          qgis_min_version?: string | null
          rating?: number | null
          rating_count?: number | null
          scan_results?: Json | null
          security_scanned?: boolean | null
          status?: string | null
          subcategory?: string | null
          tags?: string[] | null
          tech_stack?: string[] | null
          title: string
          tool_type: string
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          author_id?: string | null
          base_price_inr?: number | null
          base_price_usd?: number | null
          category?: string
          compatibility_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          demo_url?: string | null
          dependencies?: string[] | null
          description?: string | null
          documentation_url?: string | null
          download_count?: number | null
          download_url?: string | null
          file_size_mb?: number | null
          github_url?: string | null
          id?: string
          installation_guide?: string | null
          installation_verified?: boolean | null
          is_featured?: boolean | null
          is_free?: boolean | null
          is_verified?: boolean | null
          license_type?: string | null
          metadata?: Json | null
          minimum_requirements?: Json | null
          plugin_icon_url?: string | null
          plugin_id?: string | null
          python_version?: string | null
          qgis_min_version?: string | null
          rating?: number | null
          rating_count?: number | null
          scan_results?: Json | null
          security_scanned?: boolean | null
          status?: string | null
          subcategory?: string | null
          tags?: string[] | null
          tech_stack?: string[] | null
          title?: string
          tool_type?: string
          updated_at?: string | null
          version?: string | null
        }
        Relationships: []
      }
      mentor_bookings: {
        Row: {
          booking_date: string | null
          created_at: string | null
          currency: string
          email: string
          full_name: string
          id: string
          mentor_name: string
          notes: string | null
          payment_id: string | null
          payment_status: string | null
          phone: string | null
          query_description: string | null
          session_date: string | null
          session_duration: number
          session_price: number
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_date?: string | null
          created_at?: string | null
          currency?: string
          email: string
          full_name: string
          id?: string
          mentor_name?: string
          notes?: string | null
          payment_id?: string | null
          payment_status?: string | null
          phone?: string | null
          query_description?: string | null
          session_date?: string | null
          session_duration: number
          session_price: number
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_date?: string | null
          created_at?: string | null
          currency?: string
          email?: string
          full_name?: string
          id?: string
          mentor_name?: string
          notes?: string | null
          payment_id?: string | null
          payment_status?: string | null
          phone?: string | null
          query_description?: string | null
          session_date?: string | null
          session_duration?: number
          session_price?: number
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mentor_messages: {
        Row: {
          admin_replied: boolean | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          sender_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_replied?: boolean | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          sender_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_replied?: boolean | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          sender_type?: string
          updated_at?: string | null
          user_id?: string
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
      newsletter_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_id: string | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "newsletter_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "newsletter_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "newsletter_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "newsletter_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_posts: {
        Row: {
          comments_count: number
          content: string | null
          cover_image_url: string | null
          created_at: string
          id: string
          is_deleted: boolean
          is_featured: boolean | null
          likes_count: number
          linkedin_url: string | null
          published_date: string
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string | null
          view_count: number | null
        }
        Insert: {
          comments_count?: number
          content?: string | null
          cover_image_url?: string | null
          created_at?: string
          id?: string
          is_deleted?: boolean
          is_featured?: boolean | null
          likes_count?: number
          linkedin_url?: string | null
          published_date: string
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id?: string | null
          view_count?: number | null
        }
        Update: {
          comments_count?: number
          content?: string | null
          cover_image_url?: string | null
          created_at?: string
          id?: string
          is_deleted?: boolean
          is_featured?: boolean | null
          likes_count?: number
          linkedin_url?: string | null
          published_date?: string
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string | null
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
      obs_configurations: {
        Row: {
          created_at: string
          default_scene: string | null
          id: string
          is_active: boolean | null
          name: string
          recording_settings: Json | null
          updated_at: string
          websocket_password: string | null
          websocket_url: string
        }
        Insert: {
          created_at?: string
          default_scene?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          recording_settings?: Json | null
          updated_at?: string
          websocket_password?: string | null
          websocket_url?: string
        }
        Update: {
          created_at?: string
          default_scene?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          recording_settings?: Json | null
          updated_at?: string
          websocket_password?: string | null
          websocket_url?: string
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string | null
          organization_id: string | null
          permissions: Json | null
          role: Database["public"]["Enums"]["org_role"]
          user_id: string | null
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id?: string | null
          permissions?: Json | null
          role?: Database["public"]["Enums"]["org_role"]
          user_id?: string | null
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id?: string | null
          permissions?: Json | null
          role?: Database["public"]["Enums"]["org_role"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          settings: Json | null
          slug: string
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          settings?: Json | null
          slug: string
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          settings?: Json | null
          slug?: string
          subscription_tier?: string | null
          updated_at?: string | null
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
      plugin_compatibility: {
        Row: {
          compatibility_status: string
          created_at: string | null
          id: string
          notes: string | null
          platform: string
          qgis_version: string
          test_date: string | null
          tester_id: string | null
          tool_id: string
        }
        Insert: {
          compatibility_status: string
          created_at?: string | null
          id?: string
          notes?: string | null
          platform: string
          qgis_version: string
          test_date?: string | null
          tester_id?: string | null
          tool_id: string
        }
        Update: {
          compatibility_status?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          platform?: string
          qgis_version?: string
          test_date?: string | null
          tester_id?: string | null
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plugin_compatibility_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "marketplace_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_analytics: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          portfolio_id: string
          referrer: string | null
          user_agent: string | null
          user_id: string
          visitor_country: string | null
          visitor_ip: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          portfolio_id: string
          referrer?: string | null
          user_agent?: string | null
          user_id: string
          visitor_country?: string | null
          visitor_ip?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          portfolio_id?: string
          referrer?: string | null
          user_agent?: string | null
          user_id?: string
          visitor_country?: string | null
          visitor_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_analytics_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "user_portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_sections: {
        Row: {
          created_at: string | null
          id: string
          is_visible: boolean | null
          order_index: number
          portfolio_id: string
          section_data: Json
          section_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          order_index?: number
          portfolio_id: string
          section_data?: Json
          section_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          order_index?: number
          portfolio_id?: string
          section_data?: Json
          section_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_sections_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "user_portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_templates: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          download_count: number | null
          id: string
          is_premium: boolean | null
          name: string
          preview_image_url: string | null
          template_config: Json
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          id?: string
          is_premium?: boolean | null
          name: string
          preview_image_url?: string | null
          template_config?: Json
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          id?: string
          is_premium?: boolean | null
          name?: string
          preview_image_url?: string | null
          template_config?: Json
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
          email: string | null
          enrolled_courses: string[] | null
          enrolled_courses_count: number | null
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          location_city: string | null
          location_country: string | null
          location_detected_at: string | null
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
          email?: string | null
          enrolled_courses?: string[] | null
          enrolled_courses_count?: number | null
          first_name?: string | null
          full_name?: string | null
          id: string
          last_name?: string | null
          location_city?: string | null
          location_country?: string | null
          location_detected_at?: string | null
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
          email?: string | null
          enrolled_courses?: string[] | null
          enrolled_courses_count?: number | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          location_city?: string | null
          location_country?: string | null
          location_detected_at?: string | null
          plan?: string | null
          projects_completed?: number | null
          spatial_analyses?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      project_activities: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string | null
          description: string
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string | null
          description: string
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string | null
          description?: string
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_activities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_submissions"
            referencedColumns: ["id"]
          },
        ]
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
      project_collaborators: {
        Row: {
          created_at: string | null
          email: string
          id: string
          invited_at: string | null
          invited_by: string
          joined_at: string | null
          permissions: Json | null
          project_id: string
          role: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          invited_at?: string | null
          invited_by: string
          joined_at?: string | null
          permissions?: Json | null
          project_id: string
          role?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          invited_at?: string | null
          invited_by?: string
          joined_at?: string | null
          permissions?: Json | null
          project_id?: string
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_collaborators_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_submissions"
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
      project_files: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          is_public: boolean | null
          project_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_public?: boolean | null
          project_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_public?: boolean | null
          project_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      project_permissions: {
        Row: {
          can_admin: boolean | null
          can_read: boolean | null
          can_write: boolean | null
          granted_at: string | null
          granted_by: string | null
          id: string
          organization_id: string | null
          permission_type: string
          project_id: string | null
          user_id: string | null
        }
        Insert: {
          can_admin?: boolean | null
          can_read?: boolean | null
          can_write?: boolean | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          organization_id?: string | null
          permission_type: string
          project_id?: string | null
          user_id?: string | null
        }
        Update: {
          can_admin?: boolean | null
          can_read?: boolean | null
          can_write?: boolean | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          organization_id?: string | null
          permission_type?: string
          project_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_permissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      project_ratings: {
        Row: {
          created_at: string | null
          id: string
          project_id: string
          rating: number
          review: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id: string
          rating: number
          review?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string
          rating?: number
          review?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_ratings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      project_submissions: {
        Row: {
          activity_log: Json | null
          average_rating: number | null
          colab_url: string | null
          collaborators: Json | null
          created_at: string | null
          demo_url: string | null
          description: string | null
          domain: string | null
          file_attachments: Json | null
          github_url: string | null
          id: string
          is_public: boolean | null
          is_team_project: boolean | null
          rating_count: number | null
          status: string | null
          team_members: Json | null
          template_id: string | null
          thumbnail_url: string | null
          title: string
          tools_used: string[] | null
          updated_at: string | null
          upvotes: number | null
          user_id: string
        }
        Insert: {
          activity_log?: Json | null
          average_rating?: number | null
          colab_url?: string | null
          collaborators?: Json | null
          created_at?: string | null
          demo_url?: string | null
          description?: string | null
          domain?: string | null
          file_attachments?: Json | null
          github_url?: string | null
          id?: string
          is_public?: boolean | null
          is_team_project?: boolean | null
          rating_count?: number | null
          status?: string | null
          team_members?: Json | null
          template_id?: string | null
          thumbnail_url?: string | null
          title: string
          tools_used?: string[] | null
          updated_at?: string | null
          upvotes?: number | null
          user_id: string
        }
        Update: {
          activity_log?: Json | null
          average_rating?: number | null
          colab_url?: string | null
          collaborators?: Json | null
          created_at?: string | null
          demo_url?: string | null
          description?: string | null
          domain?: string | null
          file_attachments?: Json | null
          github_url?: string | null
          id?: string
          is_public?: boolean | null
          is_team_project?: boolean | null
          rating_count?: number | null
          status?: string | null
          team_members?: Json | null
          template_id?: string | null
          thumbnail_url?: string | null
          title?: string
          tools_used?: string[] | null
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_submissions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "project_templates"
            referencedColumns: ["id"]
          },
        ]
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
      rate_limit_tracking: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          ip_address: unknown | null
          request_count: number | null
          user_id: string | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          ip_address?: unknown | null
          request_count?: number | null
          user_id?: string | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          ip_address?: unknown | null
          request_count?: number | null
          user_id?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      recording_analytics: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          recording_id: string
          timestamp_seconds: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          recording_id: string
          timestamp_seconds?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          recording_id?: string
          timestamp_seconds?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recording_analytics_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "geova_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      recording_qa_interactions: {
        Row: {
          ai_responder: string | null
          ai_response: string | null
          created_at: string
          id: string
          interaction_type: string | null
          question: string
          recording_id: string
          resolved: boolean | null
          timestamp_seconds: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_responder?: string | null
          ai_response?: string | null
          created_at?: string
          id?: string
          interaction_type?: string | null
          question: string
          recording_id: string
          resolved?: boolean | null
          timestamp_seconds?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_responder?: string | null
          ai_response?: string | null
          created_at?: string
          id?: string
          interaction_type?: string | null
          question?: string
          recording_id?: string
          resolved?: boolean | null
          timestamp_seconds?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recording_qa_interactions_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "geova_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_usage: {
        Row: {
          created_at: string | null
          id: string
          referee_id: string
          referral_code: string
          referrer_id: string
          reward_granted: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          referee_id: string
          referral_code: string
          referrer_id: string
          reward_granted?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          referee_id?: string
          referral_code?: string
          referrer_id?: string
          reward_granted?: boolean | null
        }
        Relationships: []
      }
      regional_pricing: {
        Row: {
          country_code: string
          created_at: string | null
          currency_code: string
          exchange_rate: number
          id: string
          is_active: boolean | null
          tax_rate: number
          updated_at: string | null
        }
        Insert: {
          country_code: string
          created_at?: string | null
          currency_code: string
          exchange_rate?: number
          id?: string
          is_active?: boolean | null
          tax_rate?: number
          updated_at?: string | null
        }
        Update: {
          country_code?: string
          created_at?: string | null
          currency_code?: string
          exchange_rate?: number
          id?: string
          is_active?: boolean | null
          tax_rate?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      resume_follow_up_questions: {
        Row: {
          created_at: string
          id: string
          questions: Json
          responses: Json | null
          resume_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          questions?: Json
          responses?: Json | null
          resume_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          questions?: Json
          responses?: Json | null
          resume_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resume_generations: {
        Row: {
          created_at: string | null
          error_message: string | null
          file_size: number | null
          file_url: string | null
          format: string
          generation_status: string | null
          id: string
          portfolio_id: string | null
          template_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          file_size?: number | null
          file_url?: string | null
          format: string
          generation_status?: string | null
          id?: string
          portfolio_id?: string | null
          template_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          file_size?: number | null
          file_url?: string | null
          format?: string
          generation_status?: string | null
          id?: string
          portfolio_id?: string | null
          template_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_generations_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "user_portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      role_change_audit: {
        Row: {
          change_reason: string | null
          changed_by: string | null
          changed_by_email: string | null
          created_at: string
          id: string
          new_role: string
          old_role: string | null
          user_email: string
        }
        Insert: {
          change_reason?: string | null
          changed_by?: string | null
          changed_by_email?: string | null
          created_at?: string
          id?: string
          new_role: string
          old_role?: string | null
          user_email: string
        }
        Update: {
          change_reason?: string | null
          changed_by?: string | null
          changed_by_email?: string | null
          created_at?: string
          id?: string
          new_role?: string
          old_role?: string | null
          user_email?: string
        }
        Relationships: []
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
      saved_jobs: {
        Row: {
          id: string
          project_data: Json
          project_id: string
          saved_at: string
          user_id: string
        }
        Insert: {
          id?: string
          project_data: Json
          project_id: string
          saved_at?: string
          user_id: string
        }
        Update: {
          id?: string
          project_data?: Json
          project_id?: string
          saved_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scenario_simulations: {
        Row: {
          completed_at: string | null
          created_at: string | null
          description: string | null
          estimated_completion: string | null
          id: string
          input_datasets: Json | null
          name: string
          organization_id: string | null
          output_results: Json | null
          parameters: Json
          progress_percentage: number | null
          scenario_type: Database["public"]["Enums"]["scenario_type"]
          started_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          estimated_completion?: string | null
          id?: string
          input_datasets?: Json | null
          name: string
          organization_id?: string | null
          output_results?: Json | null
          parameters?: Json
          progress_percentage?: number | null
          scenario_type: Database["public"]["Enums"]["scenario_type"]
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          estimated_completion?: string | null
          id?: string
          input_datasets?: Json | null
          name?: string
          organization_id?: string | null
          output_results?: Json | null
          parameters?: Json
          progress_percentage?: number | null
          scenario_type?: Database["public"]["Enums"]["scenario_type"]
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scenario_simulations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_executions: {
        Row: {
          completed_at: string | null
          duration_seconds: number | null
          error_message: string | null
          execution_log: Json | null
          id: string
          output_location: string | null
          output_size_bytes: number | null
          schedule_id: string
          started_at: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          duration_seconds?: number | null
          error_message?: string | null
          execution_log?: Json | null
          id?: string
          output_location?: string | null
          output_size_bytes?: number | null
          schedule_id: string
          started_at?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          duration_seconds?: number | null
          error_message?: string | null
          execution_log?: Json | null
          id?: string
          output_location?: string | null
          output_size_bytes?: number | null
          schedule_id?: string
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_executions_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "workflow_schedules"
            referencedColumns: ["id"]
          },
        ]
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
      security_audit_log: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
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
      stream_analytics: {
        Row: {
          bitrate: number | null
          class_id: string
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          quality_metrics: Json | null
          viewer_count: number | null
        }
        Insert: {
          bitrate?: number | null
          class_id: string
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          quality_metrics?: Json | null
          viewer_count?: number | null
        }
        Update: {
          bitrate?: number | null
          class_id?: string
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          quality_metrics?: Json | null
          viewer_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stream_analytics_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "live_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      stream_controls: {
        Row: {
          action: string
          admin_user_id: string
          class_id: string
          created_at: string
          id: string
          reason: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          class_id: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          class_id?: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stream_controls_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "live_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      stream_keys: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          stream_key: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          stream_key: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          stream_key?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      stream_sessions: {
        Row: {
          created_at: string | null
          description: string | null
          ended_at: string | null
          hls_endpoint: string | null
          id: string
          recording_cloudfront_url: string | null
          recording_s3_key: string | null
          recording_url: string | null
          rtmp_endpoint: string | null
          started_at: string | null
          status: string | null
          stream_key_id: string | null
          title: string | null
          updated_at: string | null
          user_id: string
          viewer_analytics: Json | null
          viewer_count: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          hls_endpoint?: string | null
          id?: string
          recording_cloudfront_url?: string | null
          recording_s3_key?: string | null
          recording_url?: string | null
          rtmp_endpoint?: string | null
          started_at?: string | null
          status?: string | null
          stream_key_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
          viewer_analytics?: Json | null
          viewer_count?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          hls_endpoint?: string | null
          id?: string
          recording_cloudfront_url?: string | null
          recording_s3_key?: string | null
          recording_url?: string | null
          rtmp_endpoint?: string | null
          started_at?: string | null
          status?: string | null
          stream_key_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
          viewer_analytics?: Json | null
          viewer_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stream_sessions_stream_key_id_fkey"
            columns: ["stream_key_id"]
            isOneToOne: false
            referencedRelation: "stream_keys"
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
      student_recording_bookmarks: {
        Row: {
          bookmarked_at: string
          id: string
          notes: string | null
          recording_id: string
          user_id: string
        }
        Insert: {
          bookmarked_at?: string
          id?: string
          notes?: string | null
          recording_id: string
          user_id: string
        }
        Update: {
          bookmarked_at?: string
          id?: string
          notes?: string | null
          recording_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_recording_bookmarks_recording_id_fkey"
            columns: ["recording_id"]
            isOneToOne: false
            referencedRelation: "geova_recordings"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_content: {
        Row: {
          comments_count: number | null
          content_type: string
          created_at: string | null
          description: string | null
          duration: number | null
          embed_url: string | null
          file_size: number | null
          file_url: string | null
          goal: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          likes_count: number | null
          outcome: string | null
          region: string | null
          skill_domain: string | null
          status: string | null
          tags: Json | null
          thumbnail_url: string | null
          title: string
          tools_used: string[] | null
          updated_at: string | null
          user_id: string
          views_count: number | null
        }
        Insert: {
          comments_count?: number | null
          content_type?: string
          created_at?: string | null
          description?: string | null
          duration?: number | null
          embed_url?: string | null
          file_size?: number | null
          file_url?: string | null
          goal?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          likes_count?: number | null
          outcome?: string | null
          region?: string | null
          skill_domain?: string | null
          status?: string | null
          tags?: Json | null
          thumbnail_url?: string | null
          title: string
          tools_used?: string[] | null
          updated_at?: string | null
          user_id: string
          views_count?: number | null
        }
        Update: {
          comments_count?: number | null
          content_type?: string
          created_at?: string | null
          description?: string | null
          duration?: number | null
          embed_url?: string | null
          file_size?: number | null
          file_url?: string | null
          goal?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          likes_count?: number | null
          outcome?: string | null
          region?: string | null
          skill_domain?: string | null
          status?: string | null
          tags?: Json | null
          thumbnail_url?: string | null
          title?: string
          tools_used?: string[] | null
          updated_at?: string | null
          user_id?: string
          views_count?: number | null
        }
        Relationships: []
      }
      studio_content_comments: {
        Row: {
          comment: string
          content_id: string
          created_at: string | null
          id: string
          is_deleted: boolean | null
          parent_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment: string
          content_id: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          parent_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string
          content_id?: string
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          parent_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_content_comments_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "studio_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "studio_content_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "studio_content_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_content_interactions: {
        Row: {
          content_id: string
          created_at: string | null
          id: string
          interaction_type: string
          user_id: string
        }
        Insert: {
          content_id: string
          created_at?: string | null
          id?: string
          interaction_type: string
          user_id: string
        }
        Update: {
          content_id?: string
          created_at?: string | null
          id?: string
          interaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_content_interactions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "studio_content"
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
      template_collection_items: {
        Row: {
          added_at: string | null
          collection_id: string | null
          id: string
          order_index: number | null
          template_id: string | null
        }
        Insert: {
          added_at?: string | null
          collection_id?: string | null
          id?: string
          order_index?: number | null
          template_id?: string | null
        }
        Update: {
          added_at?: string | null
          collection_id?: string | null
          id?: string
          order_index?: number | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "template_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "template_collection_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "enhanced_project_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      template_collections: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          curator_id: string | null
          description: string | null
          id: string
          is_featured: boolean | null
          is_public: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          curator_id?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          curator_id?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      template_downloads: {
        Row: {
          download_type: string | null
          downloaded_at: string | null
          id: string
          ip_address: unknown | null
          template_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          download_type?: string | null
          downloaded_at?: string | null
          id?: string
          ip_address?: unknown | null
          template_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          download_type?: string | null
          downloaded_at?: string | null
          id?: string
          ip_address?: unknown | null
          template_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_downloads_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "enhanced_project_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      template_ratings: {
        Row: {
          created_at: string | null
          helpful_count: number | null
          id: string
          rating: number | null
          review: string | null
          template_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          rating?: number | null
          review?: string | null
          template_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          rating?: number | null
          review?: string | null
          template_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_ratings_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "enhanced_project_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      template_usage_analytics: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          session_id: string | null
          template_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          template_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          template_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_usage_analytics_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "enhanced_project_templates"
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
      tool_downloads: {
        Row: {
          downloaded_at: string | null
          id: string
          ip_address: unknown | null
          order_id: string | null
          tool_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          downloaded_at?: string | null
          id?: string
          ip_address?: unknown | null
          order_id?: string | null
          tool_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          downloaded_at?: string | null
          id?: string
          ip_address?: unknown | null
          order_id?: string | null
          tool_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tool_downloads_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "tool_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_downloads_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "marketplace_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_orders: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          download_count: number | null
          expires_at: string | null
          id: string
          max_downloads: number | null
          metadata: Json | null
          payment_method: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          status: string
          tool_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          download_count?: number | null
          expires_at?: string | null
          id?: string
          max_downloads?: number | null
          metadata?: Json | null
          payment_method?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: string
          tool_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          download_count?: number | null
          expires_at?: string | null
          id?: string
          max_downloads?: number | null
          metadata?: Json | null
          payment_method?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: string
          tool_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tool_orders_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "marketplace_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_purchases: {
        Row: {
          currency_code: string
          download_attempts: number | null
          expires_at: string | null
          id: string
          invoice_url: string | null
          max_downloads: number | null
          metadata: Json | null
          payment_method: string | null
          purchase_price: number
          purchased_at: string | null
          status: string | null
          tool_id: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          currency_code: string
          download_attempts?: number | null
          expires_at?: string | null
          id?: string
          invoice_url?: string | null
          max_downloads?: number | null
          metadata?: Json | null
          payment_method?: string | null
          purchase_price: number
          purchased_at?: string | null
          status?: string | null
          tool_id: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          currency_code?: string
          download_attempts?: number | null
          expires_at?: string | null
          id?: string
          invoice_url?: string | null
          max_downloads?: number | null
          metadata?: Json | null
          payment_method?: string | null
          purchase_price?: number
          purchased_at?: string | null
          status?: string | null
          tool_id?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_purchases_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "marketplace_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_reviews: {
        Row: {
          created_at: string | null
          id: string
          is_verified_purchase: boolean | null
          rating: number
          review_text: string | null
          tool_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_verified_purchase?: boolean | null
          rating: number
          review_text?: string | null
          tool_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_verified_purchase?: boolean | null
          rating?: number
          review_text?: string | null
          tool_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_reviews_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "marketplace_tools"
            referencedColumns: ["id"]
          },
        ]
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
      toolkit_recommendations: {
        Row: {
          created_at: string
          id: string
          recommendation_data: Json
          region: string | null
          requirement: string
          skill_level: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          recommendation_data?: Json
          region?: string | null
          requirement: string
          skill_level?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          recommendation_data?: Json
          region?: string | null
          requirement?: string
          skill_level?: string
          updated_at?: string
          user_id?: string
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
      trending_news: {
        Row: {
          category: string | null
          created_at: string | null
          fetched_at: string | null
          id: string
          image_url: string | null
          published_date: string
          relevance_score: number | null
          source: string
          summary: string
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          fetched_at?: string | null
          id?: string
          image_url?: string | null
          published_date: string
          relevance_score?: number | null
          source: string
          summary: string
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          fetched_at?: string | null
          id?: string
          image_url?: string | null
          published_date?: string
          relevance_score?: number | null
          source?: string
          summary?: string
          title?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      trending_topics: {
        Row: {
          category: string
          count: number | null
          created_at: string | null
          date_recorded: string | null
          id: string
          topic: string
          trend_direction: string | null
        }
        Insert: {
          category: string
          count?: number | null
          created_at?: string | null
          date_recorded?: string | null
          id?: string
          topic: string
          trend_direction?: string | null
        }
        Update: {
          category?: string
          count?: number | null
          created_at?: string | null
          date_recorded?: string | null
          id?: string
          topic?: string
          trend_direction?: string | null
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
          is_certification: boolean | null
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
          is_certification?: boolean | null
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
          is_certification?: boolean | null
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
      user_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          points_earned: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          points_earned?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          points_earned?: number
          updated_at?: string | null
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
      user_badges: {
        Row: {
          badge_description: string | null
          badge_icon: string | null
          badge_name: string
          badge_type: string
          earned_at: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          user_id: string
        }
        Insert: {
          badge_description?: string | null
          badge_icon?: string | null
          badge_name: string
          badge_type: string
          earned_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          user_id: string
        }
        Update: {
          badge_description?: string | null
          badge_icon?: string | null
          badge_name?: string
          badge_type?: string
          earned_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
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
      user_credits: {
        Row: {
          balance: number
          created_at: string | null
          earned_total: number | null
          id: string
          last_transaction_at: string | null
          spent_total: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string | null
          earned_total?: number | null
          id?: string
          last_transaction_at?: string | null
          spent_total?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string | null
          earned_total?: number | null
          id?: string
          last_transaction_at?: string | null
          spent_total?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_downloads: {
        Row: {
          download_type: string
          download_url: string | null
          downloaded_at: string | null
          file_hash: string | null
          id: string
          ip_address: unknown | null
          tool_id: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          download_type: string
          download_url?: string | null
          downloaded_at?: string | null
          file_hash?: string | null
          id?: string
          ip_address?: unknown | null
          tool_id: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          download_type?: string
          download_url?: string | null
          downloaded_at?: string | null
          file_hash?: string | null
          id?: string
          ip_address?: unknown | null
          tool_id?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_downloads_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "marketplace_tools"
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
      user_leaderboard_stats: {
        Row: {
          badges: Json | null
          challenge_participations: number | null
          code_shares: number | null
          comments: number | null
          courses_completed: number | null
          created_at: string | null
          featured_week: string | null
          id: string
          likes_given: number | null
          monthly_points: number | null
          note_shares: number | null
          post_creations: number | null
          tool_uploads: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string
          weekly_points: number | null
        }
        Insert: {
          badges?: Json | null
          challenge_participations?: number | null
          code_shares?: number | null
          comments?: number | null
          courses_completed?: number | null
          created_at?: string | null
          featured_week?: string | null
          id?: string
          likes_given?: number | null
          monthly_points?: number | null
          note_shares?: number | null
          post_creations?: number | null
          tool_uploads?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
          weekly_points?: number | null
        }
        Update: {
          badges?: Json | null
          challenge_participations?: number | null
          code_shares?: number | null
          comments?: number | null
          courses_completed?: number | null
          created_at?: string | null
          featured_week?: string | null
          id?: string
          likes_given?: number | null
          monthly_points?: number | null
          note_shares?: number | null
          post_creations?: number | null
          tool_uploads?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
          weekly_points?: number | null
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
      user_location: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          detected_at: string | null
          id: string
          ip_address: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          detected_at?: string | null
          id?: string
          ip_address?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          detected_at?: string | null
          id?: string
          ip_address?: string | null
          updated_at?: string | null
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
      user_pack_installations: {
        Row: {
          id: string
          installed_at: string | null
          pack_id: string
          status: string | null
          user_id: string
        }
        Insert: {
          id?: string
          installed_at?: string | null
          pack_id: string
          status?: string | null
          user_id: string
        }
        Update: {
          id?: string
          installed_at?: string | null
          pack_id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_pack_installations_pack_id_fkey"
            columns: ["pack_id"]
            isOneToOne: false
            referencedRelation: "industry_intelligence_packs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_portfolios: {
        Row: {
          created_at: string | null
          description: string | null
          download_count: number | null
          id: string
          is_public: boolean | null
          last_exported_at: string | null
          layout_config: Json | null
          public_url: string | null
          template_id: string | null
          theme_config: Json | null
          title: string
          updated_at: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          id?: string
          is_public?: boolean | null
          last_exported_at?: string | null
          layout_config?: Json | null
          public_url?: string | null
          template_id?: string | null
          theme_config?: Json | null
          title?: string
          updated_at?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          id?: string
          is_public?: boolean | null
          last_exported_at?: string | null
          layout_config?: Json | null
          public_url?: string | null
          template_id?: string | null
          theme_config?: Json | null
          title?: string
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
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
          extracted_data: Json | null
          extraction_status: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          file_url: string | null
          id: string
          match_scores: Json | null
          processed_at: string | null
          updated_at: string | null
          uploaded_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          extracted_data?: Json | null
          extraction_status?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          file_url?: string | null
          id?: string
          match_scores?: Json | null
          processed_at?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          extracted_data?: Json | null
          extraction_status?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          file_url?: string | null
          id?: string
          match_scores?: Json | null
          processed_at?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
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
          plan_locked: boolean
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
          plan_locked?: boolean
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
          plan_locked?: boolean
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
      visualization_dashboards: {
        Row: {
          configuration: Json
          created_at: string
          dashboard_type: string
          data_sources: Json
          description: string | null
          id: string
          is_public: boolean
          name: string
          shared_url: string | null
          updated_at: string
          user_id: string
          view_count: number
        }
        Insert: {
          configuration?: Json
          created_at?: string
          dashboard_type: string
          data_sources?: Json
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          shared_url?: string | null
          updated_at?: string
          user_id: string
          view_count?: number
        }
        Update: {
          configuration?: Json
          created_at?: string
          dashboard_type?: string
          data_sources?: Json
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          shared_url?: string | null
          updated_at?: string
          user_id?: string
          view_count?: number
        }
        Relationships: []
      }
      webgis_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          position: Json | null
          project_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          position?: Json | null
          project_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          position?: Json | null
          project_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webgis_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "webgis_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      webgis_layers: {
        Row: {
          created_at: string | null
          id: string
          is_visible: boolean | null
          layer_order: number | null
          name: string
          project_id: string
          source_data: Json | null
          source_url: string | null
          style_config: Json | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          layer_order?: number | null
          name: string
          project_id: string
          source_data?: Json | null
          source_url?: string | null
          style_config?: Json | null
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          layer_order?: number | null
          name?: string
          project_id?: string
          source_data?: Json | null
          source_url?: string | null
          style_config?: Json | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webgis_layers_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "webgis_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      webgis_projects: {
        Row: {
          config: Json
          created_at: string | null
          description: string | null
          embed_code: string | null
          id: string
          is_public: boolean | null
          is_template: boolean | null
          published_at: string | null
          published_url: string | null
          template_category: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          config?: Json
          created_at?: string | null
          description?: string | null
          embed_code?: string | null
          id?: string
          is_public?: boolean | null
          is_template?: boolean | null
          published_at?: string | null
          published_url?: string | null
          template_category?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          description?: string | null
          embed_code?: string | null
          id?: string
          is_public?: boolean | null
          is_template?: boolean | null
          published_at?: string | null
          published_url?: string | null
          template_category?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      webgis_shared_projects: {
        Row: {
          created_at: string | null
          id: string
          permission_level: string
          project_id: string
          shared_by: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_level?: string
          project_id: string
          shared_by: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_level?: string
          project_id?: string
          shared_by?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webgis_shared_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "webgis_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      webgis_widgets: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          is_visible: boolean | null
          position: string
          project_id: string
          title: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          position: string
          project_id: string
          title?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          position?: string
          project_id?: string
          title?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webgis_widgets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "webgis_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_endpoints: {
        Row: {
          created_at: string
          delivery_count: number
          events: string[]
          id: string
          is_active: boolean
          last_delivery: string | null
          secret: string
          status: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_count?: number
          events?: string[]
          id?: string
          is_active?: boolean
          last_delivery?: string | null
          secret: string
          status?: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_count?: number
          events?: string[]
          id?: string
          is_active?: boolean
          last_delivery?: string | null
          secret?: string
          status?: string
          updated_at?: string
          url?: string
          user_id?: string
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
      workflow_schedules: {
        Row: {
          created_at: string | null
          description: string | null
          estimated_duration: number | null
          id: string
          last_run_at: string | null
          name: string
          next_run_at: string | null
          notifications_enabled: boolean | null
          organization_id: string | null
          output_destination: string | null
          priority: string | null
          schedule_expression: string
          schedule_type: string | null
          status: string | null
          success_rate: number | null
          total_runs: number | null
          updated_at: string | null
          user_id: string
          workflow_config: Json | null
          workflow_type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          estimated_duration?: number | null
          id?: string
          last_run_at?: string | null
          name: string
          next_run_at?: string | null
          notifications_enabled?: boolean | null
          organization_id?: string | null
          output_destination?: string | null
          priority?: string | null
          schedule_expression: string
          schedule_type?: string | null
          status?: string | null
          success_rate?: number | null
          total_runs?: number | null
          updated_at?: string | null
          user_id: string
          workflow_config?: Json | null
          workflow_type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          estimated_duration?: number | null
          id?: string
          last_run_at?: string | null
          name?: string
          next_run_at?: string | null
          notifications_enabled?: boolean | null
          organization_id?: string | null
          output_destination?: string | null
          priority?: string | null
          schedule_expression?: string
          schedule_type?: string | null
          status?: string | null
          success_rate?: number | null
          total_runs?: number | null
          updated_at?: string | null
          user_id?: string
          workflow_config?: Json | null
          workflow_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_schedules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_api_logs: {
        Row: {
          api_endpoint: string
          consecutive_failures: number | null
          created_at: string | null
          error_message: string | null
          id: string
          method: string
          response_data: Json | null
          status_code: number | null
        }
        Insert: {
          api_endpoint: string
          consecutive_failures?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          method: string
          response_data?: Json | null
          status_code?: number | null
        }
        Update: {
          api_endpoint?: string
          consecutive_failures?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          method?: string
          response_data?: Json | null
          status_code?: number | null
        }
        Relationships: []
      }
      youtube_api_operations: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          operation_type: string
          schedule_id: string | null
          success: boolean
          youtube_response: Json | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          operation_type: string
          schedule_id?: string | null
          success: boolean
          youtube_response?: Json | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          operation_type?: string
          schedule_id?: string | null
          success?: boolean
          youtube_response?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "youtube_api_operations_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "youtube_live_schedule"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_live_schedule: {
        Row: {
          actual_end_time: string | null
          actual_start_time: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          obs_auto_start: boolean | null
          obs_configured: boolean | null
          obs_scene_name: string | null
          privacy_status: string
          recording_available: boolean | null
          recording_url: string | null
          recording_youtube_id: string | null
          scheduled_end_time: string | null
          scheduled_start_time: string
          status: string
          stream_key: string | null
          stream_url: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          youtube_broadcast_id: string | null
          youtube_stream_id: string | null
        }
        Insert: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          obs_auto_start?: boolean | null
          obs_configured?: boolean | null
          obs_scene_name?: string | null
          privacy_status?: string
          recording_available?: boolean | null
          recording_url?: string | null
          recording_youtube_id?: string | null
          scheduled_end_time?: string | null
          scheduled_start_time: string
          status?: string
          stream_key?: string | null
          stream_url?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          youtube_broadcast_id?: string | null
          youtube_stream_id?: string | null
        }
        Update: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          obs_auto_start?: boolean | null
          obs_configured?: boolean | null
          obs_scene_name?: string | null
          privacy_status?: string
          recording_available?: boolean | null
          recording_url?: string | null
          recording_youtube_id?: string | null
          scheduled_end_time?: string | null
          scheduled_start_time?: string
          status?: string
          stream_key?: string | null
          stream_url?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          youtube_broadcast_id?: string | null
          youtube_stream_id?: string | null
        }
        Relationships: []
      }
      youtube_oauth_tokens: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string | null
          id: string
          refresh_token: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          refresh_token?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          refresh_token?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      youtube_recordings: {
        Row: {
          access_tier: string | null
          created_at: string | null
          description: string | null
          download_count: number | null
          duration_seconds: number | null
          embed_url: string | null
          id: string
          recorded_at: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          view_count: number | null
          youtube_broadcast_id: string | null
          youtube_url: string | null
        }
        Insert: {
          access_tier?: string | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          duration_seconds?: number | null
          embed_url?: string | null
          id?: string
          recorded_at?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          view_count?: number | null
          youtube_broadcast_id?: string | null
          youtube_url?: string | null
        }
        Update: {
          access_tier?: string | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          duration_seconds?: number | null
          embed_url?: string | null
          id?: string
          recorded_at?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
          youtube_broadcast_id?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      youtube_sessions: {
        Row: {
          access_tier: string
          created_at: string
          created_by: string | null
          description: string | null
          ended_at: string | null
          id: string
          is_active: boolean
          order_index: number | null
          scheduled_date: string | null
          session_type: string
          started_at: string | null
          status: string
          title: string
          updated_at: string
          youtube_embed_url: string
        }
        Insert: {
          access_tier?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          is_active?: boolean
          order_index?: number | null
          scheduled_date?: string | null
          session_type: string
          started_at?: string | null
          status?: string
          title: string
          updated_at?: string
          youtube_embed_url: string
        }
        Update: {
          access_tier?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          is_active?: boolean
          order_index?: number | null
          scheduled_date?: string | null
          session_type?: string
          started_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          youtube_embed_url?: string
        }
        Relationships: []
      }
      youtube_stream_config: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          is_active: boolean | null
          stream_name: string
          updated_at: string | null
          youtube_stream_key: string
          youtube_stream_url: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          is_active?: boolean | null
          stream_name: string
          updated_at?: string | null
          youtube_stream_key: string
          youtube_stream_url: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          is_active?: boolean | null
          stream_name?: string
          updated_at?: string | null
          youtube_stream_key?: string
          youtube_stream_url?: string
        }
        Relationships: []
      }
      youtube_stream_schedule: {
        Row: {
          course_schedule_id: string | null
          created_at: string | null
          day_of_week: string
          id: string
          scheduled_datetime: string
          status: string | null
          stream_description: string | null
          stream_title: string
          updated_at: string | null
          week_starting: string
          youtube_broadcast_id: string | null
          youtube_stream_key: string | null
        }
        Insert: {
          course_schedule_id?: string | null
          created_at?: string | null
          day_of_week: string
          id?: string
          scheduled_datetime: string
          status?: string | null
          stream_description?: string | null
          stream_title: string
          updated_at?: string | null
          week_starting: string
          youtube_broadcast_id?: string | null
          youtube_stream_key?: string | null
        }
        Update: {
          course_schedule_id?: string | null
          created_at?: string | null
          day_of_week?: string
          id?: string
          scheduled_datetime?: string
          status?: string | null
          stream_description?: string | null
          stream_title?: string
          updated_at?: string | null
          week_starting?: string
          youtube_broadcast_id?: string | null
          youtube_stream_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "youtube_stream_schedule_course_schedule_id_fkey"
            columns: ["course_schedule_id"]
            isOneToOne: false
            referencedRelation: "course_schedule"
            referencedColumns: ["id"]
          },
        ]
      }
      zoom_meeting_participants: {
        Row: {
          duration_minutes: number | null
          id: string
          joined_at: string | null
          left_at: string | null
          meeting_id: string
          registered_at: string
          user_id: string
        }
        Insert: {
          duration_minutes?: number | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          meeting_id: string
          registered_at?: string
          user_id: string
        }
        Update: {
          duration_minutes?: number | null
          id?: string
          joined_at?: string | null
          left_at?: string | null
          meeting_id?: string
          registered_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "zoom_meeting_participants_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "zoom_meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      zoom_meetings: {
        Row: {
          access_tier: string
          created_at: string
          description: string | null
          duration: number
          host_user_id: string
          id: string
          join_url: string
          meeting_type: string
          password: string | null
          recording_enabled: boolean | null
          start_time: string
          start_url: string
          status: string
          topic: string
          updated_at: string
          waiting_room: boolean | null
          zoom_meeting_id: string
        }
        Insert: {
          access_tier?: string
          created_at?: string
          description?: string | null
          duration?: number
          host_user_id: string
          id?: string
          join_url: string
          meeting_type?: string
          password?: string | null
          recording_enabled?: boolean | null
          start_time: string
          start_url: string
          status?: string
          topic: string
          updated_at?: string
          waiting_room?: boolean | null
          zoom_meeting_id: string
        }
        Update: {
          access_tier?: string
          created_at?: string
          description?: string | null
          duration?: number
          host_user_id?: string
          id?: string
          join_url?: string
          meeting_type?: string
          password?: string | null
          recording_enabled?: boolean | null
          start_time?: string
          start_url?: string
          status?: string
          topic?: string
          updated_at?: string
          waiting_room?: boolean | null
          zoom_meeting_id?: string
        }
        Relationships: []
      }
      zoom_recordings: {
        Row: {
          created_at: string
          download_url: string
          file_size: number | null
          file_type: string
          id: string
          meeting_id: string
          play_url: string | null
          recording_end: string | null
          recording_start: string | null
          recording_type: string
          zoom_recording_id: string
        }
        Insert: {
          created_at?: string
          download_url: string
          file_size?: number | null
          file_type?: string
          id?: string
          meeting_id: string
          play_url?: string | null
          recording_end?: string | null
          recording_start?: string | null
          recording_type?: string
          zoom_recording_id: string
        }
        Update: {
          created_at?: string
          download_url?: string
          file_size?: number | null
          file_type?: string
          id?: string
          meeting_id?: string
          play_url?: string | null
          recording_end?: string | null
          recording_start?: string | null
          recording_type?: string
          zoom_recording_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "zoom_recordings_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "zoom_meetings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auto_enroll_professional_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      bulk_assign_professional_access: {
        Args: { email_list: string[] }
        Returns: Json
      }
      bulk_assign_professional_and_enroll: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      bulk_assign_professional_and_enroll_updated: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      can_download_premium_plugin: {
        Args: { p_tool_id: string; p_user_id: string }
        Returns: boolean
      }
      change_user_role_with_notification: {
        Args: {
          change_reason?: string
          new_role_name: string
          target_email: string
        }
        Returns: Json
      }
      check_admin_rate_limit: {
        Args: { p_action: string }
        Returns: boolean
      }
      check_geo_processing_limits: {
        Args: { p_job_type: string; p_user_id: string }
        Returns: Json
      }
      check_gis_marketplace_access: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          p_action: string
          p_identifier: string
          p_max_requests?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      check_rate_limit_secure: {
        Args: {
          action_type: string
          identifier: string
          max_attempts?: number
          window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_old_trending_news: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_daily_live_class: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      create_geova_daily_class: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      create_geova_daily_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_organization: {
        Args: { p_description?: string; p_name: string; p_slug: string }
        Returns: string
      }
      create_user_subscription: {
        Args: { p_tier?: string; p_user_id: string }
        Returns: undefined
      }
      create_weekly_youtube_streams: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      debug_storage_path: {
        Args: { file_path: string; user_id: string }
        Returns: Json
      }
      decrement_viewer_count: {
        Args: { stream_id: string }
        Returns: undefined
      }
      ensure_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_ai_alert: {
        Args: {
          p_alert_type: Database["public"]["Enums"]["alert_type"]
          p_confidence_score?: number
          p_description: string
          p_metadata?: Json
          p_org_id: string
          p_severity: Database["public"]["Enums"]["alert_severity"]
          p_title: string
          p_user_id: string
        }
        Returns: string
      }
      generate_live_stream_key: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_portfolio_url: {
        Args: { p_portfolio_title: string; p_user_id: string }
        Returns: string
      }
      generate_referral_code: {
        Args: { user_id: string }
        Returns: string
      }
      generate_session_stream_key: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_stream_key: {
        Args: { p_user_id: string }
        Returns: string
      }
      generate_unique_stream_key: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_unsubscribe_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_auth_users_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email: string
          id: string
          last_sign_in_at: string
        }[]
      }
      get_email_template: {
        Args: { template_name: string }
        Returns: Json
      }
      get_ga_tracking_id: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_next_geova_class_time: {
        Args: Record<PropertyKey, never>
        Returns: {
          minutes_until_next: number
          next_class_date: string
          next_class_time: string
          next_class_topic: string
        }[]
      }
      get_regional_price: {
        Args: { p_base_price_usd: number; p_country_code?: string }
        Returns: {
          currency_code: string
          local_price: number
          tax_rate: number
        }[]
      }
      get_secure_embed_url: {
        Args: { p_youtube_url: string }
        Returns: string
      }
      get_super_admin_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_top_missing_queries: {
        Args: { p_limit?: number; p_status?: string }
        Returns: {
          created_at: string
          days_old: number
          id: string
          query: string
          status: string
          times_requested: number
          updated_at: string
        }[]
      }
      get_user_credits: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_user_enrollment_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_user_profile_for_stream: {
        Args: { p_user_id: string }
        Returns: {
          email: string
          full_name: string
        }[]
      }
      get_user_recommendations: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          content_id: string
          content_type: string
          reason: string
          score: number
        }[]
      }
      get_user_roles_bypass_rls: {
        Args: { p_user_id: string }
        Returns: {
          granted_at: string
          granted_by: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }[]
      }
      get_user_roles_safe: {
        Args: { p_user_id: string }
        Returns: {
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      get_user_stats_safe: {
        Args: { p_user_id: string }
        Returns: {
          community_posts: number
          course_count: number
          enrolled_courses_count: number
          plan: string
          projects_completed: number
          spatial_analyses: number
          subscription_tier: string
          user_id: string
        }[]
      }
      get_user_subscription_safe: {
        Args: { p_user_id: string }
        Returns: {
          created_at: string
          expires_at: string
          id: string
          payment_method: string
          started_at: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          subscription_tier: string
          updated_at: string
          user_id: string
        }[]
      }
      get_youtube_automation_status: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_youtube_credentials: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      has_org_permission: {
        Args: {
          p_org_id: string
          p_required_role: Database["public"]["Enums"]["org_role"]
          p_user_id: string
        }
        Returns: boolean
      }
      has_role_bypass_rls: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: boolean
      }
      increment_download_count: {
        Args: { template_id: string }
        Returns: undefined
      }
      increment_template_download_count: {
        Args: { template_id: string }
        Returns: undefined
      }
      increment_viewer_count: {
        Args: { stream_id: string }
        Returns: undefined
      }
      invalidate_previous_sessions: {
        Args: { p_new_session_token: string; p_user_id: string }
        Returns: undefined
      }
      is_admin_secure: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_platform_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_professional_email: {
        Args: { email_input: string }
        Returns: boolean
      }
      is_session_valid: {
        Args: { p_session_token: string; p_user_id: string }
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
      is_super_admin_secure: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_valid_email_domain: {
        Args: { email_input: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          p_action: string
          p_new_value?: Json
          p_old_value?: Json
          p_target_user_id: string
        }
        Returns: undefined
      }
      log_admin_action_secure: {
        Args: {
          p_action: string
          p_new_value?: Json
          p_old_value?: Json
          p_target_user_id: string
        }
        Returns: undefined
      }
      log_admin_error: {
        Args: {
          p_context_data?: Json
          p_error_message: string
          p_error_type: string
        }
        Returns: string
      }
      log_audit_event: {
        Args: {
          event_type: string
          new_values?: Json
          old_values?: Json
          record_id: string
          table_name: string
        }
        Returns: undefined
      }
      log_project_activity: {
        Args: {
          p_activity_data?: Json
          p_activity_type: string
          p_description: string
          p_project_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      log_security_event_secure: {
        Args: { p_details?: Json; p_event_type: string; p_user_id?: string }
        Returns: undefined
      }
      log_youtube_api_error: {
        Args: {
          p_endpoint: string
          p_error_message: string
          p_method: string
          p_response_data?: Json
          p_status_code: number
        }
        Returns: undefined
      }
      mark_youtube_token_expired: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      move_live_to_recording: {
        Args: { p_session_id: string }
        Returns: undefined
      }
      refresh_youtube_oauth_token: {
        Args: { token_id: string }
        Returns: boolean
      }
      refresh_youtube_oauth_token_if_needed: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      reset_monthly_points: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reset_weekly_points: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      should_get_auto_pro_access: {
        Args: { email_input: string }
        Returns: boolean
      }
      start_aws_stream: {
        Args: { p_admin_user_id: string; p_class_id: string }
        Returns: Json
      }
      start_stream_session: {
        Args: { p_description?: string; p_title?: string; p_user_id: string }
        Returns: string
      }
      stop_aws_stream: {
        Args: {
          p_admin_user_id: string
          p_class_id: string
          p_recording_s3_key?: string
        }
        Returns: Json
      }
      sync_geova_recordings_from_schedule: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      track_class_attendance: {
        Args: { p_action: string; p_class_id: string; p_user_id: string }
        Returns: undefined
      }
      track_missing_search_query: {
        Args: { p_filters?: Json; p_query: string; p_user_id: string }
        Returns: string
      }
      track_portfolio_view: {
        Args: {
          p_portfolio_id: string
          p_user_agent?: string
          p_visitor_ip?: string
        }
        Returns: undefined
      }
      track_recording_view: {
        Args: {
          p_event_type: string
          p_recording_id: string
          p_timestamp_seconds?: number
          p_user_id: string
        }
        Returns: undefined
      }
      track_user_activity: {
        Args: { p_activity_type: string; p_metadata?: Json; p_user_id: string }
        Returns: undefined
      }
      track_user_interaction: {
        Args: {
          p_content_id: string
          p_content_type: string
          p_interaction_type: string
          p_metadata?: Json
          p_user_id: string
        }
        Returns: undefined
      }
      trigger_youtube_detection: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      update_class_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_geova_student_progress: {
        Args: { p_day_number: number; p_user_id: string }
        Returns: undefined
      }
      update_session_order: {
        Args: { p_new_order: number; p_session_id: string }
        Returns: undefined
      }
      update_stream_status: {
        Args: {
          p_session_id: string
          p_status: string
          p_viewer_count?: number
        }
        Returns: boolean
      }
      update_user_credits: {
        Args: {
          p_amount: number
          p_description: string
          p_reference_id?: string
          p_transaction_type: string
          p_user_id: string
        }
        Returns: boolean
      }
      update_user_enrolled_courses: {
        Args: { p_course_title: string; p_user_id: string }
        Returns: undefined
      }
      update_user_stats: {
        Args: { p_increment?: number; p_stat_type: string; p_user_id: string }
        Returns: undefined
      }
      user_has_live_class_access: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      user_has_premium_access: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      validate_and_sanitize_input: {
        Args: { allow_html?: boolean; input_text: string; max_length?: number }
        Returns: string
      }
      validate_password: {
        Args: { password_input: string }
        Returns: Json
      }
    }
    Enums: {
      alert_severity: "low" | "medium" | "high" | "critical"
      alert_type:
        | "anomaly_detection"
        | "threshold_breach"
        | "predictive_warning"
        | "data_quality_issue"
        | "system_notification"
      app_role: "admin" | "moderator" | "beta_tester" | "user" | "super_admin"
      gis_tool:
        | "qgis"
        | "arcgis"
        | "python"
        | "r"
        | "google_earth_engine"
        | "postgis"
        | "sql"
        | "javascript"
        | "leaflet"
        | "openlayers"
        | "mapbox"
        | "grass_gis"
        | "gdal"
        | "fme"
        | "autocad_map"
        | "microstation"
        | "erdas_imagine"
        | "envi"
        | "snap"
        | "matlab"
      org_role: "owner" | "admin" | "analyst" | "viewer"
      project_sector:
        | "agriculture"
        | "urban_planning"
        | "infrastructure"
        | "risk_mapping"
        | "forestry"
        | "water_resources"
        | "climate"
        | "remote_sensing"
        | "health"
        | "real_estate"
        | "mining"
        | "transportation"
        | "environmental"
        | "disaster_management"
        | "archaeology"
        | "marine"
        | "energy"
      scenario_type:
        | "urban_growth"
        | "climate_projection"
        | "flood_simulation"
        | "drought_prediction"
        | "vegetation_change"
      skill_level: "beginner" | "intermediate" | "advanced" | "expert"
      stream_status: "live" | "ended" | "scheduled" | "error"
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
      alert_severity: ["low", "medium", "high", "critical"],
      alert_type: [
        "anomaly_detection",
        "threshold_breach",
        "predictive_warning",
        "data_quality_issue",
        "system_notification",
      ],
      app_role: ["admin", "moderator", "beta_tester", "user", "super_admin"],
      gis_tool: [
        "qgis",
        "arcgis",
        "python",
        "r",
        "google_earth_engine",
        "postgis",
        "sql",
        "javascript",
        "leaflet",
        "openlayers",
        "mapbox",
        "grass_gis",
        "gdal",
        "fme",
        "autocad_map",
        "microstation",
        "erdas_imagine",
        "envi",
        "snap",
        "matlab",
      ],
      org_role: ["owner", "admin", "analyst", "viewer"],
      project_sector: [
        "agriculture",
        "urban_planning",
        "infrastructure",
        "risk_mapping",
        "forestry",
        "water_resources",
        "climate",
        "remote_sensing",
        "health",
        "real_estate",
        "mining",
        "transportation",
        "environmental",
        "disaster_management",
        "archaeology",
        "marine",
        "energy",
      ],
      scenario_type: [
        "urban_growth",
        "climate_projection",
        "flood_simulation",
        "drought_prediction",
        "vegetation_change",
      ],
      skill_level: ["beginner", "intermediate", "advanced", "expert"],
      stream_status: ["live", "ended", "scheduled", "error"],
    },
  },
} as const
