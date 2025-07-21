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
          size_bryst: string | null
          size_talje: string | null
          size_hofte: string | null
          size_arms: string | null
          size_height: string | null
          invoice_status: string
          invoice_pdf: string | null
          confirmation_pdf: string | null
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
          size_bryst?: string | null
          size_talje?: string | null
          size_hofte?: string | null
          size_arms?: string | null
          size_height?: string | null
          invoice_status?: string
          invoice_pdf?: string | null
          confirmation_pdf?: string | null
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
          size_bryst?: string | null
          size_talje?: string | null
          size_hofte?: string | null
          size_arms?: string | null
          size_height?: string | null
          invoice_status?: string
          invoice_pdf?: string | null
          confirmation_pdf?: string | null
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