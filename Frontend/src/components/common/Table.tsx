import type { ReactNode } from 'react'
import Loading from './Loading'
import EmptyState from './EmptyState'

export interface Columna<T> {
  header: string
  /** clave directa o función de render */
  render: (fila: T) => ReactNode
  className?: string
}

interface TableProps<T> {
  columnas: Columna<T>[]
  datos: T[]
  keyExtractor: (fila: T) => string | number
  cargando?: boolean
  onRowClick?: (fila: T) => void
  mensajeVacio?: string
}

export default function Table<T>({
  columnas,
  datos,
  keyExtractor,
  cargando = false,
  onRowClick,
  mensajeVacio = 'No hay registros para mostrar.',
}: TableProps<T>) {
  if (cargando) return <Loading texto="Cargando datos..." />
  if (!datos.length) return <EmptyState titulo="Sin resultados" descripcion={mensajeVacio} />

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            {columnas.map((col, i) => (
              <th
                key={i}
                className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
          {datos.map((fila) => (
            <tr
              key={keyExtractor(fila)}
              onClick={() => onRowClick?.(fila)}
              className={`transition-colors ${
                onRowClick ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900' : ''
              }`}
            >
              {columnas.map((col, i) => (
                <td key={i} className={`px-4 py-3 text-slate-700 dark:text-slate-200 ${col.className ?? ''}`}>
                  {col.render(fila)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
