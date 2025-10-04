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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_detection_results: {
        Row: {
          ai_probability: number
          analysis_summary: string | null
          confidence_score: number
          created_at: string
          detected_patterns: Json | null
          detection_service: string
          document_content: string
          document_name: string
          human_probability: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_probability: number
          analysis_summary?: string | null
          confidence_score: number
          created_at?: string
          detected_patterns?: Json | null
          detection_service: string
          document_content: string
          document_name: string
          human_probability: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_probability?: number
          analysis_summary?: string | null
          confidence_score?: number
          created_at?: string
          detected_patterns?: Json | null
          detection_service?: string
          document_content?: string
          document_name?: string
          human_probability?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          replied_at: string | null
          service: string | null
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          replied_at?: string | null
          service?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          replied_at?: string | null
          service?: string | null
          status?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: number
          title: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: never
          title?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: never
          title?: string | null
        }
        Relationships: []
      }
      email_integrations: {
        Row: {
          created_at: string
          encrypted_access_token: string | null
          encrypted_refresh_token: string | null
          encryption_key_id: string | null
          id: string
          is_connected: boolean | null
          last_sync: string | null
          provider: string
          sync_settings: Json | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          encrypted_access_token?: string | null
          encrypted_refresh_token?: string | null
          encryption_key_id?: string | null
          id?: string
          is_connected?: boolean | null
          last_sync?: string | null
          provider?: string
          sync_settings?: Json | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          encrypted_access_token?: string | null
          encrypted_refresh_token?: string | null
          encryption_key_id?: string | null
          id?: string
          is_connected?: boolean | null
          last_sync?: string | null
          provider?: string
          sync_settings?: Json | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          company: string
          created_at: string
          date_applied: string
          description: string | null
          id: string
          job_title: string
          job_url: string | null
          last_update: string
          location: string | null
          notes: string | null
          salary: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company: string
          created_at?: string
          date_applied?: string
          description?: string | null
          id?: string
          job_title: string
          job_url?: string | null
          last_update?: string
          location?: string | null
          notes?: string | null
          salary?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string
          date_applied?: string
          description?: string | null
          id?: string
          job_title?: string
          job_url?: string | null
          last_update?: string
          location?: string | null
          notes?: string | null
          salary?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: number | null
          created_at: string | null
          id: number
          sender_id: string | null
        }
        Insert: {
          content: string
          conversation_id?: number | null
          created_at?: string | null
          id?: never
          sender_id?: string | null
        }
        Update: {
          content?: string
          conversation_id?: number | null
          created_at?: string | null
          id?: never
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      password_check_events: {
        Row: {
          created_at: string
          id: number
          password_verified: boolean
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: never
          password_verified?: boolean
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: never
          password_verified?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          preferences: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          preferences?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          identifier: string
          request_count: number
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          identifier: string
          request_count?: number
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          identifier?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          created_at: string
          education: Json | null
          experience: Json | null
          id: string
          is_public: boolean | null
          personal_info: Json
          share_token: string | null
          skills: Json | null
          summary: string | null
          template_name: string | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          education?: Json | null
          experience?: Json | null
          id?: string
          is_public?: boolean | null
          personal_info: Json
          share_token?: string | null
          skills?: Json | null
          summary?: string | null
          template_name?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          education?: Json | null
          experience?: Json | null
          id?: string
          is_public?: boolean | null
          personal_info?: Json
          share_token?: string | null
          skills?: Json | null
          summary?: string | null
          template_name?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          actual_cost: number | null
          attachments: Json | null
          client_email: string
          client_name: string
          client_phone: string
          completion_date: string | null
          created_at: string
          description: string
          estimated_completion_date: string | null
          estimated_cost: number | null
          id: string
          notes: string | null
          priority: string
          service_category: string
          service_type: string
          status: string
          updated_at: string
        }
        Insert: {
          actual_cost?: number | null
          attachments?: Json | null
          client_email: string
          client_name: string
          client_phone: string
          completion_date?: string | null
          created_at?: string
          description: string
          estimated_completion_date?: string | null
          estimated_cost?: number | null
          id?: string
          notes?: string | null
          priority?: string
          service_category: string
          service_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          actual_cost?: number | null
          attachments?: Json | null
          client_email?: string
          client_name?: string
          client_phone?: string
          completion_date?: string | null
          created_at?: string
          description?: string
          estimated_completion_date?: string | null
          estimated_cost?: number | null
          id?: string
          notes?: string | null
          priority?: string
          service_category?: string
          service_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_contact_messages: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_old_rate_limits: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      decrypt_token: {
        Args: { encrypted_token: string; encryption_key: string }
        Returns: string
      }
      disconnect_email_integration: {
        Args: { p_provider: string; p_user_id: string }
        Returns: boolean
      }
      encrypt_token: {
        Args: { token_value: string }
        Returns: string
      }
      filter_sensitive_resume_data: {
        Args: { resume_row: Database["public"]["Tables"]["resumes"]["Row"] }
        Returns: {
          created_at: string
          education: Json
          experience: Json
          id: string
          is_public: boolean
          personal_info: Json
          share_token: string
          skills: Json
          summary: string
          template_name: string
          title: string
          updated_at: string
        }[]
      }
      get_decrypted_tokens: {
        Args: { p_provider: string; p_user_id: string }
        Returns: {
          access_token: string
          refresh_token: string
          token_expires_at: string
        }[]
      }
      get_public_resume_by_token: {
        Args: { token_param: string }
        Returns: {
          created_at: string
          education: Json
          experience: Json
          id: string
          is_public: boolean
          personal_info: Json
          share_token: string
          skills: Json
          summary: string
          template_name: string
          title: string
          updated_at: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      log_admin_access: {
        Args: {
          p_action: string
          p_details?: Json
          p_record_id?: string
          p_table_name: string
        }
        Returns: undefined
      }
      store_encrypted_tokens: {
        Args: {
          p_access_token: string
          p_provider: string
          p_refresh_token: string
          p_token_expires_at: string
          p_user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
