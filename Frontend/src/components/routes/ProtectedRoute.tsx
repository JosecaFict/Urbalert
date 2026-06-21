import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Loading from '../common/Loading'

/**
 * Protege rutas que requieren autenticación.
 * Si el usuario no está autenticado, redirige al login.
 */
export default function ProtectedRoute() {
  const { autenticado, cargando } = useAuth()
  const location = useLocation()

  if (cargando) {
    return <Loading pantallaCompleta texto="Verificando sesión..." />
  }

  if (!autenticado) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
