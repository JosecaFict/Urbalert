import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Inbox,
  CheckCircle,
  XCircle,
  UserCheck,
  HardHat,
  Wrench,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  CheckCheck,
  type LucideIcon,
} from 'lucide-react'
import { notificacionService } from '../../api/notificacionService'
import type { Notificacion, TipoNotificacion } from '../../types/notificacion'
import { timeAgo } from '../../utils/formatDate'

/** Icono y color por tipo de notificación (alineado con los colores de estado). */
const ESTILO_TIPO: Record<TipoNotificacion, { icon: LucideIcon; clases: string }> = {
  reclamo_nuevo: { icon: Inbox, clases: 'bg-yellow-100 text-yellow-700' },
  reclamo_aceptado: { icon: CheckCircle, clases: 'bg-blue-100 text-blue-700' },
  reclamo_rechazado: { icon: XCircle, clases: 'bg-red-100 text-red-700' },
  reclamo_asignado: { icon: UserCheck, clases: 'bg-purple-100 text-purple-700' },
  asignacion_nueva: { icon: HardHat, clases: 'bg-purple-100 text-purple-700' },
  reclamo_en_atencion: { icon: Wrench, clases: 'bg-orange-100 text-orange-700' },
  reporte_enviado: { icon: ClipboardCheck, clases: 'bg-sky-100 text-sky-700' },
  reclamo_solucionado: { icon: CheckCircle2, clases: 'bg-green-100 text-green-700' },
  reclamo_no_solucionado: { icon: AlertTriangle, clases: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200' },
  usuario_nuevo: { icon: UserPlus, clases: 'bg-green-100 text-green-700' },
}

const INTERVALO_POLLING = 30_000

export default function NotificacionesCampana() {
  const navigate = useNavigate()
  const [abierto, setAbierto] = useState(false)
  const [noLeidas, setNoLeidas] = useState(0)
  const [items, setItems] = useState<Notificacion[]>([])
  const [cargando, setCargando] = useState(false)
  const contenedor = useRef<HTMLDivElement>(null)

  const refrescarConteo = useCallback(async () => {
    try {
      setNoLeidas(await notificacionService.contarNoLeidas())
    } catch {
      /* silencioso: el badge no debe romper la app */
    }
  }, [])

  // Polling del contador de no leídas
  useEffect(() => {
    refrescarConteo()
    const id = window.setInterval(refrescarConteo, INTERVALO_POLLING)
    return () => window.clearInterval(id)
  }, [refrescarConteo])

  // Cerrar al hacer clic fuera
  useEffect(() => {
    if (!abierto) return
    const handler = (e: MouseEvent) => {
      if (contenedor.current && !contenedor.current.contains(e.target as Node)) {
        setAbierto(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [abierto])

  const abrirPanel = async () => {
    const nuevoEstado = !abierto
    setAbierto(nuevoEstado)
    if (nuevoEstado) {
      setCargando(true)
      try {
        setItems(await notificacionService.listar())
      } catch {
        setItems([])
      } finally {
        setCargando(false)
      }
    }
  }

  const abrirNotificacion = async (n: Notificacion) => {
    setAbierto(false)
    if (!n.leida) {
      try {
        await notificacionService.marcarLeida(n.id)
        setNoLeidas((c) => Math.max(0, c - 1))
      } catch {
        /* si falla, igual navegamos */
      }
    }
    if (n.url) navigate(n.url)
  }

  const marcarTodas = async () => {
    try {
      await notificacionService.marcarTodas()
      setItems((prev) => prev.map((n) => ({ ...n, leida: true })))
      setNoLeidas(0)
    } catch {
      /* silencioso */
    }
  }

  return (
    <div className="relative" ref={contenedor}>
      <button
        onClick={abrirPanel}
        className="relative rounded-lg p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
        aria-label="Notificaciones"
      >
        <Bell size={20} />
        {noLeidas > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-card-hover sm:w-96">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 px-4 py-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Notificaciones</p>
            {noLeidas > 0 && (
              <button
                onClick={marcarTodas}
                className="flex items-center gap-1 text-xs font-medium text-primary-700 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-300"
              >
                <CheckCheck size={14} /> Marcar todas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto scrollbar-thin">
            {cargando ? (
              <p className="px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                Cargando…
              </p>
            ) : items.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell size={28} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm text-slate-400 dark:text-slate-500">No tienes notificaciones.</p>
              </div>
            ) : (
              items.map((n) => {
                const estilo = ESTILO_TIPO[n.tipo] ?? {
                  icon: Bell,
                  clases: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
                }
                const Icono = estilo.icon
                return (
                  <button
                    key={n.id}
                    onClick={() => abrirNotificacion(n)}
                    className={`flex w-full gap-3 border-b border-slate-50 dark:border-slate-700/50 px-4 py-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-900 ${
                      n.leida ? '' : 'bg-primary-50/60 dark:bg-primary-900/30'
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${estilo.clases}`}
                    >
                      <Icono size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {n.titulo}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                        {n.mensaje}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                        {timeAgo(n.fecha_creacion)}
                      </p>
                    </div>
                    {!n.leida && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-600" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
