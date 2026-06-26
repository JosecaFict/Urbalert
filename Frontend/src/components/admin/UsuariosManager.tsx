import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Search, KeyRound } from 'lucide-react'
import PageHeader from '../common/PageHeader'
import Card from '../common/Card'
import Button from '../common/Button'
import Input from '../common/Input'
import Table, { type Columna } from '../common/Table'
import Badge from '../common/Badge'
import Modal from '../common/Modal'
import UsuarioFormModal from './UsuarioFormModal'
import RestablecerPasswordModal from './RestablecerPasswordModal'
import { usuarioService } from '../../api/usuarioService'
import { extraerError } from '../../api/axios'
import { useToast } from '../../context/ToastContext'
import { formatDate } from '../../utils/formatDate'
import { rolLabel, ROL_BADGE } from '../../utils/roleLabels'
import type { Rol, RolNombre, Usuario, UsuarioFormData } from '../../types/usuario'

interface UsuariosManagerProps {
  titulo: string
  descripcion: string
  /** si se indica, filtra y fija el rol (ciudadanos/encargados/trabajadores) */
  rolFiltro?: RolNombre
  cargar: () => Promise<Usuario[]>
  /** se ejecuta después de cada alta/edición/eliminación/restablecimiento */
  onCambio?: () => void
  /** contenido extra a renderizar entre el header y la tabla (tabs) */
  encabezadoExtra?: React.ReactNode
}

export default function UsuariosManager({
  titulo,
  descripcion,
  rolFiltro,
  cargar,
  onCambio,
  encabezadoExtra,
}: UsuariosManagerProps) {
  const toast = useToast()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [roles, setRoles] = useState<Rol[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [modalForm, setModalForm] = useState(false)
  const [editando, setEditando] = useState<Usuario | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [aEliminar, setAEliminar] = useState<Usuario | null>(null)
  const [aRestablecer, setARestablecer] = useState<Usuario | null>(null)
  const [restableciendo, setRestableciendo] = useState(false)

  const recargar = async () => {
    setCargando(true)
    try {
      const data = await cargar()
      setUsuarios(data)
    } catch (e) {
      toast.error(extraerError(e))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    recargar()
    usuarioService.roles().then(setRoles).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolFiltro])

  const rolFijoId = rolFiltro ? roles.find((r) => r.nombre === rolFiltro)?.id : undefined

  const guardar = async (data: UsuarioFormData, id?: number) => {
    setGuardando(true)
    try {
      if (id) {
        await usuarioService.actualizar(id, data)
        toast.exito('Usuario actualizado.')
      } else {
        await usuarioService.crear(data)
        toast.exito('Usuario creado.')
      }
      setModalForm(false)
      setEditando(null)
      await recargar()
      onCambio?.()
    } catch (e) {
      toast.error(extraerError(e))
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async () => {
    if (!aEliminar) return
    try {
      await usuarioService.eliminar(aEliminar.id)
      toast.exito('Usuario eliminado.')
      setAEliminar(null)
      await recargar()
      onCambio?.()
    } catch (e) {
      toast.error(extraerError(e))
    }
  }

  const restablecerPassword = async (password: string) => {
    if (!aRestablecer) return
    setRestableciendo(true)
    try {
      await usuarioService.restablecerPassword(aRestablecer.id, password)
      toast.exito('Contraseña restablecida.')
      setARestablecer(null)
    } catch (e) {
      toast.error(extraerError(e))
    } finally {
      setRestableciendo(false)
    }
  }

  const filtrados = usuarios.filter((u) => {
    const t = busqueda.toLowerCase()
    return (
      u.nombre_completo.toLowerCase().includes(t) ||
      u.email.toLowerCase().includes(t) ||
      u.ci.toLowerCase().includes(t)
    )
  })

  const columnas: Columna<Usuario>[] = [
    {
      header: 'Usuario',
      render: (u) => (
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-100">{u.nombre_completo || '—'}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{u.email}</p>
        </div>
      ),
    },
    { header: 'CI', render: (u) => u.ci || '—' },
    { header: 'Teléfono', render: (u) => u.telefono || '—' },
    ...(!rolFiltro
      ? [{
          header: 'Rol',
          render: (u: Usuario) =>
            u.rol_nombre ? (
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ROL_BADGE[u.rol_nombre]}`}>
                {rolLabel(u.rol_nombre)}
              </span>
            ) : '—',
        }]
      : []),
    {
      header: 'Estado',
      render: (u) =>
        u.estado === 'activo' ? (
          <Badge className="bg-green-100 text-green-700" dot="bg-green-500">Activo</Badge>
        ) : (
          <Badge className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300" dot="bg-slate-500">Inactivo</Badge>
        ),
    },
    { header: 'Registro', render: (u) => formatDate(u.fecha_registro) },
    {
      header: 'Acciones',
      render: (u) => (
        <div className="flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setEditando(u); setModalForm(true) }}
            className="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-300"
            aria-label="Editar"
            title="Editar"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setARestablecer(u) }}
            className="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-300"
            aria-label="Restablecer contraseña"
            title="Restablecer contraseña"
          >
            <KeyRound size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setAEliminar(u) }}
            className="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-red-50 hover:text-red-600"
            aria-label="Eliminar"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        titulo={titulo}
        descripcion={descripcion}
        accion={
          <Button
            icono={<Plus size={18} />}
            onClick={() => { setEditando(null); setModalForm(true) }}
          >
            Nuevo {rolFiltro ? rolLabel(rolFiltro).toLowerCase() : 'usuario'}
          </Button>
        }
      />

      {encabezadoExtra}

      <Card className="mb-6">
        <div className="w-full max-w-sm">
          <Input
            placeholder="Buscar por nombre, correo o CI..."
            icono={<Search size={18} />}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </Card>

      <Card>
        <Table
          columnas={columnas}
          datos={filtrados}
          keyExtractor={(u) => u.id}
          cargando={cargando}
          mensajeVacio="No hay usuarios para mostrar."
        />
      </Card>

      <UsuarioFormModal
        abierto={modalForm}
        onCerrar={() => { setModalForm(false); setEditando(null) }}
        onGuardar={guardar}
        roles={roles}
        usuario={editando}
        rolFijo={rolFijoId}
        guardando={guardando}
      />

      <RestablecerPasswordModal
        abierto={!!aRestablecer}
        onCerrar={() => setARestablecer(null)}
        onConfirmar={restablecerPassword}
        usuario={aRestablecer}
        guardando={restableciendo}
      />

      <Modal
        abierto={!!aEliminar}
        onCerrar={() => setAEliminar(null)}
        titulo="Eliminar usuario"
        footer={
          <>
            <Button variant="outline" onClick={() => setAEliminar(null)}>Cancelar</Button>
            <Button variant="danger" onClick={eliminar}>Eliminar</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          ¿Seguro que deseas eliminar a <strong>{aEliminar?.nombre_completo || aEliminar?.email}</strong>?
          Esta acción no se puede deshacer.
        </p>
      </Modal>
    </div>
  )
}
