import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert, MapPin, CheckCircle2, Clock, ArrowLeft } from 'lucide-react'
import ThemeToggle from '../common/ThemeToggle'

interface AuthLayoutProps {
  children: ReactNode
  titulo: string
  subtitulo: string
}

export default function AuthLayout({ children, titulo, subtitulo }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Panel informativo (oculto en móvil) */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-primary-900 p-12 text-white lg:flex">
        <Link to="/" className="flex items-center gap-3 transition hover:opacity-90">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-urban-500">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold">Urbalert</p>
            <p className="text-sm text-slate-300">Santa Cruz de la Sierra</p>
          </div>
        </Link>

        <div className="space-y-6">
          <h2 className="text-3xl font-bold leading-tight">
            Tu ciudad te escucha.<br />Reporta y haz seguimiento.
          </h2>
          <p className="text-slate-300">
            Reporta baches, basura, alumbrado y más. Lo derivamos a quien
            corresponde y tú sigues cada paso hasta la solución.
          </p>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <MapPin className="text-urban-400" size={20} />
              <span><strong className="font-semibold">Reporta</strong> con foto y ubicación exacta en el mapa</span>
            </li>
            <li className="flex items-center gap-3">
              <Clock className="text-urban-400" size={20} />
              <span><strong className="font-semibold">Sigue</strong> el estado de tu reclamo en tiempo real</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 className="text-urban-400" size={20} />
              <span><strong className="font-semibold">Recibe</strong> un aviso cuando quede solucionado</span>
            </li>
          </ul>
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-500">
          © 2026 Urbalert · Gestión de reclamos ciudadanos
        </p>
      </div>

      {/* Formulario */}
      <div className="relative flex w-full items-center justify-center bg-slate-100 dark:bg-slate-900 p-6 lg:w-1/2">
        <Link
          to="/"
          className="absolute left-4 top-4 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
        >
          <ArrowLeft size={16} /> Volver al inicio
        </Link>
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-900">
              <ShieldAlert size={20} className="text-urban-400" />
            </div>
            <p className="text-xl font-bold text-primary-900">Urbalert</p>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{titulo}</h1>
          <p className="mt-1 mb-6 text-sm text-slate-500 dark:text-slate-400">{subtitulo}</p>
          {children}
        </div>
      </div>
    </div>
  )
}
