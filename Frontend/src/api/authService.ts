import api, { tokenStorage } from './axios'
import type { AuthResponse, LoginCredentials, RegisterData } from '../types/auth'
import type { Usuario } from '../types/usuario'

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login/', credentials)
    tokenStorage.set(data.access, data.refresh)
    return data
  },

  async register(payload: RegisterData): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register/', payload)
    tokenStorage.set(data.access, data.refresh)
    return data
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout/')
    } finally {
      tokenStorage.clear()
    }
  },

  async me(): Promise<Usuario> {
    const { data } = await api.get<Usuario>('/auth/me/')
    return data
  },

  async actualizarPerfil(payload: Partial<Usuario>): Promise<Usuario> {
    const { data } = await api.patch<Usuario>('/auth/me/', payload)
    return data
  },
}
