import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          name: string
          email: string
          phone_number: string | null
          salesperson: string | null
          status: string
          dress: string | null
          maker: string | null
          skraedder: string | null
          size_bryst: number | null
          size_talje: number | null
          size_hofte: number | null
          size_arms: number | null
          size_height: number | null
          invoice_status: string
          invoice_file_url: string | null
          supplier_file_url: string | null
          notes: string | null
          wedding_date: string | null
          date_added: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone_number?: string | null
          salesperson?: string | null
          status?: string
          dress?: string | null
          maker?: string | null
          skraedder?: string | null
          size_bryst?: number | null
          size_talje?: number | null
          size_hofte?: number | null
          size_arms?: number | null
          size_height?: number | null
          invoice_status?: string
          invoice_file_url?: string | null
          supplier_file_url?: string | null
          notes?: string | null
          wedding_date?: string | null
          date_added?: string
          created_by: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone_number?: string | null
          salesperson?: string | null
          status?: string
          dress?: string | null
          maker?: string | null
          skraedder?: string | null
          size_bryst?: number | null
          size_talje?: number | null
          size_hofte?: number | null
          size_arms?: number | null
          size_height?: number | null
          invoice_status?: string
          invoice_file_url?: string | null
          supplier_file_url?: string | null
          notes?: string | null
          wedding_date?: string | null
          date_added?: string
          created_by?: string
          updated_at?: string
        }
      }
    }
  }
}