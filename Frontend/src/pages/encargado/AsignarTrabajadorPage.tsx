import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, UserPlus } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Select from '../../components/common/Select'
import Textarea from '../../components/common/Textarea'
import Loading from '../../components/common/Loading'
import ReclamoStatusBadge from '../../components/reclamos/ReclamoStatusBadge'
import { reclamoService } from '../../api/reclamoService'
import { usuarioService } from '../../api/usuarioService'
import { asignacionService } from '../../api/asignacionService'
import { extraerError } from '../../api/axios'
import { useToast } from '../../context/ToastContext'
import type { ReclamoDetalle } from '../../types/reclamo'
import type { Usuario } from '../../types/usuario'

export default function AsignarTrabajadorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const [reclamo, setReclamo] = useState<ReclamoDetalle | null>(null)
  const [trabajadores, setTrabajadores] = useState<Usuario[]>([])
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [trabajador, setTrabajador] = useState('')
  const [observacion, setObservacion] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    Promise.all([reclamoService.obtener(Number(id)), usuarioService.trabajadores()])
      .then(([rec, trabs]) => {
        setReclamo(rec)
        setTrabajadores(trabs)
      })
      .catch((e) => toast.error(extraerError(e)))
      .finally(() => setCargando(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!trabajador) {
      setError('Selecciona un trabajador.')
      return
    }
    if (!reclamo) return
    setEnviando(true)
    try {
      await asignacionService.crear({
        reclamo: reclamo.id,
        trabajador: Number(trabajador),
        observacion,
      })
      toast.exito('Reclamo asignado correctamente al trabajador.')
      navigate(`/encargado/reclamos/${reclamo.id}`)
    } catch (err) {
      toast.error(extraerError(err, 'No se pudo asignar el reclamo.'))
    } finally {
      setEnviando(false)
    }
  }

  if (cargando) return <Loading texto="Cargando datos..." />
  if (!reclamo) return null

  return (
    <div className="mx-auto max-w-3xl">
      <button
        onClick={() => navigate(`/encargado/reclamos/${reclamo.id}`)}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
      >
        <ArrowLeft size={16} /> Volver al reclamo
      </button>

      <PageHeader titulo="Asignar trabajador" descripcion="Selecciona el trabajador que atenderá este reclamo." />

      <Card className="mb-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">{reclamo.titulo}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{reclamo.direccion_texto}</p>
          </div>
          <ReclamoStatusBadge estado={reclamo.estado_nombre} />
        </div>
      </Card>

      <Card>
        {reclamo.estado_nombre !== 'Aceptado' && reclamo.estado_nombre !== 'Asignado' ? (
          <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-700">
            Solo se pueden asignar reclamos en estado <strong>Aceptado</strong>.
            Este reclamo está en estado <strong>{reclamo.estado_nombre}</strong>.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <Select
              label="Trabajador"
              required
              placeholder="Selecciona un trabajador"
              opciones={trabajadores.map((t) => ({
                value: t.id,
                label: `${t.nombre_completo || t.email}`,
              }))}
              value={trabajador}
              onChange={(e) => {
                setTrabajador(e.target.value)
                setError('')
              }}
              error={error}
            />
            <Textarea
              label="Observación (opcional)"
              rows={3}
              placeholder="Instrucciones o detalles para el trabajador..."
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
            />
            <div className="flex justify-end">
              <Button type="submit" icono={<UserPlus size={18} />} cargando={enviando}>
                Asignar reclamo
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  )
}
