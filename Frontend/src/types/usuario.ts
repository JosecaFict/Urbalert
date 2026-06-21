export type RolNombre = 'administrador' | 'ciudadano' | 'encargado' | 'trabajador'

export interface Usuario {
  id: number
  email: string
  username: string
  rol: number | null
  rol_nombre: RolNombre | null
  rol_descripcion?: string
  nombres: string
  apellidos: string
  nombre_completo: string
  ci: string
  telefono: string
  direccion: string
  estado: 'activo' | 'inactivo'
  fecha_registro: string
  ultimo_acceso: string | null
  is_active?: boolean
}

export interface UsuarioFormData {
  email: string
  password?: string
  nombres: string
  apellidos: string
  ci: string
  telefono: string
  direccion: string
  rol: number | null
  estado?: 'activo' | 'inactivo'
}

export interface Rol {
  id: number
  nombre: RolNombre
  descripcion: string
}
