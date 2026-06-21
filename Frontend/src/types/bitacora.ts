export interface Bitacora {
  id: number
  usuario: number | null
  usuario_nombre: string
  usuario_rol: string | null
  accion: string
  modulo: string
  descripcion: string
  ip_usuario: string | null
  fecha_hora: string
}
