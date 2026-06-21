import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  abierto: boolean
  onCerrar: () => void
  titulo?: string
  children: ReactNode
  footer?: ReactNode
  tamano?: 'sm' | 'md' | 'lg' | 'xl'
}

const TAMANOS = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export default function Modal({
  abierto,
  onCerrar,
  titulo,
  children,
  footer,
  tamano = 'md',
}: ModalProps) {
  useEffect(() => {
    if (!abierto) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [abierto, onCerrar])

  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onCerrar}
      />
      <div
        className={`relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-xl bg-white dark:bg-slate-800 shadow-2xl scrollbar-thin ${TAMANOS[tamano]}`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 px-5 py-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{titulo}</h3>
          <button
            onClick={onCerrar}
            className="rounded-lg p-1 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-700 px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
