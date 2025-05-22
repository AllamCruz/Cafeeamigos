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
      categories: {
        Row: {
          id: string
          name: string
          order: number
          parent_category_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          order?: number
          parent_category_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          order?: number
          parent_category_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          category_id: string
          image_url: string | null
          sizes: Json[]
          is_on_sale: boolean
          is_most_requested: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          category_id: string
          image_url?: string | null
          sizes?: Json[]
          is_on_sale?: boolean
          is_most_requested?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          category_id?: string
          image_url?: string | null
          sizes?: Json[]
          is_on_sale?: boolean
          is_most_requested?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    storage: {
      Buckets: {
        'menu-items': {
          allowedMimeTypes: ['image/*']
          maxFileSize: 5242880 // 5MB
        }
      }
    }
  }
}