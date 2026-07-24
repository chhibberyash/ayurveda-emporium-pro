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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          country: string
          created_at: string
          full_name: string
          id: string
          is_default: boolean
          line1: string
          line2: string | null
          phone: string
          postal_code: string
          state: string
          user_id: string
        }
        Insert: {
          city: string
          country?: string
          created_at?: string
          full_name: string
          id?: string
          is_default?: boolean
          line1: string
          line2?: string | null
          phone: string
          postal_code: string
          state: string
          user_id: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          full_name?: string
          id?: string
          is_default?: boolean
          line1?: string
          line2?: string | null
          phone?: string
          postal_code?: string
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          sender_id: string | null
          sender_role: string
          thread_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          sender_id?: string | null
          sender_role: string
          thread_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          sender_id?: string | null
          sender_role?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
        Row: {
          created_at: string
          guest_email: string | null
          guest_name: string | null
          id: string
          last_message_at: string
          status: string
          subject: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          last_message_at?: string
          status?: string
          subject?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          last_message_at?: string
          status?: string
          subject?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          min_order: number
          usage_limit: number | null
          used_count: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          min_order?: number
          usage_limit?: number | null
          used_count?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          min_order?: number
          usage_limit?: number | null
          used_count?: number
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          order_id: string
          price: number
          product_id: string | null
          product_name: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          order_id: string
          price: number
          product_id?: string | null
          product_name: string
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          order_id?: string
          price?: number
          product_id?: string | null
          product_name?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          coupon_code: string | null
          created_at: string
          discount: number
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: string
          shipping: number
          shipping_address: Json | null
          status: string
          subtotal: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          coupon_code?: string | null
          created_at?: string
          discount?: number
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string
          shipping?: number
          shipping_address?: Json | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          coupon_code?: string | null
          created_at?: string
          discount?: number
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string
          shipping?: number
          shipping_address?: Json | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          content: string
          id: string
          published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          id?: string
          published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          id?: string
          published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_gateways: {
        Row: {
          config: Json
          created_at: string
          display_name: string
          enabled: boolean
          id: string
          mode: string
          provider: string
          public_key: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          display_name: string
          enabled?: boolean
          id?: string
          mode?: string
          provider: string
          public_key?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          display_name?: string
          enabled?: boolean
          id?: string
          mode?: string
          provider?: string
          public_key?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          benefits: string | null
          category_id: string | null
          compare_at_price: number | null
          created_at: string
          description: string | null
          featured: boolean
          id: string
          image_url: string | null
          images: Json
          ingredients: string | null
          name: string
          price: number
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          slug: string
          stock: number
          tags: string[]
          updated_at: string
        }
        Insert: {
          active?: boolean
          benefits?: string | null
          category_id?: string | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          images?: Json
          ingredients?: string | null
          name: string
          price?: number
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug: string
          stock?: number
          tags?: string[]
          updated_at?: string
        }
        Update: {
          active?: boolean
          benefits?: string | null
          category_id?: string | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          image_url?: string | null
          images?: Json
          ingredients?: string | null
          name?: string
          price?: number
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug?: string
          stock?: number
          tags?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          blocked: boolean
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          blocked?: boolean
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          blocked?: boolean
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          about_snippet: string | null
          address: string | null
          contact_email: string
          contact_phone: string
          currency: string
          currency_symbol: string
          footer_text: string | null
          free_shipping_threshold: number
          hero_image_url: string | null
          hero_subtitle: string | null
          hero_title: string | null
          id: number
          logo_url: string | null
          shipping_flat_rate: number
          site_name: string
          social_facebook: string | null
          social_instagram: string | null
          social_twitter: string | null
          tagline: string
          updated_at: string
        }
        Insert: {
          about_snippet?: string | null
          address?: string | null
          contact_email?: string
          contact_phone?: string
          currency?: string
          currency_symbol?: string
          footer_text?: string | null
          free_shipping_threshold?: number
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: number
          logo_url?: string | null
          shipping_flat_rate?: number
          site_name?: string
          social_facebook?: string | null
          social_instagram?: string | null
          social_twitter?: string | null
          tagline?: string
          updated_at?: string
        }
        Update: {
          about_snippet?: string | null
          address?: string | null
          contact_email?: string
          contact_phone?: string
          currency?: string
          currency_symbol?: string
          footer_text?: string | null
          free_shipping_threshold?: number
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: number
          logo_url?: string | null
          shipping_flat_rate?: number
          site_name?: string
          social_facebook?: string | null
          social_instagram?: string | null
          social_twitter?: string | null
          tagline?: string
          updated_at?: string
        }
        Relationships: []
      }
      theme_settings: {
        Row: {
          accent_color: string
          background_color: string
          body_font: string
          foreground_color: string
          heading_font: string
          id: number
          primary_color: string
          radius: string
          updated_at: string
        }
        Insert: {
          accent_color?: string
          background_color?: string
          body_font?: string
          foreground_color?: string
          heading_font?: string
          id?: number
          primary_color?: string
          radius?: string
          updated_at?: string
        }
        Update: {
          accent_color?: string
          background_color?: string
          body_font?: string
          foreground_color?: string
          heading_font?: string
          id?: number
          primary_color?: string
          radius?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "customer"
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
      app_role: ["admin", "customer"],
    },
  },
} as const
