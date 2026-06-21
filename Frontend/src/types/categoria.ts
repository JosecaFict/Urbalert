export interface Categoria {
  id: number
  nombre: string
  descripcion: string
  estado: boolean
  total_reclamos?: number
}

export interface CategoriaFormData {
  nombre: string
  descripcion: string
  estado: boolean
}
