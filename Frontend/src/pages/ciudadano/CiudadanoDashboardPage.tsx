import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ClipboardList, Clock, Wrench, CheckCircle2, PlusCircle, Check,
  XCircle, AlertTriangle, MapPin, ArrowRight, Bell,
} from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import PageHeader from '../../components/common/PageHeader'
import StatCard from '../../components/common/StatCard'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Loading from '../../components/common/Loading'
import EmptyState from '../../components/common/EmptyState'
import ReclamoStatusBadge from '../../components/reclamos/ReclamoStatusBadge'
import { defaultIcon } from '../../components/maps/leafletIcon'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { reclamoService } from '../../api/reclamoService'
import { notificacionService } from '../../api/notificacionService'
import { extraerError } from '../../api/axios'
import { estadoStyle } from '../../utils/statusColors'
import { timeAgo } from '../../utils/formatDate'
import type { ReclamoListItem } from '../../types/reclamo'
import type { Notificacion } from '../../types/notificacion'

/** Pasos del flujo normal de un reclamo (para la línea de progreso). */
const PASOS = ['Pendiente', 'Aceptado', 'Asignado', 'En atención', 'Reportado', 'Solucionado']
const ESTADOS_ACTIVOS = ['Pendiente', 'Aceptado', 'Asignado', 'En atención', 'Reportado']
const CENTRO_SCZ: [number, number] = [-17.7833, -63.1821]

/** Ajusta el mapa para que todos los pines queden visibles. */
function AjustarVista({ puntos }: { puntos: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (puntos.length === 1) {
      map.setView(puntos[0], 15)
    } else if (puntos.length > 1) {
      map.fitBounds(puntos, { padding: [30, 30], maxZoom: 15 })
    }
  }, [puntos, map])
  return null
}

