import { estadoStyle } from '../../utils/statusColors'
import { formatDateTime } from '../../utils/formatDate'
import type { HistorialEstado } from '../../types/reclamo'

interface ReclamoTimelineProps {
  historial: HistorialEstado[]
}

/** Línea de tiempo vertical del historial de estados de un reclamo. */
export default function ReclamoTimeline({ historial }: ReclamoTimelineProps) {
  if (!historial.length) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Sin historial de estados todavía.</p>
  }

  return (
    <ol className="relative space-y-6 border-l-2 border-slate-200 dark:border-slate-700 pl-6">
      {historial.map((h) => {
        const style = estadoStyle(h.estado_nuevo_nombre)
        return (
          <li key={h.id} className="relative">
            <span
              className={`absolute -left-[31px] top-0.5 h-4 w-4 rounded-full ring-4 ring-white ${style.dot}`}
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
                {h.estado_nuevo_nombre}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {formatDateTime(h.fecha_cambio)}
              </span>
            </div>
            {h.observacion && (
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{h.observacion}</p>
            )}
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">Por {h.usuario_nombre}</p>
          </li>
        )
      })}
    </ol>
  )
}
