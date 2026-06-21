import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ListChecks, Wrench, FileText, CheckCircle2 } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import StatCard from '../../components/common/StatCard'
import Card from '../../components/common/Card'
import Loading from '../../components/common/Loading'
import EmptyState from '../../components/common/EmptyState'
import ReclamoStatusBadge from '../../components/reclamos/ReclamoStatusBadge'
import { asignacionService } from '../../api/asignacionService'
import { extraerError } from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { formatDate } from '../../utils/formatDate'
import type { Asignacion } from '../../types/asignacion'

export default function TrabajadorDashboardPage() {
  const { usuario } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    asignacionService
      .misAsignaciones()
      .then(setAsignaciones)
      .catch((e) => toast.error(extraerError(e)))
      .finally(() => setCargando(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const contar = (estados: string[]) =>
    asignaciones.filter((a) => estados.includes(a.reclamo_detalle.estado_nombre)).length

  if (cargando) return <Loading texto="Cargando tus asignaciones..." />

  return (
    <div>
      <PageHeader
        titulo={`Hola, ${usuario?.nombre_completo?.split(' ')[0] || 'trabajador'} 👷`}
        descripcion="Resumen de los reclamos asignados a ti."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard titulo="Asignados" valor={contar(['Asignado'])} icono={<ListChecks size={22} />} color="bg-purple-600" />
        <StatCard titulo="En atención" valor={contar(['En atención'])} icono={<Wrench size={22} />} color="bg-orange-500" />
        <StatCard titulo="Reportados" valor={contar(['Reportado'])} icono={<FileText size={22} />} color="bg-sky-500" />
        <StatCard titulo="Solucionados" valor={contar(['Solucionado'])} icono={<CheckCircle2 size={22} />} color="bg-green-600" />
      </div>

      <Card titulo="Asignaciones recientes" className="mt-8">
        {asignaciones.length === 0 ? (
          <EmptyState titulo="Sin asignaciones" descripcion="Todavía no tienes reclamos asignados." />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {asignaciones.slice(0, 6).map((a) => (
              <button
                key={a.id}
                onClick={() => navigate(`/trabajador/asignaciones/${a.id}`)}
                className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-800 dark:text-slate-100">
                    {a.reclamo_detalle.titulo}
                  </p>
                  <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                    {a.reclamo_detalle.direccion_texto} · {formatDate(a.fecha_asignacion)}
                  </p>
                </div>
                <ReclamoStatusBadge estado={a.reclamo_detalle.estado_nombre} />
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
