import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, X, UserPlus, CheckCircle2, XCircle } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Select from '../../components/common/Select'
import Textarea from '../../components/common/Textarea'
import Modal from '../../components/common/Modal'
import Loading from '../../components/common/Loading'
import ReclamoTable from '../../components/reclamos/ReclamoTable'
import ReclamoDetailView from '../../components/reclamos/ReclamoDetailView'
import { reclamoService } from '../../api/reclamoService'
import { reporteService } from '../../api/reporteService'
import { extraerError } from '../../api/axios'
import { useToast } from '../../context/ToastContext'
import type { EstadoNombre, ReclamoDetalle, ReclamoListItem } from '../../types/reclamo'
import type { Reporte } from '../../types/reporte'

const ESTADOS: EstadoNombre[] = [
  'Pendiente', 'Aceptado', 'Rechazado', 'Asignado',
  'En atención', 'Reportado', 'Solucionado', 'No solucionado',
]

/** Vista de lista de todos los reclamos para gestión. */
function ListaGestion() {
  const navigate = useNavigate()
  const toast = useToast()
  const [reclamos, setReclamos] = useState<ReclamoListItem[]>([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('')

  useEffect(() => {
    reclamoService
      .listar(filtro ? { estado: filtro } : undefined)
      .then(setReclamos)
      .catch((e) => toast.error(extraerError(e)))
      .finally(() => setCargando(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro])

  return (
    <div>
      <PageHeader
        titulo="Gestión de reclamos"
        descripcion="Todos los reclamos del sistema. Haz clic para gestionarlos."
      />
      <Card className="mb-6">
        <div className="w-full max-w-xs">
          <Select
            label="Filtrar por estado"
            placeholder="Todos los estados"
            opciones={ESTADOS.map((e) => ({ value: e, label: e }))}
            value={filtro}
            onChange={(e) => {
              setCargando(true)
              setFiltro(e.target.value)
            }}
          />
        </div>
      </Card>
      <Card>
        <ReclamoTable
          reclamos={reclamos}
          cargando={cargando}
          onVer={(r) => navigate(`/encargado/reclamos/${r.id}`)}
        />
      </Card>
    </div>
  )
}

/** Vista de detalle/gestión de un reclamo. */
function DetalleGestion({ id }: { id: number }) {
  const navigate = useNavigate()
  const toast = useToast()
  const [reclamo, setReclamo] = useState<ReclamoDetalle | null>(null)
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [cargando, setCargando] = useState(true)
  const [accionando, setAccionando] = useState(false)
  const [modalRechazo, setModalRechazo] = useState(false)
  const [motivo, setMotivo] = useState('')

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

  const aceptar = async () => {
    setAccionando(true)
    try {
      setReclamo(await reclamoService.aceptar(id))
      toast.exito('Reclamo aceptado.')
    } catch (e) {
      toast.error(extraerError(e))
    } finally {
      setAccionando(false)
    }
  }

  const rechazar = async () => {
    if (!motivo.trim()) {
      toast.error('Debes indicar el motivo del rechazo.')
      return
    }
    setAccionando(true)
    try {
      setReclamo(await reclamoService.rechazar(id, motivo))
      toast.exito('Reclamo rechazado.')
      setModalRechazo(false)
      setMotivo('')
    } catch (e) {
      toast.error(extraerError(e))
    } finally {
      setAccionando(false)
    }
  }

  const cerrar = async (estado: 'Solucionado' | 'No solucionado') => {
    setAccionando(true)
    try {
      setReclamo(
        await reclamoService.cambiarEstado(
          id,
          estado,
          `El encargado cerró el reclamo como ${estado.toLowerCase()}.`,
        ),
      )
      toast.exito(`Reclamo cerrado como ${estado}.`)
    } catch (e) {
      toast.error(extraerError(e))
    } finally {
      setAccionando(false)
    }
  }

  if (cargando) return <Loading texto="Cargando reclamo..." />
  if (!reclamo) return null

  const estado = reclamo.estado_nombre

  const acciones = (
    <div className="space-y-3">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Estado actual: <strong className="text-slate-700 dark:text-slate-200">{estado}</strong>
      </p>

      {estado === 'Pendiente' && (
        <>
          <Button className="w-full" variant="secondary" icono={<Check size={18} />} cargando={accionando} onClick={aceptar}>
            Aceptar reclamo
          </Button>
          <Button className="w-full" variant="danger" icono={<X size={18} />} onClick={() => setModalRechazo(true)}>
            Rechazar reclamo
          </Button>
        </>
      )}

      {estado === 'Aceptado' && (
        <Button
          className="w-full"
          icono={<UserPlus size={18} />}
          onClick={() => navigate(`/encargado/reclamos/${id}/asignar`)}
        >
          Asignar a un trabajador
        </Button>
      )}

      {(estado === 'Asignado' || estado === 'En atención') && (
        <div className="rounded-lg bg-purple-50 p-3 text-sm text-purple-700">
          El reclamo está en proceso de atención por el trabajador asignado.
        </div>
      )}

      {estado === 'Reportado' && (
        <>
          {reportes[0] && (
            <div className="rounded-lg bg-sky-50 p-3 text-sm text-sky-800">
              <p className="font-medium">Reporte del trabajador</p>
              <p className="mt-1">{reportes[0].descripcion_trabajo}</p>
              <p className="mt-1 text-xs">Resultado: {reportes[0].resultado_display}</p>
            </div>
          )}
          <Button className="w-full" variant="success" icono={<CheckCircle2 size={18} />} cargando={accionando} onClick={() => cerrar('Solucionado')}>
            Cerrar como Solucionado
          </Button>
          <Button className="w-full" variant="outline" icono={<XCircle size={18} />} onClick={() => cerrar('No solucionado')}>
            Cerrar como No solucionado
          </Button>
        </>
      )}

      {(estado === 'Solucionado' || estado === 'No solucionado' || estado === 'Rechazado') && (
        <div className="rounded-lg bg-slate-100 dark:bg-slate-700 p-3 text-sm text-slate-600 dark:text-slate-300">
          Este reclamo ya fue cerrado. No requiere más acciones.
        </div>
      )}
    </div>
  )

  return (
    <div>
      <button
        onClick={() => navigate('/encargado/reclamos')}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
      >
        <ArrowLeft size={16} /> Volver a la gestión
      </button>

      <ReclamoDetailView reclamo={reclamo} acciones={acciones} />

      <Modal
        abierto={modalRechazo}
        onCerrar={() => setModalRechazo(false)}
        titulo="Rechazar reclamo"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalRechazo(false)}>Cancelar</Button>
            <Button variant="danger" cargando={accionando} onClick={rechazar}>Confirmar rechazo</Button>
          </>
        }
      >
        <Textarea
          label="Motivo del rechazo"
          required
          rows={4}
          placeholder="Explica por qué se rechaza este reclamo..."
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />
      </Modal>
    </div>
  )
}

export default function GestionReclamoPage() {
  const { id } = useParams<{ id: string }>()
  return id ? <DetalleGestion id={Number(id)} /> : <ListaGestion />
}
