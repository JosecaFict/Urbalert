import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

/** Botón para alternar entre tema claro y oscuro. */
export default function ThemeToggle() {
  const { oscuro, alternar } = useTheme()
  return (
    <button
      onClick={alternar}
      className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
      aria-label={oscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      title={oscuro ? 'Tema claro' : 'Tema oscuro'}
    >
      {oscuro ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}
