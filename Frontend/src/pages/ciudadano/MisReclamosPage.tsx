import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, LayoutGrid, List } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import ReclamoCard from '../../components/reclamos/ReclamoCard'
import ReclamoTable from '../../components/reclamos/ReclamoTable'
import Loading from '../../components/common/Loading'
import EmptyState from '../../components/common/EmptyState'
import { reclamoService } from '../../api/reclamoService'
import { extraerError } from '../../api/axios'
import { useToast } from '../../context/ToastContext'
import type { ReclamoListItem } from '../../types/reclamo'

/** Pestañas que agrupan los reclamos del ciudadano según su estado. */
const PESTANAS = [
  { id: 'todos', label: 'Todos', estados: null },
  { id: 'pendientes', label: 'Pendientes', estados: ['Pendiente'] },
  {
    id: 'en_proceso',
    label: 'En proceso',
    estados: ['Aceptado', 'Asignado', 'En atención', 'Reportado'],
  },
  { id: 'resueltos', label: 'Resueltos', estados: ['Solucionado'] },
  { id: 'no_resueltos', label: 'No resueltos', estados: ['Rechazado', 'No solucionado'] },
] as const

type PestanaId = (typeof PESTANAS)[number]['id']

export default function MisReclamosPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [reclamos, setReclamos] = useState<ReclamoListItem[]>([])
  const [cargando, setCargando] = useState(true)
  const [pestana, setPestana] = useState<PestanaId>('todos')
  const [vista, setVista] = useState<'grid' | 'tabla'>('grid')

  useEffect(() => {
    reclamoService
      .misReclamos()
      .then(setReclamos)
      .catch((e) => toast.error(extraerError(e)))
      .finally(() => setCargando(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Contador de reclamos por pestaña
  const conteos = useMemo(() => {
    const mapa = {} as Record<PestanaId, number>
    for (const p of PESTANAS) {
      mapa[p.id] = p.estados
        ? reclamos.filter((r) => (p.estados as readonly string[]).includes(r.estado_nombre)).length
        : reclamos.length
    }
    return mapa
  }, [reclamos])

  const estadosActivos = PESTANAS.find((p) => p.id === pestana)!.estados
  const filtrados = useMemo(
    () =>
      estadosActivos
        ? reclamos.filter((r) => (estadosActivos as readonly string[]).includes(r.estado_nombre))
        : reclamos,
    [reclamos, estadosActivos],
  )

  const irADetalle = (r: ReclamoListItem) => navigate(`/ciudadano/reclamos/${r.id}`)

  return (
    <div>
      <PageHeader
        titulo="Mis reclamos"
        descripcion="Consulta el estado y el historial de todos tus reclamos."
        accion={
          <Button icono={<PlusCircle size={18} />} onClick={() => navigate('/ciudadano/nuevo-reclamo')}>
            Nuevo reclamo
          </Button>
        }
      />

      {/* Pestañas por estado + selector de vista */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex gap-1 overflow-x-auto scrollbar-thin">
          {PESTANAS.map((p) => {
            const activa = p.id === pestana
            return (
              <button
                key={p.id}
                onClick={() => setPestana(p.id)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition ${
                  activa
                    ? 'border-primary-600 text-primary-700 dark:text-primary-300'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {p.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    activa
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {conteos[p.id]}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mb-2 flex gap-1 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
          <button
            onClick={() => setVista('grid')}
            className={`rounded-md p-2 ${vista === 'grid' ? 'bg-primary-700 text-white' : 'text-slate-500 dark:text-slate-400'}`}
            aria-label="Vista de tarjetas"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setVista('tabla')}
            className={`rounded-md p-2 ${vista === 'tabla' ? 'bg-primary-700 text-white' : 'text-slate-500 dark:text-slate-400'}`}
            aria-label="Vista de lista"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {cargando ? (
        <Loading texto="Cargando tus reclamos..." />
      ) : filtrados.length === 0 ? (
        <Card>
          <EmptyState
            titulo="No hay reclamos"
            descripcion={
              pestana === 'todos'
                ? 'Aún no has creado reclamos.'
                : 'No tienes reclamos en esta sección.'
            }
          />
        </Card>
      ) : vista === 'grid' ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((r) => (
            <ReclamoCard key={r.id} reclamo={r} onClick={() => irADetalle(r)} />
          ))}
        </div>
      ) : (
        <Card>
          <ReclamoTable reclamos={filtrados} onVer={irADetalle} mostrarCiudadano={false} />
        </Card>
      )}
    </div>
  )
}
