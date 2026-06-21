import { useEffect, useState, type FormEvent } from 'react'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Textarea from '../../components/common/Textarea'
import Select from '../../components/common/Select'
import Table, { type Columna } from '../../components/common/Table'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import { categoriaService } from '../../api/categoriaService'
import { extraerError } from '../../api/axios'
import { useToast } from '../../context/ToastContext'
import type { Categoria, CategoriaFormData } from '../../types/categoria'

const VACIO: CategoriaFormData = { nombre: '', descripcion: '', estado: true }

export default function CategoriasPage() {
  const toast = useToast()
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [cargando, setCargando] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<CategoriaFormData>(VACIO)
  const [editId, setEditId] = useState<number | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [aEliminar, setAEliminar] = useState<Categoria | null>(null)

  const recargar = async () => {
    setCargando(true)
    try {
      setCategorias(await categoriaService.listar())
    } catch (e) {
      toast.error(extraerError(e))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    recargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const abrirNuevo = () => {
    setForm(VACIO)
    setEditId(null)
    setModal(true)
  }

  const abrirEditar = (c: Categoria) => {
    setForm({ nombre: c.nombre, descripcion: c.descripcion, estado: c.estado })
    setEditId(c.id)
    setModal(true)
  }

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    try {
      if (editId) {
        await categoriaService.actualizar(editId, form)
        toast.exito('Categoría actualizada.')
      } else {
        await categoriaService.crear(form)
        toast.exito('Categoría creada.')
      }
      setModal(false)
      await recargar()
    } catch (err) {
      toast.error(extraerError(err))
    } finally {
      setGuardando(false)
    }
  }

  const eliminar = async () => {
    if (!aEliminar) return
    try {
      await categoriaService.eliminar(aEliminar.id)
      toast.exito('Categoría eliminada.')
      setAEliminar(null)
      await recargar()
    } catch (e) {
      toast.error(extraerError(e, 'No se pudo eliminar (puede tener reclamos asociados).'))
    }
  }

  const columnas: Columna<Categoria>[] = [
    {
      header: 'Categoría',
      render: (c) => (
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
            <Tag size={16} />
          </span>
          <span className="font-medium text-slate-800 dark:text-slate-100">{c.nombre}</span>
        </div>
      ),
    },
    { header: 'Descripción', render: (c) => c.descripcion || <span className="text-slate-400 dark:text-slate-500">—</span> },
    { header: 'Reclamos', render: (c) => c.total_reclamos ?? 0 },
    {
      header: 'Estado',
      render: (c) =>
        c.estado ? (
          <Badge className="bg-green-100 text-green-700" dot="bg-green-500">Activa</Badge>
        ) : (
          <Badge className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300" dot="bg-slate-500">Inactiva</Badge>
        ),
    },
    {
      header: 'Acciones',
      render: (c) => (
        <div className="flex gap-1">
          <button onClick={() => abrirEditar(c)} className="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-300" aria-label="Editar">
            <Pencil size={16} />
          </button>
          <button onClick={() => setAEliminar(c)} className="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Eliminar">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        titulo="Categorías de reclamos"
        descripcion="Administra las categorías disponibles para clasificar reclamos."
        accion={<Button icono={<Plus size={18} />} onClick={abrirNuevo}>Nueva categoría</Button>}
      />

      <Card>
        <Table columnas={columnas} datos={categorias} keyExtractor={(c) => c.id} cargando={cargando} />
      </Card>

      <Modal
        abierto={modal}
        onCerrar={() => setModal(false)}
        titulo={editId ? 'Editar categoría' : 'Nueva categoría'}
      >
        <form onSubmit={guardar} className="space-y-4">
          <Input
            label="Nombre"
            required
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />
          <Textarea
            label="Descripción"
            rows={3}
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          />
          <Select
            label="Estado"
            opciones={[
              { value: 'true', label: 'Activa' },
              { value: 'false', label: 'Inactiva' },
            ]}
            value={String(form.estado)}
            onChange={(e) => setForm({ ...form, estado: e.target.value === 'true' })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModal(false)}>Cancelar</Button>
            <Button type="submit" cargando={guardando}>{editId ? 'Guardar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        abierto={!!aEliminar}
        onCerrar={() => setAEliminar(null)}
        titulo="Eliminar categoría"
        footer={
          <>
            <Button variant="outline" onClick={() => setAEliminar(null)}>Cancelar</Button>
            <Button variant="danger" onClick={eliminar}>Eliminar</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          ¿Seguro que deseas eliminar la categoría <strong>{aEliminar?.nombre}</strong>?
        </p>
      </Modal>
    </div>
  )
}
