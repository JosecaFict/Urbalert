import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Select from '../../components/common/Select'
import Textarea from '../../components/common/Textarea'
import Loading from '../../components/common/Loading'
import ImageUpload from '../../components/uploads/ImageUpload'
import MapPicker from '../../components/maps/MapPicker'
import { asignacionService } from '../../api/asignacionService'
import { reporteService } from '../../api/reporteService'
import { extraerError } from '../../api/axios'
import { useToast } from '../../context/ToastContext'
import type { Asignacion } from '../../types/asignacion'
import type { ResultadoReporte } from '../../types/reporte'

export default function CrearReportePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const [asignacion, setAsignacion] = useState<Asignacion | null>(null)
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)

  const [descripcion, setDescripcion] = useState('')
  const [resultado, setResultado] = useState<ResultadoReporte>('solucionado')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [foto, setFoto] = useState<File | null>(null)
  const [errorDesc, setErrorDesc] = useState('')

  useEffect(() => {
    if (!id) return
    asignacionService
      .obtener(Number(id))
      .then((a) => {
        setAsignacion(a)
        setLat(Number(a.reclamo_detalle.latitud))
        setLng(Number(a.reclamo_detalle.longitud))
      })
      .catch((e) => toast.error(extraerError(e)))
      .finally(() => setCargando(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!descripcion.trim()) {
      setErrorDesc('Describe el trabajo realizado.')
      return
    }
    if (!asignacion) return
    setEnviando(true)
    try {
      await reporteService.crear({
        reclamo: asignacion.reclamo,
        descripcion_trabajo: descripcion,
        resultado,
        latitud_atencion: lat,
        longitud_atencion: lng,
        foto_evidencia: foto,
      })
      toast.exito('Reporte enviado. El reclamo pasó a estado "Reportado".')
      navigate(`/trabajador/asignaciones/${asignacion.id}`)
    } catch (err) {
      toast.error(extraerError(err, 'No se pudo enviar el reporte.'))
    } finally {
      setEnviando(false)
    }
  }

  if (cargando) return <Loading texto="Cargando datos..." />
  if (!asignacion) return null

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => navigate(`/trabajador/asignaciones/${asignacion.id}`)}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
      >
        <ArrowLeft size={16} /> Volver al detalle
      </button>

      <PageHeader
        titulo="Reporte de atención"
        descripcion={`Reclamo: ${asignacion.reclamo_detalle.titulo}`}
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Textarea
            label="Descripción del trabajo realizado"
            required
            rows={4}
            placeholder="Describe qué hiciste para atender el reclamo..."
            value={descripcion}
            onChange={(e) => {
              setDescripcion(e.target.value)
              setErrorDesc('')
            }}
            error={errorDesc}
          />

          <Select
            label="Resultado de la atención"
            opciones={[
              { value: 'solucionado', label: 'Solucionado' },
              { value: 'no_solucionado', label: 'No solucionado' },
              { value: 'requiere_revision', label: 'Requiere revisión' },
            ]}
            value={resultado}
            onChange={(e) => setResultado(e.target.value as ResultadoReporte)}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Ubicación de la atención
            </label>
            <MapPicker
              latitud={lat}
              longitud={lng}
              onCambio={(la, lo) => {
                setLat(la)
                setLng(lo)
              }}
              altura="280px"
            />
          </div>

          <ImageUpload
            label="Foto de evidencia de la atención"
            ayuda="Sube una foto que demuestre el trabajo realizado."
            onChange={setFoto}
          />

          <div className="flex justify-end">
            <Button type="submit" size="lg" icono={<Send size={18} />} cargando={enviando}>
              Enviar reporte
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
