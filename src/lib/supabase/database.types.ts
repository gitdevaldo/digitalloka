export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: string;
          is_active: boolean;
          droplet_ids: number[] | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: string;
          is_active?: boolean;
          droplet_ids?: number[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: string;
          is_active?: boolean;
          droplet_ids?: number[] | null;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: number;
          name: string;
          slug: string;
          product_type: string;
          status: string;
          short_description: string | null;
          description: string | null;
          price_amount: number | null;
          price_currency: string;
          price_billing_period: string | null;
          is_visible: boolean;
          category_id: number | null;
          category_slug: string | null;
          rating: number;
          reviews_count: number;
          tags: string[] | null;
          badges: string[] | null;
          faq_items: Json | null;
          featured: Json | null;
          meta: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          slug: string;
          product_type?: string;
          status?: string;
          short_description?: string | null;
          description?: string | null;
          price_amount?: number | null;
          price_currency?: string;
          price_billing_period?: string | null;
          is_visible?: boolean;
          category_id?: number | null;
          category_slug?: string | null;
          rating?: number;
          reviews_count?: number;
          tags?: string[] | null;
          badges?: string[] | null;
          faq_items?: Json | null;
          featured?: Json | null;
          meta?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          slug?: string;
          product_type?: string;
          status?: string;
          short_description?: string | null;
          description?: string | null;
          price_amount?: number | null;
          price_currency?: string;
          price_billing_period?: string | null;
          is_visible?: boolean;
          category_id?: number | null;
          category_slug?: string | null;
          rating?: number;
          reviews_count?: number;
          tags?: string[] | null;
          badges?: string[] | null;
          faq_items?: Json | null;
          featured?: Json | null;
          meta?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "product_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: number;
          user_id: string;
          order_number: string;
          status: string;
          payment_status: string;
          subtotal_amount: number;
          total_amount: number;
          currency: string;
          meta: Json | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          order_number: string;
          status?: string;
          payment_status?: string;
          subtotal_amount: number;
          total_amount: number;
          currency: string;
          meta?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          order_number?: string;
          status?: string;
          payment_status?: string;
          subtotal_amount?: number;
          total_amount?: number;
          currency?: string;
          meta?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          id: number;
          order_id: number;
          product_id: number;
          item_name: string;
          quantity: number;
          unit_price: number;
          line_total: number;
          meta: Json | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          order_id: number;
          product_id: number;
          item_name: string;
          quantity: number;
          unit_price: number;
          line_total: number;
          meta?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          order_id?: number;
          product_id?: number;
          item_name?: string;
          quantity?: number;
          unit_price?: number;
          line_total?: number;
          meta?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          id: number;
          order_id: number;
          idempotency_key: string | null;
          provider: string;
          provider_ref: string | null;
          status: string;
          amount: number;
          currency: string;
          paid_at: string | null;
          verified_at: string | null;
          payload: Json | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          order_id: number;
          idempotency_key?: string | null;
          provider: string;
          provider_ref?: string | null;
          status?: string;
          amount: number;
          currency: string;
          paid_at?: string | null;
          verified_at?: string | null;
          payload?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          order_id?: number;
          idempotency_key?: string | null;
          provider?: string;
          provider_ref?: string | null;
          status?: string;
          amount?: number;
          currency?: string;
          paid_at?: string | null;
          verified_at?: string | null;
          payload?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      entitlements: {
        Row: {
          id: number;
          user_id: string;
          product_id: number;
          order_item_id: number;
          status: string;
          starts_at: string;
          expires_at: string | null;
          revoked_at: string | null;
          revocation_reason: string | null;
          meta: Json | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          product_id: number;
          order_item_id: number;
          status?: string;
          starts_at: string;
          expires_at?: string | null;
          revoked_at?: string | null;
          revocation_reason?: string | null;
          meta?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          product_id?: number;
          order_item_id?: number;
          status?: string;
          starts_at?: string;
          expires_at?: string | null;
          revoked_at?: string | null;
          revocation_reason?: string | null;
          meta?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "entitlements_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "entitlements_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "entitlements_order_item_id_fkey";
            columns: ["order_item_id"];
            isOneToOne: false;
            referencedRelation: "order_items";
            referencedColumns: ["id"];
          },
        ];
      };
      wishlists: {
        Row: {
          id: number;
          user_id: string;
          product_id: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          product_id: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          product_id?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wishlists_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wishlists_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          id: number;
          actor_user_id: string | null;
          actor_role: string | null;
          action: string;
          target_type: string | null;
          target_id: string | null;
          changes: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          actor_user_id?: string | null;
          actor_role?: string | null;
          action: string;
          target_type?: string | null;
          target_id?: string | null;
          changes?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          actor_user_id?: string | null;
          actor_role?: string | null;
          action?: string;
          target_type?: string | null;
          target_id?: string | null;
          changes?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      payment_events: {
        Row: {
          id: number;
          event_id: string | null;
          idempotency_key: string | null;
          provider: string;
          status: string;
          payload: Json | null;
          processed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          event_id?: string | null;
          idempotency_key?: string | null;
          provider: string;
          status?: string;
          payload?: Json | null;
          processed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          event_id?: string | null;
          idempotency_key?: string | null;
          provider?: string;
          status?: string;
          payload?: Json | null;
          processed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      product_stock_items: {
        Row: {
          id: number;
          product_id: number;
          credential_data: Json;
          credential_hash: string;
          status: string;
          is_unlimited: boolean;
          sold_order_item_id: number | null;
          sold_user_id: string | null;
          sold_at: string | null;
          meta: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          product_id: number;
          credential_data?: Json;
          credential_hash: string;
          status?: string;
          is_unlimited?: boolean;
          sold_order_item_id?: number | null;
          sold_user_id?: string | null;
          sold_at?: string | null;
          meta?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          product_id?: number;
          credential_data?: Json;
          credential_hash?: string;
          status?: string;
          is_unlimited?: boolean;
          sold_order_item_id?: number | null;
          sold_user_id?: string | null;
          sold_at?: string | null;
          meta?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_stock_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_stock_items_sold_order_item_id_fkey";
            columns: ["sold_order_item_id"];
            isOneToOne: false;
            referencedRelation: "order_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_stock_items_sold_user_id_fkey";
            columns: ["sold_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      product_categories: {
        Row: {
          id: number;
          name: string;
          slug: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          slug: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          slug?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      product_types: {
        Row: {
          id: number;
          type_key: string;
          label: string;
          description: string | null;
          is_active: boolean;
          fields: Json | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          type_key: string;
          label: string;
          description?: string | null;
          is_active?: boolean;
          fields?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          type_key?: string;
          label?: string;
          description?: string | null;
          is_active?: boolean;
          fields?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: number;
          setting_group: string;
          setting_key: string;
          setting_value: Json | null;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          id?: number;
          setting_group: string;
          setting_key: string;
          setting_value?: Json | null;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: number;
          setting_group?: string;
          setting_key?: string;
          setting_value?: Json | null;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      vps_provider_data: {
        Row: {
          id: number;
          provider: string;
          resource_type: string;
          slug: string;
          name: string;
          data: Json;
          available: boolean;
          synced_at: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          provider: string;
          resource_type: string;
          slug: string;
          name: string;
          data?: Json;
          available?: boolean;
          synced_at?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          provider?: string;
          resource_type?: string;
          slug?: string;
          name?: string;
          data?: Json;
          available?: boolean;
          synced_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_checkout_order_atomic: {
        Args: {
          p_user_id: string;
          p_order_number: string;
          p_currency: string;
          p_subtotal: number;
          p_total: number;
          p_meta: Json;
          p_items: Json;
          p_provider?: string;
        };
        Returns: number;
      };
      create_entitlements_for_order: {
        Args: {
          p_order_id: number;
          p_user_id: string;
        };
        Returns: undefined;
      };
      process_payment_atomic: {
        Args: {
          p_order_id: number;
          p_user_id: string;
          p_provider: string;
          p_provider_ref: string;
          p_idempotency_key: string;
          p_amount: number;
          p_currency: string;
          p_payload: Json;
        };
        Returns: undefined;
      };
      assign_stock_item_atomic: {
        Args: {
          p_product_id: number;
          p_order_item_id: number;
          p_user_id: string;
          p_stock_item_id?: number | null;
        };
        Returns: Json;
      };
      check_rate_limit_atomic: {
        Args: {
          p_key: string;
          p_window_ms: number;
          p_max_requests: number;
        };
        Returns: { allowed: boolean; current_count: number; oldest_ts: string }[];
      };
      cleanup_rate_limit_entries: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      cleanup_expired_cache: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
  };
}

import type { SupabaseClient } from '@supabase/supabase-js';
export type TypedSupabaseClient = SupabaseClient<Database>;
