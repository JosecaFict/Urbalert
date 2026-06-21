import { NavLink } from 'react-router-dom'
import { ShieldAlert, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { NAV_POR_ROL } from './navConfig'
import { rolLabel } from '../../utils/roleLabels'

interface SidebarProps {
  abierto: boolean
  colapsado: boolean
  onCerrar: () => void
}

export default function Sidebar({ abierto, colapsado, onCerrar }: SidebarProps) {
  const { rol, usuario } = useAuth()
  const items = rol ? NAV_POR_ROL[rol] : []

  return (
    <>
      {/* Overlay en móvil */}
      {abierto && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden"
          onClick={onCerrar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-primary-900 text-slate-100 transition-all duration-200 lg:static lg:translate-x-0 ${
          abierto ? 'translate-x-0' : '-translate-x-full'
        } ${colapsado ? 'lg:w-0 lg:overflow-hidden lg:border-0' : ''}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-urban-500">
              <ShieldAlert size={20} className="text-white" />
            </div>
            <div>
              <p className="text-lg font-bold leading-tight text-white">Urbalert</p>
              <p className="text-[11px] text-slate-300">Santa Cruz de la Sierra</p>
            </div>
          </div>
          <button onClick={onCerrar} className="text-slate-300 lg:hidden" aria-label="Cerrar menú">
            <X size={20} />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onCerrar}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-urban-500 text-white'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        {/* Usuario */}
        <div className="border-t border-white/10 px-5 py-4">
          <p className="truncate text-sm font-medium text-white">
            {usuario?.nombres || usuario?.nombre_completo || usuario?.email}
          </p>
          <p className="text-xs text-urban-300">{rolLabel(rol)}</p>
        </div>
      </aside>
    </>
  )
}
