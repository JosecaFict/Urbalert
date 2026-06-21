import type { RolNombre } from '../types/usuario'

export const ROL_LABEL: Record<RolNombre, string> = {
  administrador: 'Administrador',
  ciudadano: 'Ciudadano',
  encargado: 'Encargado',
  trabajador: 'Trabajador',
}

export const ROL_BADGE: Record<RolNombre, string> = {
  administrador: 'bg-primary-100 text-primary-800 dark:text-primary-300',
  ciudadano: 'bg-urban-100 text-urban-800',
  encargado: 'bg-indigo-100 text-indigo-800',
  trabajador: 'bg-amber-100 text-amber-800',
}

export function rolLabel(rol: RolNombre | null | undefined): string {
  if (!rol) return 'Sin rol'
  return ROL_LABEL[rol] ?? rol
}

/** Ruta del dashboard inicial según el rol del usuario. */
export function rutaInicialPorRol(rol: RolNombre | null | undefined): string {
  switch (rol) {
    case 'administrador':
      return '/admin'
    case 'encargado':
      return '/encargado'
    case 'trabajador':
      return '/trabajador'
    case 'ciudadano':
      return '/ciudadano'
    default:
      return '/login'
  }
}
