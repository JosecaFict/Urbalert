import { Link } from 'react-router-dom'
import { ShieldAlert, Home } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { rutaInicialPorRol } from '../../utils/roleLabels'

export default function NotFoundPage() {
  const { rol, autenticado } = useAuth()
  const destino = autenticado ? rutaInicialPorRol(rol) : '/login'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 dark:bg-slate-700 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-900">
        <ShieldAlert size={32} className="text-urban-400" />
      </div>
      <p className="mt-6 text-6xl font-bold text-primary-900">404</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-800 dark:text-slate-100">Página no encontrada</h1>
      <p className="mt-2 max-w-md text-slate-500 dark:text-slate-400">
        La página que buscas no existe o fue movida. Verifica la dirección o vuelve al inicio.
      </p>
      <Link
        to={destino}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-700 px-5 py-3 font-medium text-white hover:bg-primary-800"
      >
        <Home size={18} /> Volver al inicio
      </Link>
    </div>
  )
}
