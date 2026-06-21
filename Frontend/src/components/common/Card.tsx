import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  titulo?: string
  subtitulo?: string
  accion?: ReactNode
  icono?: ReactNode
}

export default function Card({
  children,
  className = '',
  titulo,
  subtitulo,
  accion,
  icono,
}: CardProps) {
  return (
    <div className={`rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-card ${className}`}>
      {(titulo || accion) && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 px-5 py-4">
          <div className="flex items-center gap-3">
            {icono && <span className="text-primary-700 dark:text-primary-300">{icono}</span>}
            <div>
              {titulo && <h3 className="font-semibold text-slate-800 dark:text-slate-100">{titulo}</h3>}
              {subtitulo && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitulo}</p>}
            </div>
          </div>
          {accion}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}
