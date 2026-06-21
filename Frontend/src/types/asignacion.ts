import type { ReclamoListItem } from './reclamo'

export interface Asignacion {
  id: number
  reclamo: number
  reclamo_detalle: ReclamoListItem
  encargado: number | null
  encargado_nombre: string | null
  trabajador: number
  trabajador_nombre: string
  fecha_asignacion: string
  observacion: string
  estado_asignacion: 'activa' | 'finalizada'
}

export interface AsignacionFormData {
  reclamo: number
  trabajador: number
  observacion: string
}
