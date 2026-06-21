export type EstadoNombre =
  | 'Pendiente'
  | 'Aceptado'
  | 'Rechazado'
  | 'Asignado'
  | 'En atención'
  | 'Reportado'
  | 'Solucionado'
  | 'No solucionado'

export type Prioridad = 'baja' | 'media' | 'alta'

export interface ImagenReclamo {
  id: number
  imagen: string
  tipo_imagen: string
  fecha_subida: string
}

export interface HistorialEstado {
  id: number
  estado_anterior: number | null
  estado_anterior_nombre: string | null
  estado_nuevo: number
  estado_nuevo_nombre: EstadoNombre
  usuario: number | null
  usuario_nombre: string
  observacion: string
  fecha_cambio: string
}

export interface ComentarioReclamo {
  id: number
  reclamo: number
  usuario: number | null
  usuario_nombre: string
  comentario: string
  tipo_comentario: string
  fecha_comentario: string
}

export interface ReclamoListItem {
  id: number
  titulo: string
  categoria: number
  categoria_nombre: string
  estado_actual: number
  estado_nombre: EstadoNombre
  ciudadano: number
  ciudadano_nombre: string
  direccion_texto: string
  latitud: string
  longitud: string
  prioridad: Prioridad
  foto_principal: string | null
  fecha_registro: string
  fecha_actualizacion: string
}

export interface ReclamoDetalle extends ReclamoListItem {
  descripcion: string
  ciudadano_telefono: string
  imagenes: ImagenReclamo[]
  historial: HistorialEstado[]
  comentarios: ComentarioReclamo[]
}

export interface ReclamoFormData {
  titulo: string
  descripcion: string
  categoria: number | ''
  direccion_texto: string
  latitud: number | null
  longitud: number | null
  prioridad: Prioridad
  foto_principal?: File | null
}

export interface EstadoReclamo {
  id: number
  nombre: EstadoNombre
  descripcion: string
  orden: number
}
