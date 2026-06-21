import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import Select from '../../components/common/Select'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import Loading from '../../components/common/Loading'
import ReclamoTable from '../../components/reclamos/ReclamoTable'
import ReclamoDetailView from '../../components/reclamos/ReclamoDetailView'
import { Search } from 'lucide-react'
import { reclamoService } from '../../api/reclamoService'
import { categoriaService } from '../../api/categoriaService'
import { extraerError } from '../../api/axios'
import { useToast } from '../../context/ToastContext'
import type { EstadoNombre, ReclamoDetalle, ReclamoListItem } from '../../types/reclamo'
import type { Categoria } from '../../types/categoria'

const ESTADOS: EstadoNombre[] = [
  'Pendiente', 'Aceptado', 'Rechazado', 'Asignado',
  'En atención', 'Reportado', 'Solucionado', 'No solucionado',
]

export default function TodosReclamosPage() {
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [reclamos, setReclamos] = useState<ReclamoListItem[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [cargando, setCargando] = useState(true)
  const [estado, setEstado] = useState('')
  const [categoria, setCategoria] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const [detalle, setDetalle] = useState<ReclamoDetalle | null>(null)
  const [cargandoDetalle, setCargandoDetalle] = useState(false)

  useEffect(() => {
    categoriaService.listar().then(setCategorias).catch(() => {})
  }, [])

  useEffect(() => {
    setCargando(true)
    const params: Record<string, string> = {}
    if (estado) params.estado = estado
    if (categoria) params.categoria = categoria
    reclamoService
      .listar(params)
      .then(setReclamos)
      .catch((e) => toast.error(extraerError(e)))
      .finally(() => setCargando(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado, categoria])

  const abrirDetalle = async (id: number) => {
    setCargandoDetalle(true)
    setDetalle({} as ReclamoDetalle)
    try {
      setDetalle(await reclamoService.obtener(id))
    } catch (e) {
      toast.error(extraerError(e))
      setDetalle(null)
    } finally {
      setCargandoDetalle(false)
    }
  }

  // Abrir automáticamente si viene ?reclamo=ID
  useEffect(() => {
    const rid = searchParams.get('reclamo')
    if (rid) {
      abrirDetalle(Number(rid))
      searchParams.delete('reclamo')
      setSearchParams(searchParams, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtrados = useMemo(() => {
    const t = busqueda.toLowerCase()
    return reclamos.filter(
      (r) =>
        r.titulo.toLowerCase().includes(t) ||
        r.direccion_texto.toLowerCase().includes(t) ||
        r.ciudadano_nombre.toLowerCase().includes(t),
    )
  }, [reclamos, busqueda])

  return (
    <div>
      <PageHeader
        titulo="Todos los reclamos"
        descripcion="Vista global de todos los reclamos registrados en Urbalert."
      />

      <Card className="mb-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Buscar"
            placeholder="Título, dirección o ciudadano..."
            icono={<Search size={18} />}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <Select
            label="Estado"
            placeholder="Todos los estados"
            opciones={ESTADOS.map((e) => ({ value: e, label: e }))}
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          />
          <Select
            label="Categoría"
            placeholder="Todas las categorías"
            opciones={categorias.map((c) => ({ value: c.id, label: c.nombre }))}
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          />
        </div>
      </Card>

      <Card>
        <ReclamoTable reclamos={filtrados} cargando={cargando} onVer={(r) => abrirDetalle(r.id)} />
      </Card>

      <Modal
        abierto={!!detalle}
        onCerrar={() => setDetalle(null)}
        titulo="Detalle del reclamo"
        tamano="xl"
      >
        {cargandoDetalle || !detalle?.id ? (
          <Loading texto="Cargando detalle..." />
        ) : (
          <ReclamoDetailView reclamo={detalle} />
        )}
      </Modal>
    </div>
  )
}
