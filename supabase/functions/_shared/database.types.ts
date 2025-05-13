
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      cron_jobs: {
        Row: {
          id: string
          name: string
          command: string
          schedule_expression: string
          status: string
          created_at: string | null
          updated_at: string | null
          flexible_time_window_mode: 'OFF' | 'FLEXIBLE'
          flexible_window_minutes: number | null
          group_id: string | null
          target_type: string
          target_config: Json | null
          is_api: boolean
          sdk_code: string | null
          endpoint_name: string | null
          iac_code: string | null
          timezone: string | null
          tags: string[]
          description: string | null
          start_time: string | null
          end_time: string | null
        }
      }
      job_history: {
        Row: {
          id: string
          job_id: string
          status: string
          start_time: string
          end_time: string | null
          runtime_seconds: number | null
          created_at: string | null
          updated_at: string | null
          status_text: string | null
        }
      }
      schedule_groups: {
        Row: {
          id: string
          name: string
          icon_name: string
          created_at: string
          updated_at: string
        }
      }
      settings: {
        Row: {
          id: string
          name: string
          iac_description: string
          iac_code: string | null
          time_zone: string
          time_zone_description: string | null
          target_templates: Json | null
          created_at: string
          updated_at: string
        }
      }
    }
  }
}
