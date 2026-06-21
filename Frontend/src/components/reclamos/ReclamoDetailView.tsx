import type { ReactNode } from 'react'
import { MapPin, Tag, Calendar, User, Phone, AlertTriangle } from 'lucide-react'
import Card from '../common/Card'
import Badge from '../common/Badge'
import ReclamoStatusBadge from './ReclamoStatusBadge'
import ReclamoTimeline from './ReclamoTimeline'
import MapViewer from '../maps/MapViewer'
import { formatDateTime } from '../../utils/formatDate'
import { prioridadStyle, PRIORIDAD_LABEL } from '../../utils/statusColors'
import type { ReclamoDetalle } from '../../types/reclamo'

interface ReclamoDetailViewProps {
  reclamo: ReclamoDetalle
  /** panel de acciones específico del rol (botones de aceptar/asignar/etc.) */
  acciones?: ReactNode
  mostrarCiudadano?: boolean
}

export default function ReclamoDetailView({
  reclamo,
  acciones,
  mostrarCiudadano = true,
}: ReclamoDetailViewProps) {
  const prio = prioridadStyle(reclamo.prioridad)

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Columna principal */}
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <ReclamoStatusBadge estado={reclamo.estado_nombre} />
                <Badge className={`${prio.bg} ${prio.text}`} dot={prio.dot}>
                  Prioridad {PRIORIDAD_LABEL[reclamo.prioridad]}
                </Badge>
                <span className="text-xs text-slate-400 dark:text-slate-500">#{reclamo.id}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{reclamo.titulo}</h2>
            </div>
          </div>

          <p className="mt-4 whitespace-pre-line text-slate-600 dark:text-slate-300">{reclamo.descripcion}</p>

          <div className="mt-5 grid gap-3 border-t border-slate-100 dark:border-slate-700 pt-5 text-sm sm:grid-cols-2">
            <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Tag size={16} className="text-primary-600" /> {reclamo.categoria_nombre}
            </p>
            <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <MapPin size={16} className="text-primary-600" /> {reclamo.direccion_texto}
            </p>
            <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Calendar size={16} className="text-primary-600" />
              {formatDateTime(reclamo.fecha_registro)}
            </p>
            {mostrarCiudadano && (
              <>
                <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <User size={16} className="text-primary-600" /> {reclamo.ciudadano_nombre}
                </p>
                {reclamo.ciudadano_telefono && (
                  <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Phone size={16} className="text-primary-600" /> {reclamo.ciudadano_telefono}
                  </p>
                )}
              </>
            )}
          </div>
        </Card>

        {reclamo.foto_principal && (
          <Card titulo="Foto de evidencia">
            <img
              src={reclamo.foto_principal}
              alt="Evidencia del reclamo"
              className="max-h-96 w-full rounded-lg object-cover"
            />
          </Card>
        )}

        <Card titulo="Ubicación del reclamo">
          <MapViewer
            latitud={reclamo.latitud}
            longitud={reclamo.longitud}
            titulo={reclamo.titulo}
            direccion={reclamo.direccion_texto}
          />
        </Card>
      </div>

      {/* Columna lateral */}
      <div className="space-y-6">
        {acciones && (
          <Card titulo="Acciones" icono={<AlertTriangle size={18} />}>
            {acciones}
          </Card>
        )}

        <Card titulo="Historial del reclamo">
          <ReclamoTimeline historial={reclamo.historial} />
        </Card>
      </div>
    </div>
  )
}
