import type { Bitacora } from './bitacora'
import type { ReclamoListItem } from './reclamo'

export interface ResumenDashboard {
  total_reclamos: number
  pendientes: number
  aceptados: number
  rechazados: number
  asignados: number
  en_atencion: number
  reportados: number
  solucionados: number
  no_solucionados: number
  // Sólo para admin / encargado
  total_ciudadanos?: number
  total_trabajadores?: number
  total_encargados?: number
  total_asignaciones?: number
  reportes_pendientes?: number
  total_reportes?: number
  // Métricas de supervisión (admin / encargado)
  tiempo_promedio_dias?: number | null
  pendientes_antiguos?: number
  dias_pendiente_umbral?: number
}

export interface ReclamoUbicacion {
  id: number
  titulo: string
  estado: string
  prioridad: string
  lat: number
  lng: number
}

export interface ReclamosPorEstado {
  estado: string
  total: number
}

export interface ReclamosPorCategoria {
  categoria: string
  total: number
}

export interface ReclamosPorMes {
  mes: string
  total: number
}

export interface ActividadReciente {
  ultimos_reclamos: ReclamoListItem[]
  actividad: Bitacora[]
}
