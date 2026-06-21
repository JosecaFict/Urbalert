import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Loading from '../../components/common/Loading'
import ReclamoForm from '../../components/reclamos/ReclamoForm'
import { categoriaService } from '../../api/categoriaService'
import { reclamoService } from '../../api/reclamoService'
import { extraerError } from '../../api/axios'
import { useToast } from '../../context/ToastContext'
import type { Categoria } from '../../types/categoria'
import type { ReclamoFormData } from '../../types/reclamo'

export default function CrearReclamoPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    categoriaService
      .listar()
      .then((cats) => setCategorias(cats.filter((c) => c.estado)))
      .catch((e) => toast.error(extraerError(e)))
      .finally(() => setCargando(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (data: ReclamoFormData) => {
    setEnviando(true)
    try {
      const reclamo = await reclamoService.crear(data)
      toast.exito('¡Reclamo creado correctamente! Quedó en estado Pendiente.')
      navigate(`/ciudadano/reclamos/${reclamo.id}`)
    } catch (e) {
      toast.error(extraerError(e, 'No se pudo crear el reclamo.'))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
      >
        <ArrowLeft size={16} /> Volver
      </button>

      <PageHeader
        titulo="Crear nuevo reclamo"
        descripcion="Completa los datos del problema que deseas reportar en tu ciudad."
      />

      <Card>
        {cargando ? (
          <Loading texto="Cargando categorías..." />
        ) : (
          <ReclamoForm categorias={categorias} onSubmit={handleSubmit} enviando={enviando} />
        )}
      </Card>
    </div>
  )
}
