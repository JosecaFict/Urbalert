import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Mail, Lock, User, IdCard, Phone, MapPin, UserPlus,
  Eye, EyeOff, Check, X,
} from 'lucide-react'
import AuthLayout from '../../components/layout/AuthLayout'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { extraerError } from '../../api/axios'
import type { RegisterData } from '../../types/auth'

const INICIAL: RegisterData = {
  email: '',
  password: '',
  nombres: '',
  apellidos: '',
  ci: '',
  telefono: '',
  direccion: '',
}

/** Reglas de la contraseña (deben coincidir con la validación del backend). */
function requisitosContrasena(password: string) {
  return {
    longitud: password.length >= 8,
    mayuscula: /[A-Z]/.test(password),
    minuscula: /[a-z]/.test(password),
    numero: /\d/.test(password),
  }
}

/** Pequeño botón con el ojo para ver/ocultar una contraseña. */
function BotonVer({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded-md p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
      aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      tabIndex={-1}
    >
      {visible ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  )
}

/** Línea de requisito con check verde / equis gris. */
function Requisito({ ok, texto }: { ok: boolean; texto: string }) {
  return (
    <li className={`flex items-center gap-1.5 ${ok ? 'text-green-600' : 'text-slate-400 dark:text-slate-500'}`}>
      {ok ? <Check size={14} /> : <X size={14} />}
      {texto}
    </li>
  )
}

export default function RegisterPage() {
  const { register } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState<RegisterData>(INICIAL)
  const [confirmar, setConfirmar] = useState('')
  const [verPassword, setVerPassword] = useState(false)
  const [verConfirmar, setVerConfirmar] = useState(false)
  const [cargando, setCargando] = useState(false)

  const set = (campo: keyof RegisterData, valor: string) =>
    setForm((prev) => ({ ...prev, [campo]: valor }))

  const reglas = useMemo(() => requisitosContrasena(form.password), [form.password])
  const contrasenaValida = Object.values(reglas).every(Boolean)
  const coincide = confirmar.length > 0 && form.password === confirmar

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!contrasenaValida) {
      toast.error(
        'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número.',
      )
      return
    }
    if (form.password !== confirmar) {
      toast.error('Las contraseñas no coinciden.')
      return
    }
    setCargando(true)
    try {
      await register(form)
      toast.exito('¡Cuenta creada con éxito! Bienvenido a Urbalert.')
      navigate('/ciudadano', { replace: true })
    } catch (err) {
      toast.error(extraerError(err, 'No se pudo completar el registro.'))
    } finally {
      setCargando(false)
    }
  }

  return (
    <AuthLayout
      titulo="Crear cuenta de ciudadano"
      subtitulo="Regístrate para reportar y hacer seguimiento a tus reclamos."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nombres"
            name="nombres"
            required
            placeholder="Ej: María"
            icono={<User size={18} />}
            value={form.nombres}
            onChange={(e) => set('nombres', e.target.value)}
          />
          <Input
            label="Apellidos"
            name="apellidos"
            required
            placeholder="Ej: Gutiérrez Soliz"
            icono={<User size={18} />}
            value={form.apellidos}
            onChange={(e) => set('apellidos', e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Carnet de identidad"
            name="ci"
            placeholder="Ej: 4000004"
            icono={<IdCard size={18} />}
            value={form.ci}
            onChange={(e) => set('ci', e.target.value)}
          />
          <Input
            label="Teléfono"
            name="telefono"
            placeholder="Ej: 70000004"
            icono={<Phone size={18} />}
            value={form.telefono}
            onChange={(e) => set('telefono', e.target.value)}
          />
        </div>
        <Input
          label="Dirección"
          name="direccion"
          placeholder="Ej: Av. Santos Dumont, 4to anillo"
          icono={<MapPin size={18} />}
          value={form.direccion}
          onChange={(e) => set('direccion', e.target.value)}
        />
        <Input
          label="Correo electrónico"
          name="email"
          type="email"
          required
          placeholder="tucorreo@ejemplo.com"
          icono={<Mail size={18} />}
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
        />
        <Input
          label="Contraseña"
          name="password"
          type={verPassword ? 'text' : 'password'}
          required
          placeholder="Mínimo 8 caracteres"
          icono={<Lock size={18} />}
          accionDerecha={
            <BotonVer visible={verPassword} onToggle={() => setVerPassword((v) => !v)} />
          }
          value={form.password}
          onChange={(e) => set('password', e.target.value)}
        />

        {/* Requisitos de la contraseña (en vivo) */}
        {form.password.length > 0 && (
          <ul className="grid grid-cols-2 gap-x-3 gap-y-1 rounded-lg bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs">
            <Requisito ok={reglas.longitud} texto="Mínimo 8 caracteres" />
            <Requisito ok={reglas.mayuscula} texto="Una mayúscula" />
            <Requisito ok={reglas.minuscula} texto="Una minúscula" />
            <Requisito ok={reglas.numero} texto="Un número" />
          </ul>
        )}

        <Input
          label="Confirmar contraseña"
          name="confirmar"
          type={verConfirmar ? 'text' : 'password'}
          required
          placeholder="Repite tu contraseña"
          icono={<Lock size={18} />}
          accionDerecha={
            <BotonVer visible={verConfirmar} onToggle={() => setVerConfirmar((v) => !v)} />
          }
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          error={
            confirmar.length > 0 && !coincide ? 'Las contraseñas no coinciden.' : undefined
          }
        />

        <Button type="submit" className="w-full" size="lg" cargando={cargando} icono={<UserPlus size={18} />}>
          Crear cuenta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-semibold text-primary-700 dark:text-primary-300 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  )
}
