import api from './axios'
import type { Rol, Usuario, UsuarioFormData } from '../types/usuario'

interface Paginado<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

function desempaquetar<T>(data: T[] | Paginado<T>): T[] {
  return Array.isArray(data) ? data : data.results
}

export const usuarioService = {
  async listar(): Promise<Usuario[]> {
    const { data } = await api.get('/usuarios/', { params: { page_size: 1000 } })
    return desempaquetar<Usuario>(data)
  },

  async obtener(id: number): Promise<Usuario> {
    const { data } = await api.get<Usuario>(`/usuarios/${id}/`)
    return data
  },

  async crear(payload: UsuarioFormData): Promise<Usuario> {
    const { data } = await api.post<Usuario>('/usuarios/', payload)
    return data
  },

  async actualizar(id: number, payload: Partial<UsuarioFormData>): Promise<Usuario> {
    const { data } = await api.put<Usuario>(`/usuarios/${id}/`, payload)
    return data
  },

  async eliminar(id: number): Promise<void> {
    await api.delete(`/usuarios/${id}/`)
  },

  async restablecerPassword(id: number, password: string): Promise<void> {
    await api.post(`/usuarios/${id}/restablecer-contrasena/`, { password })
  },

  async administradores(): Promise<Usuario[]> {
    const { data } = await api.get('/usuarios/administradores/')
    return desempaquetar<Usuario>(data)
  },

  async ciudadanos(): Promise<Usuario[]> {
    const { data } = await api.get('/usuarios/ciudadanos/')
    return desempaquetar<Usuario>(data)
  },

  async encargados(): Promise<Usuario[]> {
    const { data } = await api.get('/usuarios/encargados/')
    return desempaquetar<Usuario>(data)
  },

  async trabajadores(): Promise<Usuario[]> {
    const { data } = await api.get('/usuarios/trabajadores/')
    return desempaquetar<Usuario>(data)
  },

  async roles(): Promise<Rol[]> {
    const { data } = await api.get('/usuarios/roles/')
    return desempaquetar<Rol>(data)
  },
}
