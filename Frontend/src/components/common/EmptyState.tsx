import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  titulo?: string
  descripcion?: string
  icono?: ReactNode
  accion?: ReactNode
}

export default function EmptyState({
  titulo = 'No hay nada por aquí',
  descripcion,
  icono,
  accion,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500">
        {icono ?? <Inbox size={28} />}
      </div>
      <div>
        <h4 className="font-semibold text-slate-700 dark:text-slate-200">{titulo}</h4>
        {descripcion && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{descripcion}</p>}
      </div>
      {accion}
    </div>
  )
}
