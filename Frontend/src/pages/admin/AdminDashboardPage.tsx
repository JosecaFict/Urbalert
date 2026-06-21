import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ClipboardList, Clock, CheckCircle2, Wrench, Users2,
  Percent, Timer, AlertTriangle,
} from 'lucide-react'
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import PageHeader from '../../components/common/PageHeader'
import StatCard from '../../components/common/StatCard'
import Card from '../../components/common/Card'
import Loading from '../../components/common/Loading'
import { defaultIcon } from '../../components/maps/leafletIcon'
import { dashboardService } from '../../api/dashboardService'
import { extraerError } from '../../api/axios'
import { useToast } from '../../context/ToastContext'
import { useTheme } from '../../context/ThemeContext'
import { estadoStyle } from '../../utils/statusColors'
import type {
  ReclamosPorCategoria, ReclamosPorEstado,
  ReclamosPorMes, ReclamoUbicacion, ResumenDashboard,
} from '../../types/dashboard'

const COLORES_CAT = ['#1d4ed8', '#059669', '#f59e0b', '#a855f7', '#ef4444', '#0ea5e9', '#f97316', '#22c55e', '#64748b']
const CENTRO_SCZ: [number, number] = [-17.7833, -63.1821]

/** Ajusta el mapa para mostrar todos los pines. */
function AjustarVista({ puntos }: { puntos: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (puntos.length === 1) map.setView(puntos[0], 14)
    else if (puntos.length > 1) map.fitBounds(puntos, { padding: [30, 30], maxZoom: 14 })
  }, [puntos, map])
  return null
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { oscuro } = useTheme()
  const [resumen, setResumen] = useState<ResumenDashboard | null>(null)
  const [porEstado, setPorEstado] = useState<ReclamosPorEstado[]>([])
  const [porCategoria, setPorCategoria] = useState<ReclamosPorCategoria[]>([])
  const [porMes, setPorMes] = useState<ReclamosPorMes[]>([])
  const [ubicaciones, setUbicaciones] = useState<ReclamoUbicacion[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardService.resumen(),
      dashboardService.porEstado(),
      dashboardService.porCategoria(),
      dashboardService.porMes(),
      dashboardService.ubicaciones(),
    ])
      .then(([r, e, c, m, u]) => {
        setResumen(r)
        setPorEstado(e)
        setPorCategoria(c)
        setPorMes(m)
        setUbicaciones(u)
      })
      .catch((err) => toast.error(extraerError(err)))
      .finally(() => setCargando(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Colores de los gráficos según el tema
  const gridColor = oscuro ? '#334155' : '#e2e8f0'
  const tickColor = oscuro ? '#94a3b8' : '#64748b'
  const tooltipStyle = {
    backgroundColor: oscuro ? '#1e293b' : '#ffffff',
    border: `1px solid ${oscuro ? '#334155' : '#e2e8f0'}`,
    borderRadius: 8,
    color: oscuro ? '#e2e8f0' : '#0f172a',
  }

  const puntos = useMemo(
    () => ubicaciones.map((u) => [u.lat, u.lng] as [number, number]),
    [ubicaciones],
  )

  if (cargando || !resumen) return <Loading texto="Cargando dashboard..." />

  const total = resumen.total_reclamos
  const enProceso =
    resumen.aceptados + resumen.asignados + resumen.en_atencion + resumen.reportados
  const tasaResolucion = total ? Math.round((resumen.solucionados / total) * 100) : 0
  const pendAntiguos = resumen.pendientes_antiguos ?? 0

  return (
    <div>
      <PageHeader
        titulo="Dashboard general"
        descripcion="Panorama completo de los reclamos ciudadanos de Santa Cruz de la Sierra."
      />

      {/* KPIs principales (el detalle por estado está en el gráfico) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard titulo="Total de reclamos" valor={total} icono={<ClipboardList size={22} />} color="bg-primary-700" />
        <StatCard
          titulo="Pendientes"
          valor={resumen.pendientes}
          icono={<Clock size={22} />}
          color="bg-amber-500"
          descripcion={pendAntiguos > 0 ? `${pendAntiguos} con demora` : undefined}
        />
        <StatCard titulo="En proceso" valor={enProceso} icono={<Wrench size={22} />} color="bg-orange-500" />
        <StatCard titulo="Resueltos" valor={resumen.solucionados} icono={<CheckCircle2 size={22} />} color="bg-green-600" />
      </div>

      {/* Métricas de supervisión */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          titulo="Tasa de resolución"
          valor={`${tasaResolucion}%`}
          icono={<Percent size={22} />}
          color="bg-emerald-600"
          descripcion="Resueltos sobre el total"
        />
        <StatCard
          titulo="Tiempo promedio"
          valor={resumen.tiempo_promedio_dias != null ? `${resumen.tiempo_promedio_dias} días` : '—'}
          icono={<Timer size={22} />}
          color="bg-sky-600"
          descripcion="De pendiente a resuelto"
        />
        <StatCard
          titulo="Pendientes con demora"
          valor={pendAntiguos}
          icono={<AlertTriangle size={22} />}
          color={pendAntiguos > 0 ? 'bg-red-500' : 'bg-slate-500'}
          descripcion={`Más de ${resumen.dias_pendiente_umbral ?? 7} días`}
        />
        <StatCard titulo="Asignaciones" valor={resumen.total_asignaciones ?? 0} icono={<Users2 size={22} />} color="bg-purple-600" />
      </div>

      {/* Mapa de la ciudad */}
      <Card titulo="Mapa de reclamos de la ciudad" className="mt-8">
        {puntos.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No hay reclamos con ubicación registrada.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
            <MapContainer
              center={puntos[0] ?? CENTRO_SCZ}
              zoom={12}
              style={{ height: '520px', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <AjustarVista puntos={puntos} />
              {ubicaciones.map((u) => (
                <Marker key={u.id} position={[u.lat, u.lng]} icon={defaultIcon}>
                  <Popup>
                    <strong>#{u.id} · {u.titulo}</strong>
                    <p>{u.estado}</p>
                    <button
                      onClick={() => navigate(`/admin/reclamos?reclamo=${u.id}`)}
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

      {/* Gráficos */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card titulo="Reclamos por estado">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={porEstado}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="estado" tick={{ fontSize: 11, fill: tickColor }} angle={-20} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: tickColor }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: oscuro ? '#33415555' : '#f1f5f9' }} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {porEstado.map((e, i) => (
                  <Cell key={i} fill={estadoStyle(e.estado).hex} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card titulo="Reclamos por categoría">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={porCategoria}
                dataKey="total"
                nameKey="categoria"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(e) => `${e.total}`}
              >
                {porCategoria.map((_, i) => (
                  <Cell key={i} fill={COLORES_CAT[i % COLORES_CAT.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            {porCategoria.map((c, i) => (
              <span key={c.categoria} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORES_CAT[i % COLORES_CAT.length] }} />
                {c.categoria}
              </span>
            ))}
          </div>
        </Card>

        <Card titulo="Reclamos por mes" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={porMes}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: tickColor }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: tickColor }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="total" stroke="#1d4ed8" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

    </div>
  )
}
