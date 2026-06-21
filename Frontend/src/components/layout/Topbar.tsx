import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, ChevronDown, User, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { rolLabel, ROL_BADGE } from '../../utils/roleLabels'
import NotificacionesCampana from '../notificaciones/NotificacionesCampana'
import ThemeToggle from '../common/ThemeToggle'

interface TopbarProps {
  titulo: string
  colapsado: boolean
  onAbrirMenu: () => void
  onToggleColapso: () => void
}

export default function Topbar({ titulo, colapsado, onAbrirMenu, onToggleColapso }: TopbarProps) {
  const { usuario, rol, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      toast.info('Sesión cerrada.')
      navigate('/login')
    } catch {
      toast.error('No se pudo cerrar la sesión.')
    }
  }

  const iniciales = (
    `${usuario?.nombres ?? ''} ${usuario?.apellidos ?? ''}`.trim() ||
    usuario?.email ||
    '?'
  )
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  // En la barra mostramos solo los nombres de pila (ej. "Gloria Nicole").
  const nombreCorto = usuario?.nombres || usuario?.nombre_completo || usuario?.email

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 lg:px-6">
      <div className="flex items-center gap-3">
        {/* Móvil: abre el menú lateral */}
        <button
          onClick={onAbrirMenu}
          className="rounded-lg p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu size={22} />
        </button>
        {/* Escritorio: oculta/muestra el menú lateral */}
        <button
          onClick={onToggleColapso}
          className="hidden rounded-lg p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 lg:inline-flex"
          aria-label={colapsado ? 'Mostrar menú' : 'Ocultar menú'}
          title={colapsado ? 'Mostrar menú' : 'Ocultar menú'}
        >
          {colapsado ? <PanelLeftOpen size={22} /> : <PanelLeftClose size={22} />}
        </button>
        <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{titulo}</h1>
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <NotificacionesCampana />

        <div className="relative">
        <button
          onClick={() => setMenuAbierto((v) => !v)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-700 text-sm font-semibold text-white">
            {iniciales}
          </div>
          <div className="hidden text-left sm:block">
            <p className="max-w-[140px] truncate text-sm font-medium text-slate-700 dark:text-slate-200">
              {nombreCorto}
            </p>
            <span className="text-xs text-slate-400 dark:text-slate-500">{rolLabel(rol)}</span>
          </div>
          <ChevronDown size={16} className="text-slate-400 dark:text-slate-500" />
        </button>

        {menuAbierto && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuAbierto(false)} />
            <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-card-hover">
              <div className="border-b border-slate-100 dark:border-slate-700 px-4 py-3">
                <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                  {usuario?.email}
                </p>
                {rol && (
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${ROL_BADGE[rol]}`}>
                    {rolLabel(rol)}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setMenuAbierto(false)
                  navigate('/perfil')
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <User size={16} /> Mi perfil
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} /> Cerrar sesión
              </button>
            </div>
          </>
        )}
        </div>
      </div>
    </header>
  )
}
