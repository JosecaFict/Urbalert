import api from './axios'
import type { Categoria, CategoriaFormData } from '../types/categoria'

interface Paginado<T> {
  results: T[]
}

function desempaquetar<T>(data: T[] | Paginado<T>): T[] {
  return Array.isArray(data) ? data : data.results
}

export const categoriaService = {
  async listar(): Promise<Categoria[]> {
    const { data } = await api.get('/categorias/')
    return desempaquetar<Categoria>(data)
  },

  async crear(payload: CategoriaFormData): Promise<Categoria> {
    const { data } = await api.post<Categoria>('/categorias/', payload)
    return data
  },

  async actualizar(id: number, payload: Partial<CategoriaFormData>): Promise<Categoria> {
    const { data } = await api.put<Categoria>(`/categorias/${id}/`, payload)
    return data
  },

  async eliminar(id: number): Promise<void> {
    await api.delete(`/categorias/${id}/`)
  },
}
