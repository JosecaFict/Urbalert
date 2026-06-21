import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import { MapPin } from 'lucide-react'
import { defaultIcon } from './leafletIcon'
import { SANTA_CRUZ_CENTRO } from '../../data/mockData'

interface MapPickerProps {
  latitud: number | null
  longitud: number | null
  onCambio: (lat: number, lng: number) => void
  altura?: string
}

function SelectorPunto({ onCambio }: { onCambio: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onCambio(
        Number(e.latlng.lat.toFixed(7)),
        Number(e.latlng.lng.toFixed(7)),
      )
    },
  })
  return null
}

/**
 * Mapa interactivo para seleccionar la ubicación de un reclamo.
 * Centrado en Santa Cruz de la Sierra. Al hacer clic, coloca/actualiza el marcador.
 */
export default function MapPicker({
  latitud,
  longitud,
  onCambio,
  altura = '360px',
}: MapPickerProps) {
  const tieneMarcador = latitud != null && longitud != null

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600">
      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
        <MapPin size={14} className="text-primary-700 dark:text-primary-300" />
        Haz clic en el mapa para marcar la ubicación exacta del problema.
      </div>
      <MapContainer
        center={[SANTA_CRUZ_CENTRO.latitud, SANTA_CRUZ_CENTRO.longitud]}
        zoom={SANTA_CRUZ_CENTRO.zoom}
        style={{ height: altura, width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SelectorPunto onCambio={onCambio} />
        {tieneMarcador && (
          <Marker position={[latitud!, longitud!]} icon={defaultIcon} />
        )}
      </MapContainer>
      {tieneMarcador && (
        <div className="flex flex-wrap gap-x-6 gap-y-1 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
          <span>
            <strong>Latitud:</strong> {latitud}
          </span>
          <span>
            <strong>Longitud:</strong> {longitud}
          </span>
        </div>
      )}
    </div>
  )
}
