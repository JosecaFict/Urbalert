import type { EstadoNombre, Prioridad } from '../types/reclamo'

export interface BadgeStyle {
  bg: string
  text: string
  dot: string
  /** color hexadecimal para gráficos */
  hex: string
}

/**
 * Mapa de colores por estado del reclamo, según la especificación de Urbalert.
 */
export const ESTADO_COLORS: Record<EstadoNombre, BadgeStyle> = {
  Pendiente: { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500', hex: '#f59e0b' },
  Aceptado: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500', hex: '#3b82f6' },
  Rechazado: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500', hex: '#ef4444' },
  Asignado: { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500', hex: '#a855f7' },
  'En atención': { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500', hex: '#f97316' },
  Reportado: { bg: 'bg-sky-100', text: 'text-sky-800', dot: 'bg-sky-500', hex: '#0ea5e9' },
  Solucionado: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', hex: '#22c55e' },
  'No solucionado': { bg: 'bg-slate-200 dark:bg-slate-700', text: 'text-slate-700 dark:text-slate-200', dot: 'bg-slate-600', hex: '#475569' },
}

const ESTADO_FALLBACK: BadgeStyle = {
  bg: 'bg-slate-100 dark:bg-slate-700',
  text: 'text-slate-700 dark:text-slate-200',
  dot: 'bg-slate-400',
  hex: '#94a3b8',
}

export function estadoStyle(estado: string): BadgeStyle {
  return ESTADO_COLORS[estado as EstadoNombre] ?? ESTADO_FALLBACK
}

export const PRIORIDAD_COLORS: Record<Prioridad, BadgeStyle> = {
  baja: { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-600 dark:text-slate-300', dot: 'bg-slate-400', hex: '#94a3b8' },
  media: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500', hex: '#3b82f6' },
  alta: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', hex: '#ef4444' },
}

export function prioridadStyle(prioridad: Prioridad): BadgeStyle {
  return PRIORIDAD_COLORS[prioridad] ?? PRIORIDAD_COLORS.media
}

export const PRIORIDAD_LABEL: Record<Prioridad, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
}
