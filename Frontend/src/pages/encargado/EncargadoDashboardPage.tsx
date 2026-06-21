import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Inbox, CheckCircle2, Users2, ClipboardCheck, FolderCheck, ArrowRight } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import StatCard from '../../components/common/StatCard'
import Card from '../../components/common/Card'
import Loading from '../../components/common/Loading'
import { dashboardService } from '../../api/dashboardService'
import { extraerError } from '../../api/axios'
import { useToast } from '../../context/ToastContext'
import type { ResumenDashboard } from '../../types/dashboard'

export default function EncargadoDashboardPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [resumen, setResumen] = useState<ResumenDashboard | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    dashboardService
      .resumen()
      .then(setResumen)
      .catch((e) => toast.error(extraerError(e)))
      .finally(() => setCargando(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (cargando || !resumen) return <Loading texto="Cargando panel..." />

  return (
    <div>
      <PageHeader
        titulo="Panel del encargado"
        descripcion="Gestiona los reclamos ciudadanos: revisa, acepta, asigna y cierra."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard titulo="Pendientes por revisar" valor={resumen.pendientes} icono={<Inbox size={22} />} color="bg-amber-500" />
        <StatCard titulo="Aceptados" valor={resumen.aceptados} icono={<CheckCircle2 size={22} />} color="bg-blue-500" />
        <StatCard titulo="Asignados" valor={resumen.asignados} icono={<Users2 size={22} />} color="bg-purple-600" />
        <StatCard titulo="Reportes por revisar" valor={resumen.reportados} icono={<ClipboardCheck size={22} />} color="bg-sky-500" />
        <StatCard titulo="Solucionados" valor={resumen.solucionados} icono={<FolderCheck size={22} />} color="bg-green-600" />
        <StatCard titulo="No solucionados" valor={resumen.no_solucionados} icono={<FolderCheck size={22} />} color="bg-slate-600" />
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Card titulo="Acceso rápido">
          <div className="space-y-3">
            <button
              onClick={() => navigate('/encargado/pendientes')}
              className="flex w-full items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-left transition hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <Inbox size={20} />
                </span>
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">Reclamos pendientes</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Revisa y acepta o rechaza</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-slate-400 dark:text-slate-500" />
            </button>

            <button
              onClick={() => navigate('/encargado/reportes')}
              className="flex w-full items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 p-4 text-left transition hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                  <ClipboardCheck size={20} />
                </span>
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">Reportes de trabajadores</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Revisa reportes y cierra reclamos</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-slate-400 dark:text-slate-500" />
            </button>
          </div>
        </Card>

        <Card titulo="Resumen general">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-4">
              <dt className="text-slate-400 dark:text-slate-500">Total de reclamos</dt>
              <dd className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">{resumen.total_reclamos}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-4">
              <dt className="text-slate-400 dark:text-slate-500">En atención</dt>
              <dd className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">{resumen.en_atencion}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-4">
              <dt className="text-slate-400 dark:text-slate-500">Rechazados</dt>
              <dd className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">{resumen.rechazados}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-4">
              <dt className="text-slate-400 dark:text-slate-500">Trabajadores</dt>
              <dd className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">{resumen.total_trabajadores ?? '—'}</dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  )
}
