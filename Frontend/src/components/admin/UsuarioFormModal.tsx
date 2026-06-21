import { useEffect, useState, type FormEvent } from 'react'
import Modal from '../common/Modal'
import Input from '../common/Input'
import Select from '../common/Select'
import Button from '../common/Button'
import type { Rol, Usuario, UsuarioFormData } from '../../types/usuario'

interface UsuarioFormModalProps {
  abierto: boolean
  onCerrar: () => void
  onGuardar: (data: UsuarioFormData, id?: number) => Promise<void>
  roles: Rol[]
  usuario?: Usuario | null
  /** rol fijo (para páginas de ciudadanos/encargados/trabajadores) */
  rolFijo?: number
  guardando?: boolean
}

const VACIO: UsuarioFormData = {
  email: '',
  password: '',
  nombres: '',
  apellidos: '',
  ci: '',
  telefono: '',
  direccion: '',
  rol: null,
  estado: 'activo',
}

export default function UsuarioFormModal({
  abierto,
  onCerrar,
  onGuardar,
  roles,
  usuario,
  rolFijo,
  guardando,
}: UsuarioFormModalProps) {
  const [form, setForm] = useState<UsuarioFormData>(VACIO)
  const editando = !!usuario

  useEffect(() => {
    if (usuario) {
      setForm({
        email: usuario.email,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        ci: usuario.ci,
        telefono: usuario.telefono,
        direccion: usuario.direccion,
        rol: usuario.rol,
        estado: usuario.estado,
        password: '',
      })
    } else {
      setForm({ ...VACIO, rol: rolFijo ?? null })
    }
  }, [usuario, rolFijo, abierto])

  const set = (campo: keyof UsuarioFormData, valor: string | number) =>
    setForm((prev) => ({ ...prev, [campo]: valor }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const payload = { ...form }
    if (editando && !payload.password) delete payload.password
    await onGuardar(payload, usuario?.id)
  }

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={editando ? 'Editar usuario' : 'Nuevo usuario'}
      tamano="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nombres"
            required
            value={form.nombres}
            onChange={(e) => set('nombres', e.target.value)}
          />
          <Input
            label="Apellidos"
            required
            value={form.apellidos}
            onChange={(e) => set('apellidos', e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Correo electrónico"
            type="email"
            required
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
          <Input
            label={editando ? 'Nueva contraseña (opcional)' : 'Contraseña'}
            type="password"
            required={!editando}
            placeholder={editando ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'}
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Carnet de identidad" value={form.ci} onChange={(e) => set('ci', e.target.value)} />
          <Input label="Teléfono" value={form.telefono} onChange={(e) => set('telefono', e.target.value)} />
        </div>
        <Input label="Dirección" value={form.direccion} onChange={(e) => set('direccion', e.target.value)} />
        <div className="grid gap-4 sm:grid-cols-2">
          {!rolFijo && (
            <Select
              label="Rol"
              required
              placeholder="Selecciona un rol"
              opciones={roles.map((r) => ({ value: r.id, label: r.nombre }))}
              value={form.rol ?? ''}
              onChange={(e) => set('rol', Number(e.target.value))}
            />
          )}
          <Select
            label="Estado"
            opciones={[
              { value: 'activo', label: 'Activo' },
              { value: 'inactivo', label: 'Inactivo' },
            ]}
            value={form.estado ?? 'activo'}
            onChange={(e) => set('estado', e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCerrar}>Cancelar</Button>
          <Button type="submit" cargando={guardando}>
            {editando ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
