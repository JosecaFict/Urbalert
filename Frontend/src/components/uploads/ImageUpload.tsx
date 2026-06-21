import { useRef, useState, type ChangeEvent } from 'react'
import { ImagePlus, X } from 'lucide-react'

interface ImageUploadProps {
  label?: string
  onChange: (file: File | null) => void
  error?: string
  ayuda?: string
}

export default function ImageUpload({
  label = 'Fotografía',
  onChange,
  error,
  ayuda,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [nombre, setNombre] = useState<string>('')

  const seleccionar = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    if (file) {
      setPreview(URL.createObjectURL(file))
      setNombre(file.name)
      onChange(file)
    }
  }

  const quitar = () => {
    setPreview(null)
    setNombre('')
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</label>
      )}

      {preview ? (
        <div className="relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
          <img src={preview} alt="Vista previa" className="h-48 w-full object-cover" />
          <button
            type="button"
            onClick={quitar}
            className="absolute right-2 top-2 rounded-full bg-slate-900/70 p-1.5 text-white hover:bg-slate-900"
            aria-label="Quitar imagen"
          >
            <X size={16} />
          </button>
          <p className="truncate bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400">{nombre}</p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`flex h-40 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-slate-400 dark:text-slate-500 transition hover:border-primary-400 hover:text-primary-600 ${
            error ? 'border-red-300' : 'border-slate-300 dark:border-slate-600'
          }`}
        >
          <ImagePlus size={28} />
          <span className="text-sm font-medium">Haz clic para subir una imagen</span>
          <span className="text-xs">JPG o PNG, máx. recomendado 5 MB</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={seleccionar}
      />
      {ayuda && !error && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{ayuda}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
