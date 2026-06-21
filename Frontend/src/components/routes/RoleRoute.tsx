import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { rutaInicialPorRol } from '../../utils/roleLabels'
import type { RolNombre } from '../../types/usuario'

interface RoleRouteProps {
  roles: RolNombre[]
}

/**
 * Restringe el acceso a usuarios cuyo rol esté en la lista permitida.
 * Si el rol no coincide, redirige a su dashboard correspondiente.
 */
export default function RoleRoute({ roles }: RoleRouteProps) {
  const { rol } = useAuth()

  if (!rol || !roles.includes(rol)) {
    return <Navigate to={rutaInicialPorRol(rol)} replace />
  }

  return <Outlet />
}
