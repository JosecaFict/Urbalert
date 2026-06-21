import api from './axios'
import type { Notificacion } from '../types/notificacion'

interface Paginado<T> {
  results: T[]
}

function desempaquetar<T>(data: T[] | Paginado<T>): T[] {
  return Array.isArray(data) ? data : data.results
}

export const notificacionService = {
  /** Lista las notificaciones del usuario autenticado (más recientes primero). */
  async listar(soloNoLeidas = false): Promise<Notificacion[]> {
    const { data } = await api.get('/notificaciones/', {
      params: soloNoLeidas ? { no_leidas: 1 } : undefined,
    })
    return desempaquetar<Notificacion>(data)
  },

  /** Devuelve cuántas notificaciones sin leer tiene el usuario (para el badge). */
  async contarNoLeidas(): Promise<number> {
    const { data } = await api.get<{ no_leidas: number }>(
      '/notificaciones/no-leidas/',
    )
    return data.no_leidas
  },

  /** Marca una notificación como leída. */
  async marcarLeida(id: number): Promise<void> {
    await api.patch(`/notificaciones/${id}/marcar-leida/`)
  },

  /** Marca todas las notificaciones del usuario como leídas. */
  async marcarTodas(): Promise<void> {
    await api.patch('/notificaciones/marcar-todas/')
  },
}
