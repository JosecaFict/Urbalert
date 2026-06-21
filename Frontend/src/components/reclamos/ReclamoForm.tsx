import { useState, type FormEvent } from 'react'
import { Save } from 'lucide-react'
import Input from '../common/Input'
import Select from '../common/Select'
import Textarea from '../common/Textarea'
import Button from '../common/Button'
import MapPicker from '../maps/MapPicker'
import ImageUpload from '../uploads/ImageUpload'
import { AYUDA_CATEGORIA } from '../../data/mockData'
import type { Categoria } from '../../types/categoria'
import type { Prioridad, ReclamoFormData } from '../../types/reclamo'

interface ReclamoFormProps {
  categorias: Categoria[]
  onSubmit: (data: ReclamoFormData) => Promise<void>
  enviando?: boolean
}

type Errores = Partial<Record<keyof ReclamoFormData | 'ubicacion', string>>

const ESTADO_INICIAL: ReclamoFormData = {
  titulo: '',
  descripcion: '',
  categoria: '',
  direccion_texto: '',
  latitud: null,
  longitud: null,
  prioridad: 'media',
  foto_principal: null,
}

export default function ReclamoForm({ categorias, onSubmit, enviando }: ReclamoFormProps) {
  const [form, setForm] = useState<ReclamoFormData>(ESTADO_INICIAL)
  const [errores, setErrores] = useState<Errores>({})

  const set = <K extends keyof ReclamoFormData>(campo: K, valor: ReclamoFormData[K]) => {
    setForm((prev) => ({ ...prev, [campo]: valor }))
    setErrores((prev) => ({ ...prev, [campo]: undefined }))
  }

  const validar = (): boolean => {
    const e: Errores = {}
    if (!form.titulo.trim()) e.titulo = 'El título es obligatorio.'
    if (!form.categoria) e.categoria = 'Selecciona una categoría.'
    if (!form.descripcion.trim()) e.descripcion = 'La descripción es obligatoria.'
    if (!form.direccion_texto.trim()) e.direccion_texto = 'La dirección es obligatoria.'
    if (form.latitud == null || form.longitud == null)
      e.ubicacion = 'Marca la ubicación exacta en el mapa.'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault()
    if (!validar()) return
    await onSubmit(form)
  }

  const ayuda = form.categoria
    ? AYUDA_CATEGORIA[categorias.find((c) => c.id === Number(form.categoria))?.nombre ?? '']
    : undefined

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Input
          label="Título del reclamo"
          name="titulo"
          required
          placeholder="Ej: Bache profundo en Av. Santos Dumont"
          value={form.titulo}
          onChange={(e) => set('titulo', e.target.value)}
          error={errores.titulo}
        />
        <Select
          label="Categoría"
          name="categoria"
          required
          placeholder="Selecciona una categoría"
          opciones={categorias.map((c) => ({ value: c.id, label: c.nombre }))}
          value={form.categoria}
          onChange={(e) => set('categoria', e.target.value ? Number(e.target.value) : '')}
          error={errores.categoria}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Select
          label="Prioridad"
          name="prioridad"
          opciones={[
            { value: 'baja', label: 'Baja' },
            { value: 'media', label: 'Media' },
            { value: 'alta', label: 'Alta' },
          ]}
          value={form.prioridad}
          onChange={(e) => set('prioridad', e.target.value as Prioridad)}
        />
        <Input
          label="Dirección escrita"
          name="direccion_texto"
          required
          placeholder="Ej: Av. Banzer, 3er anillo"
          value={form.direccion_texto}
          onChange={(e) => set('direccion_texto', e.target.value)}
          error={errores.direccion_texto}
        />
      </div>

      <Textarea
        label="Descripción detallada"
        name="descripcion"
        required
        rows={4}
        placeholder="Describe el problema con el mayor detalle posible..."
        value={form.descripcion}
        onChange={(e) => set('descripcion', e.target.value)}
        error={errores.descripcion}
      />
      {ayuda && (
        <p className="-mt-3 text-xs text-primary-700 dark:text-primary-300">💡 {ayuda}</p>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
          Ubicación en el mapa <span className="text-red-500">*</span>
        </label>
        <MapPicker
          latitud={form.latitud}
          longitud={form.longitud}
          onCambio={(lat, lng) => {
            set('latitud', lat)
            set('longitud', lng)
            setErrores((prev) => ({ ...prev, ubicacion: undefined }))
          }}
        />
        {errores.ubicacion && <p className="mt-1 text-xs text-red-600">{errores.ubicacion}</p>}
      </div>

      <ImageUpload
        label="Foto del problema (recomendado)"
        ayuda="Una foto ayuda al encargado a evaluar mejor tu reclamo."
        onChange={(file) => set('foto_principal', file)}
      />

      <div className="flex justify-end pt-2">
        <Button type="submit" size="lg" icono={<Save size={18} />} cargando={enviando}>
          Guardar reclamo
        </Button>
      </div>
    </form>
  )
}
