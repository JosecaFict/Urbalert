import { Link } from 'react-router-dom'
import {
  ShieldAlert,
  MapPin,
  ClipboardList,
  Search,
  Wrench,
  CheckCircle2,
  Lightbulb,
  Trash2,
  Droplets,
  TreePine,
  TrafficCone,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react'
import ThemeToggle from '../../components/common/ThemeToggle'

interface Paso {
  icon: LucideIcon
  titulo: string
  texto: string
}

const PASOS: Paso[] = [
  {
    icon: ClipboardList,
    titulo: '1. Reporta',
    texto: 'Describe el problema y marca la ubicación exacta en el mapa.',
  },
  {
    icon: Search,
    titulo: '2. Seguimiento',
    texto: 'El encargado revisa tu reclamo y lo acepta para atenderlo.',
  },
  {
    icon: Wrench,
    titulo: '3. Atención',
    texto: 'Se asigna un trabajador que se encarga de resolver el problema.',
  },
  {
    icon: CheckCircle2,
    titulo: '4. Solución',
    texto: 'Recibes una notificación cuando tu reclamo queda resuelto.',
  },
]

interface Categoria {
  icon: LucideIcon
  nombre: string
  clases: string
}

const CATEGORIAS: Categoria[] = [
  { icon: Lightbulb, nombre: 'Alumbrado público', clases: 'bg-yellow-100 text-yellow-700' },
  { icon: TrafficCone, nombre: 'Baches y calles', clases: 'bg-orange-100 text-orange-700' },
  { icon: Trash2, nombre: 'Recojo de basura', clases: 'bg-green-100 text-green-700' },
  { icon: Droplets, nombre: 'Agua y drenaje', clases: 'bg-sky-100 text-sky-700' },
  { icon: TreePine, nombre: 'Áreas verdes', clases: 'bg-emerald-100 text-emerald-700' },
  { icon: MapPin, nombre: 'Otros reclamos urbanos', clases: 'bg-purple-100 text-purple-700' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">
      {/* Barra superior */}
      <header className="sticky top-0 z-20 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-900">
              <ShieldAlert size={22} className="text-urban-400" />
            </div>
            <div className="leading-tight">
              <p className="text-lg font-bold text-primary-900 dark:text-slate-100">Urbalert</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Santa Cruz de la Sierra
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-primary-700 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-800"
            >
              Registrarme
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-primary-900 text-white">
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-urban-300">
              <MapPin size={14} /> Reclamos ciudadanos en línea
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">
              Tu ciudad te escucha.
              <br />
              Reporta y haz seguimiento.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-300">
              Urbalert conecta a los ciudadanos con las autoridades municipales para atender
              reclamos urbanos de forma transparente y trazable.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-urban-500 px-5 py-3 text-sm font-semibold text-white hover:bg-urban-600"
              >
                Crear una cuenta <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 sm:text-3xl">
            ¿Cómo funciona?
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-slate-500 dark:text-slate-400">
            Un proceso simple y transparente, desde el reporte hasta la solución.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PASOS.map((paso) => {
            const Icono = paso.icon
            return (
              <div
                key={paso.titulo}
                className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-card"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                  <Icono size={24} />
                </div>
                <h3 className="mt-4 font-semibold text-slate-800 dark:text-slate-100">
                  {paso.titulo}
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{paso.texto}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Categorías */}
      <section className="bg-slate-50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 sm:text-3xl">
              ¿Qué puedes reportar?
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-slate-500 dark:text-slate-400">
              Atendemos los principales problemas urbanos de tu barrio.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIAS.map((cat) => {
              const Icono = cat.icon
              return (
                <div
                  key={cat.nombre}
                  className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${cat.clases}`}
                  >
                    <Icono size={20} />
                  </div>
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {cat.nombre}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Llamado a la acción */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl bg-primary-900 px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-2xl font-bold sm:text-3xl">¿Listo para reportar un problema?</h2>
          <p className="mx-auto mt-3 max-w-lg text-slate-300">
            Crea tu cuenta gratis y empieza a darle seguimiento a tus reclamos en tiempo real.
          </p>
          <Link
            to="/register"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-urban-500 px-6 py-3 text-sm font-semibold text-white hover:bg-urban-600"
          >
            Registrarme ahora <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-500 dark:text-slate-400 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="text-primary-700 dark:text-primary-300" />
            <span className="font-medium text-slate-600 dark:text-slate-300">Urbalert</span>
          </div>
          <p>© 2026 Urbalert · Gestión de reclamos ciudadanos · Santa Cruz de la Sierra</p>
        </div>
      </footer>
    </div>
  )
}
