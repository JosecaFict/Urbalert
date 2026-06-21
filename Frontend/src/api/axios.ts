import axios from 'axios'

const STORAGE_TOKEN = 'urbalert_access'
const STORAGE_REFRESH = 'urbalert_refresh'

/**
 * Instancia central de Axios.
 * En desarrollo Vite hace proxy de /api hacia el backend Django (puerto 8000).
 */
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Adjunta el token JWT a cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_TOKEN)
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Manejo global de errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const enLogin = window.location.pathname.startsWith('/login')
      if (!enLogin) {
        localStorage.removeItem(STORAGE_TOKEN)
        localStorage.removeItem(STORAGE_REFRESH)
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export const tokenStorage = {
  get: () => localStorage.getItem(STORAGE_TOKEN),
  set: (access: string, refresh: string) => {
    localStorage.setItem(STORAGE_TOKEN, access)
    localStorage.setItem(STORAGE_REFRESH, refresh)
  },
  clear: () => {
    localStorage.removeItem(STORAGE_TOKEN)
    localStorage.removeItem(STORAGE_REFRESH)
  },
}

/** Extrae un mensaje de error legible desde una respuesta de DRF. */
export function extraerError(error: unknown, fallback = 'Ocurrió un error.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as Record<string, unknown> | undefined
    if (data) {
      if (typeof data.detail === 'string') return data.detail
      const primera = Object.values(data)[0]
      if (Array.isArray(primera) && primera.length) return String(primera[0])
      if (typeof primera === 'string') return primera
    }
    if (error.message === 'Network Error') {
      return 'No se pudo conectar con el servidor. ¿Está corriendo el backend?'
    }
  }
  return fallback
}

export default api
