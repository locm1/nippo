import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      nippo: {
        Row: {
          id: string
          content: string
          is_public: boolean
          created_at: string
          updated_at: string
          user_id: string
          images: string[] | null
          report_date: string
        }
        Insert: {
          id?: string
          content: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
          user_id: string
          images?: string[] | null
          report_date?: string
        }
        Update: {
          id?: string
          content?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
          user_id?: string
          images?: string[] | null
          report_date?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}