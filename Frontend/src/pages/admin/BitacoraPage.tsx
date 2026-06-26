import { useEffect, useMemo, useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Table, { type Columna } from '../../components/common/Table'
import Badge from '../../components/common/Badge'
import Pagination from '../../components/common/Pagination'
import { bitacoraService, type FiltrosBitacora } from '../../api/bitacoraService'
import { extraerError } from '../../api/axios'
import { useToast } from '../../context/ToastContext'
import { formatDateTime } from '../../utils/formatDate'
import { rolLabel, ROL_BADGE } from '../../utils/roleLabels'
import type { Bitacora } from '../../types/bitacora'
import type { RolNombre } from '../../types/usuario'

export default function BitacoraPage() {
  const toast = useToast()
  const [registros, setRegistros] = useState<Bitacora[]>([])
  const [cargando, setCargando] = useState(true)
  const [filtros, setFiltros] = useState<FiltrosBitacora>({})
  const [pagina, setPagina] = useState(1)
  const [tamanoPagina, setTamanoPagina] = useState(20)

  const cargar = async (f: FiltrosBitacora = {}) => {
    setCargando(true)
    try {
      setRegistros(await bitacoraService.listar({ ...f, page_size: 1000 }))
      setPagina(1)
    } catch (e) {
      toast.error(extraerError(e))
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const aplicar = () => cargar(filtros)
  const limpiar = () => {
    setFiltros({})
    cargar()
  }

  useEffect(() => {
    setPagina(1)
  }, [tamanoPagina])

  const paginados = useMemo(() => {
    const inicio = (pagina - 1) * tamanoPagina
    return registros.slice(inicio, inicio + tamanoPagina)
  }, [registros, pagina, tamanoPagina])

  const columnas: Columna<Bitacora>[] = [
    { header: 'Fecha y hora', render: (b) => <span className="whitespace-nowrap">{formatDateTime(b.fecha_hora)}</span> },
    {
      header: 'Usuario',
      render: (b) => (
        <div>
          <p className="font-medium text-slate-700 dark:text-slate-200">{b.usuario_nombre}</p>
          {b.usuario_rol && (
            <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${ROL_BADGE[b.usuario_rol as RolNombre] ?? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
              {rolLabel(b.usuario_rol as RolNombre)}
            </span>
          )}
        </div>
      ),
    },
    { header: 'Acción', render: (b) => <span className="font-medium text-slate-700 dark:text-slate-200">{b.accion}</span> },
    { header: 'Módulo', render: (b) => <Badge className="bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">{b.modulo}</Badge> },
    { header: 'Descripción', render: (b) => <span className="text-slate-600 dark:text-slate-300">{b.descripcion}</span> },
    { header: 'IP', render: (b) => <span className="text-xs text-slate-400 dark:text-slate-500">{b.ip_usuario || '—'}</span> },
  ]

  return (
    <div>
      <PageHeader
        titulo="Bitácora del sistema"
        descripcion="Registro de los movimientos importantes realizados en Urbalert."
      />

      <Card className="mb-6">
        <div className="grid items-end gap-4 md:grid-cols-4">
          <Input
            label="Acción"
            placeholder="Ej: Inicio de sesión"
            icono={<Search size={18} />}
            value={filtros.accion ?? ''}
            onChange={(e) => setFiltros({ ...filtros, accion: e.target.value })}
          />
          <Input
            label="Desde"
            type="date"
            value={filtros.desde ?? ''}
            onChange={(e) => setFiltros({ ...filtros, desde: e.target.value })}
          />
          <Input
            label="Hasta"
            type="date"
            value={filtros.hasta ?? ''}
            onChange={(e) => setFiltros({ ...filtros, hasta: e.target.value })}
          />
          <div className="flex gap-2">
            <Button icono={<Filter size={16} />} onClick={aplicar} className="flex-1">Filtrar</Button>
            <Button variant="outline" icono={<X size={16} />} onClick={limpiar}>Limpiar</Button>
          </div>
        </div>
      </Card>

      <Card>
        <Table
          columnas={columnas}
          datos={paginados}
          keyExtractor={(b) => b.id}
          cargando={cargando}
          mensajeVacio="No hay movimientos registrados con esos filtros."
        />
        {!cargando && registros.length > 0 && (
          <div className="mt-4">
            <Pagination
              total={registros.length}
              paginaActual={pagina}
              tamanoPagina={tamanoPagina}
              onCambiarPagina={setPagina}
              onCambiarTamano={setTamanoPagina}
            />
          </div>
        )}
      </Card>
    </div>
  )
}
