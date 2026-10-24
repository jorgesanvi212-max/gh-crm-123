// Textos en pantalla de los tipos enumerados (SCRIPTS-SQL.md §1.1) y de la auditoría (DESIGN_BRIEF.md, anexo B).
import type { AuditAction, Enums } from './database.types'

export const USER_ROLE: Record<Enums<'user_role'>, string> = {
  vendedor: 'Vendedor',
  supervisor: 'Supervisor',
}

export const BUSINESS_TYPE: Record<Enums<'business_type'>, string> = {
  fruteria: 'Frutería',
  hosteleria: 'Hostelería / Restaurante',
  supermercado: 'Supermercado',
  mercado_mayorista: 'Mercado / Mayorista',
  otro: 'Otro',
}

export const OPPORTUNITY_STAGE: Record<Enums<'opportunity_stage'>, string> = {
  nueva: 'Nueva',
  oferta_enviada: 'Oferta enviada',
  negociacion: 'Negociación',
  ganada: 'Ganada',
  perdida: 'Perdida',
}

export const LOSS_REASON: Record<Enums<'loss_reason'>, string> = {
  precio: 'Precio',
  calidad: 'Calidad / producto',
  plazo: 'Plazo de entrega',
  competencia: 'Competencia',
  otro: 'Otro',
}

export const ACTIVITY_TYPE: Record<Enums<'activity_type'>, string> = {
  llamada: 'Llamada',
  visita: 'Visita',
  whatsapp: 'WhatsApp',
  email: 'Email',
  nota: 'Nota',
}

export const TASK_STATUS: Record<Enums<'task_status'>, string> = {
  pendiente: 'Pendiente',
  hecha: 'Hecha',
  cancelada: 'Cancelada',
}

export const SUMMARY_TRIGGER: Record<Enums<'summary_trigger'>, string> = {
  programado: 'Programado',
  manual: 'Manual',
}

export const SUMMARY_RUN_STATUS: Record<Enums<'summary_run_status'>, string> = {
  pendiente: 'En cola',
  en_proceso: 'En proceso',
  completado: 'Completado',
  con_errores: 'Con errores',
  fallido: 'Fallido',
  omitido: 'Omitido',
}

export const DELIVERY_STATUS: Record<Enums<'delivery_status'>, string> = {
  pendiente: 'Pendiente',
  enviado: 'Enviado',
  fallido: 'Fallido',
}

export const AUDIT_ACTION: Record<AuditAction, string> = {
  'usuario.alta': 'Alta de usuario',
  'usuario.cambio_rol': 'Cambio de rol',
  'usuario.desactivado': 'Usuario desactivado',
  'usuario.reactivado': 'Usuario reactivado',
  'usuario.contrasena_restablecida': 'Contraseña temporal asignada',
  'cliente.reasignado': 'Cliente reasignado',
  'cliente.archivado': 'Cliente archivado',
  'cliente.restaurado': 'Cliente restaurado',
  'oportunidad.cambio_etapa': 'Cambio de etapa',
  'oportunidad.archivada': 'Oportunidad archivada',
  'oportunidad.restaurada': 'Oportunidad restaurada',
  'ajustes.actualizados': 'Ajustes del resumen actualizados',
  'resumen.solicitado': 'Resumen manual solicitado',
  'resumen.omitido': 'Resumen omitido',
  'resumen.finalizado': 'Resumen finalizado',
}
