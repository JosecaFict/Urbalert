import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  cargando?: boolean
  icono?: ReactNode
  children: ReactNode
}

const VARIANTES: Record<Variant, string> = {
  primary: 'bg-primary-700 text-white hover:bg-primary-800 focus:ring-primary-500',
  secondary: 'bg-urban-600 text-white hover:bg-urban-700 focus:ring-urban-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  outline:
    'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 focus:ring-primary-500',
  ghost: 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 focus:ring-slate-300',
}

const TAMANOS: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  cargando = false,
  icono,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTES[variant]} ${TAMANOS[size]} ${className}`}
      disabled={disabled || cargando}
      {...props}
    >
      {cargando ? <Loader2 className="animate-spin" size={18} /> : icono}
      {children}
    </button>
  )
}
