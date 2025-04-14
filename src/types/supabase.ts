
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
          cron_expression: string
          status: 'active' | 'paused'
          created_at: string
          updated_at: string
          is_api: boolean
          endpoint_name: string | null
          iac_code: string | null
          group_id: string | null
        }
        Insert: {
          id?: string
          name: string
          command: string
          cron_expression: string
          status?: 'active' | 'paused'
          created_at?: string
          updated_at?: string
          is_api?: boolean
          endpoint_name?: string | null
          iac_code?: string | null
          group_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          command?: string
          cron_expression?: string
          status?: 'active' | 'paused'
          created_at?: string
          updated_at?: string
          is_api?: boolean
          endpoint_name?: string | null
          iac_code?: string | null
          group_id?: string | null
        }
      }
      schedule_groups: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
