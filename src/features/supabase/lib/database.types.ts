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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      achievement_definitions: {
        Row: {
          created_at: string
          criteria: Json
          description: string
          icon: string
          id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          criteria?: Json
          description: string
          icon?: string
          id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          criteria?: Json
          description?: string
          icon?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_activity_logs: {
        Row: {
          action: string
          actor_id: string | null
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
          occurred_at: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          entity_id?: string | null
          entity_type: string
          id: string
          metadata?: Json
          occurred_at?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
          occurred_at?: string
        }
        Relationships: []
      }
      admin_alerts: {
        Row: {
          body: string
          created_at: string
          id: string
          severity: string
          status: string
          title: string
        }
        Insert: {
          body: string
          created_at?: string
          id: string
          severity: string
          status: string
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          severity?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      admin_roles: {
        Row: {
          granted_at: string
          granted_by: string | null
          role: string
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          role: string
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          course_id: string | null
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_prompts: {
        Row: {
          created_at: string
          id: string
          name: string
          prompt_body: string
          provider: string
          purpose: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          prompt_body: string
          provider: string
          purpose: string
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          prompt_body?: string
          provider?: string
          purpose?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_rate_limits: {
        Row: {
          feature: string
          request_count: number
          user_id: string
          window_started_at: string
        }
        Insert: {
          feature: string
          request_count?: number
          user_id: string
          window_started_at?: string
        }
        Update: {
          feature?: string
          request_count?: number
          user_id?: string
          window_started_at?: string
        }
        Relationships: []
      }
      ai_usage: {
        Row: {
          feature: string
          period_start: string
          request_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          feature: string
          period_start: string
          request_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          feature?: string
          period_start?: string
          request_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_writing_submissions: {
        Row: {
          course_id: string | null
          created_at: string
          id: string
          input_text: string
          prompt_id: string | null
          result: Json
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          id?: string
          input_text: string
          prompt_id?: string | null
          result?: Json
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          id?: string
          input_text?: string
          prompt_id?: string | null
          result?: Json
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_writing_submissions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_writing_submissions_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "ai_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          action_url: string | null
          archived_at: string | null
          audience: string
          body: string
          course_id: string | null
          created_by: string | null
          id: string
          published_at: string
          title: string
        }
        Insert: {
          action_url?: string | null
          archived_at?: string | null
          audience?: string
          body: string
          course_id?: string | null
          created_by?: string | null
          id?: string
          published_at?: string
          title: string
        }
        Update: {
          action_url?: string | null
          archived_at?: string | null
          audience?: string
          body?: string
          course_id?: string | null
          created_by?: string | null
          id?: string
          published_at?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      api_key_metadata: {
        Row: {
          created_at: string
          id: string
          masked_key: string
          owner_name: string
          provider: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          masked_key: string
          owner_name: string
          provider: string
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          masked_key?: string
          owner_name?: string
          provider?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      assessment_attempts: {
        Row: {
          answers: Json
          assessment_id: string
          attempted_at: string
          id: string
          passed: boolean
          score: number
          user_id: string
        }
        Insert: {
          answers?: Json
          assessment_id: string
          attempted_at?: string
          id: string
          passed: boolean
          score: number
          user_id: string
        }
        Update: {
          answers?: Json
          assessment_id?: string
          attempted_at?: string
          id?: string
          passed?: boolean
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_attempts_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_questions: {
        Row: {
          assessment_id: string
          correct_answer: string
          created_at: string
          explanation: string | null
          id: string
          options: Json
          order_index: number
          prompt: string
          updated_at: string
        }
        Insert: {
          assessment_id: string
          correct_answer: string
          created_at?: string
          explanation?: string | null
          id: string
          options?: Json
          order_index?: number
          prompt: string
          updated_at?: string
        }
        Update: {
          assessment_id?: string
          correct_answer?: string
          created_at?: string
          explanation?: string | null
          id?: string
          options?: Json
          order_index?: number
          prompt?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_questions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          assessment_type: string
          course_id: string
          created_at: string
          id: string
          order_index: number
          passing_score: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assessment_type: string
          course_id: string
          created_at?: string
          id: string
          order_index?: number
          passing_score: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assessment_type?: string
          course_id?: string
          created_at?: string
          id?: string
          order_index?: number
          passing_score?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      community_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
        }
        Relationships: []
      }
      community_follows: {
        Row: {
          created_at: string
          followed_id: string
          follower_id: string
        }
        Insert: {
          created_at?: string
          followed_id: string
          follower_id: string
        }
        Update: {
          created_at?: string
          followed_id?: string
          follower_id?: string
        }
        Relationships: []
      }
      community_group_members: {
        Row: {
          group_id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "community_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      community_groups: {
        Row: {
          course_id: string | null
          created_at: string
          created_by: string
          description: string
          id: string
          is_public: boolean
          name: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          created_by: string
          description?: string
          id?: string
          is_public?: boolean
          name: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          is_public?: boolean
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_groups_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      community_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          body: string
          created_at: string
          deleted_at: string | null
          group_id: string | null
          id: string
          metadata: Json
          post_type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          deleted_at?: string | null
          group_id?: string | null
          id?: string
          metadata?: Json
          post_type?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          deleted_at?: string | null
          group_id?: string | null
          id?: string
          metadata?: Json
          post_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "community_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      community_profiles: {
        Row: {
          bio: string
          created_at: string
          handle: string
          is_public: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string
          created_at?: string
          handle: string
          is_public?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string
          created_at?: string
          handle?: string
          is_public?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      content_revisions: {
        Row: {
          action: string
          author_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          snapshot: Json
          version: number
        }
        Insert: {
          action: string
          author_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          snapshot: Json
          version: number
        }
        Update: {
          action?: string
          author_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          snapshot?: Json
          version?: number
        }
        Relationships: []
      }
      course_modules: {
        Row: {
          course_id: string
          created_at: string
          description: string
          id: string
          level: string
          order_index: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description: string
          id: string
          level: string
          order_index?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string
          id?: string
          level?: string
          order_index?: number
          status?: string
          title?: string
          updated_at?: string
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
          created_at: string
          description: string
          id: string
          level: string
          order_index: number
          published_at: string | null
          slug: string
          status: string
          theme_color: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id: string
          level: string
          order_index?: number
          published_at?: string | null
          slug: string
          status?: string
          theme_color?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          level?: string
          order_index?: number
          published_at?: string | null
          slug?: string
          status?: string
          theme_color?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      dashboard_hero_slots: {
        Row: {
          alt_text: string
          asset_key: string
          created_at: string
          end_time: string
          id: string
          is_active: boolean
          label: string
          sort_order: number
          start_time: string
          updated_at: string
        }
        Insert: {
          alt_text: string
          asset_key: string
          created_at?: string
          end_time: string
          id: string
          is_active?: boolean
          label: string
          sort_order?: number
          start_time: string
          updated_at?: string
        }
        Update: {
          alt_text?: string
          asset_key?: string
          created_at?: string
          end_time?: string
          id?: string
          is_active?: boolean
          label?: string
          sort_order?: number
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      document_annotations: {
        Row: {
          anchor: Json
          color: string
          created_at: string
          document_id: string
          id: string
          note: string
          selected_text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          anchor?: Json
          color?: string
          created_at?: string
          document_id: string
          id?: string
          note?: string
          selected_text?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          anchor?: Json
          color?: string
          created_at?: string
          document_id?: string
          id?: string
          note?: string
          selected_text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_annotations_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_bookmarks: {
        Row: {
          created_at: string
          document_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_bookmarks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content_markdown: string
          course_id: string
          created_at: string
          document_type: string
          external_url: string | null
          id: string
          metadata: Json
          read_time_minutes: number
          status: string
          storage_path: string | null
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          content_markdown?: string
          course_id: string
          created_at?: string
          document_type: string
          external_url?: string | null
          id: string
          metadata?: Json
          read_time_minutes?: number
          status?: string
          storage_path?: string | null
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          content_markdown?: string
          course_id?: string
          created_at?: string
          document_type?: string
          external_url?: string | null
          id?: string
          metadata?: Json
          read_time_minutes?: number
          status?: string
          storage_path?: string | null
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string
          id: string
          package_id: string | null
          progress_percent: number
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string
          id: string
          package_id?: string | null
          progress_percent?: number
          status: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string
          id?: string
          package_id?: string | null
          progress_percent?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      grammar_examples: {
        Row: {
          created_at: string
          explanation: string | null
          id: string
          japanese_text: string
          order_index: number
          topic_id: string
          updated_at: string
          vietnamese_text: string
        }
        Insert: {
          created_at?: string
          explanation?: string | null
          id: string
          japanese_text: string
          order_index?: number
          topic_id: string
          updated_at?: string
          vietnamese_text: string
        }
        Update: {
          created_at?: string
          explanation?: string | null
          id?: string
          japanese_text?: string
          order_index?: number
          topic_id?: string
          updated_at?: string
          vietnamese_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "grammar_examples_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "grammar_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      grammar_rules: {
        Row: {
          body_markdown: string
          created_at: string
          id: string
          order_index: number
          title: string
          topic_id: string
          updated_at: string
        }
        Insert: {
          body_markdown: string
          created_at?: string
          id: string
          order_index?: number
          title: string
          topic_id: string
          updated_at?: string
        }
        Update: {
          body_markdown?: string
          created_at?: string
          id?: string
          order_index?: number
          title?: string
          topic_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grammar_rules_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "grammar_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      grammar_topic_courses: {
        Row: {
          course_id: string
          topic_id: string
        }
        Insert: {
          course_id: string
          topic_id: string
        }
        Update: {
          course_id?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grammar_topic_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grammar_topic_courses_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "grammar_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      grammar_topic_vocabulary: {
        Row: {
          topic_id: string
          vocabulary_item_id: string
        }
        Insert: {
          topic_id: string
          vocabulary_item_id: string
        }
        Update: {
          topic_id?: string
          vocabulary_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grammar_topic_vocabulary_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "grammar_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grammar_topic_vocabulary_vocabulary_item_id_fkey"
            columns: ["vocabulary_item_id"]
            isOneToOne: false
            referencedRelation: "vocabulary_items"
            referencedColumns: ["id"]
          },
        ]
      }
      grammar_topics: {
        Row: {
          category: string
          created_at: string
          id: string
          level: string
          order_index: number
          slug: string
          status: string
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          id: string
          level?: string
          order_index?: number
          slug: string
          status?: string
          summary?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          level?: string
          order_index?: number
          slug?: string
          status?: string
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string
          id: string
          prompt: string | null
          tags: string[]
          title: string
          updated_at: string
          user_id: string
          writing_submission_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          prompt?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
          user_id: string
          writing_submission_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          prompt?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
          user_id?: string
          writing_submission_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_writing_submission_id_fkey"
            columns: ["writing_submission_id"]
            isOneToOne: false
            referencedRelation: "ai_writing_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      learner_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          metadata: Json
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          metadata?: Json
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          metadata?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learner_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievement_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      learner_certificates: {
        Row: {
          certificate_code: string
          course_id: string
          id: string
          issued_at: string
          metadata: Json
          user_id: string
        }
        Insert: {
          certificate_code: string
          course_id: string
          id?: string
          issued_at?: string
          metadata?: Json
          user_id: string
        }
        Update: {
          certificate_code?: string
          course_id?: string
          id?: string
          issued_at?: string
          metadata?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learner_certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      learner_intervention_notes: {
        Row: {
          body: string
          created_at: string
          id: string
          learner_id: string
          staff_id: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          learner_id: string
          staff_id: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          learner_id?: string
          staff_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      learner_profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
          target_level: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id: string
          target_level: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          target_level?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      learner_settings: {
        Row: {
          ai_concise: boolean
          daily_goal_minutes: number
          email_notifications: boolean
          in_app_notifications: boolean
          new_cards_per_day: number
          onboarding_completed_at: string | null
          push_notifications: boolean
          reminder_time: string | null
          timezone: string
          tts_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_concise?: boolean
          daily_goal_minutes?: number
          email_notifications?: boolean
          in_app_notifications?: boolean
          new_cards_per_day?: number
          onboarding_completed_at?: string | null
          push_notifications?: boolean
          reminder_time?: string | null
          timezone?: string
          tts_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_concise?: boolean
          daily_goal_minutes?: number
          email_notifications?: boolean
          in_app_notifications?: boolean
          new_cards_per_day?: number
          onboarding_completed_at?: string | null
          push_notifications?: boolean
          reminder_time?: string | null
          timezone?: string
          tts_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      learning_activity_events: {
        Row: {
          course_id: string | null
          event_label: string
          event_type: string
          id: string
          metadata: Json
          occurred_at: string
          user_id: string
        }
        Insert: {
          course_id?: string | null
          event_label: string
          event_type: string
          id: string
          metadata?: Json
          occurred_at?: string
          user_id: string
        }
        Update: {
          course_id?: string | null
          event_label?: string
          event_type?: string
          id?: string
          metadata?: Json
          occurred_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_activity_events_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_assets: {
        Row: {
          asset_type: string
          created_at: string
          description: string | null
          external_url: string | null
          id: string
          lesson_id: string
          metadata: Json
          storage_path: string | null
          title: string
          updated_at: string
        }
        Insert: {
          asset_type: string
          created_at?: string
          description?: string | null
          external_url?: string | null
          id: string
          lesson_id: string
          metadata?: Json
          storage_path?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          asset_type?: string
          created_at?: string
          description?: string | null
          external_url?: string | null
          id?: string
          lesson_id?: string
          metadata?: Json
          storage_path?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_assets_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_exercises: {
        Row: {
          answer: string
          choices: Json
          created_at: string
          exercise_type: string
          id: string
          lesson_id: string
          order_index: number
          prompt: string
          updated_at: string
        }
        Insert: {
          answer: string
          choices?: Json
          created_at?: string
          exercise_type: string
          id: string
          lesson_id: string
          order_index?: number
          prompt: string
          updated_at?: string
        }
        Update: {
          answer?: string
          choices?: Json
          created_at?: string
          exercise_type?: string
          id?: string
          lesson_id?: string
          order_index?: number
          prompt?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_exercises_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          lesson_id: string
          score: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          lesson_id: string
          score?: number | null
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          lesson_id?: string
          score?: number | null
          status?: string
          updated_at?: string
          user_id?: string
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
      lesson_vocabulary: {
        Row: {
          lesson_id: string
          position: number
          vocabulary_item_id: string
        }
        Insert: {
          lesson_id: string
          position?: number
          vocabulary_item_id: string
        }
        Update: {
          lesson_id?: string
          position?: number
          vocabulary_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_vocabulary_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_vocabulary_vocabulary_item_id_fkey"
            columns: ["vocabulary_item_id"]
            isOneToOne: false
            referencedRelation: "vocabulary_items"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content_markdown: string
          course_id: string
          created_at: string
          description: string
          duration_minutes: number
          id: string
          lesson_type: string
          module_id: string
          objectives: string[]
          order_index: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          content_markdown?: string
          course_id: string
          created_at?: string
          description: string
          duration_minutes?: number
          id: string
          lesson_type: string
          module_id: string
          objectives?: string[]
          order_index?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          content_markdown?: string
          course_id?: string
          created_at?: string
          description?: string
          duration_minutes?: number
          id?: string
          lesson_type?: string
          module_id?: string
          objectives?: string[]
          order_index?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_deliveries: {
        Row: {
          attempts: number
          channel: string
          created_at: string
          id: string
          last_attempt_at: string | null
          last_error: string | null
          locked_at: string | null
          notification_id: string
          sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          channel: string
          created_at?: string
          id?: string
          last_attempt_at?: string | null
          last_error?: string | null
          locked_at?: string | null
          notification_id: string
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          channel?: string
          created_at?: string
          id?: string
          last_attempt_at?: string | null
          last_error?: string | null
          locked_at?: string | null
          notification_id?: string
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_deliveries_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          announcement_id: string | null
          body: string
          created_at: string
          id: string
          notification_type: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          announcement_id?: string | null
          body: string
          created_at?: string
          id?: string
          notification_type?: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          announcement_id?: string | null
          body?: string
          created_at?: string
          id?: string
          notification_type?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      package_courses: {
        Row: {
          course_id: string
          package_id: string
        }
        Insert: {
          course_id: string
          package_id: string
        }
        Update: {
          course_id?: string
          package_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_courses_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          ai_monthly_quota: number
          created_at: string
          currency: string
          description: string
          id: string
          name: string
          price_cents: number
          status: string
          updated_at: string
        }
        Insert: {
          ai_monthly_quota?: number
          created_at?: string
          currency?: string
          description: string
          id: string
          name: string
          price_cents: number
          status: string
          updated_at?: string
        }
        Update: {
          ai_monthly_quota?: number
          created_at?: string
          currency?: string
          description?: string
          id?: string
          name?: string
          price_cents?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      podcast_episodes: {
        Row: {
          course_id: string
          created_at: string
          duration_minutes: number
          external_url: string | null
          id: string
          lesson_id: string | null
          status: string
          storage_path: string | null
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          duration_minutes?: number
          external_url?: string | null
          id: string
          lesson_id?: string | null
          status?: string
          storage_path?: string | null
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          duration_minutes?: number
          external_url?: string | null
          id?: string
          lesson_id?: string | null
          status?: string
          storage_path?: string | null
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "podcast_episodes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "podcast_episodes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          email: string
          profile_role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          email: string
          profile_role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string
          profile_role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      review_attempts: {
        Row: {
          answered_at: string
          id: string
          is_correct: boolean
          question_id: string
          user_id: string
        }
        Insert: {
          answered_at?: string
          id: string
          is_correct: boolean
          question_id: string
          user_id: string
        }
        Update: {
          answered_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_attempts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "review_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      review_options: {
        Row: {
          id: string
          is_correct: boolean
          label: string
          order_index: number
          question_id: string
        }
        Insert: {
          id: string
          is_correct?: boolean
          label: string
          order_index?: number
          question_id: string
        }
        Update: {
          id?: string
          is_correct?: boolean
          label?: string
          order_index?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "review_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      review_questions: {
        Row: {
          created_at: string
          explanation: string | null
          id: string
          lesson_id: string
          order_index: number
          prompt: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          explanation?: string | null
          id: string
          lesson_id: string
          order_index?: number
          prompt: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          explanation?: string | null
          id?: string
          lesson_id?: string
          order_index?: number
          prompt?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_questions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      site_pages: {
        Row: {
          body_markdown: string
          slug: string
          status: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          body_markdown: string
          slug: string
          status?: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          body_markdown?: string
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      speaking_prompts: {
        Row: {
          course_id: string | null
          created_at: string
          id: string
          instructions: string
          order_index: number
          rubric: Json
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          id: string
          instructions: string
          order_index?: number
          rubric?: Json
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          id?: string
          instructions?: string
          order_index?: number
          rubric?: Json
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "speaking_prompts_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      speaking_submissions: {
        Row: {
          course_id: string | null
          created_at: string
          duration_seconds: number | null
          error_code: string | null
          id: string
          mime_type: string
          prompt_id: string | null
          result: Json
          status: string
          storage_path: string
          transcript: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          error_code?: string | null
          id?: string
          mime_type: string
          prompt_id?: string | null
          result?: Json
          status?: string
          storage_path: string
          transcript?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          duration_seconds?: number | null
          error_code?: string | null
          id?: string
          mime_type?: string
          prompt_id?: string | null
          result?: Json
          status?: string
          storage_path?: string
          transcript?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "speaking_submissions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "speaking_submissions_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "speaking_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      vocabulary_items: {
        Row: {
          audio_url: string | null
          created_at: string
          example_sentence: string | null
          id: string
          level: string | null
          metadata: Json
          pronunciation: string | null
          reading: string | null
          tags: string[]
          term: string
          translation: string
          updated_at: string
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          example_sentence?: string | null
          id: string
          level?: string | null
          metadata?: Json
          pronunciation?: string | null
          reading?: string | null
          tags?: string[]
          term: string
          translation: string
          updated_at?: string
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          example_sentence?: string | null
          id?: string
          level?: string | null
          metadata?: Json
          pronunciation?: string | null
          reading?: string | null
          tags?: string[]
          term?: string
          translation?: string
          updated_at?: string
        }
        Relationships: []
      }
      vocabulary_progress: {
        Row: {
          due_at: string | null
          interval_days: number
          lapses: number
          last_reviewed_at: string | null
          repetitions: number
          status: string
          user_id: string
          vocabulary_item_id: string
        }
        Insert: {
          due_at?: string | null
          interval_days?: number
          lapses?: number
          last_reviewed_at?: string | null
          repetitions?: number
          status: string
          user_id: string
          vocabulary_item_id: string
        }
        Update: {
          due_at?: string | null
          interval_days?: number
          lapses?: number
          last_reviewed_at?: string | null
          repetitions?: number
          status?: string
          user_id?: string
          vocabulary_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vocabulary_progress_vocabulary_item_id_fkey"
            columns: ["vocabulary_item_id"]
            isOneToOne: false
            referencedRelation: "vocabulary_items"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_default_starter_enrollment: {
        Args: never
        Returns: {
          course_id: string
          id: string
          package_id: string
          progress_percent: number
          status: string
        }[]
      }
      admin_create_intervention_note: {
        Args: { target_body: string; target_learner_id: string }
        Returns: {
          body: string
          created_at: string
          id: string
          learner_id: string
          staff_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "learner_intervention_notes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_delete_review_question: {
        Args: { target_question_id: string }
        Returns: undefined
      }
      admin_grant_enrollment: {
        Args: {
          target_course_id: string
          target_package_id?: string
          target_user_id: string
        }
        Returns: {
          completed_at: string | null
          course_id: string
          enrolled_at: string
          id: string
          package_id: string | null
          progress_percent: number
          status: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "enrollments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_remove_staff_role: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      admin_replace_grammar_topic_courses: {
        Args: { target_course_ids: string[]; target_topic_id: string }
        Returns: undefined
      }
      admin_replace_lesson_vocabulary: {
        Args: { target_lesson_id: string; target_vocabulary_ids: string[] }
        Returns: undefined
      }
      admin_replace_package_courses: {
        Args: { target_course_ids: string[]; target_package_id: string }
        Returns: undefined
      }
      admin_revoke_enrollment: {
        Args: { target_course_id: string; target_user_id: string }
        Returns: undefined
      }
      admin_save_review_question: {
        Args: {
          target_correct_index: number
          target_explanation: string
          target_lesson_id: string
          target_options: string[]
          target_order_index: number
          target_prompt: string
          target_question_id: string
        }
        Returns: string
      }
      admin_set_staff_role: {
        Args: { target_role: string; target_user_id: string }
        Returns: {
          granted_at: string
          granted_by: string | null
          role: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "admin_roles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      archive_announcement: {
        Args: { target_announcement_id: string }
        Returns: undefined
      }
      block_community_user: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      can_read_course: { Args: { target_course_id: string }; Returns: boolean }
      can_read_lesson: { Args: { target_lesson_id: string }; Returns: boolean }
      can_write_content_status: {
        Args: { target_status: string }
        Returns: boolean
      }
      claim_daily_reward: {
        Args: never
        Returns: {
          claimed: boolean
          current_streak: number
          newly_earned: Json
          reward_xp: number
        }[]
      }
      claim_notification_email_deliveries: {
        Args: { target_batch_size?: number }
        Returns: {
          action_url: string
          attempts: number
          body: string
          delivery_id: string
          notification_id: string
          status: string
          title: string
          user_id: string
        }[]
      }
      claim_notification_push_deliveries: {
        Args: { target_batch_size?: number }
        Returns: {
          action_url: string
          attempts: number
          body: string
          delivery_id: string
          notification_id: string
          status: string
          title: string
          user_id: string
        }[]
      }
      complete_learner_onboarding: {
        Args: {
          target_daily_goal_minutes: number
          target_display_name: string
          target_level: string
          target_timezone: string
        }
        Returns: undefined
      }
      complete_notification_email_delivery: {
        Args: {
          target_delivery_id: string
          target_error?: string
          target_status: string
        }
        Returns: undefined
      }
      complete_notification_push_delivery: {
        Args: {
          target_delivery_id: string
          target_error?: string
          target_status: string
        }
        Returns: undefined
      }
      consume_ai_quota: {
        Args: { target_feature: string }
        Returns: {
          feature: string
          monthly_quota: number
          period_start: string
          request_count: number
        }[]
      }
      consume_ai_rate_limit: {
        Args: { target_feature: string }
        Returns: undefined
      }
      create_announcement: {
        Args: {
          target_action_url?: string
          target_audience?: string
          target_body: string
          target_course_id?: string
          target_title: string
        }
        Returns: string
      }
      create_community_post: {
        Args: { target_body: string }
        Returns: {
          post_id: string
        }[]
      }
      create_progress_post: {
        Args: never
        Returns: {
          current_streak: number
          daily_xp: number
          post_id: string
        }[]
      }
      enroll_in_free_package: {
        Args: { target_package_id: string }
        Returns: {
          course_id: string
          id: string
          package_id: string
          progress_percent: number
          status: string
        }[]
      }
      follow_community_user: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      get_admin_analytics: { Args: never; Returns: Json }
      get_admin_assessment_questions: {
        Args: never
        Returns: {
          assessment_id: string
          correct_answer: string
          created_at: string
          id: string
          options: Json
          order_index: number
          prompt: string
          updated_at: string
        }[]
      }
      get_admin_learner_detail: {
        Args: { target_learner_id: string }
        Returns: Json
      }
      get_admin_lesson_exercises: {
        Args: never
        Returns: {
          answer: string
          choices: Json
          created_at: string
          exercise_type: string
          id: string
          lesson_id: string
          order_index: number
          prompt: string
          updated_at: string
        }[]
      }
      get_admin_review_options: {
        Args: never
        Returns: {
          id: string
          is_correct: boolean
          label: string
          order_index: number
          question_id: string
        }[]
      }
      get_assessment_result_detail: {
        Args: { target_attempt_id: string }
        Returns: {
          attempt_id: string
          explanation: string
          is_correct: boolean
          order_index: number
          prompt: string
          question_id: string
          selected_answer: string
        }[]
      }
      get_community_feed: {
        Args: { target_limit?: number }
        Returns: {
          body: string
          created_at: string
          display_name: string
          handle: string
          metadata: Json
          post_id: string
          post_type: string
          user_id: string
        }[]
      }
      get_community_leaderboard: {
        Args: { target_limit?: number }
        Returns: {
          current_streak: number
          display_name: string
          handle: string
          user_id: string
          weekly_xp: number
        }[]
      }
      get_community_me: {
        Args: never
        Returns: {
          bio: string
          display_name: string
          email: string
          handle: string
          is_public: boolean
          user_id: string
        }[]
      }
      get_community_messages: {
        Args: { target_limit?: number; target_user_id: string }
        Returns: {
          body: string
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
        }[]
      }
      mark_community_messages_read: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      get_course_review_questions: {
        Args: { target_course_id: string }
        Returns: {
          explanation: string
          options: Json
          prompt: string
          question_id: string
          source: string
        }[]
      }
      get_daily_learning_plan: { Args: never; Returns: Json }
      get_due_vocabulary_cards: {
        Args: { target_limit?: number }
        Returns: {
          due_at: string
          example_sentence: string
          interval_days: number
          lapses: number
          pronunciation: string
          reading: string
          repetitions: number
          status: string
          tags: string[]
          term: string
          translation: string
          vocabulary_item_id: string
        }[]
      }
      get_global_search_results: {
        Args: { target_limit?: number; target_query: string }
        Returns: {
          id: string
          result_type: string
          route: string
          subtitle: string
          title: string
        }[]
      }
      get_latest_assessment_result: {
        Args: { target_assessment_id: string }
        Returns: {
          assessment_id: string
          attempt_id: string
          attempted_at: string
          correct_answers: number
          passed: boolean
          score: number
          total_questions: number
        }[]
      }
      get_learner_dashboard: {
        Args: never
        Returns: {
          active_courses: number
          completed_lessons: number
          due_vocabulary: number
          mastered_vocabulary: number
          recent_activity: Json
          streak_days: number
        }[]
      }
      get_learner_stats: {
        Args: never
        Returns: {
          current_streak: number
          daily_xp: number
          due_vocabulary: number
          mastered_vocabulary: number
          reviewed_today: number
          topic_mastery: Json
          total_reviews: number
          total_xp: number
          weekly_activity: Json
          weekly_xp: number
        }[]
      }
      has_staff_permission: {
        Args: { target_permission: string }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      join_community_group: {
        Args: { target_group_id: string }
        Returns: undefined
      }
      leave_community_group: {
        Args: { target_group_id: string }
        Returns: undefined
      }
      list_community_groups: {
        Args: { target_limit?: number }
        Returns: {
          course_id: string
          description: string
          id: string
          joined: boolean
          member_count: number
          name: string
        }[]
      }
      list_community_threads: {
        Args: never
        Returns: {
          display_name: string
          handle: string
          last_at: string
          last_body: string
          other_user_id: string
          unread_count: number
        }[]
      }
      list_learner_achievements: {
        Args: never
        Returns: {
          achievement_id: string
          description: string
          earned_at: string
          icon: string
          metadata: Json
          title: string
        }[]
      }
      list_learner_certificates: {
        Args: never
        Returns: {
          certificate_code: string
          course_id: string
          course_title: string
          id: string
          issued_at: string
          metadata: Json
        }[]
      }
      mark_notification_read: {
        Args: { target_notification_id: string }
        Returns: undefined
      }
      publish_content_revision: {
        Args: {
          target_entity_id: string
          target_entity_type: string
          target_status: string
        }
        Returns: undefined
      }
      queue_due_reminders: { Args: never; Returns: number }
      record_game_completion: {
        Args: { target_course_id: string; target_game_type: string }
        Returns: {
          awarded: boolean
          completed_at: string
          xp_awarded: number
        }[]
      }
      record_lesson_progress: {
        Args: {
          target_lesson_id: string
          target_score?: number
          target_status: string
        }
        Returns: {
          course_id: string
          lesson_id: string
          progress_percent: number
          score: number
          status: string
        }[]
      }
      record_review_attempt: {
        Args: { target_is_correct: boolean; target_question_id: string }
        Returns: {
          answered_at: string
          id: string
          is_correct: boolean
          question_id: string
        }[]
      }
      record_vocabulary_review: {
        Args: { target_is_correct: boolean; target_vocabulary_item_id: string }
        Returns: {
          last_reviewed_at: string
          status: string
          vocabulary_item_id: string
        }[]
      }
      register_push_subscription: {
        Args: {
          target_auth: string
          target_endpoint: string
          target_p256dh: string
          target_user_agent?: string
        }
        Returns: string
      }
      report_community_content: {
        Args: { target_id: string; target_reason: string; target_type: string }
        Returns: string
      }
      rollback_content_revision: {
        Args: { target_revision_id: string }
        Returns: undefined
      }
      search_community_members: {
        Args: { target_limit?: number; target_query?: string }
        Returns: {
          bio: string
          display_name: string
          follower_count: number
          following: boolean
          handle: string
          user_id: string
        }[]
      }
      send_community_message: {
        Args: { target_body: string; target_user_id: string }
        Returns: {
          message_id: string
        }[]
      }
      staff_role: { Args: never; Returns: string }
      start_speaking_submission: {
        Args: {
          target_duration_seconds?: number
          target_mime_type: string
          target_prompt_id: string
        }
        Returns: {
          storage_path: string
          submission_id: string
        }[]
      }
      submit_assessment: {
        Args: { target_answers: Json; target_assessment_id: string }
        Returns: {
          assessment_id: string
          attempt_id: string
          attempted_at: string
          correct_answers: number
          passed: boolean
          score: number
          total_questions: number
        }[]
      }
      submit_review_answer: {
        Args: { target_option_id: string; target_question_id: string }
        Returns: {
          answered_at: string
          attempt_id: string
          explanation: string
          is_correct: boolean
          question_id: string
          selected_option_id: string
        }[]
      }
      submit_vocabulary_rating: {
        Args: { target_rating: string; target_vocabulary_item_id: string }
        Returns: {
          due_at: string
          interval_days: number
          lapses: number
          repetitions: number
          status: string
          vocabulary_item_id: string
        }[]
      }
      unblock_community_user: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      unfollow_community_user: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      unregister_push_subscription: {
        Args: { target_endpoint: string }
        Returns: undefined
      }
      upsert_community_profile: {
        Args: {
          target_bio?: string
          target_handle: string
          target_public?: boolean
        }
        Returns: {
          bio: string
          handle: string
          is_public: boolean
          user_id: string
        }[]
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
    Enums: {},
  },
} as const
