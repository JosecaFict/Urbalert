import api from './axios'
import type { Bitacora } from '../types/bitacora'

interface Paginado<T> {
  results: T[]
}

function desempaquetar<T>(data: T[] | Paginado<T>): T[] {
  return Array.isArray(data) ? data : data.results
}

export interface FiltrosBitacora {
  usuario?: string
  accion?: string
  modulo?: string
  desde?: string
  hasta?: string
}

export const bitacoraService = {
  async listar(filtros?: FiltrosBitacora): Promise<Bitacora[]> {
    const { data } = await api.get('/bitacora/', { params: filtros })
    return desempaquetar<Bitacora>(data)
  },
}
