import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useAuth } from '../../context/AuthContext'
import { NAV_POR_ROL } from './navConfig'

const STORAGE_MENU = 'urbalert_menu_colapsado'

/** Deriva un título legible a partir de la ruta activa y el rol. */
function useTituloPagina(): string {
  const { rol } = useAuth()
  const { pathname } = useLocation()
  if (!rol) return 'Urbalert'
  const items = NAV_POR_ROL[rol]
  // Coincidencia más larga primero
  const orden = [...items].sort((a, b) => b.to.length - a.to.length)
  const match = orden.find((i) =>
    i.end ? pathname === i.to : pathname.startsWith(i.to),
  )
  if (match) return match.label
  if (pathname.startsWith('/perfil')) return 'Mi perfil'
  return 'Urbalert'
}

export default function DashboardLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false) // menú móvil (drawer)
  const [colapsado, setColapsado] = useState(
    () => localStorage.getItem(STORAGE_MENU) === '1',
  ) // menú de escritorio oculto/visible
  const titulo = useTituloPagina()

  // Persistir la preferencia y avisar a mapas/gráficos que cambió el ancho.
  useEffect(() => {
    localStorage.setItem(STORAGE_MENU, colapsado ? '1' : '0')
    const t = window.setTimeout(() => window.dispatchEvent(new Event('resize')), 250)
    return () => window.clearTimeout(t)
  }, [colapsado])

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950">
      <Sidebar
        abierto={menuAbierto}
        colapsado={colapsado}
        onCerrar={() => setMenuAbierto(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          titulo={titulo}
          colapsado={colapsado}
          onAbrirMenu={() => setMenuAbierto(true)}
          onToggleColapso={() => setColapsado((v) => !v)}
        />
        <main className="flex-1 overflow-y-auto scrollbar-thin p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