/** Línea de progreso con los pasos del reclamo. */
function LineaProgreso({ estado }: { estado: string }) {
  if (estado === 'Rechazado' || estado === 'No solucionado') {
    const rechazado = estado === 'Rechazado'
    return (
      <div
        className={`flex items-center gap-3 rounded-lg p-4 ${
          rechazado
            ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
        }`}
      >
        {rechazado ? <XCircle size={22} /> : <AlertTriangle size={22} />}
        <p className="text-sm font-medium">
          {rechazado
            ? 'Este reclamo fue rechazado. Revisa el motivo en el detalle.'
            : 'Este reclamo se cerró como No solucionado.'}
        </p>
      </div>
    )
  }

  const idx = PASOS.indexOf(estado)
  return (
    <ol className="flex items-start">
      {PASOS.map((paso, i) => {
        const completado = i < idx
        const actual = i === idx
        return (
          <li key={paso} className="relative flex flex-1 flex-col items-center">
            {i > 0 && (
              <span
                className={`absolute right-1/2 top-3.5 h-0.5 w-full ${
                  i <= idx ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            )}
            <div
              className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                completado
                  ? 'bg-green-500 text-white'
                  : actual
                    ? 'bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-900/40'
                    : 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
              }`}
            >
              {completado ? <Check size={14} /> : i + 1}
            </div>
            <span
              className={`mt-1.5 text-center text-[10px] leading-tight ${
                actual
                  ? 'font-semibold text-primary-700 dark:text-primary-300'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {paso}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export default function CiudadanoDashboardPage() {
  const { usuario } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [reclamos, setReclamos] = useState<ReclamoListItem[]>([])
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    Promise.all([reclamoService.misReclamos(), notificacionService.listar()])
      .then(([recs, notis]) => {
        setReclamos(recs)
        setNotificaciones(notis)
      })
      .catch((e) => toast.error(extraerError(e)))
      .finally(() => setCargando(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const contar = (estados: string[]) =>
    reclamos.filter((r) => estados.includes(r.estado_nombre)).length

  // Reclamo activo más reciente (o el más reciente si no hay activos)
  const activo = useMemo(
    () => reclamos.find((r) => ESTADOS_ACTIVOS.includes(r.estado_nombre)) ?? reclamos[0],
    [reclamos],
  )

  // Datos para el gráfico de estados
  const datosEstado = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const r of reclamos) counts[r.estado_nombre] = (counts[r.estado_nombre] ?? 0) + 1
    return Object.entries(counts).map(([estado, total]) => ({ estado, total }))
  }, [reclamos])

  // Puntos del mini-mapa
  const puntos = useMemo(
    () =>
      reclamos
        .map((r) => [Number(r.latitud), Number(r.longitud)] as [number, number])
        .filter(([la, ln]) => !Number.isNaN(la) && !Number.isNaN(ln)),
    [reclamos],
  )
  const reclamosConCoords = reclamos.filter(
    (r) => !Number.isNaN(Number(r.latitud)) && !Number.isNaN(Number(r.longitud)),
  )

  if (cargando) return <Loading texto="Cargando tu información..." />

  return (
    <div>
      <PageHeader
        titulo={`Hola, ${usuario?.nombres?.split(' ')[0] || 'ciudadano'} 👋`}
        descripcion="Este es el resumen de tus reclamos en Urbalert."
        accion={
          <Button icono={<PlusCircle size={18} />} onClick={() => navigate('/ciudadano/nuevo-reclamo')}>
            Nuevo reclamo
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard titulo="Total de reclamos" valor={reclamos.length} icono={<ClipboardList size={22} />} color="bg-primary-700" />
        <StatCard titulo="Pendientes" valor={contar(['Pendiente'])} icono={<Clock size={22} />} color="bg-amber-500" />
        <StatCard titulo="En atención" valor={contar(['Asignado', 'En atención', 'Reportado'])} icono={<Wrench size={22} />} color="bg-orange-500" />
        <StatCard titulo="Solucionados" valor={contar(['Solucionado'])} icono={<CheckCircle2 size={22} />} color="bg-green-600" />
      </div>

      {reclamos.length === 0 ? (
        <Card className="mt-8">
          <EmptyState
            titulo="Aún no tienes reclamos"
            descripcion="Crea tu primer reclamo para reportar un problema en tu zona y hacerle seguimiento."
            accion={
              <Button icono={<PlusCircle size={18} />} onClick={() => navigate('/ciudadano/nuevo-reclamo')}>
                Crear reclamo
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          {/* Seguimiento del reclamo activo + gráfico de estados */}
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <Card titulo="Seguimiento de tu reclamo" className="lg:col-span-2">
              {activo && (
                <div>
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-800 dark:text-slate-100">
                        <span className="text-slate-400 dark:text-slate-500">#{activo.id}</span>{' '}
                        {activo.titulo}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                        <MapPin size={14} className="text-primary-600" />
                        <span className="truncate">{activo.direccion_texto}</span>
                      </p>
                    </div>
                    <ReclamoStatusBadge estado={activo.estado_nombre} />
                  </div>

                  <LineaProgreso estado={activo.estado_nombre} />

                  <div className="mt-5 text-right">
                    <Link
                      to={`/ciudadano/reclamos/${activo.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 dark:text-primary-300 hover:gap-2"
                    >
                      Ver detalle <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              )}
            </Card>

            <Card titulo="Tus reclamos por estado">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={datosEstado}
                    dataKey="total"
                    nameKey="estado"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {datosEstado.map((e) => (
                      <Cell key={e.estado} fill={estadoStyle(e.estado).hex} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                {datosEstado.map((e) => (
                  <span key={e.estado} className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: estadoStyle(e.estado).hex }}
                    />
                    {e.estado} ({e.total})
                  </span>
                ))}
              </div>
            </Card>
          </div>

          {/* Mini-mapa + actividad reciente */}
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card titulo="Mapa de tus reclamos" className="lg:col-span-2">
              {puntos.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Tus reclamos no tienen ubicación registrada.
                </p>
              ) : (
                <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                  <MapContainer
                    center={puntos[0] ?? CENTRO_SCZ}
                    zoom={13}
                    style={{ height: '320px', width: '100%' }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <AjustarVista puntos={puntos} />
                    {reclamosConCoords.map((r) => (
                      <Marker
                        key={r.id}
                        position={[Number(r.latitud), Number(r.longitud)]}
                        icon={defaultIcon}
                      >
                        <Popup>
                          <strong>#{r.id} · {r.titulo}</strong>
                          <p>{r.estado_nombre}</p>
                          <button
                            onClick={() => navigate(`/ciudadano/reclamos/${r.id}`)}
                            className="text-primary-700 underline"
                          >
                            Ver detalle
                          </button>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              )}
            </Card>

            <Card titulo="Actividad reciente">
              {notificaciones.length === 0 ? (
                <div className="py-6 text-center">
                  <Bell size={26} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-sm text-slate-400 dark:text-slate-500">Sin novedades por ahora.</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                  {notificaciones.slice(0, 6).map((n) => (
                    <li key={n.id}>
                      <button
                        onClick={() => n.url && navigate(n.url)}
                        className="flex w-full items-start gap-3 py-3 text-left transition hover:opacity-80"
                      >
                        <span
                          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                            n.leida ? 'bg-slate-300 dark:bg-slate-600' : 'bg-primary-600'
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{n.titulo}</p>
                          <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{n.mensaje}</p>
                          <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                            {timeAgo(n.fecha_creacion)}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
