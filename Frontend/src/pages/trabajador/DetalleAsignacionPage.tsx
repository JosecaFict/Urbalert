import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Wrench, FileText } from 'lucide-react'
import Loading from '../../components/common/Loading'
import Button from '../../components/common/Button'
import ReclamoDetailView from '../../components/reclamos/ReclamoDetailView'
import { asignacionService } from '../../api/asignacionService'
import { reclamoService } from '../../api/reclamoService'
import { reporteService } from '../../api/reporteService'
import { extraerError } from '../../api/axios'
import { useToast } from '../../context/ToastContext'
import type { Asignacion } from '../../types/asignacion'
import type { ReclamoDetalle } from '../../types/reclamo'
import type { Reporte } from '../../types/reporte'

export default function DetalleAsignacionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const [asignacion, setAsignacion] = useState<Asignacion | null>(null)
  const [reclamo, setReclamo] = useState<ReclamoDetalle | null>(null)
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [cargando, setCargando] = useState(true)
  const [accionando, setAccionando] = useState(false)

  const cargar = async () => {
    if (!id) return
    try {
      const asig = await asignacionService.obtener(Number(id))
      setAsignacion(asig)
      const [rec, reps] = await Promise.all([
        reclamoService.obtener(asig.reclamo),
        reporteService.porReclamo(asig.reclamo),
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

  const iniciarAtencion = async () => {
    if (!reclamo) return
    setAccionando(true)
    try {
      const actualizado = await reclamoService.cambiarEstado(
        reclamo.id,
        'En atención',
        'El trabajador inició la atención del reclamo.',
      )
      setReclamo(actualizado)
      toast.exito('Reclamo marcado como "En atención".')
    } catch (e) {
      toast.error(extraerError(e))
    } finally {
      setAccionando(false)
    }
  }

  if (cargando) return <Loading texto="Cargando asignación..." />
  if (!reclamo || !asignacion) return null

  const estado = reclamo.estado_nombre
  const puedeIniciar = estado === 'Asignado'
  const puedeReportar = estado === 'Asignado' || estado === 'En atención'
  const yaReporto = reportes.length > 0

  const acciones = (
    <div className="space-y-3">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Estado actual: <strong className="text-slate-700 dark:text-slate-200">{estado}</strong>
      </p>

      {puedeIniciar && (
        <Button
          className="w-full"
          variant="secondary"
          icono={<Wrench size={18} />}
          cargando={accionando}
          onClick={iniciarAtencion}
        >
          Marcar "En atención"
        </Button>
      )}

      {puedeReportar && (
        <Button
          className="w-full"
          icono={<FileText size={18} />}
          onClick={() => navigate(`/trabajador/asignaciones/${asignacion.id}/reporte`)}
        >
          Crear reporte de atención
        </Button>
      )}

      {yaReporto && (
        <div className="rounded-lg bg-sky-50 p-3 text-sm text-sky-700">
          Ya enviaste un reporte. El encargado lo revisará y cerrará el reclamo.
        </div>
      )}

      {estado === 'Solucionado' && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          El reclamo fue cerrado como solucionado. ¡Buen trabajo!
        </div>
      )}
      {estado === 'No solucionado' && (
        <div className="rounded-lg bg-slate-100 dark:bg-slate-700 p-3 text-sm text-slate-600 dark:text-slate-300">
          El encargado cerró el reclamo como no solucionado.
        </div>
      )}
    </div>
  )

  return (
    <div>
      <button
        onClick={() => navigate('/trabajador/asignaciones')}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
      >
        <ArrowLeft size={16} /> Volver a mis asignaciones
      </button>

      <ReclamoDetailView reclamo={reclamo} acciones={acciones} />
    </div>
  )
}
