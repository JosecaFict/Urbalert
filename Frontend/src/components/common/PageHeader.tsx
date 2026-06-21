import type { ReactNode } from 'react'

interface PageHeaderProps {
  titulo: string
  descripcion?: string
  accion?: ReactNode
}

export default function PageHeader({ titulo, descripcion, accion }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{titulo}</h1>
        {descripcion && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{descripcion}</p>}
      </div>
      {accion}
    </div>
  )
}
