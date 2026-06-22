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
    </AuthLayout>
  )
}
