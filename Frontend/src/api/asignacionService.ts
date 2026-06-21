import api from './axios'
import type { Asignacion, AsignacionFormData } from '../types/asignacion'

interface Paginado<T> {
  results: T[]
}

function desempaquetar<T>(data: T[] | Paginado<T>): T[] {
  return Array.isArray(data) ? data : data.results
}

export const asignacionService = {
  async listar(): Promise<Asignacion[]> {
    const { data } = await api.get('/asignaciones/')
    return desempaquetar<Asignacion>(data)
  },

  async misAsignaciones(): Promise<Asignacion[]> {
    const { data } = await api.get<Asignacion[]>('/asignaciones/mis-asignaciones/')
    return data
  },

  async obtener(id: number): Promise<Asignacion> {
    const { data } = await api.get<Asignacion>(`/asignaciones/${id}/`)
    return data
  },

  async crear(payload: AsignacionFormData): Promise<Asignacion> {
    const { data } = await api.post<Asignacion>('/asignaciones/', payload)
    return data
  },

  async finalizar(id: number): Promise<Asignacion> {
    const { data } = await api.patch<Asignacion>(`/asignaciones/${id}/finalizar/`)
    return data
  },
}
