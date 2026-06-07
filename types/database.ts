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
      products: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          price: number | null
          sale_price: number | null
          affiliate_link: string | null
          category_id: string | null
          image_urls: string[]
          why_victory: string | null
          item_type: 'curated' | 'shop' | 'archive'
          is_featured: boolean
          is_active: boolean
          curator_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description?: string | null
          price?: number | null
          sale_price?: number | null
          affiliate_link?: string | null
          category_id?: string | null
          image_urls?: string[]
          why_victory?: string | null
          item_type?: 'curated' | 'shop' | 'archive'
          is_featured?: boolean
          is_active?: boolean
          curator_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string | null
          price?: number | null
          sale_price?: number | null
          affiliate_link?: string | null
          category_id?: string | null
          image_urls?: string[]
          why_victory?: string | null
          item_type?: 'curated' | 'shop' | 'archive'
          is_featured?: boolean
          is_active?: boolean
          curator_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          display_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'curator' | 'user'
          phone: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'curator' | 'user'
          phone?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'curator' | 'user'
          phone?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      email_subscribers: {
        Row: {
          id: string
          email: string
          first_name: string | null
          source: string
          is_verified: boolean
          brevo_contact_id: string | null
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          id?: string
          email: string
          first_name?: string | null
          source?: string
          is_verified?: boolean
          brevo_contact_id?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          source?: string
          is_verified?: boolean
          brevo_contact_id?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
      }
      click_tracking: {
        Row: {
          id: string
          product_id: string
          user_id: string | null
          session_id: string | null
          referrer: string | null
          user_agent: string | null
          ip_address: string | null
          clicked_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id?: string | null
          session_id?: string | null
          referrer?: string | null
          user_agent?: string | null
          ip_address?: string | null
          clicked_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string | null
          session_id?: string | null
          referrer?: string | null
          user_agent?: string | null
          ip_address?: string | null
          clicked_at?: string
        }
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: string | null
          description: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value?: string | null
          description?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string | null
          description?: string | null
          updated_at?: string
        }
      }
    }
    Views: {
      product_analytics: {
        Row: {
          id: string | null
          name: string | null
          slug: string | null
          item_type: string | null
          is_active: boolean | null
          total_clicks: number | null
          unique_clicks: number | null
          last_clicked: string | null
        }
      }
      daily_click_stats: {
        Row: {
          date: string | null
          total_clicks: number | null
          unique_sessions: number | null
          products_clicked: number | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
