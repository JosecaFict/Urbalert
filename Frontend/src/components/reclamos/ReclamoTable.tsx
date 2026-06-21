import Table, { type Columna } from '../common/Table'
import ReclamoStatusBadge from './ReclamoStatusBadge'
import Badge from '../common/Badge'
import { formatDate } from '../../utils/formatDate'
import { prioridadStyle, PRIORIDAD_LABEL } from '../../utils/statusColors'
import type { ReclamoListItem } from '../../types/reclamo'

interface ReclamoTableProps {
  reclamos: ReclamoListItem[]
  cargando?: boolean
  onVer?: (reclamo: ReclamoListItem) => void
  mostrarCiudadano?: boolean
}

export default function ReclamoTable({
  reclamos,
  cargando,
  onVer,
  mostrarCiudadano = true,
}: ReclamoTableProps) {
  const columnas: Columna<ReclamoListItem>[] = [
    {
      header: '#',
      render: (r) => <span className="text-slate-400 dark:text-slate-500">#{r.id}</span>,
      className: 'w-16',
    },
    {
      header: 'Título',
      render: (r) => (
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-100">{r.titulo}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{r.direccion_texto}</p>
        </div>
      ),
    },
    { header: 'Categoría', render: (r) => r.categoria_nombre },
    ...(mostrarCiudadano
      ? [{ header: 'Ciudadano', render: (r: ReclamoListItem) => r.ciudadano_nombre }]
      : []),
    {
      header: 'Prioridad',
      render: (r) => {
        const p = prioridadStyle(r.prioridad)
        return (
          <Badge className={`${p.bg} ${p.text}`} dot={p.dot}>
            {PRIORIDAD_LABEL[r.prioridad]}
          </Badge>
        )
      },
    },
    { header: 'Estado', render: (r) => <ReclamoStatusBadge estado={r.estado_nombre} /> },
    {
      header: 'Fecha',
      render: (r) => <span className="whitespace-nowrap">{formatDate(r.fecha_registro)}</span>,
    },
  ]

  return (
    <Table
      columnas={columnas}
      datos={reclamos}
      keyExtractor={(r) => r.id}
      cargando={cargando}
      onRowClick={onVer}
      mensajeVacio="No hay reclamos que coincidan con los filtros."
    />
  )
}
