import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  /** clases de color de fondo + texto, p. ej. "bg-green-100 text-green-800" */
  className?: string
  dot?: string
}

export default function Badge({ children, className = 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200', dot }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
      {children}
    </span>
  )
}
