import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, XCircle, ClipboardCheck, ImageIcon } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Loading from '../../components/common/Loading'
import EmptyState from '../../components/common/EmptyState'
import ReclamoTable from '../../components/reclamos/ReclamoTable'
import ReclamoDetailView from '../../components/reclamos/ReclamoDetailView'
import { reclamoService } from '../../api/reclamoService'
import { reporteService } from '../../api/reporteService'
import { extraerError } from '../../api/axios'
import { useToast } from '../../context/ToastContext'
import { formatDateTime } from '../../utils/formatDate'
import type { ReclamoDetalle, ReclamoListItem } from '../../types/reclamo'
import type { Reporte } from '../../types/reporte'

function ListaReportes() {
  const navigate = useNavigate()
  const toast = useToast()
  const [reclamos, setReclamos] = useState<ReclamoListItem[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    reclamoService
      .listar({ estado: 'Reportado' })
      .then(setReclamos)
      .catch((e) => toast.error(extraerError(e)))
      .finally(() => setCargando(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <PageHeader
        titulo="Revisar reportes"
        descripcion="Reclamos con reporte de atención enviado por los trabajadores."
      />
      {cargando ? (
        <Loading texto="Cargando reportes..." />
      ) : reclamos.length === 0 ? (
        <Card>
          <EmptyState
            icono={<ClipboardCheck size={28} />}
            titulo="No hay reportes por revisar"
            descripcion="Cuando un trabajador envíe un reporte, aparecerá aquí para que lo revises."
          />
        </Card>
      ) : (
        <Card>
          <ReclamoTable
            reclamos={reclamos}
            onVer={(r) => navigate(`/encargado/reportes/${r.id}`)}
          />
        </Card>
      )}
    </div>
  )
}

function RevisarDetalle({ id }: { id: number }) {
  const navigate = useNavigate()
  const toast = useToast()
  const [reclamo, setReclamo] = useState<ReclamoDetalle | null>(null)
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [cargando, setCargando] = useState(true)
  const [accionando, setAccionando] = useState(false)

  const cargar = async () => {
    try {
      const [rec, reps] = await Promise.all([
        reclamoService.obtener(id),
        reporteService.porReclamo(id),
      ])
      setReclamo(rec)
      setReportes(reps)
    } catch (e) {
      toast.error(extraerError(e))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const cerrar = async (estado: 'Solucionado' | 'No solucionado') => {
    setAccionando(true)
    try {
      setReclamo(
        await reclamoService.cambiarEstado(
          id,
          estado,
          `El encargado revisó el reporte y cerró el reclamo como ${estado.toLowerCase()}.`,
        ),
      )
      toast.exito(`Reclamo cerrado como ${estado}.`)
    } catch (e) {
      toast.error(extraerError(e))
    } finally {
      setAccionando(false)
    }
  }

  if (cargando) return <Loading texto="Cargando reporte..." />
  if (!reclamo) return null

  const reporte = reportes[0]
  const cerrado = reclamo.estado_nombre === 'Solucionado' || reclamo.estado_nombre === 'No solucionado'

  const acciones = (
    <div className="space-y-3">
      {reporte ? (
        <div className="rounded-lg bg-sky-50 p-3 text-sm">
          <p className="font-medium text-sky-800">Reporte del trabajador</p>
          <p className="mt-1 text-slate-600 dark:text-slate-300">{reporte.descripcion_trabajo}</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Resultado: <strong>{reporte.resultado_display}</strong>
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{formatDateTime(reporte.fecha_reporte)}</p>
          {reporte.foto_evidencia && (
            <a
              href={reporte.foto_evidencia}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary-700 dark:text-primary-300 hover:underline"
            >
              <ImageIcon size={14} /> Ver foto de evidencia
            </a>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">No se encontró el reporte.</p>
      )}

      {!cerrado ? (
        <>
          <Button className="w-full" variant="success" icono={<CheckCircle2 size={18} />} cargando={accionando} onClick={() => cerrar('Solucionado')}>
            Cerrar como Solucionado
          </Button>
          <Button className="w-full" variant="outline" icono={<XCircle size={18} />} onClick={() => cerrar('No solucionado')}>
            Cerrar como No solucionado
          </Button>
        </>
      ) : (
        <div className="rounded-lg bg-slate-100 dark:bg-slate-700 p-3 text-sm text-slate-600 dark:text-slate-300">
          Reclamo cerrado como <strong>{reclamo.estado_nombre}</strong>.
        </div>
      )}
    </div>
  )

  return (
    <div>
      <button
        onClick={() => navigate('/encargado/reportes')}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
      >
        <ArrowLeft size={16} /> Volver a reportes
      </button>
      <ReclamoDetailView reclamo={reclamo} acciones={acciones} />
    </div>
  )
}

export default function RevisarReportePage() {
  const { id } = useParams<{ id: string }>()
  return id ? <RevisarDetalle id={Number(id)} /> : <ListaReportes />
}
