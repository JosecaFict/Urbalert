import { useState, type FormEvent } from 'react'
import { User, IdCard, Phone, MapPin, Mail, Save } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { authService } from '../../api/authService'
import { extraerError } from '../../api/axios'
import { rolLabel, ROL_BADGE } from '../../utils/roleLabels'
import { formatDateLong } from '../../utils/formatDate'

export default function PerfilPage() {
  const { usuario, rol, refrescarUsuario } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({
    nombres: usuario?.nombres ?? '',
    apellidos: usuario?.apellidos ?? '',
    ci: usuario?.ci ?? '',
    telefono: usuario?.telefono ?? '',
    direccion: usuario?.direccion ?? '',
  })
  const [guardando, setGuardando] = useState(false)

  const set = (campo: keyof typeof form, valor: string) =>
    setForm((prev) => ({ ...prev, [campo]: valor }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    try {
      await authService.actualizarPerfil(form)
      await refrescarUsuario()
      toast.exito('Perfil actualizado correctamente.')
    } catch (err) {
      toast.error(extraerError(err))
    } finally {
      setGuardando(false)
    }
  }

  const iniciales = (
    `${usuario?.nombres ?? ''} ${usuario?.apellidos ?? ''}`.trim() ||
    usuario?.email ||
    '?'
  )
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader titulo="Mi perfil" descripcion="Consulta y actualiza tus datos personales." />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-700 text-2xl font-bold text-white">
              {iniciales}
            </div>
            <h3 className="mt-4 font-semibold text-slate-800 dark:text-slate-100">
              {usuario?.nombre_completo || '—'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{usuario?.email}</p>
            {rol && (
              <span className={`mt-3 rounded-full px-3 py-1 text-xs font-medium ${ROL_BADGE[rol]}`}>
                {rolLabel(rol)}
              </span>
            )}
            <div className="mt-4 w-full border-t border-slate-100 dark:border-slate-700 pt-4 text-sm">
              <p className="text-slate-400 dark:text-slate-500">Miembro desde</p>
              <p className="font-medium text-slate-600 dark:text-slate-300">
                {formatDateLong(usuario?.fecha_registro)}
              </p>
            </div>
            <Badge className="mt-3 bg-green-100 text-green-700" dot="bg-green-500">
              Cuenta {usuario?.estado ?? 'activa'}
            </Badge>
          </div>
        </Card>

        <Card titulo="Datos personales" className="md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Nombres"
                icono={<User size={18} />}
                value={form.nombres}
                onChange={(e) => set('nombres', e.target.value)}
              />
              <Input
                label="Apellidos"
                icono={<User size={18} />}
                value={form.apellidos}
                onChange={(e) => set('apellidos', e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Carnet de identidad"
                icono={<IdCard size={18} />}
                value={form.ci}
                onChange={(e) => set('ci', e.target.value)}
              />
              <Input
                label="Teléfono"
                icono={<Phone size={18} />}
                value={form.telefono}
                onChange={(e) => set('telefono', e.target.value)}
              />
            </div>
            <Input
              label="Dirección"
              icono={<MapPin size={18} />}
              value={form.direccion}
              onChange={(e) => set('direccion', e.target.value)}
            />
            <Input
              label="Correo electrónico"
              icono={<Mail size={18} />}
              value={usuario?.email ?? ''}
              disabled
            />
            <div className="flex justify-end">
              <Button type="submit" icono={<Save size={18} />} cargando={guardando}>
                Guardar cambios
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
