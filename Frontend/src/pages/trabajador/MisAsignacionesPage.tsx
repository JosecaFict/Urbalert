import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, ChevronRight } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import Loading from '../../components/common/Loading'
import EmptyState from '../../components/common/EmptyState'
import ReclamoStatusBadge from '../../components/reclamos/ReclamoStatusBadge'
import { asignacionService } from '../../api/asignacionService'
import { extraerError } from '../../api/axios'
import { useToast } from '../../context/ToastContext'
import { formatDate } from '../../utils/formatDate'
import type { Asignacion } from '../../types/asignacion'

/** Pestañas que agrupan las asignaciones según el estado del reclamo. */
const PESTANAS = [
  { id: 'por_atender', label: 'Por atender', estados: ['Asignado'] },
  { id: 'en_atencion', label: 'En atención', estados: ['En atención'] },
  { id: 'reportadas', label: 'Reportadas', estados: ['Reportado'] },
  { id: 'finalizadas', label: 'Finalizadas', estados: ['Solucionado', 'No solucionado'] },
] as const

type PestanaId = (typeof PESTANAS)[number]['id']

export default function MisAsignacionesPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([])
  const [cargando, setCargando] = useState(true)
  const [pestana, setPestana] = useState<PestanaId>('por_atender')

  useEffect(() => {
    asignacionService
      .misAsignaciones()
      .then(setAsignaciones)
      .catch((e) => toast.error(extraerError(e)))
      .finally(() => setCargando(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cantidad de asignaciones por pestaña (para los contadores)
  const conteos = useMemo(() => {
    const mapa: Record<PestanaId, number> = {
      por_atender: 0,
      en_atencion: 0,
      reportadas: 0,
      finalizadas: 0,
    }
    for (const a of asignaciones) {
      const estado = a.reclamo_detalle.estado_nombre
      const p = PESTANAS.find((x) => (x.estados as readonly string[]).includes(estado))
      if (p) mapa[p.id] += 1
    }
    return mapa
  }, [asignaciones])

  const estadosActivos = PESTANAS.find((p) => p.id === pestana)!.estados as readonly string[]
  const visibles = asignaciones.filter((a) =>
    estadosActivos.includes(a.reclamo_detalle.estado_nombre),
  )

  if (cargando) return <Loading texto="Cargando asignaciones..." />

  return (
    <div>
      <PageHeader
        titulo="Mis asignaciones"
        descripcion="Reclamos que te han sido asignados para atender."
      />

      {/* Pestañas por estado */}
      <div className="mb-5 flex gap-2 overflow-x-auto border-b border-slate-200 dark:border-slate-700 scrollbar-thin">
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

      {visibles.length === 0 ? (
        <Card>
          <EmptyState
            titulo="Sin reclamos en esta sección"
            descripcion="No tienes asignaciones en este estado por el momento."
          />
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          {/* Cabecera (solo escritorio) */}
          <div className="hidden items-center gap-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 md:grid md:grid-cols-[130px_1fr_1fr_110px_40px]">
            <span>Estado</span>
            <span>Reclamo</span>
            <span>Dirección</span>
            <span>Asignado</span>
            <span className="text-right">Ver</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {visibles.map((a) => {
              const r = a.reclamo_detalle
              return (
                <button
                  key={a.id}
                  onClick={() => navigate(`/trabajador/asignaciones/${a.id}`)}
                  className="flex w-full flex-col gap-2 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-900/60 md:grid md:grid-cols-[130px_1fr_1fr_110px_40px] md:items-center md:gap-4"
                >
                  {/* Estado */}
                  <div>
                    <ReclamoStatusBadge estado={r.estado_nombre} />
                  </div>

                  {/* Reclamo: # + título */}
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-800 dark:text-slate-100">
                      <span className="text-slate-400 dark:text-slate-500">#{r.id}</span>{' '}
                      {r.titulo}
                    </p>
                    {/* En móvil mostramos la dirección debajo del título */}
                    <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500 dark:text-slate-400 md:hidden">
                      <MapPin size={12} className="shrink-0 text-primary-600" />
                      {r.direccion_texto}
                    </p>
                  </div>

                  {/* Dirección (solo escritorio) */}
                  <p className="hidden min-w-0 items-center gap-1.5 truncate text-sm text-slate-500 dark:text-slate-400 md:flex">
                    <MapPin size={14} className="shrink-0 text-primary-600" />
                    {r.direccion_texto}
                  </p>

                  {/* Fecha */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 md:text-sm">
                    <span className="md:hidden">Asignado el </span>
                    {formatDate(a.fecha_asignacion)}
                  </p>

                  {/* Acción */}
                  <span className="hidden justify-end text-primary-600 dark:text-primary-300 md:flex">
                    <ChevronRight size={18} />
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
