import { useState } from 'react'
import { MapPin, Calendar, Tag, ArrowRight } from 'lucide-react'
import ReclamoStatusBadge from './ReclamoStatusBadge'
import Badge from '../common/Badge'
import { formatDate } from '../../utils/formatDate'
import { prioridadStyle, PRIORIDAD_LABEL } from '../../utils/statusColors'
import type { ReclamoListItem } from '../../types/reclamo'

interface ReclamoCardProps {
  reclamo: ReclamoListItem
  onClick?: () => void
}

const ZOOM_MAPA = 15

/**
 * URL de un "tile" de OpenStreetMap (sin API key, mismo servidor que Leaflet)
 * que contiene la ubicación dada. Sirve como mini-mapa de la tarjeta.
 */
function urlTileMapa(lat: number, lng: number): string {
  const n = 2 ** ZOOM_MAPA
  const x = Math.floor(((lng + 180) / 360) * n)
  const latRad = (lat * Math.PI) / 180
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n,
  )
  return `https://tile.openstreetmap.org/${ZOOM_MAPA}/${x}/${y}.png`
}

export default function ReclamoCard({ reclamo, onClick }: ReclamoCardProps) {
  const prio = prioridadStyle(reclamo.prioridad)
  const [mapaError, setMapaError] = useState(false)

  const lat = Number(reclamo.latitud)
  const lng = Number(reclamo.longitud)
  const tieneCoords = !!reclamo.latitud && !!reclamo.longitud && !Number.isNaN(lat) && !Number.isNaN(lng)
  const mostrarMapa = !reclamo.foto_principal && tieneCoords && !mapaError

  return (
    <div
      onClick={onClick}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-card transition hover:shadow-card-hover"
    >
      <div className="relative h-40 w-full bg-slate-100 dark:bg-slate-700">
        {reclamo.foto_principal ? (
          <img
            src={reclamo.foto_principal}
            alt={reclamo.titulo}
            className="h-full w-full object-cover"
          />
        ) : mostrarMapa ? (
          <>
            <img
              src={urlTileMapa(lat, lng)}
              alt={`Ubicación de ${reclamo.titulo}`}
              loading="lazy"
              onError={() => setMapaError(true)}
              className="h-full w-full object-cover"
            />
            {/* Pin sobre el centro del mini-mapa */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <MapPin
                size={30}
                className="-translate-y-2 fill-red-500 text-red-600 drop-shadow"
              />
            </div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <MapPin size={40} />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <ReclamoStatusBadge estado={reclamo.estado_nombre} />
        </div>
        <div className="absolute right-3 top-3">
          <Badge className={`${prio.bg} ${prio.text}`} dot={prio.dot}>
            {PRIORIDAD_LABEL[reclamo.prioridad]}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-semibold text-slate-800 dark:text-slate-100">{reclamo.titulo}</h3>

        <div className="mt-3 space-y-1.5 text-sm text-slate-500 dark:text-slate-400">
          <p className="flex items-center gap-2">
            <Tag size={14} className="shrink-0 text-primary-600" />
            <span className="truncate">{reclamo.categoria_nombre}</span>
          </p>
          <p className="flex items-center gap-2">
            <MapPin size={14} className="shrink-0 text-primary-600" />
            <span className="truncate">{reclamo.direccion_texto}</span>
          </p>
          <p className="flex items-center gap-2">
            <Calendar size={14} className="shrink-0 text-primary-600" />
            {formatDate(reclamo.fecha_registro)}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-3">
          <span className="text-xs text-slate-400 dark:text-slate-500">#{reclamo.id}</span>
          <span className="flex items-center gap-1 text-sm font-medium text-primary-700 dark:text-primary-300 group-hover:gap-2">
            Ver detalle <ArrowRight size={15} />
          </span>
        </div>
      </div>
    </div>
  )
}
