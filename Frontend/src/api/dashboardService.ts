import api from './axios'
import type {
  ActividadReciente,
  ReclamosPorCategoria,
  ReclamosPorEstado,
  ReclamosPorMes,
  ReclamoUbicacion,
  ResumenDashboard,
} from '../types/dashboard'

export const dashboardService = {
  async resumen(): Promise<ResumenDashboard> {
    const { data } = await api.get<ResumenDashboard>('/dashboard/resumen/')
    return data
  },

  async porEstado(): Promise<ReclamosPorEstado[]> {
    const { data } = await api.get<ReclamosPorEstado[]>(
      '/dashboard/reclamos-por-estado/',
    )
    return data
  },

  async porCategoria(): Promise<ReclamosPorCategoria[]> {
    const { data } = await api.get<ReclamosPorCategoria[]>(
      '/dashboard/reclamos-por-categoria/',
    )
    return data
  },

  async porMes(): Promise<ReclamosPorMes[]> {
    const { data } = await api.get<ReclamosPorMes[]>('/dashboard/reclamos-por-mes/')
    return data
  },

  async actividadReciente(): Promise<ActividadReciente> {
    const { data } = await api.get<ActividadReciente>(
      '/dashboard/actividad-reciente/',
    )
    return data
  },

  async ubicaciones(): Promise<ReclamoUbicacion[]> {
    const { data } = await api.get<ReclamoUbicacion[]>(
      '/dashboard/reclamos-ubicaciones/',
    )
    return data
  },
}
