import {
  LayoutDashboard,
  Users,
  UserCog,
  HardHat,
  UserRound,
  Tags,
  ClipboardList,
  ScrollText,
  PlusCircle,
  FileText,
  ListChecks,
  ClipboardCheck,
  Inbox,
  type LucideIcon,
} from 'lucide-react'
import type { RolNombre } from '../../types/usuario'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export const NAV_POR_ROL: Record<RolNombre, NavItem[]> = {
  administrador: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
    { to: '/admin/ciudadanos', label: 'Ciudadanos', icon: UserRound },
    { to: '/admin/encargados', label: 'Encargados', icon: UserCog },
    { to: '/admin/trabajadores', label: 'Trabajadores', icon: HardHat },
    { to: '/admin/categorias', label: 'Categorías', icon: Tags },
    { to: '/admin/reclamos', label: 'Todos los reclamos', icon: ClipboardList },
    { to: '/admin/bitacora', label: 'Bitácora', icon: ScrollText },
  ],
  ciudadano: [
    { to: '/ciudadano', label: 'Inicio', icon: LayoutDashboard, end: true },
    { to: '/ciudadano/nuevo-reclamo', label: 'Nuevo reclamo', icon: PlusCircle },
    { to: '/ciudadano/mis-reclamos', label: 'Mis reclamos', icon: ClipboardList },
  ],
  encargado: [
    { to: '/encargado', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/encargado/pendientes', label: 'Reclamos pendientes', icon: Inbox },
    { to: '/encargado/reclamos', label: 'Gestión de reclamos', icon: ClipboardList },
    { to: '/encargado/reportes', label: 'Revisar reportes', icon: ClipboardCheck },
  ],
  trabajador: [
    { to: '/trabajador', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/trabajador/asignaciones', label: 'Mis asignaciones', icon: ListChecks },
  ],
}

export const ICONO_REPORTE = FileText
