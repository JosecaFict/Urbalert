import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'

type ToastTipo = 'exito' | 'error' | 'info'

interface Toast {
  id: number
  tipo: ToastTipo
  mensaje: string
}

interface ToastContextValue {
  exito: (mensaje: string) => void
  error: (mensaje: string) => void
  info: (mensaje: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

let contador = 0

const ESTILOS: Record<ToastTipo, { borde: string; icono: ReactNode }> = {
  exito: { borde: 'border-l-green-500', icono: <CheckCircle2 className="text-green-500" size={20} /> },
  error: { borde: 'border-l-red-500', icono: <XCircle className="text-red-500" size={20} /> },
  info: { borde: 'border-l-blue-500', icono: <Info className="text-blue-500" size={20} /> },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const quitar = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const mostrar = useCallback(
    (tipo: ToastTipo, mensaje: string) => {
      const id = ++contador
      setToasts((prev) => [...prev, { id, tipo, mensaje }])
      setTimeout(() => quitar(id), 4000)
    },
    [quitar],
  )

  const value: ToastContextValue = {
    exito: (m) => mostrar('exito', m),
    error: (m) => mostrar('error', m),
    info: (m) => mostrar('info', m),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[1000] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 rounded-lg border-l-4 bg-white dark:bg-slate-800 p-4 shadow-card-hover ${ESTILOS[t.tipo].borde}`}
          >
            <span className="mt-0.5">{ESTILOS[t.tipo].icono}</span>
            <p className="flex-1 text-sm text-slate-700 dark:text-slate-200">{t.mensaje}</p>
            <button
              onClick={() => quitar(t.id)}
              className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              aria-label="Cerrar"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}
