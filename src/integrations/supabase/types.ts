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
      admin_scheduled_reports: {
        Row: {
          cadence: string
          created_at: string | null
          filters: Json
          id: string
          is_active: boolean | null
          last_run_at: string | null
          owner_user_id: string | null
          report_type: string
          updated_at: string | null
        }
        Insert: {
          cadence: string
          created_at?: string | null
          filters?: Json
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          owner_user_id?: string | null
          report_type: string
          updated_at?: string | null
        }
        Update: {
          cadence?: string
          created_at?: string | null
          filters?: Json
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          owner_user_id?: string | null
          report_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_scheduled_reports_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "admin_v_freelancers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "admin_scheduled_reports_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      admin_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      agencies: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          website: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          website?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agencies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_v_freelancers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "agencies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      agency_members: {
        Row: {
          agency_id: string
          created_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          agency_id: string
          created_at?: string | null
          role: string
          user_id: string
        }
        Update: {
          agency_id?: string
          created_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agency_members_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "admin_v_agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "agency_members_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_v_freelancers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "agency_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      agency_payout_splits: {
        Row: {
          agency_id: string | null
          id: string
          member_user_id: string | null
          milestone_id: string | null
          percentage: number | null
        }
        Insert: {
          agency_id?: string | null
          id?: string
          member_user_id?: string | null
          milestone_id?: string | null
          percentage?: number | null
        }
        Update: {
          agency_id?: string | null
          id?: string
          member_user_id?: string | null
          milestone_id?: string | null
          percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_payout_splits_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "admin_v_agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "agency_payout_splits_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_payout_splits_member_user_id_fkey"
            columns: ["member_user_id"]
            isOneToOne: false
            referencedRelation: "admin_v_freelancers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "agency_payout_splits_member_user_id_fkey"
            columns: ["member_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "agency_payout_splits_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "admin_v_milestones"
            referencedColumns: ["milestone_id"]
          },
          {
            foreignKeyName: "agency_payout_splits_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          entity: string
          entity_id: string | null
          id: string
          meta: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity: string
          entity_id?: string | null
          id?: string
          meta?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity?: string
          entity_id?: string | null
          id?: string
          meta?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_v_freelancers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      brief_events: {
        Row: {
          brief_id: string
          created_at: string | null
          id: string
          payload: Json | null
          type: string
        }
        Insert: {
          brief_id: string
          created_at?: string | null
          id?: string
          payload?: Json | null
          type: string
        }
        Update: {
          brief_id?: string
          created_at?: string | null
          id?: string
          payload?: Json | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "brief_events_brief_id_fkey"
            columns: ["brief_id"]
            isOneToOne: false
            referencedRelation: "admin_v_briefs"
            referencedColumns: ["brief_id"]
          },
          {
            foreignKeyName: "brief_events_brief_id_fkey"
            columns: ["brief_id"]
            isOneToOne: false
            referencedRelation: "briefs"
            referencedColumns: ["id"]
          },
        ]
      }
      briefs: {
        Row: {
          assured_mode: boolean | null
          contact_email: string
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          matched_at: string | null
          matched_expert_id: string | null
          matching_results: Json | null
          org_id: string | null
          origin: string
          origin_id: string | null
          proposal_json: Json | null
          status: string | null
          structured_brief: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assured_mode?: boolean | null
          contact_email: string
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          matched_at?: string | null
          matched_expert_id?: string | null
          matching_results?: Json | null
          org_id?: string | null
          origin: string
          origin_id?: string | null
          proposal_json?: Json | null
          status?: string | null
          structured_brief?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assured_mode?: boolean | null
          contact_email?: string
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          matched_at?: string | null
          matched_expert_id?: string | null
          matching_results?: Json | null
          org_id?: string | null
          origin?: string
          origin_id?: string | null
          proposal_json?: Json | null
          status?: string | null
          structured_brief?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "briefs_matched_expert_id_fkey"
            columns: ["matched_expert_id"]
            isOneToOne: false
            referencedRelation: "admin_v_freelancers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "briefs_matched_expert_id_fkey"
            columns: ["matched_expert_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "briefs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "admin_v_client_orgs"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "briefs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          id: string
          is_active: boolean | null
          name: string
          slug: string
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
        }
        Update: {
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      change_orders: {
        Row: {
          amount_delta: number
          created_at: string | null
          description: string | null
          id: string
          project_id: string | null
          status: string | null
        }
        Insert: {
          amount_delta: number
          created_at?: string | null
          description?: string | null
          id?: string
          project_id?: string | null
          status?: string | null
        }
        Update: {
          amount_delta?: number
          created_at?: string | null
          description?: string | null
          id?: string
          project_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "change_orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "admin_v_projects"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "change_orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
          session_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
          session_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          project_id: string | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          project_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "admin_v_projects"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "chat_sessions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_project_milestones: {
        Row: {
          amount: number
          created_at: string
          deliverables: Json | null
          description: string | null
          due_date: string | null
          id: string
          milestone_number: number
          paid_at: string | null
          project_id: string | null
          quote_id: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          deliverables?: Json | null
          description?: string | null
          due_date?: string | null
          id?: string
          milestone_number: number
          paid_at?: string | null
          project_id?: string | null
          quote_id?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          deliverables?: Json | null
          description?: string | null
          due_date?: string | null
          id?: string
          milestone_number?: number
          paid_at?: string | null
          project_id?: string | null
          quote_id?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "admin_v_projects"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "custom_project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_project_milestones_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "admin_v_quotes"
            referencedColumns: ["quote_id"]
          },
          {
            foreignKeyName: "custom_project_milestones_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "custom_quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_quotes: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          client_notes: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          customization_request_id: string | null
          deliverables: Json
          estimated_duration: string | null
          estimated_start_date: string | null
          expires_at: string | null
          id: string
          internal_notes: string | null
          milestones: Json
          payment_structure: string | null
          project_title: string
          quote_number: string
          scope_description: string
          status: string | null
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          client_notes?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          customization_request_id?: string | null
          deliverables?: Json
          estimated_duration?: string | null
          estimated_start_date?: string | null
          expires_at?: string | null
          id?: string
          internal_notes?: string | null
          milestones?: Json
          payment_structure?: string | null
          project_title: string
          quote_number?: string
          scope_description: string
          status?: string | null
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          client_notes?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          customization_request_id?: string | null
          deliverables?: Json
          estimated_duration?: string | null
          estimated_start_date?: string | null
          expires_at?: string | null
          id?: string
          internal_notes?: string | null
          milestones?: Json
          payment_structure?: string | null
          project_title?: string
          quote_number?: string
          scope_description?: string
          status?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_quotes_customization_request_id_fkey"
            columns: ["customization_request_id"]
            isOneToOne: false
            referencedRelation: "admin_v_requests"
            referencedColumns: ["request_id"]
          },
          {
            foreignKeyName: "custom_quotes_customization_request_id_fkey"
            columns: ["customization_request_id"]
            isOneToOne: false
            referencedRelation: "customization_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      customization_requests: {
        Row: {
          additional_context: string | null
          base_template: string | null
          budget_range: string | null
          company_name: string | null
          contact_email: string
          contact_phone: string | null
          created_at: string
          custom_requirements: string
          id: string
          product_id: string | null
          project_title: string
          status: string | null
          timeline_preference: string | null
          updated_at: string
          urgency_level: string | null
          user_id: string | null
        }
        Insert: {
          additional_context?: string | null
          base_template?: string | null
          budget_range?: string | null
          company_name?: string | null
          contact_email: string
          contact_phone?: string | null
          created_at?: string
          custom_requirements: string
          id?: string
          product_id?: string | null
          project_title: string
          status?: string | null
          timeline_preference?: string | null
          updated_at?: string
          urgency_level?: string | null
          user_id?: string | null
        }
        Update: {
          additional_context?: string | null
          base_template?: string | null
          budget_range?: string | null
          company_name?: string | null
          contact_email?: string
          contact_phone?: string | null
          created_at?: string
          custom_requirements?: string
          id?: string
          product_id?: string | null
          project_title?: string
          status?: string | null
          timeline_preference?: string | null
          updated_at?: string
          urgency_level?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customization_requests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverable_files: {
        Row: {
          deliverable_id: string
          file_name: string
          file_size: number | null
          file_type: string | null
          id: string
          notes: string | null
          storage_path: string
          uploaded_at: string
          uploaded_by: string
          version_number: number
        }
        Insert: {
          deliverable_id: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          notes?: string | null
          storage_path: string
          uploaded_at?: string
          uploaded_by: string
          version_number?: number
        }
        Update: {
          deliverable_id?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          notes?: string | null
          storage_path?: string
          uploaded_at?: string
          uploaded_by?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "deliverable_files_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "admin_v_project_deliverables"
            referencedColumns: ["deliverable_id"]
          },
          {
            foreignKeyName: "deliverable_files_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "project_deliverables"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverable_versions: {
        Row: {
          created_at: string | null
          created_by: string | null
          deliverable_id: string | null
          id: string
          notes: string | null
          storage_path: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deliverable_id?: string | null
          id?: string
          notes?: string | null
          storage_path: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deliverable_id?: string | null
          id?: string
          notes?: string | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliverable_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_v_freelancers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "deliverable_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "deliverable_versions_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "admin_v_deliverables"
            referencedColumns: ["deliverable_id"]
          },
          {
            foreignKeyName: "deliverable_versions_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "deliverables"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverables: {
        Row: {
          created_at: string | null
          id: string
          milestone_id: string | null
          project_id: string | null
          status: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          milestone_id?: string | null
          project_id?: string | null
          status?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          milestone_id?: string | null
          project_id?: string | null
          status?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliverables_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "admin_v_milestones"
            referencedColumns: ["milestone_id"]
          },
          {
            foreignKeyName: "deliverables_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverables_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "admin_v_projects"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "deliverables_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      document_chunks: {
        Row: {
          chunk: string
          document_id: string | null
          embedding: string
          id: string
        }
        Insert: {
          chunk: string
          document_id?: string | null
          embedding: string
          id?: string
        }
        Update: {
          chunk?: string
          document_id?: string | null
          embedding?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          id: string
          project_id: string | null
          source: string | null
          storage_path: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id?: string | null
          source?: string | null
          storage_path?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string | null
          source?: string | null
          storage_path?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "admin_v_projects"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_invites: {
        Row: {
          brief_id: string
          created_at: string | null
          expert_user_id: string
          expires_at: string
          id: string
          invitation_message: string | null
          responded_at: string | null
          response_message: string | null
          score_at_invite: number | null
          sent_at: string | null
          status: string
          updated_at: string | null
          viewed_at: string | null
        }
        Insert: {
          brief_id: string
          created_at?: string | null
          expert_user_id: string
          expires_at: string
          id?: string
          invitation_message?: string | null
          responded_at?: string | null
          response_message?: string | null
          score_at_invite?: number | null
          sent_at?: string | null
          status?: string
          updated_at?: string | null
          viewed_at?: string | null
        }
        Update: {
          brief_id?: string
          created_at?: string | null
          expert_user_id?: string
          expires_at?: string
          id?: string
          invitation_message?: string | null
          responded_at?: string | null
          response_message?: string | null
          score_at_invite?: number | null
          sent_at?: string | null
          status?: string
          updated_at?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expert_invites_brief_id_fkey"
            columns: ["brief_id"]
            isOneToOne: false
            referencedRelation: "admin_v_briefs"
            referencedColumns: ["brief_id"]
          },
          {
            foreignKeyName: "expert_invites_brief_id_fkey"
            columns: ["brief_id"]
            isOneToOne: false
            referencedRelation: "briefs"
            referencedColumns: ["id"]
          },
        ]
      }
      freelancer_profiles: {
        Row: {
          availability_weekly_hours: number | null
          certifications: string[] | null
          connected_calendar: boolean | null
          created_at: string | null
          id: string
          industries: string[] | null
          locales: string[] | null
          outcome_history: Json | null
          price_band_max: number | null
          price_band_min: number | null
          pto_ranges: Json | null
          skills: string[] | null
          tools: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          availability_weekly_hours?: number | null
          certifications?: string[] | null
          connected_calendar?: boolean | null
          created_at?: string | null
          id?: string
          industries?: string[] | null
          locales?: string[] | null
          outcome_history?: Json | null
          price_band_max?: number | null
          price_band_min?: number | null
          pto_ranges?: Json | null
          skills?: string[] | null
          tools?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          availability_weekly_hours?: number | null
          certifications?: string[] | null
          connected_calendar?: boolean | null
          created_at?: string | null
          id?: string
          industries?: string[] | null
          locales?: string[] | null
          outcome_history?: Json | null
          price_band_max?: number | null
          price_band_min?: number | null
          pto_ranges?: Json | null
          skills?: string[] | null
          tools?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      invite_status: {
        Row: {
          expires_at: string
          id: string
          invited_at: string | null
          request_id: string
          responded_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          expires_at: string
          id?: string
          invited_at?: string | null
          request_id: string
          responded_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          expires_at?: string
          id?: string
          invited_at?: string | null
          request_id?: string
          responded_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invite_status_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "admin_v_requests"
            referencedColumns: ["request_id"]
          },
          {
            foreignKeyName: "invite_status_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "customization_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          ci_assessment: Json | null
          company: string | null
          created_by: string | null
          email: string
          first_name: string | null
          funnel_stages: string[] | null
          last_name: string | null
          last_updated: string | null
          lead_source: string | null
          platform: string | null
          roi_input: Json | null
          roi_output: Json | null
        }
        Insert: {
          ci_assessment?: Json | null
          company?: string | null
          created_by?: string | null
          email: string
          first_name?: string | null
          funnel_stages?: string[] | null
          last_name?: string | null
          last_updated?: string | null
          lead_source?: string | null
          platform?: string | null
          roi_input?: Json | null
          roi_output?: Json | null
        }
        Update: {
          ci_assessment?: Json | null
          company?: string | null
          created_by?: string | null
          email?: string
          first_name?: string | null
          funnel_stages?: string[] | null
          last_name?: string | null
          last_updated?: string | null
          lead_source?: string | null
          platform?: string | null
          roi_input?: Json | null
          roi_output?: Json | null
        }
        Relationships: []
      }
      matching_snapshots: {
        Row: {
          candidates: Json
          created_at: string | null
          id: string
          matching_weights: Json
          request_id: string
          shortlist_size: number | null
        }
        Insert: {
          candidates?: Json
          created_at?: string | null
          id?: string
          matching_weights?: Json
          request_id: string
          shortlist_size?: number | null
        }
        Update: {
          candidates?: Json
          created_at?: string | null
          id?: string
          matching_weights?: Json
          request_id?: string
          shortlist_size?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "matching_snapshots_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "admin_v_requests"
            referencedColumns: ["request_id"]
          },
          {
            foreignKeyName: "matching_snapshots_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "customization_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          created_at: string | null
          ends_at: string | null
          external_event_id: string | null
          id: string
          join_url: string
          milestone_id: string | null
          organizer_user_id: string | null
          project_id: string | null
          provider: string
          recording_consent: boolean | null
          starts_at: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          ends_at?: string | null
          external_event_id?: string | null
          id?: string
          join_url: string
          milestone_id?: string | null
          organizer_user_id?: string | null
          project_id?: string | null
          provider: string
          recording_consent?: boolean | null
          starts_at?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          ends_at?: string | null
          external_event_id?: string | null
          id?: string
          join_url?: string
          milestone_id?: string | null
          organizer_user_id?: string | null
          project_id?: string | null
          provider?: string
          recording_consent?: boolean | null
          starts_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "admin_v_milestones"
            referencedColumns: ["milestone_id"]
          },
          {
            foreignKeyName: "meetings_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_organizer_user_id_fkey"
            columns: ["organizer_user_id"]
            isOneToOne: false
            referencedRelation: "admin_v_freelancers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "meetings_organizer_user_id_fkey"
            columns: ["organizer_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "meetings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "admin_v_projects"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "meetings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          project_id: string | null
          status: string | null
          title: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          project_id?: string | null
          status?: string | null
          title: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          project_id?: string | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "admin_v_projects"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read_at: string | null
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          id: string
          product_id: string | null
          status: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          product_id?: string | null
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          product_id?: string | null
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      org_members: {
        Row: {
          created_at: string | null
          org_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          org_id: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          org_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "admin_v_client_orgs"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_v_freelancers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "org_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      orgs: {
        Row: {
          billing_email: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          billing_email?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          billing_email?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      payment_intents: {
        Row: {
          created_at: string | null
          id: string
          milestone_id: string | null
          project_id: string | null
          status: string | null
          stripe_payment_intent_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          milestone_id?: string | null
          project_id?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          milestone_id?: string | null
          project_id?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_intents_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "admin_v_milestones"
            referencedColumns: ["milestone_id"]
          },
          {
            foreignKeyName: "payment_intents_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_intents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "admin_v_projects"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "payment_intents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      product_snapshots: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          snapshot: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          snapshot: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "product_snapshots_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number
          category_id: string | null
          created_at: string | null
          deliverables: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_fixed_scope: boolean | null
          most_popular: boolean | null
          outcomes: Json | null
          series_id: string | null
          stripe_price_id: string | null
          subcategory_id: string | null
          tags: string[] | null
          tier: string | null
          timeline: string | null
          timeline_days: number | null
          title: string
        }
        Insert: {
          base_price: number
          category_id?: string | null
          created_at?: string | null
          deliverables?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_fixed_scope?: boolean | null
          most_popular?: boolean | null
          outcomes?: Json | null
          series_id?: string | null
          stripe_price_id?: string | null
          subcategory_id?: string | null
          tags?: string[] | null
          tier?: string | null
          timeline?: string | null
          timeline_days?: number | null
          title: string
        }
        Update: {
          base_price?: number
          category_id?: string | null
          created_at?: string | null
          deliverables?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_fixed_scope?: boolean | null
          most_popular?: boolean | null
          outcomes?: Json | null
          series_id?: string | null
          stripe_price_id?: string | null
          subcategory_id?: string | null
          tags?: string[] | null
          tier?: string | null
          timeline?: string | null
          timeline_days?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          is_admin: boolean | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          is_admin?: boolean | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          is_admin?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      project_deliverables: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          milestone_id: string | null
          project_id: string
          rejection_reason: string | null
          status: string
          submitted_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          milestone_id?: string | null
          project_id: string
          rejection_reason?: string | null
          status?: string
          submitted_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          milestone_id?: string | null
          project_id?: string
          rejection_reason?: string | null
          status?: string
          submitted_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_deliverables_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "admin_v_milestones"
            referencedColumns: ["milestone_id"]
          },
          {
            foreignKeyName: "project_deliverables_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_deliverables_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "admin_v_projects"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_deliverables_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_files: {
        Row: {
          created_at: string | null
          deliverable_id: string | null
          id: string
          milestone_id: string | null
          project_id: string | null
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          deliverable_id?: string | null
          id?: string
          milestone_id?: string | null
          project_id?: string | null
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          deliverable_id?: string | null
          id?: string
          milestone_id?: string | null
          project_id?: string | null
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_files_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "admin_v_deliverables"
            referencedColumns: ["deliverable_id"]
          },
          {
            foreignKeyName: "project_files_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "deliverables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_files_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "admin_v_milestones"
            referencedColumns: ["milestone_id"]
          },
          {
            foreignKeyName: "project_files_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "admin_v_projects"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "admin_v_freelancers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "project_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      project_insights: {
        Row: {
          confidence_score: number | null
          content: string
          created_at: string
          id: string
          insight_type: string
          project_id: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          confidence_score?: number | null
          content: string
          created_at?: string
          id?: string
          insight_type: string
          project_id?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          confidence_score?: number | null
          content?: string
          created_at?: string
          id?: string
          insight_type?: string
          project_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_insights_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "admin_v_projects"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_insights_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          project_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          project_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          project_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "admin_v_projects"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_v_freelancers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "project_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      project_participants: {
        Row: {
          project_id: string
          role: string | null
          user_id: string
        }
        Insert: {
          project_id: string
          role?: string | null
          user_id: string
        }
        Update: {
          project_id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_participants_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "admin_v_projects"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_participants_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_v_freelancers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "project_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      projects: {
        Row: {
          agency_id: string | null
          created_at: string | null
          currency: string | null
          id: string
          is_custom: boolean | null
          org_id: string | null
          product_snapshot_id: string | null
          status: string | null
          teamsmith_user_id: string | null
          title: string
          total_price: number | null
        }
        Insert: {
          agency_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          is_custom?: boolean | null
          org_id?: string | null
          product_snapshot_id?: string | null
          status?: string | null
          teamsmith_user_id?: string | null
          title: string
          total_price?: number | null
        }
        Update: {
          agency_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          is_custom?: boolean | null
          org_id?: string | null
          product_snapshot_id?: string | null
          status?: string | null
          teamsmith_user_id?: string | null
          title?: string
          total_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "admin_v_agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "projects_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "admin_v_client_orgs"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "projects_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_product_snapshot_id_fkey"
            columns: ["product_snapshot_id"]
            isOneToOne: false
            referencedRelation: "product_snapshots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_teamsmith_user_id_fkey"
            columns: ["teamsmith_user_id"]
            isOneToOne: false
            referencedRelation: "admin_v_freelancers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "projects_teamsmith_user_id_fkey"
            columns: ["teamsmith_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      qa_reviews: {
        Row: {
          comments: string | null
          created_at: string | null
          decision: string
          deliverable_id: string | null
          id: string
          reviewer_user_id: string | null
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          decision: string
          deliverable_id?: string | null
          id?: string
          reviewer_user_id?: string | null
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          decision?: string
          deliverable_id?: string | null
          id?: string
          reviewer_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qa_reviews_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "admin_v_deliverables"
            referencedColumns: ["deliverable_id"]
          },
          {
            foreignKeyName: "qa_reviews_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "deliverables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qa_reviews_reviewer_user_id_fkey"
            columns: ["reviewer_user_id"]
            isOneToOne: false
            referencedRelation: "admin_v_freelancers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "qa_reviews_reviewer_user_id_fkey"
            columns: ["reviewer_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      quote_revisions: {
        Row: {
          changes_requested: string
          created_at: string
          id: string
          quote_id: string | null
          requested_by: string | null
          revised_amount: number | null
          revised_scope: string | null
          revised_timeline: string | null
          revision_number: number
        }
        Insert: {
          changes_requested: string
          created_at?: string
          id?: string
          quote_id?: string | null
          requested_by?: string | null
          revised_amount?: number | null
          revised_scope?: string | null
          revised_timeline?: string | null
          revision_number: number
        }
        Update: {
          changes_requested?: string
          created_at?: string
          id?: string
          quote_id?: string | null
          requested_by?: string | null
          revised_amount?: number | null
          revised_scope?: string | null
          revised_timeline?: string | null
          revision_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_revisions_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "admin_v_quotes"
            referencedColumns: ["quote_id"]
          },
          {
            foreignKeyName: "quote_revisions_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "custom_quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      series: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          subcategory_id: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          subcategory_id?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          subcategory_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "series_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "series_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      standardized_quotes: {
        Row: {
          assumptions: string | null
          created_at: string | null
          currency: string | null
          freelancer_id: string
          id: string
          milestones: Json
          portfolio_highlights: string[] | null
          qa_guarantees: string | null
          request_id: string
          status: string | null
          timeline_weeks: number | null
          total_price: number
          updated_at: string | null
          validity_until: string | null
        }
        Insert: {
          assumptions?: string | null
          created_at?: string | null
          currency?: string | null
          freelancer_id: string
          id?: string
          milestones?: Json
          portfolio_highlights?: string[] | null
          qa_guarantees?: string | null
          request_id: string
          status?: string | null
          timeline_weeks?: number | null
          total_price: number
          updated_at?: string | null
          validity_until?: string | null
        }
        Update: {
          assumptions?: string | null
          created_at?: string | null
          currency?: string | null
          freelancer_id?: string
          id?: string
          milestones?: Json
          portfolio_highlights?: string[] | null
          qa_guarantees?: string | null
          request_id?: string
          status?: string | null
          timeline_weeks?: number | null
          total_price?: number
          updated_at?: string | null
          validity_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "standardized_quotes_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "admin_v_requests"
            referencedColumns: ["request_id"]
          },
          {
            foreignKeyName: "standardized_quotes_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "customization_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategories: {
        Row: {
          category_id: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
        }
        Insert: {
          category_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
        }
        Update: {
          category_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      teamsmiths: {
        Row: {
          bio: string | null
          created_at: string | null
          hourly_rate: number | null
          skills: string[] | null
          user_id: string
          vetted: boolean | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          hourly_rate?: number | null
          skills?: string[] | null
          user_id: string
          vetted?: boolean | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          hourly_rate?: number | null
          skills?: string[] | null
          user_id?: string
          vetted?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "teamsmiths_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "admin_v_freelancers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "teamsmiths_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      transcripts: {
        Row: {
          created_at: string | null
          id: string
          json: Json | null
          project_id: string | null
          provider_id: string | null
          source: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          json?: Json | null
          project_id?: string | null
          provider_id?: string | null
          source?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          json?: Json | null
          project_id?: string | null
          provider_id?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transcripts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "admin_v_projects"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "transcripts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_orgs: {
        Row: {
          created_at: string | null
          org_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          org_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          org_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_orgs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "admin_v_client_orgs"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "user_orgs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_orgs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      zapier_fallback: {
        Row: {
          created_at: string | null
          email: string
          trigger_at: string
        }
        Insert: {
          created_at?: string | null
          email: string
          trigger_at: string
        }
        Update: {
          created_at?: string | null
          email?: string
          trigger_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_v_agencies: {
        Row: {
          active_projects: number | null
          agency_id: string | null
          completed_projects: number | null
          created_at: string | null
          members: number | null
          name: string | null
          website: string | null
        }
        Relationships: []
      }
      admin_v_briefs: {
        Row: {
          assured_mode: boolean | null
          brief_id: string | null
          budget_range: string | null
          candidate_count: number | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          matched_at: string | null
          matched_expert_id: string | null
          matching_results: Json | null
          origin: string | null
          origin_id: string | null
          project_title: string | null
          proposal_json: Json | null
          status: string | null
          structured_brief: Json | null
          timeline_preference: string | null
          updated_at: string | null
          urgency_level: string | null
        }
        Insert: {
          assured_mode?: boolean | null
          brief_id?: string | null
          budget_range?: never
          candidate_count?: never
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          matched_at?: string | null
          matched_expert_id?: string | null
          matching_results?: Json | null
          origin?: string | null
          origin_id?: string | null
          project_title?: never
          proposal_json?: Json | null
          status?: string | null
          structured_brief?: Json | null
          timeline_preference?: never
          updated_at?: string | null
          urgency_level?: never
        }
        Update: {
          assured_mode?: boolean | null
          brief_id?: string | null
          budget_range?: never
          candidate_count?: never
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          matched_at?: string | null
          matched_expert_id?: string | null
          matching_results?: Json | null
          origin?: string | null
          origin_id?: string | null
          project_title?: never
          proposal_json?: Json | null
          status?: string | null
          structured_brief?: Json | null
          timeline_preference?: never
          updated_at?: string | null
          urgency_level?: never
        }
        Relationships: [
          {
            foreignKeyName: "briefs_matched_expert_id_fkey"
            columns: ["matched_expert_id"]
            isOneToOne: false
            referencedRelation: "admin_v_freelancers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "briefs_matched_expert_id_fkey"
            columns: ["matched_expert_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      admin_v_client_orgs: {
        Row: {
          active_projects: number | null
          billing_email: string | null
          completed_projects: number | null
          created_at: string | null
          gross_value_gbp: number | null
          name: string | null
          org_id: string | null
          total_projects: number | null
        }
        Relationships: []
      }
      admin_v_custom_milestones: {
        Row: {
          amount: number | null
          created_at: string | null
          due_date: string | null
          milestone_id: string | null
          paid_at: string | null
          project_id: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          title: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          due_date?: string | null
          milestone_id?: string | null
          paid_at?: string | null
          project_id?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          title?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          due_date?: string | null
          milestone_id?: string | null
          paid_at?: string | null
          project_id?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "admin_v_projects"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "custom_project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_v_deliverables: {
        Row: {
          created_at: string | null
          deliverable_id: string | null
          last_qa_decision: string | null
          last_updated: string | null
          milestone_id: string | null
          project_id: string | null
          status: string | null
          title: string | null
          versions: number | null
        }
        Insert: {
          created_at?: string | null
          deliverable_id?: string | null
          last_qa_decision?: never
          last_updated?: never
          milestone_id?: string | null
          project_id?: string | null
          status?: string | null
          title?: string | null
          versions?: never
        }
        Update: {
          created_at?: string | null
          deliverable_id?: string | null
          last_qa_decision?: never
          last_updated?: never
          milestone_id?: string | null
          project_id?: string | null
          status?: string | null
          title?: string | null
          versions?: never
        }
        Relationships: [
          {
            foreignKeyName: "deliverables_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "admin_v_milestones"
            referencedColumns: ["milestone_id"]
          },
          {
            foreignKeyName: "deliverables_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverables_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "admin_v_projects"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "deliverables_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_v_freelancers: {
        Row: {
          active_projects: number | null
          availability_weekly_hours: number | null
          completed_projects: number | null
          created_at: string | null
          csat_avg: number | null
          email: string | null
          full_name: string | null
          price_band_max: number | null
          price_band_min: number | null
          skills: string[] | null
          user_id: string | null
        }
        Relationships: []
      }
      admin_v_meetings: {
        Row: {
          created_at: string | null
          ends_at: string | null
          join_url: string | null
          meeting_id: string | null
          organizer_user_id: string | null
          project_id: string | null
          provider: string | null
          recording_consent: boolean | null
          starts_at: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          ends_at?: string | null
          join_url?: string | null
          meeting_id?: string | null
          organizer_user_id?: string | null
          project_id?: string | null
          provider?: string | null
          recording_consent?: boolean | null
          starts_at?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          ends_at?: string | null
          join_url?: string | null
          meeting_id?: string | null
          organizer_user_id?: string | null
          project_id?: string | null
          provider?: string | null
          recording_consent?: boolean | null
          starts_at?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meetings_organizer_user_id_fkey"
            columns: ["organizer_user_id"]
            isOneToOne: false
            referencedRelation: "admin_v_freelancers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "meetings_organizer_user_id_fkey"
            columns: ["organizer_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "meetings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "admin_v_projects"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "meetings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_v_milestones: {
        Row: {
          amount: number | null
          created_at: string | null
          due_date: string | null
          milestone_id: string | null
          payment_status: string | null
          project_id: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "admin_v_projects"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_v_project_deliverables: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          deliverable_id: string | null
          milestone_id: string | null
          project_id: string | null
          rejection_reason: string | null
          status: string | null
          submitted_at: string | null
          title: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          deliverable_id?: string | null
          milestone_id?: string | null
          project_id?: string | null
          rejection_reason?: string | null
          status?: string | null
          submitted_at?: string | null
          title?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          deliverable_id?: string | null
          milestone_id?: string | null
          project_id?: string | null
          rejection_reason?: string | null
          status?: string | null
          submitted_at?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_deliverables_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "admin_v_milestones"
            referencedColumns: ["milestone_id"]
          },
          {
            foreignKeyName: "project_deliverables_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_deliverables_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "admin_v_projects"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "project_deliverables_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_v_projects: {
        Row: {
          agency_id: string | null
          created_at: string | null
          currency: string | null
          deliverables_count: number | null
          milestones_count: number | null
          org_id: string | null
          project_id: string | null
          qa_reviews_count: number | null
          status: string | null
          teamsmith_user_id: string | null
          title: string | null
          total_price: number | null
        }
        Insert: {
          agency_id?: string | null
          created_at?: string | null
          currency?: string | null
          deliverables_count?: never
          milestones_count?: never
          org_id?: string | null
          project_id?: string | null
          qa_reviews_count?: never
          status?: string | null
          teamsmith_user_id?: string | null
          title?: string | null
          total_price?: number | null
        }
        Update: {
          agency_id?: string | null
          created_at?: string | null
          currency?: string | null
          deliverables_count?: never
          milestones_count?: never
          org_id?: string | null
          project_id?: string | null
          qa_reviews_count?: never
          status?: string | null
          teamsmith_user_id?: string | null
          title?: string | null
          total_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "admin_v_agencies"
            referencedColumns: ["agency_id"]
          },
          {
            foreignKeyName: "projects_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "admin_v_client_orgs"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "projects_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "orgs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_teamsmith_user_id_fkey"
            columns: ["teamsmith_user_id"]
            isOneToOne: false
            referencedRelation: "admin_v_freelancers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "projects_teamsmith_user_id_fkey"
            columns: ["teamsmith_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      admin_v_quotes: {
        Row: {
          budget_range: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          project_title: string | null
          quote_id: string | null
          request_id: string | null
          status: string | null
          total_amount: number | null
          user_id: string | null
          valid_until: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_quotes_customization_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "admin_v_requests"
            referencedColumns: ["request_id"]
          },
          {
            foreignKeyName: "custom_quotes_customization_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "customization_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_v_requests: {
        Row: {
          budget_range: string | null
          created_at: string | null
          email: string | null
          product_id: string | null
          project_title: string | null
          request_id: string | null
          status: string | null
          timeline_preference: string | null
          urgency_level: string | null
          user_id: string | null
        }
        Insert: {
          budget_range?: string | null
          created_at?: string | null
          email?: string | null
          product_id?: string | null
          project_title?: string | null
          request_id?: string | null
          status?: string | null
          timeline_preference?: string | null
          urgency_level?: string | null
          user_id?: string | null
        }
        Update: {
          budget_range?: string | null
          created_at?: string | null
          email?: string | null
          product_id?: string | null
          project_title?: string | null
          request_id?: string | null
          status?: string | null
          timeline_preference?: string | null
          urgency_level?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customization_requests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_list_briefs: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_order?: string
          p_statuses?: string[]
        }
        Returns: {
          assured_mode: boolean | null
          brief_id: string | null
          budget_range: string | null
          candidate_count: number | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          matched_at: string | null
          matched_expert_id: string | null
          matching_results: Json | null
          origin: string | null
          origin_id: string | null
          project_title: string | null
          proposal_json: Json | null
          status: string | null
          structured_brief: Json | null
          timeline_preference: string | null
          updated_at: string | null
          urgency_level: string | null
        }[]
      }
      admin_list_freelancers: {
        Args: {
          p_filters?: Json
          p_limit?: number
          p_offset?: number
          p_order?: string
        }
        Returns: {
          active_projects: number
          availability_weekly_hours: number
          completed_projects: number
          created_at: string
          csat_avg: number
          email: string
          full_name: string
          price_band_max: number
          price_band_min: number
          skills: string[]
          total: number
          user_id: string
        }[]
      }
      admin_list_projects: {
        Args: {
          p_filters?: Json
          p_limit?: number
          p_offset?: number
          p_order?: string
        }
        Returns: {
          agency_id: string
          created_at: string
          currency: string
          deliverables_count: number
          milestones_count: number
          org_id: string
          project_id: string
          qa_reviews_count: number
          status: string
          teamsmith_user_id: string
          title: string
          total: number
          total_price: number
        }[]
      }
      admin_list_quotes: {
        Args: {
          p_filters?: Json
          p_limit?: number
          p_offset?: number
          p_order?: string
        }
        Returns: {
          budget_range: string
          created_at: string
          created_by: string
          currency: string
          project_title: string
          quote_id: string
          request_id: string
          status: string
          total: number
          total_amount: number
          user_id: string
          valid_until: string
        }[]
      }
      create_notification: {
        Args: {
          p_message: string
          p_related_id?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      get_project_id_from_deliverable: {
        Args: { _deliverable_id: string }
        Returns: string
      }
      get_project_id_from_document: {
        Args: { _document_id: string }
        Returns: string
      }
      get_project_id_from_milestone: {
        Args: { _milestone_id: string }
        Returns: string
      }
      get_projects_for_user: {
        Args: { _uid: string }
        Returns: {
          agency_id: string | null
          created_at: string | null
          currency: string | null
          id: string
          is_custom: boolean | null
          org_id: string | null
          product_snapshot_id: string | null
          status: string | null
          teamsmith_user_id: string | null
          title: string
          total_price: number | null
        }[]
      }
      get_public_settings: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      is_admin: {
        Args: { _uid: string }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_project_participant: {
        Args: { _project_id: string; _uid: string }
        Returns: boolean
      }
      link_briefs_to_user_by_email: {
        Args: { _email: string; _user_id: string }
        Returns: undefined
      }
      update_admin_setting: {
        Args: { p_key: string; p_value: Json }
        Returns: undefined
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
