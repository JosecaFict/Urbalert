import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Inbox } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import ReclamoCard from '../../components/reclamos/ReclamoCard'
import Loading from '../../components/common/Loading'
import EmptyState from '../../components/common/EmptyState'
import { reclamoService } from '../../api/reclamoService'
import { extraerError } from '../../api/axios'
import { useToast } from '../../context/ToastContext'
import type { ReclamoListItem } from '../../types/reclamo'

export default function ReclamosPendientesPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [reclamos, setReclamos] = useState<ReclamoListItem[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    reclamoService
      .pendientes()
      .then(setReclamos)
      .catch((e) => toast.error(extraerError(e)))
      .finally(() => setCargando(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (cargando) return <Loading texto="Cargando reclamos pendientes..." />

  return (
    <div>
      <PageHeader
        titulo="Reclamos pendientes"
        descripcion="Reclamos recién creados que esperan tu revisión."
      />

      {reclamos.length === 0 ? (
        <Card>
          <EmptyState
            icono={<Inbox size={28} />}
            titulo="No hay reclamos pendientes"
            descripcion="Todos los reclamos han sido revisados. ¡Buen trabajo!"
          />
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reclamos.map((r) => (
            <ReclamoCard
              key={r.id}
              reclamo={r}
              onClick={() => navigate(`/encargado/reclamos/${r.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
