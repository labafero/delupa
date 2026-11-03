type Table<Row, Insert = Partial<Row>, Update = Partial<Insert>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export type Database = {
  __InternalSupabase: { PostgrestVersion: '14.1' }
  public: {
    Tables: {
      user_roles: Table<
        { user_id: string; role: Database['public']['Enums']['app_role']; created_at: string },
        { user_id: string; role?: Database['public']['Enums']['app_role']; created_at?: string }
      >
      profiles: Table<
        { user_id: string; email: string; created_at: string; updated_at: string },
        { user_id: string; email: string; created_at?: string; updated_at?: string }
      >
      products: Table<
        {
          id: string
          name: string
          description: string
          price_cents: number
          unit: string
          quantity_available: number
          online_limit: number
          image_path: string | null
          status: Database['public']['Enums']['product_status']
          created_at: string
          updated_at: string
        },
        {
          id?: string
          name: string
          description?: string
          price_cents: number
          unit?: string
          quantity_available?: number
          online_limit?: number
          image_path?: string | null
          status?: Database['public']['Enums']['product_status']
          created_at?: string
          updated_at?: string
        }
      >
      product_private: Table<
        { product_id: string; acquisition_cost_cents: number; updated_at: string },
        { product_id: string; acquisition_cost_cents?: number; updated_at?: string }
      >
      orders: Table<
        {
          id: string
          customer_id: string
          customer_email: string
          pickup_code: string
          status: Database['public']['Enums']['order_status']
          payment_method: Database['public']['Enums']['order_payment_method']
          payment_status: Database['public']['Enums']['order_payment_status']
          fulfillment: Database['public']['Enums']['order_fulfillment']
          delivery_address: string | null
          pickup_location: string | null
          delivery_instructions: string | null
          total_cents: number
          created_by: string
          created_at: string
          updated_at: string
        },
        {
          id?: string
          customer_id: string
          customer_email: string
          pickup_code?: string
          status?: Database['public']['Enums']['order_status']
          payment_method: Database['public']['Enums']['order_payment_method']
          payment_status?: Database['public']['Enums']['order_payment_status']
          fulfillment: Database['public']['Enums']['order_fulfillment']
          delivery_address?: string | null
          pickup_location?: string | null
          delivery_instructions?: string | null
          total_cents?: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
      >
      order_items: Table<
        {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          unit: string
          quantity: number
          unit_price_cents: number
          line_total_cents: number
        },
        {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          unit: string
          quantity: number
          unit_price_cents: number
          line_total_cents?: never
        }
      >
      order_status_history: Table<
        {
          id: number
          order_id: string
          old_status: Database['public']['Enums']['order_status'] | null
          new_status: Database['public']['Enums']['order_status']
          changed_by: string
          changed_at: string
        },
        {
          id?: never
          order_id: string
          old_status?: Database['public']['Enums']['order_status'] | null
          new_status: Database['public']['Enums']['order_status']
          changed_by?: string
          changed_at?: string
        }
      >
    }
    Views: Record<never, never>
    Functions: {
      create_admin_order: {
        Args: {
          p_customer_id: string
          p_fulfillment: Database['public']['Enums']['order_fulfillment']
          p_payment_method: Database['public']['Enums']['order_payment_method']
          p_fulfillment_location: string
          p_delivery_instructions: string | null
          p_items: { product_id: string; quantity: number }[]
        }
        Returns: string
      }
    }
    Enums: {
      app_role: 'admin' | 'client'
      product_status: 'active' | 'archived'
      order_fulfillment: 'delivery' | 'pickup'
      order_payment_method: 'manual_pix' | 'cash_at_delivery' | 'cash_at_pickup'
      order_payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
      order_status:
        | 'awaiting_payment'
        | 'paid'
        | 'preparing'
        | 'out_for_delivery'
        | 'awaiting_pickup'
        | 'completed'
        | 'cancelled'
        | 'refunded'
    }
    CompositeTypes: Record<never, never>
  }
}

export type AppRole = Database['public']['Enums']['app_role']
