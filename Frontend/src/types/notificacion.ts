export type TipoNotificacion =
  | 'reclamo_nuevo'
  | 'reclamo_aceptado'
  | 'reclamo_rechazado'
  | 'reclamo_asignado'
  | 'asignacion_nueva'
  | 'reclamo_en_atencion'
  | 'reporte_enviado'
  | 'reclamo_solucionado'
  | 'reclamo_no_solucionado'
  | 'usuario_nuevo'

export interface Notificacion {
  id: number
  tipo: TipoNotificacion
  titulo: string
  mensaje: string
  reclamo: number | null
  url: string
  leida: boolean
  fecha_creacion: string
}
