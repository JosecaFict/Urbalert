import api from './axios'
import type {
  HistorialEstado,
  ReclamoDetalle,
  ReclamoFormData,
  ReclamoListItem,
} from '../types/reclamo'

interface Paginado<T> {
  results: T[]
}

function desempaquetar<T>(data: T[] | Paginado<T>): T[] {
  return Array.isArray(data) ? data : data.results
}

function aFormData(payload: ReclamoFormData): FormData {
  const fd = new FormData()
  fd.append('titulo', payload.titulo)
  fd.append('descripcion', payload.descripcion)
  fd.append('categoria', String(payload.categoria))
  fd.append('direccion_texto', payload.direccion_texto)
  fd.append('latitud', String(payload.latitud ?? ''))
  fd.append('longitud', String(payload.longitud ?? ''))
  fd.append('prioridad', payload.prioridad)
  if (payload.foto_principal) {
    fd.append('foto_principal', payload.foto_principal)
  }
  return fd
}

export const reclamoService = {
  async listar(params?: Record<string, string>): Promise<ReclamoListItem[]> {
    const { data } = await api.get('/reclamos/', { params })
    return desempaquetar<ReclamoListItem>(data)
  },

  async misReclamos(): Promise<ReclamoListItem[]> {
    const { data } = await api.get<ReclamoListItem[]>('/reclamos/mis-reclamos/')
    return data
  },

  async pendientes(): Promise<ReclamoListItem[]> {
    const { data } = await api.get<ReclamoListItem[]>('/reclamos/pendientes/')
    return data
  },

  async obtener(id: number): Promise<ReclamoDetalle> {
    const { data } = await api.get<ReclamoDetalle>(`/reclamos/${id}/`)
    return data
  },

  async crear(payload: ReclamoFormData): Promise<ReclamoDetalle> {
    const { data } = await api.post<ReclamoDetalle>('/reclamos/', aFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async historial(id: number): Promise<HistorialEstado[]> {
    const { data } = await api.get<HistorialEstado[]>(`/reclamos/${id}/historial/`)
    return data
  },

  async aceptar(id: number, observacion = ''): Promise<ReclamoDetalle> {
    const { data } = await api.patch<ReclamoDetalle>(`/reclamos/${id}/aceptar/`, {
      observacion,
    })
    return data
  },

  async rechazar(id: number, observacion: string): Promise<ReclamoDetalle> {
    const { data } = await api.patch<ReclamoDetalle>(`/reclamos/${id}/rechazar/`, {
      observacion,
    })
    return data
  },

  async cambiarEstado(
    id: number,
    estado: string,
    observacion = '',
  ): Promise<ReclamoDetalle> {
    const { data } = await api.patch<ReclamoDetalle>(
      `/reclamos/${id}/cambiar-estado/`,
      { estado, observacion },
    )
    return data
  },
}
