import { Loader2 } from 'lucide-react'

interface LoadingProps {
  texto?: string
  pantallaCompleta?: boolean
}

export default function Loading({ texto = 'Cargando...', pantallaCompleta = false }: LoadingProps) {
  const contenido = (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-slate-500 dark:text-slate-400">
      <Loader2 className="animate-spin text-primary-700 dark:text-primary-300" size={32} />
      <p className="text-sm">{texto}</p>
    </div>
  )

  if (pantallaCompleta) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-700">
        {contenido}
      </div>
    )
  }
  return contenido
}
