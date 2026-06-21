import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Loading from '../../components/common/Loading'
import ReclamoDetailView from '../../components/reclamos/ReclamoDetailView'
import { reclamoService } from '../../api/reclamoService'
import { extraerError } from '../../api/axios'
import { useToast } from '../../context/ToastContext'
import type { ReclamoDetalle } from '../../types/reclamo'

export default function DetalleMiReclamoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const [reclamo, setReclamo] = useState<ReclamoDetalle | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!id) return
    reclamoService
      .obtener(Number(id))
      .then(setReclamo)
      .catch((e) => toast.error(extraerError(e)))
      .finally(() => setCargando(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (cargando) return <Loading texto="Cargando reclamo..." />
  if (!reclamo) return null

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
      >
        <ArrowLeft size={16} /> Volver a mis reclamos
      </button>

      <ReclamoDetailView reclamo={reclamo} mostrarCiudadano={false} />
    </div>
  )
}
