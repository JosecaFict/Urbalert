import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
  total: number
  paginaActual: number
  tamanoPagina: number
  opcionesTamano?: number[]
  onCambiarPagina: (pagina: number) => void
  onCambiarTamano: (tamano: number) => void
}

const OPCIONES_DEFECTO = [10, 20, 50]
const MAX_BOTONES = 5

function calcularRangoPaginas(paginaActual: number, totalPaginas: number): number[] {
  if (totalPaginas <= MAX_BOTONES) {
    return Array.from({ length: totalPaginas }, (_, i) => i + 1)
  }
  const mitad = Math.floor(MAX_BOTONES / 2)
  let inicio = Math.max(1, paginaActual - mitad)
  let fin = inicio + MAX_BOTONES - 1
  if (fin > totalPaginas) {
    fin = totalPaginas
    inicio = fin - MAX_BOTONES + 1
  }
  return Array.from({ length: fin - inicio + 1 }, (_, i) => inicio + i)
}

export default function Pagination({
  total,
  paginaActual,
  tamanoPagina,
  opcionesTamano = OPCIONES_DEFECTO,
  onCambiarPagina,
  onCambiarTamano,
}: PaginationProps) {
  const totalPaginas = Math.max(1, Math.ceil(total / tamanoPagina))
  const pagina = Math.min(Math.max(1, paginaActual), totalPaginas)
  const desde = total === 0 ? 0 : (pagina - 1) * tamanoPagina + 1
  const hasta = Math.min(pagina * tamanoPagina, total)
  const paginas = calcularRangoPaginas(pagina, totalPaginas)
  const esPrimera = pagina <= 1
  const esUltima = pagina >= totalPaginas

  const baseBtn =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2.5 text-sm text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50'
  const btnActivo =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-primary-600 bg-primary-700 px-2.5 text-sm font-semibold text-white'

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 dark:border-slate-700 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <span>Mostrar</span>
        <select
          value={tamanoPagina}
          onChange={(e) => onCambiarTamano(Number(e.target.value))}
          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-200"
        >
          {opcionesTamano.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>
        <span>
          de {total} · {desde}-{hasta}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-1.5">
        <button
          type="button"
          onClick={() => onCambiarPagina(1)}
          disabled={esPrimera}
          className={baseBtn}
          aria-label="Primera página"
          title="Primera página"
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => onCambiarPagina(pagina - 1)}
          disabled={esPrimera}
          className={baseBtn}
          aria-label="Página anterior"
          title="Página anterior"
        >
          <ChevronLeft size={16} />
        </button>

        {paginas[0] > 1 && (
          <span className="px-2 text-sm text-slate-400 dark:text-slate-500">…</span>
        )}
        {paginas.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onCambiarPagina(p)}
            className={p === pagina ? btnActivo : baseBtn}
            aria-current={p === pagina ? 'page' : undefined}
          >
            {p}
          </button>
        ))}
        {paginas[paginas.length - 1] < totalPaginas && (
          <span className="px-2 text-sm text-slate-400 dark:text-slate-500">…</span>
        )}

        <button
          type="button"
          onClick={() => onCambiarPagina(pagina + 1)}
          disabled={esUltima}
          className={baseBtn}
          aria-label="Página siguiente"
          title="Página siguiente"
        >
          <ChevronRight size={16} />
        </button>
        <button
          type="button"
          onClick={() => onCambiarPagina(totalPaginas)}
          disabled={esUltima}
          className={baseBtn}
          aria-label="Última página"
          title="Última página"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  )
}
