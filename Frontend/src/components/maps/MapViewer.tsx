import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { ExternalLink } from 'lucide-react'
import { defaultIcon } from './leafletIcon'

interface MapViewerProps {
  latitud: number | string
  longitud: number | string
  titulo?: string
  direccion?: string
  altura?: string
}

/**
 * Muestra la ubicación guardada de un reclamo (sólo lectura) con marcador
 * y enlace para abrir la referencia en OpenStreetMap.
 */
export default function MapViewer({
  latitud,
  longitud,
  titulo,
  direccion,
  altura = '300px',
}: MapViewerProps) {
  const lat = Number(latitud)
  const lng = Number(longitud)

  if (isNaN(lat) || isNaN(lng)) {
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4 text-sm text-slate-500 dark:text-slate-400">
        Sin coordenadas registradas.
      </div>
    )
  }

  const enlaceOSM = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
      <MapContainer
        center={[lat, lng]}
        zoom={16}
        style={{ height: altura, width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={defaultIcon}>
          {(titulo || direccion) && (
            <Popup>
              {titulo && <strong>{titulo}</strong>}
              {direccion && <p>{direccion}</p>}
            </Popup>
          )}
        </Marker>
      </MapContainer>
      <a
        href={enlaceOSM}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-medium text-primary-700 dark:text-primary-300 hover:bg-slate-100 dark:hover:bg-slate-700"
      >
        <ExternalLink size={14} />
        Ver referencia en OpenStreetMap
      </a>
    </div>
  )
}
