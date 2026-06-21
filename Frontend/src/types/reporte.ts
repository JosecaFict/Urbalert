export type ResultadoReporte = 'solucionado' | 'no_solucionado' | 'requiere_revision'

export interface Reporte {
  id: number
  reclamo: number
  reclamo_titulo: string
  trabajador: number | null
  trabajador_nombre: string | null
  descripcion_trabajo: string
  resultado: ResultadoReporte
  resultado_display: string
  foto_evidencia: string | null
  latitud_atencion: string | null
  longitud_atencion: string | null
  fecha_reporte: string
}

export interface ReporteFormData {
  reclamo: number
  descripcion_trabajo: string
  resultado: ResultadoReporte
  latitud_atencion: number | null
  longitud_atencion: number | null
  foto_evidencia?: File | null
}
