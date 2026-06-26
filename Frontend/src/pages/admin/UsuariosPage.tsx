import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import UsuariosManager from '../../components/admin/UsuariosManager'
import { usuarioService } from '../../api/usuarioService'
import type { RolNombre, Usuario } from '../../types/usuario'

type TabKey = 'todos' | RolNombre

interface TabConfig {
  key: TabKey
  label: string
  rolFiltro?: RolNombre
  cargar: () => Promise<Usuario[]>
  descripcion: string
}

const TABS: TabConfig[] = [
  {
    key: 'todos',
    label: 'Todos',
    cargar: usuarioService.listar,
    descripcion: 'Administra todos los usuarios del sistema, sin importar su rol.',
  },
  {
    key: 'administrador',
    label: 'Administradores',
    rolFiltro: 'administrador',
    cargar: usuarioService.administradores,
    descripcion: 'Usuarios con acceso total a la administración del sistema.',
  },
  {
    key: 'ciudadano',
    label: 'Ciudadanos',
    rolFiltro: 'ciudadano',
    cargar: usuarioService.ciudadanos,
    descripcion: 'Usuarios ciudadanos que reportan reclamos urbanos.',
  },
  {
    key: 'encargado',
    label: 'Encargados',
    rolFiltro: 'encargado',
    cargar: usuarioService.encargados,
    descripcion: 'Personal que gestiona, asigna y supervisa los reclamos.',
  },
  {
    key: 'trabajador',
    label: 'Trabajadores',
    rolFiltro: 'trabajador',
    cargar: usuarioService.trabajadores,
    descripcion: 'Personal operativo que atiende los reclamos en terreno.',
  },
]

function esTabValido(valor: string | null): valor is TabKey {
  return !!valor && TABS.some((t) => t.key === valor)
}

export default function UsuariosPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const rolParam = searchParams.get('rol')
  const tabActivo: TabKey = esTabValido(rolParam) ? rolParam : 'todos'

  const [conteos, setConteos] = useState<Record<TabKey, number>>({
    todos: 0,
    administrador: 0,
    ciudadano: 0,
    encargado: 0,
    trabajador: 0,
  })

  const refrescarConteos = async () => {
    try {
      const todos = await usuarioService.listar()
      setConteos({
        todos: todos.length,
        administrador: todos.filter((u) => u.rol_nombre === 'administrador').length,
        ciudadano: todos.filter((u) => u.rol_nombre === 'ciudadano').length,
        encargado: todos.filter((u) => u.rol_nombre === 'encargado').length,
        trabajador: todos.filter((u) => u.rol_nombre === 'trabajador').length,
      })
    } catch {
      // los conteos quedan como estaban
    }
  }

  useEffect(() => {
    refrescarConteos()
  }, [])

  const cambiarTab = (key: TabKey) => {
    const next = new URLSearchParams(searchParams)
    if (key === 'todos') next.delete('rol')
    else next.set('rol', key)
    setSearchParams(next, { replace: true })
  }

  const tab = useMemo(
    () => TABS.find((t) => t.key === tabActivo) ?? TABS[0],
    [tabActivo],
  )

  const tabs = (
    <div className="mb-6 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-card">
      <div className="flex overflow-x-auto scrollbar-thin">
        {TABS.map((t) => {
          const activo = t.key === tabActivo
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => cambiarTab(t.key)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-5 py-3 text-sm font-medium transition-colors ${
                activo
                  ? 'border-primary-600 text-primary-700 dark:text-primary-300 bg-primary-50/50 dark:bg-primary-900/20'
                  : 'border-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-100'
              }`}
            >
              <span>{t.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  activo
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {conteos[t.key]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <UsuariosManager
      key={tab.key}
      titulo="Gestión de usuarios"
      descripcion={tab.descripcion}
      rolFiltro={tab.rolFiltro}
      cargar={tab.cargar}
      onCambio={refrescarConteos}
      encabezadoExtra={tabs}
    />
  )
}
