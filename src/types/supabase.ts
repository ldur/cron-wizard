
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
          flexible_time_window_mode: 'OFF' | 'FLEXIBLE'
          flexible_window_minutes: number | null
        }
        Insert: {
          id?: string
          name: string
          command: string
          cron_expression: string
          status?: 'active' | 'paused'
          created_at?: string
          updated_at?: string
          flexible_time_window_mode?: 'OFF' | 'FLEXIBLE'
          flexible_window_minutes?: number | null
        }
        Update: {
          id?: string
          name?: string
          command?: string
          cron_expression?: string
          status?: 'active' | 'paused'
          created_at?: string
          updated_at?: string
          flexible_time_window_mode?: 'OFF' | 'FLEXIBLE'
          flexible_window_minutes?: number | null
        }
      }
    }
  }
}
