import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icono?: ReactNode
  /** Elemento interactivo a la derecha (p. ej. botón para ver/ocultar contraseña). */
  accionDerecha?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icono, accionDerecha, className = '', id, ...props }, ref) => {
    const inputId = id || props.name
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
            {label}
            {props.required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          {icono && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              {icono}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full rounded-lg border bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition focus:outline-none focus:ring-2 ${
              icono ? 'pl-10' : ''
            } ${accionDerecha ? 'pr-10' : ''} ${
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                : 'border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-primary-100'
            } ${className}`}
            {...props}
          />
          {accionDerecha && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2">
              {accionDerecha}
            </span>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'
export default Input
