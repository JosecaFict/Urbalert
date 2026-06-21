import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authService } from '../api/authService'
import { tokenStorage } from '../api/axios'
import type { LoginCredentials, RegisterData } from '../types/auth'
import type { RolNombre, Usuario } from '../types/usuario'

interface AuthContextValue {
  usuario: Usuario | null
  rol: RolNombre | null
  cargando: boolean
  autenticado: boolean
  login: (credentials: LoginCredentials) => Promise<Usuario>
  register: (payload: RegisterData) => Promise<Usuario>
  logout: () => Promise<void>
  refrescarUsuario: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)

  // Al montar, si hay token guardado intentamos recuperar la sesión
  useEffect(() => {
    const token = tokenStorage.get()
    if (!token) {
      setCargando(false)
      return
    }
    authService
      .me()
      .then(setUsuario)
      .catch(() => tokenStorage.clear())
      .finally(() => setCargando(false))
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const data = await authService.login(credentials)
    setUsuario(data.usuario)
    return data.usuario
  }, [])

  const register = useCallback(async (payload: RegisterData) => {
    const data = await authService.register(payload)
    setUsuario(data.usuario)
    return data.usuario
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUsuario(null)
  }, [])

  const refrescarUsuario = useCallback(async () => {
    const u = await authService.me()
    setUsuario(u)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      rol: usuario?.rol_nombre ?? null,
      cargando,
      autenticado: !!usuario,
      login,
      register,
      logout,
      refrescarUsuario,
    }),
    [usuario, cargando, login, register, logout, refrescarUsuario],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return ctx
}
