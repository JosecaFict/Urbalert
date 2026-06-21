import api from './axios'
import type { Reporte, ReporteFormData } from '../types/reporte'

interface Paginado<T> {
  results: T[]
}

function desempaquetar<T>(data: T[] | Paginado<T>): T[] {
  return Array.isArray(data) ? data : data.results
}

function aFormData(payload: ReporteFormData): FormData {
  const fd = new FormData()
  fd.append('reclamo', String(payload.reclamo))
  fd.append('descripcion_trabajo', payload.descripcion_trabajo)
  fd.append('resultado', payload.resultado)
  if (payload.latitud_atencion != null)
    fd.append('latitud_atencion', String(payload.latitud_atencion))
  if (payload.longitud_atencion != null)
    fd.append('longitud_atencion', String(payload.longitud_atencion))
  if (payload.foto_evidencia) fd.append('foto_evidencia', payload.foto_evidencia)
  return fd
}

export const reporteService = {
  async listar(): Promise<Reporte[]> {
    const { data } = await api.get('/reportes/')
    return desempaquetar<Reporte>(data)
  },

  async obtener(id: number): Promise<Reporte> {
    const { data } = await api.get<Reporte>(`/reportes/${id}/`)
    return data
  },

  async porReclamo(reclamoId: number): Promise<Reporte[]> {
    const { data } = await api.get<Reporte[]>(`/reportes/por-reclamo/${reclamoId}/`)
    return data
  },

  async crear(payload: ReporteFormData): Promise<Reporte> {
    const { data } = await api.post<Reporte>('/reportes/', aFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
}
