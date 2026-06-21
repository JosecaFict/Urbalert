import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Mail, Lock, LogIn } from 'lucide-react'
import AuthLayout from '../../components/layout/AuthLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { extraerError } from '../../api/axios'
import { rutaInicialPorRol } from '../../utils/roleLabels'

const CUENTAS_DEMO = [
  { rol: 'Administrador', email: 'admin@urbalert.com', pass: 'admin123' },
  { rol: 'Encargado', email: 'encargado@urbalert.com', pass: 'encargado123' },
  { rol: 'Trabajador', email: 'trabajador@urbalert.com', pass: 'trabajador123' },
  { rol: 'Ciudadano', email: 'ciudadano@urbalert.com', pass: 'ciudadano123' },
]

export default function LoginPage() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setCargando(true)
    try {
      const usuario = await login({ email, password })
      toast.exito(`¡Bienvenido, ${usuario.nombre_completo || usuario.email}!`)
      const destino =
        (location.state as { from?: { pathname: string } })?.from?.pathname ||
        rutaInicialPorRol(usuario.rol_nombre)
      navigate(destino, { replace: true })
    } catch (err) {
      toast.error(extraerError(err, 'No se pudo iniciar sesión.'))
    } finally {
      setCargando(false)
    }
  }

  const usarDemo = (correo: string, pass: string) => {
    setEmail(correo)
    setPassword(pass)
  }

  return (
    <AuthLayout titulo="Iniciar sesión" subtitulo="Ingresa tus credenciales para continuar.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Correo electrónico"
          name="email"
          type="email"
          required
          placeholder="tucorreo@ejemplo.com"
          icono={<Mail size={18} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Contraseña"
          name="password"
          type="password"
          required
          placeholder="••••••••"
          icono={<Lock size={18} />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" className="w-full" size="lg" cargando={cargando} icono={<LogIn size={18} />}>
          Ingresar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="font-semibold text-primary-700 dark:text-primary-300 hover:underline">
          Regístrate como ciudadano
        </Link>
      </p>

      <div className="mt-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Cuentas de prueba
        </p>
        <div className="grid grid-cols-2 gap-2">
          {CUENTAS_DEMO.map((c) => (
            <button
              key={c.email}
              type="button"
              onClick={() => usarDemo(c.email, c.pass)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-left text-xs transition hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30"
            >
              <span className="block font-semibold text-slate-700 dark:text-slate-200">{c.rol}</span>
              <span className="block truncate text-slate-400 dark:text-slate-500">{c.email}</span>
            </button>
          ))}
        </div>
      </div>
    </AuthLayout>
  )
}
