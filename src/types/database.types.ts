export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointment_items: {
        Row: {
          appointment_id: number
          combo_id: number | null
          duration_minutes: number
          id: number
          price: number
          service_id: number | null
        }
        Insert: {
          appointment_id: number
          combo_id?: number | null
          duration_minutes: number
          id?: number
          price: number
          service_id?: number | null
        }
        Update: {
          appointment_id?: number
          combo_id?: number | null
          duration_minutes?: number
          id?: number
          price?: number
          service_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_items_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_items_combo_id_fkey"
            columns: ["combo_id"]
            isOneToOne: false
            referencedRelation: "service_combos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          client_id: number | null
          company_id: number
          created_at: string | null
          employee_id: number
          end_time: string
          id: number
          notes: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          start_time: string
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string | null
        }
        Insert: {
          client_id?: number | null
          company_id: number
          created_at?: string | null
          employee_id: number
          end_time: string
          id?: number
          notes?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          start_time: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string | null
        }
        Update: {
          client_id?: number | null
          company_id?: number
          created_at?: string | null
          employee_id?: number
          end_time?: string
          id?: number
          notes?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          start_time?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_settings: {
        Row: {
          api_keys: Json | null
          company_id: number
          id: number
          is_active: boolean | null
          messages: Json | null
          provider: string | null
          updated_at: string | null
        }
        Insert: {
          api_keys?: Json | null
          company_id: number
          id?: number
          is_active?: boolean | null
          messages?: Json | null
          provider?: string | null
          updated_at?: string | null
        }
        Update: {
          api_keys?: Json | null
          company_id?: number
          id?: number
          is_active?: boolean | null
          messages?: Json | null
          provider?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bot_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          company_id: number
          created_at: string | null
          email: string | null
          id: number
          is_active: boolean | null
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          company_id: number
          created_at?: string | null
          email?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: number
          created_at?: string | null
          email?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          allow_discount: boolean | null
          allow_surcharge: boolean | null
          created_at: string | null
          document: string | null
          id: number
          logo_url: string | null
          max_discount_type:
            | Database["public"]["Enums"]["discount_surcharge_type"]
            | null
          max_discount_value: number | null
          max_surcharge_type:
            | Database["public"]["Enums"]["discount_surcharge_type"]
            | null
          max_surcharge_value: number | null
          name: string
          phone: string | null
          updated_at: string | null
          user_id: string
          working_hours: Json | null
        }
        Insert: {
          allow_discount?: boolean | null
          allow_surcharge?: boolean | null
          created_at?: string | null
          document?: string | null
          id?: number
          logo_url?: string | null
          max_discount_type?:
            | Database["public"]["Enums"]["discount_surcharge_type"]
            | null
          max_discount_value?: number | null
          max_surcharge_type?:
            | Database["public"]["Enums"]["discount_surcharge_type"]
            | null
          max_surcharge_value?: number | null
          name: string
          phone?: string | null
          updated_at?: string | null
          user_id: string
          working_hours?: Json | null
        }
        Update: {
          allow_discount?: boolean | null
          allow_surcharge?: boolean | null
          created_at?: string | null
          document?: string | null
          id?: number
          logo_url?: string | null
          max_discount_type?:
            | Database["public"]["Enums"]["discount_surcharge_type"]
            | null
          max_discount_value?: number | null
          max_surcharge_type?:
            | Database["public"]["Enums"]["discount_surcharge_type"]
            | null
          max_surcharge_value?: number | null
          name?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string
          working_hours?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_services: {
        Row: {
          employee_id: number
          service_id: number
        }
        Insert: {
          employee_id: number
          service_id: number
        }
        Update: {
          employee_id?: number
          service_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "employee_services_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_specialties: {
        Row: {
          employee_id: number
          specialty_id: number
        }
        Insert: {
          employee_id: number
          specialty_id: number
        }
        Update: {
          employee_id?: number
          specialty_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "employee_specialties_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_specialties_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          company_id: number
          created_at: string | null
          email: string | null
          id: number
          is_active: boolean | null
          name: string
          phone: string | null
          product_commission: number
          service_commission: number
          updated_at: string | null
          working_hours: Json | null
        }
        Insert: {
          company_id: number
          created_at?: string | null
          email?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          phone?: string | null
          product_commission?: number
          service_commission?: number
          updated_at?: string | null
          working_hours?: Json | null
        }
        Update: {
          company_id?: number
          created_at?: string | null
          email?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          phone?: string | null
          product_commission?: number
          service_commission?: number
          updated_at?: string | null
          working_hours?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          amount: number
          category: string | null
          company_id: number
          created_at: string | null
          description: string
          due_date: string | null
          id: number
          is_recurring: boolean | null
          sale_id: number | null
          status: Database["public"]["Enums"]["financial_transaction_status"]
          transaction_date: string | null
          type: Database["public"]["Enums"]["financial_transaction_type"]
        }
        Insert: {
          amount: number
          category?: string | null
          company_id: number
          created_at?: string | null
          description: string
          due_date?: string | null
          id?: number
          is_recurring?: boolean | null
          sale_id?: number | null
          status: Database["public"]["Enums"]["financial_transaction_status"]
          transaction_date?: string | null
          type: Database["public"]["Enums"]["financial_transaction_type"]
        }
        Update: {
          amount?: number
          category?: string | null
          company_id?: number
          created_at?: string | null
          description?: string
          due_date?: string | null
          id?: number
          is_recurring?: boolean | null
          sale_id?: number | null
          status?: Database["public"]["Enums"]["financial_transaction_status"]
          transaction_date?: string | null
          type?: Database["public"]["Enums"]["financial_transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          company_id: number
          created_at: string | null
          description: string | null
          id: number
          is_active: boolean | null
          name: string
        }
        Insert: {
          company_id: number
          created_at?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          name: string
        }
        Update: {
          company_id?: number
          created_at?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      product_combo_items: {
        Row: {
          combo_id: number
          product_id: number
        }
        Insert: {
          combo_id: number
          product_id: number
        }
        Update: {
          combo_id?: number
          product_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_combo_items_combo_id_fkey"
            columns: ["combo_id"]
            isOneToOne: false
            referencedRelation: "product_combos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_combo_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_combos: {
        Row: {
          company_id: number
          created_at: string | null
          id: number
          is_active: boolean | null
          name: string
          price: number
        }
        Insert: {
          company_id: number
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          price: number
        }
        Update: {
          company_id?: number
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_combos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          company_id: number
          control_stock: boolean | null
          cost_price: number | null
          created_at: string | null
          id: number
          is_active: boolean | null
          name: string
          sale_price: number
          stock_min_threshold: number | null
          stock_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          company_id: number
          control_stock?: boolean | null
          cost_price?: number | null
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          sale_price: number
          stock_min_threshold?: number | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          company_id?: number
          control_stock?: boolean | null
          cost_price?: number | null
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          sale_price?: number
          stock_min_threshold?: number | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          email: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_items: {
        Row: {
          id: number
          item_name: string
          product_combo_id: number | null
          product_id: number | null
          quantity: number
          sale_id: number
          service_combo_id: number | null
          service_id: number | null
          total_price: number
          unit_price: number
        }
        Insert: {
          id?: number
          item_name: string
          product_combo_id?: number | null
          product_id?: number | null
          quantity?: number
          sale_id: number
          service_combo_id?: number | null
          service_id?: number | null
          total_price: number
          unit_price: number
        }
        Update: {
          id?: number
          item_name?: string
          product_combo_id?: number | null
          product_id?: number | null
          quantity?: number
          sale_id?: number
          service_combo_id?: number | null
          service_id?: number | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_combo_id_fkey"
            columns: ["product_combo_id"]
            isOneToOne: false
            referencedRelation: "product_combos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_service_combo_id_fkey"
            columns: ["service_combo_id"]
            isOneToOne: false
            referencedRelation: "service_combos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          appointment_id: number | null
          client_id: number | null
          company_id: number
          created_at: string | null
          discount_type:
            | Database["public"]["Enums"]["discount_surcharge_type"]
            | null
          discount_value: number | null
          employee_id: number
          id: number
          payment_method_id: number | null
          subtotal: number
          surcharge_type:
            | Database["public"]["Enums"]["discount_surcharge_type"]
            | null
          surcharge_value: number | null
          total: number
        }
        Insert: {
          appointment_id?: number | null
          client_id?: number | null
          company_id: number
          created_at?: string | null
          discount_type?:
            | Database["public"]["Enums"]["discount_surcharge_type"]
            | null
          discount_value?: number | null
          employee_id: number
          id?: number
          payment_method_id?: number | null
          subtotal: number
          surcharge_type?:
            | Database["public"]["Enums"]["discount_surcharge_type"]
            | null
          surcharge_value?: number | null
          total: number
        }
        Update: {
          appointment_id?: number | null
          client_id?: number | null
          company_id?: number
          created_at?: string | null
          discount_type?:
            | Database["public"]["Enums"]["discount_surcharge_type"]
            | null
          discount_value?: number | null
          employee_id?: number
          id?: number
          payment_method_id?: number | null
          subtotal?: number
          surcharge_type?:
            | Database["public"]["Enums"]["discount_surcharge_type"]
            | null
          surcharge_value?: number | null
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      service_combo_items: {
        Row: {
          combo_id: number
          service_id: number
        }
        Insert: {
          combo_id: number
          service_id: number
        }
        Update: {
          combo_id?: number
          service_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_combo_items_combo_id_fkey"
            columns: ["combo_id"]
            isOneToOne: false
            referencedRelation: "service_combos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_combo_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_combos: {
        Row: {
          company_id: number
          created_at: string | null
          id: number
          is_active: boolean | null
          name: string
          price: number
        }
        Insert: {
          company_id: number
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          name: string
          price: number
        }
        Update: {
          company_id?: number
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_combos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          company_id: number
          created_at: string | null
          duration_minutes: number
          id: number
          is_active: boolean | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          company_id: number
          created_at?: string | null
          duration_minutes: number
          id?: number
          is_active?: boolean | null
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          company_id?: number
          created_at?: string | null
          duration_minutes?: number
          id?: number
          is_active?: boolean | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      specialties: {
        Row: {
          company_id: number
          created_at: string | null
          description: string | null
          id: number
          is_active: boolean | null
          name: string
        }
        Insert: {
          company_id: number
          created_at?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          name: string
        }
        Update: {
          company_id?: number
          created_at?: string | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialties_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      appointment_status: "agendado" | "concluido" | "cancelado" | "no-show"
      discount_surcharge_type: "fixed" | "percent"
      financial_transaction_status:
        | "pendente"
        | "pago"
        | "recebido"
        | "vencido"
      financial_transaction_type: "receita" | "despesa"
      payment_status: "pago" | "pendente"
      user_role: "admin" | "manager" | "seller"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never
