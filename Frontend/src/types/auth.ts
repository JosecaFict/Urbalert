import type { Usuario } from './usuario'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  nombres: string
  apellidos: string
  ci: string
  telefono: string
  direccion: string
}

export interface AuthResponse {
  access: string
  refresh: string
  usuario: Usuario
}
