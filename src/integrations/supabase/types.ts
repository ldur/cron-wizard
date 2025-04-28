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
      api_gateway_targets: {
        Row: {
          authorization_type:
            | Database["public"]["Enums"]["authorization_type"]
            | null
          body: Json | null
          endpoint_url: string
          headers: Json | null
          http_method: Database["public"]["Enums"]["http_method_type"]
          id: string
        }
        Insert: {
          authorization_type?:
            | Database["public"]["Enums"]["authorization_type"]
            | null
          body?: Json | null
          endpoint_url: string
          headers?: Json | null
          http_method: Database["public"]["Enums"]["http_method_type"]
          id: string
        }
        Update: {
          authorization_type?:
            | Database["public"]["Enums"]["authorization_type"]
            | null
          body?: Json | null
          endpoint_url?: string
          headers?: Json | null
          http_method?: Database["public"]["Enums"]["http_method_type"]
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_gateway_targets_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "cron_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      cron_jobs: {
        Row: {
          command: string
          created_at: string | null
          description: string | null
          end_time: string | null
          endpoint_name: string | null
          flexible_time_window_mode: Database["public"]["Enums"]["flexible_mode"]
          flexible_window_minutes: number | null
          group_id: string | null
          iac_code: string | null
          id: string
          is_api: boolean
          name: string
          schedule_expression: string
          start_time: string | null
          status: string
          tags: string[]
          target_type: Database["public"]["Enums"]["target_type"]
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          command: string
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          endpoint_name?: string | null
          flexible_time_window_mode?: Database["public"]["Enums"]["flexible_mode"]
          flexible_window_minutes?: number | null
          group_id?: string | null
          iac_code?: string | null
          id?: string
          is_api?: boolean
          name: string
          schedule_expression: string
          start_time?: string | null
          status: string
          tags?: string[]
          target_type: Database["public"]["Enums"]["target_type"]
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          command?: string
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          endpoint_name?: string | null
          flexible_time_window_mode?: Database["public"]["Enums"]["flexible_mode"]
          flexible_window_minutes?: number | null
          group_id?: string | null
          iac_code?: string | null
          id?: string
          is_api?: boolean
          name?: string
          schedule_expression?: string
          start_time?: string | null
          status?: string
          tags?: string[]
          target_type?: Database["public"]["Enums"]["target_type"]
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cron_jobs_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "schedule_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      ecs_targets: {
        Row: {
          cluster_arn: string
          id: string
          launch_type: Database["public"]["Enums"]["ecs_launch_type"] | null
          network_configuration: Json | null
          overrides: Json | null
          task_definition_arn: string
        }
        Insert: {
          cluster_arn: string
          id: string
          launch_type?: Database["public"]["Enums"]["ecs_launch_type"] | null
          network_configuration?: Json | null
          overrides?: Json | null
          task_definition_arn: string
        }
        Update: {
          cluster_arn?: string
          id?: string
          launch_type?: Database["public"]["Enums"]["ecs_launch_type"] | null
          network_configuration?: Json | null
          overrides?: Json | null
          task_definition_arn?: string
        }
        Relationships: [
          {
            foreignKeyName: "ecs_targets_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "cron_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      eventbridge_targets: {
        Row: {
          event_bus_arn: string
          event_payload: Json | null
          id: string
        }
        Insert: {
          event_bus_arn: string
          event_payload?: Json | null
          id: string
        }
        Update: {
          event_bus_arn?: string
          event_payload?: Json | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventbridge_targets_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "cron_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      kinesis_targets: {
        Row: {
          id: string
          partition_key: string
          payload: Json | null
          stream_arn: string
        }
        Insert: {
          id: string
          partition_key: string
          payload?: Json | null
          stream_arn: string
        }
        Update: {
          id?: string
          partition_key?: string
          payload?: Json | null
          stream_arn?: string
        }
        Relationships: [
          {
            foreignKeyName: "kinesis_targets_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "cron_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      lambda_targets: {
        Row: {
          function_arn: string
          id: string
          payload: Json | null
        }
        Insert: {
          function_arn: string
          id: string
          payload?: Json | null
        }
        Update: {
          function_arn?: string
          id?: string
          payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "lambda_targets_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "cron_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      sagemaker_targets: {
        Row: {
          hyper_parameters: Json | null
          id: string
          input_data_config: Json | null
          training_job_definition_arn: string
        }
        Insert: {
          hyper_parameters?: Json | null
          id: string
          input_data_config?: Json | null
          training_job_definition_arn: string
        }
        Update: {
          hyper_parameters?: Json | null
          id?: string
          input_data_config?: Json | null
          training_job_definition_arn?: string
        }
        Relationships: [
          {
            foreignKeyName: "sagemaker_targets_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "cron_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_groups: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string
          iac_code: string | null
          iac_description: string
          id: string
          name: string
          target_templates: Json | null
          time_zone: string
          time_zone_description: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          iac_code?: string | null
          iac_description: string
          id?: string
          name: string
          target_templates?: Json | null
          time_zone?: string
          time_zone_description?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          iac_code?: string | null
          iac_description?: string
          id?: string
          name?: string
          target_templates?: Json | null
          time_zone?: string
          time_zone_description?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sqs_targets: {
        Row: {
          id: string
          message_body: string
          message_group_id: string | null
          queue_url: string
        }
        Insert: {
          id: string
          message_body: string
          message_group_id?: string | null
          queue_url: string
        }
        Update: {
          id?: string
          message_body?: string
          message_group_id?: string | null
          queue_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "sqs_targets_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "cron_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      stepfunction_targets: {
        Row: {
          execution_role_arn: string
          id: string
          input_payload: Json | null
          state_machine_arn: string
        }
        Insert: {
          execution_role_arn: string
          id: string
          input_payload?: Json | null
          state_machine_arn: string
        }
        Update: {
          execution_role_arn?: string
          id?: string
          input_payload?: Json | null
          state_machine_arn?: string
        }
        Relationships: [
          {
            foreignKeyName: "stepfunction_targets_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "cron_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_default_timezone: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      authorization_type: "NONE" | "IAM" | "COGNITO_USER_POOLS"
      ecs_launch_type: "FARGATE" | "EC2"
      flexible_mode: "OFF" | "FLEXIBLE"
      http_method_type:
        | "GET"
        | "POST"
        | "PUT"
        | "DELETE"
        | "PATCH"
        | "HEAD"
        | "OPTIONS"
      target_type:
        | "LAMBDA"
        | "STEP_FUNCTION"
        | "API_GATEWAY"
        | "EVENTBRIDGE"
        | "SQS"
        | "ECS"
        | "KINESIS"
        | "SAGEMAKER"
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
    Enums: {
      authorization_type: ["NONE", "IAM", "COGNITO_USER_POOLS"],
      ecs_launch_type: ["FARGATE", "EC2"],
      flexible_mode: ["OFF", "FLEXIBLE"],
      http_method_type: [
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "PATCH",
        "HEAD",
        "OPTIONS",
      ],
      target_type: [
        "LAMBDA",
        "STEP_FUNCTION",
        "API_GATEWAY",
        "EVENTBRIDGE",
        "SQS",
        "ECS",
        "KINESIS",
        "SAGEMAKER",
      ],
    },
  },
} as const
