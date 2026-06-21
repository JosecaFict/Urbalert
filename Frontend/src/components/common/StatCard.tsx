import type { ReactNode } from 'react'

interface StatCardProps {
  titulo: string
  valor: number | string
  icono: ReactNode
  /** color de acento, p. ej. "bg-primary-700" o "bg-amber-500" */
  color?: string
  descripcion?: string
}

export default function StatCard({
  titulo,
  valor,
  icono,
  color = 'bg-primary-700',
  descripcion,
}: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-card transition hover:shadow-card-hover">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-white ${color}`}>
        {icono}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">{titulo}</p>
        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{valor}</p>
        {descripcion && <p className="truncate text-xs text-slate-400 dark:text-slate-500">{descripcion}</p>}
      </div>
    </div>
  )
}
