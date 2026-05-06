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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          business_hours: Json | null
          delivery_base_radius_km: number | null
          delivery_fee: number | null
          delivery_fee_base: number | null
          delivery_fee_per_km: number | null
          delivery_max_radius_km: number | null
          id: string
          installment_max: number | null
          installment_min_value: number | null
          store_address: string | null
          store_lat: number | null
          store_lng: number | null
          store_open: boolean | null
          store_phone: string | null
        }
        Insert: {
          business_hours?: Json | null
          delivery_base_radius_km?: number | null
          delivery_fee?: number | null
          delivery_fee_base?: number | null
          delivery_fee_per_km?: number | null
          delivery_max_radius_km?: number | null
          id?: string
          installment_max?: number | null
          installment_min_value?: number | null
          store_address?: string | null
          store_lat?: number | null
          store_lng?: number | null
          store_open?: boolean | null
          store_phone?: string | null
        }
        Update: {
          business_hours?: Json | null
          delivery_base_radius_km?: number | null
          delivery_fee?: number | null
          delivery_fee_base?: number | null
          delivery_fee_per_km?: number | null
          delivery_max_radius_km?: number | null
          id?: string
          installment_max?: number | null
          installment_min_value?: number | null
          store_address?: string | null
          store_lat?: number | null
          store_lng?: number | null
          store_open?: boolean | null
          store_phone?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean | null
          created_at: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          address: Json
          asaas_customer_id: string | null
          asaas_payment_id: string | null
          change_for: number | null
          created_at: string | null
          customer_cpf: string | null
          customer_name: string
          customer_phone: string
          delivery_fee: number
          id: string
          invoice_url: string | null
          items: Json
          needs_change: boolean | null
          notes: string | null
          order_number: number
          order_status: Database["public"]["Enums"]["order_status_type"]
          order_token: string
          payment_method: Database["public"]["Enums"]["payment_method_type"]
          payment_status: Database["public"]["Enums"]["payment_status_type"]
          pix_copy_paste: string | null
          pix_expire_date: string | null
          pix_qr_code: string | null
          subtotal: number
          total: number
          updated_at: string | null
        }
        Insert: {
          address?: Json
          asaas_customer_id?: string | null
          asaas_payment_id?: string | null
          change_for?: number | null
          created_at?: string | null
          customer_cpf?: string | null
          customer_name: string
          customer_phone: string
          delivery_fee?: number
          id?: string
          invoice_url?: string | null
          items?: Json
          needs_change?: boolean | null
          notes?: string | null
          order_number?: number
          order_status?: Database["public"]["Enums"]["order_status_type"]
          order_token?: string
          payment_method?: Database["public"]["Enums"]["payment_method_type"]
          payment_status?: Database["public"]["Enums"]["payment_status_type"]
          pix_copy_paste?: string | null
          pix_expire_date?: string | null
          pix_qr_code?: string | null
          subtotal?: number
          total?: number
          updated_at?: string | null
        }
        Update: {
          address?: Json
          asaas_customer_id?: string | null
          asaas_payment_id?: string | null
          change_for?: number | null
          created_at?: string | null
          customer_cpf?: string | null
          customer_name?: string
          customer_phone?: string
          delivery_fee?: number
          id?: string
          invoice_url?: string | null
          items?: Json
          needs_change?: boolean | null
          notes?: string | null
          order_number?: number
          order_status?: Database["public"]["Enums"]["order_status_type"]
          order_token?: string
          payment_method?: Database["public"]["Enums"]["payment_method_type"]
          payment_status?: Database["public"]["Enums"]["payment_status_type"]
          pix_copy_paste?: string | null
          pix_expire_date?: string | null
          pix_qr_code?: string | null
          subtotal?: number
          total?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean | null
          category_id: string | null
          created_at: string | null
          description: string | null
          featured: boolean | null
          id: string
          images: string[] | null
          price: number
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          price?: number
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          images?: string[] | null
          price?: number
          slug?: string
          title?: string
          updated_at?: string | null
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
      rate_limit: {
        Row: {
          count: number
          key: string
          window_start: string
        }
        Insert: {
          count?: number
          key: string
          window_start?: string
        }
        Update: {
          count?: number
          key?: string
          window_start?: string
        }
        Relationships: []
      }
      store_customization: {
        Row: {
          footer_address: string | null
          footer_hours: Json | null
          footer_phone: string | null
          hero_cta_link: string | null
          hero_cta_text: string | null
          hero_subtitle: string | null
          hero_title: string | null
          id: string
          promo_bar_text: string | null
          whatsapp_message: string | null
          whatsapp_number: string | null
        }
        Insert: {
          footer_address?: string | null
          footer_hours?: Json | null
          footer_phone?: string | null
          hero_cta_link?: string | null
          hero_cta_text?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          promo_bar_text?: string | null
          whatsapp_message?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          footer_address?: string | null
          footer_hours?: Json | null
          footer_phone?: string | null
          hero_cta_link?: string | null
          hero_cta_text?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          promo_bar_text?: string | null
          whatsapp_message?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: { p_key: string; p_max: number; p_window_seconds: number }
        Returns: boolean
      }
      get_order_by_token: {
        Args: { p_id: string; p_token: string }
        Returns: {
          address: Json
          asaas_customer_id: string | null
          asaas_payment_id: string | null
          change_for: number | null
          created_at: string | null
          customer_cpf: string | null
          customer_name: string
          customer_phone: string
          delivery_fee: number
          id: string
          invoice_url: string | null
          items: Json
          needs_change: boolean | null
          notes: string | null
          order_number: number
          order_status: Database["public"]["Enums"]["order_status_type"]
          order_token: string
          payment_method: Database["public"]["Enums"]["payment_method_type"]
          payment_status: Database["public"]["Enums"]["payment_status_type"]
          pix_copy_paste: string | null
          pix_expire_date: string | null
          pix_qr_code: string | null
          subtotal: number
          total: number
          updated_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_trending_products: {
        Args: { days_back?: number; max_results?: number }
        Returns: {
          product_id: string
          total_sold: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      search_products: {
        Args: { search_term: string }
        Returns: {
          active: boolean | null
          category_id: string | null
          created_at: string | null
          description: string | null
          featured: boolean | null
          id: string
          images: string[] | null
          price: number
          slug: string
          title: string
          updated_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "products"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "manager"
      order_status_type:
        | "received"
        | "preparing"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
      payment_method_type:
        | "pix"
        | "cartao_online"
        | "dinheiro_entrega"
        | "cartao_entrega"
      payment_status_type:
        | "pending"
        | "paid"
        | "delivery_payment"
        | "failed"
        | "refunded"
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
      app_role: ["admin", "manager"],
      order_status_type: [
        "received",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      payment_method_type: [
        "pix",
        "cartao_online",
        "dinheiro_entrega",
        "cartao_entrega",
      ],
      payment_status_type: [
        "pending",
        "paid",
        "delivery_payment",
        "failed",
        "refunded",
      ],
    },
  },
} as const
