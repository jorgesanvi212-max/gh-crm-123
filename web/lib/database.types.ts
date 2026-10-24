// Tipos escritos a mano a partir de SCRIPTS-SQL.md v1.0 (24/10/2026).
// Espejo fiel de la estructura oficial de dbcrm123: no añadir, quitar ni renombrar nada.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

type Rel = {
  foreignKeyName: string
  columns: string[]
  isOneToOne: boolean
  referencedRelation: string
  referencedColumns: string[]
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          role: Database['public']['Enums']['user_role']
          is_active: boolean
          must_change_password: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          role?: Database['public']['Enums']['user_role']
          is_active?: boolean
          must_change_password?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          role?: Database['public']['Enums']['user_role']
          is_active?: boolean
          must_change_password?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: Rel[]
      }
      clients: {
        Row: {
          id: string
          trade_name: string
          business_type: Database['public']['Enums']['business_type']
          contact_name: string
          phone: string
          email: string | null
          delivery_address: string | null
          city: string | null
          province: string | null
          notes: string | null
          owner_id: string
          is_archived: boolean
          archived_at: string | null
          archived_by: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trade_name: string
          business_type: Database['public']['Enums']['business_type']
          contact_name: string
          phone: string
          email?: string | null
          delivery_address?: string | null
          city?: string | null
          province?: string | null
          notes?: string | null
          owner_id: string
          is_archived?: boolean
          archived_at?: string | null
          archived_by?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trade_name?: string
          business_type?: Database['public']['Enums']['business_type']
          contact_name?: string
          phone?: string
          email?: string | null
          delivery_address?: string | null
          city?: string | null
          province?: string | null
          notes?: string | null
          owner_id?: string
          is_archived?: boolean
          archived_at?: string | null
          archived_by?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: Rel[]
      }
      opportunities: {
        Row: {
          id: string
          client_id: string
          owner_id: string
          title: string
          description: string | null
          amount: number
          stage: Database['public']['Enums']['opportunity_stage']
          expected_close_date: string
          loss_reason: Database['public']['Enums']['loss_reason'] | null
          loss_note: string | null
          closed_at: string | null
          is_archived: boolean
          archived_at: string | null
          archived_by: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          owner_id: string
          title: string
          description?: string | null
          amount: number
          stage?: Database['public']['Enums']['opportunity_stage']
          expected_close_date: string
          loss_reason?: Database['public']['Enums']['loss_reason'] | null
          loss_note?: string | null
          closed_at?: string | null
          is_archived?: boolean
          archived_at?: string | null
          archived_by?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          owner_id?: string
          title?: string
          description?: string | null
          amount?: number
          stage?: Database['public']['Enums']['opportunity_stage']
          expected_close_date?: string
          loss_reason?: Database['public']['Enums']['loss_reason'] | null
          loss_note?: string | null
          closed_at?: string | null
          is_archived?: boolean
          archived_at?: string | null
          archived_by?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: Rel[]
      }
      tasks: {
        Row: {
          id: string
          client_id: string
          opportunity_id: string | null
          owner_id: string
          title: string
          due_at: string
          status: Database['public']['Enums']['task_status']
          completed_at: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          opportunity_id?: string | null
          owner_id: string
          title: string
          due_at: string
          status?: Database['public']['Enums']['task_status']
          completed_at?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          opportunity_id?: string | null
          owner_id?: string
          title?: string
          due_at?: string
          status?: Database['public']['Enums']['task_status']
          completed_at?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: Rel[]
      }
      activities: {
        Row: {
          id: string
          client_id: string
          opportunity_id: string | null
          type: Database['public']['Enums']['activity_type']
          description: string
          occurred_at: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          opportunity_id?: string | null
          type: Database['public']['Enums']['activity_type']
          description: string
          occurred_at?: string
          created_by?: string
          created_at?: string
        }
        // Solo inserción: la base de datos rechaza cualquier cambio.
        Update: never
        Relationships: Rel[]
      }
      audit_log: {
        Row: {
          id: number
          actor_id: string | null
          action: AuditAction
          entity: AuditEntity
          entity_id: string | null
          details: Json
          created_at: string
        }
        // Solo la escriben triggers y funciones del servidor.
        Insert: never
        Update: never
        Relationships: Rel[]
      }
      settings: {
        Row: {
          id: number
          summary_enabled: boolean
          summary_hour: number
          summary_days: number[]
          recovery_until_hour: number
          manual_cooldown_minutes: number
          time_zone: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: number
          summary_enabled?: boolean
          summary_hour?: number
          summary_days?: number[]
          recovery_until_hour?: number
          manual_cooldown_minutes?: number
          time_zone?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: number
          summary_enabled?: boolean
          summary_hour?: number
          summary_days?: number[]
          recovery_until_hour?: number
          manual_cooldown_minutes?: number
          time_zone?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: Rel[]
      }
      summary_runs: {
        Row: {
          id: string
          trigger_type: Database['public']['Enums']['summary_trigger']
          run_date: string
          target_profile_id: string | null
          requested_by: string | null
          status: Database['public']['Enums']['summary_run_status']
          requested_at: string
          claimed_at: string | null
          finished_at: string | null
          total_recipients: number
          sent_count: number
          failed_count: number
          error_message: string | null
        }
        // Solo mediante RPC (request_manual_summary, claim_summary_run).
        Insert: never
        Update: never
        Relationships: Rel[]
      }
      summary_deliveries: {
        Row: {
          id: string
          run_id: string
          profile_id: string
          email: string
          status: Database['public']['Enums']['delivery_status']
          provider_message_id: string | null
          error_message: string | null
          created_at: string
          reported_at: string | null
        }
        // Solo mediante RPC (claim_summary_run, record_summary_delivery).
        Insert: never
        Update: never
        Relationships: Rel[]
      }
    }
    Views: {
      v_seller_kpis: {
        Row: {
          profile_id: string
          full_name: string
          is_active: boolean
          tasks_today: number
          tasks_overdue: number
          open_opps_count: number
          open_opps_amount: number
          won_month_amount: number
        }
        Relationships: Rel[]
      }
      v_clients_list: {
        Row: {
          id: string
          trade_name: string
          business_type: Database['public']['Enums']['business_type']
          contact_name: string
          phone: string
          email: string | null
          delivery_address: string | null
          city: string | null
          province: string | null
          notes: string | null
          owner_id: string
          owner_name: string | null
          is_archived: boolean
          archived_at: string | null
          created_at: string
          updated_at: string
          open_opps_count: number
          last_activity_at: string | null
        }
        Relationships: Rel[]
      }
      v_opportunities_list: {
        Row: {
          id: string
          client_id: string
          client_name: string
          client_phone: string
          owner_id: string
          owner_name: string | null
          title: string
          description: string | null
          amount: number
          stage: Database['public']['Enums']['opportunity_stage']
          expected_close_date: string
          loss_reason: Database['public']['Enums']['loss_reason'] | null
          loss_note: string | null
          closed_at: string | null
          is_archived: boolean
          created_at: string
          updated_at: string
          is_open: boolean
        }
        Relationships: Rel[]
      }
      v_tasks_list: {
        Row: {
          id: string
          client_id: string
          client_name: string
          client_phone: string
          opportunity_id: string | null
          opportunity_title: string | null
          owner_id: string
          owner_name: string | null
          title: string
          due_at: string
          status: Database['public']['Enums']['task_status']
          completed_at: string | null
          created_at: string
          bucket: TaskBucket
        }
        Relationships: Rel[]
      }
    }
    Functions: {
      // Disponibles para usuarios autenticados
      is_supervisor: { Args: Record<PropertyKey, never>; Returns: boolean }
      is_active_user: { Args: Record<PropertyKey, never>; Returns: boolean }
      owns_client: { Args: { p_client_id: string }; Returns: boolean }
      owns_active_client: { Args: { p_client_id: string }; Returns: boolean }
      phone_status: { Args: { p_phone: string }; Returns: PhoneStatus }
      mark_password_changed: { Args: Record<PropertyKey, never>; Returns: undefined }
      reassign_clients: {
        Args: { p_from: string; p_to: string; p_client_ids?: string[] | null }
        Returns: number
      }
      request_manual_summary: { Args: { p_target?: string | null }; Returns: string }
      // Solo service_role (servidor)
      claim_summary_run: { Args: { p_now?: string }; Returns: Json }
      record_summary_delivery: {
        Args: {
          p_run_id: string
          p_profile_id: string
          p_ok: boolean
          p_provider_message_id?: string | null
          p_error?: string | null
        }
        Returns: Json
      }
      get_summary_data: { Args: { p_profile_id: string; p_today: string }; Returns: Json }
      create_profile_for_user: {
        Args: {
          p_user_id: string
          p_full_name: string
          p_email: string
          p_role: Database['public']['Enums']['user_role']
          p_actor_id?: string | null
        }
        Returns: undefined
      }
      log_password_reset: { Args: { p_actor_id: string; p_user_id: string }; Returns: undefined }
    }
    Enums: {
      user_role: 'vendedor' | 'supervisor'
      business_type: 'fruteria' | 'hosteleria' | 'supermercado' | 'mercado_mayorista' | 'otro'
      opportunity_stage: 'nueva' | 'oferta_enviada' | 'negociacion' | 'ganada' | 'perdida'
      loss_reason: 'precio' | 'calidad' | 'plazo' | 'competencia' | 'otro'
      activity_type: 'llamada' | 'visita' | 'whatsapp' | 'email' | 'nota'
      task_status: 'pendiente' | 'hecha' | 'cancelada'
      summary_trigger: 'programado' | 'manual'
      summary_run_status: 'pendiente' | 'en_proceso' | 'completado' | 'con_errores' | 'fallido' | 'omitido'
      delivery_status: 'pendiente' | 'enviado' | 'fallido'
    }
    CompositeTypes: Record<string, never>
  }
}

// Valores calculados por vistas y funciones (no son tipos enumerados de Postgres)
export type TaskBucket = 'vencida' | 'hoy' | 'proxima' | 'cerrada'
export type PhoneStatus = 'libre' | 'propio' | 'otro_vendedor' | 'archivado' | 'formato_invalido'
export type AuditAction =
  | 'usuario.alta'
  | 'usuario.cambio_rol'
  | 'usuario.desactivado'
  | 'usuario.reactivado'
  | 'usuario.contrasena_restablecida'
  | 'cliente.reasignado'
  | 'cliente.archivado'
  | 'cliente.restaurado'
  | 'oportunidad.cambio_etapa'
  | 'oportunidad.archivada'
  | 'oportunidad.restaurada'
  | 'ajustes.actualizados'
  | 'resumen.solicitado'
  | 'resumen.omitido'
  | 'resumen.finalizado'
export type AuditEntity = 'profile' | 'client' | 'opportunity' | 'settings' | 'summary_run'

type PublicSchema = Database['public']
export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row']
export type Views<T extends keyof PublicSchema['Views']> = PublicSchema['Views'][T]['Row']
export type Enums<T extends keyof PublicSchema['Enums']> = PublicSchema['Enums'][T]
