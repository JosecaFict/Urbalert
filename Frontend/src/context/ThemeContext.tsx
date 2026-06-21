import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type Tema = 'claro' | 'oscuro'

const STORAGE_TEMA = 'urbalert_tema'

interface ThemeContextValue {
  tema: Tema
  oscuro: boolean
  alternar: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

/** Lee el tema inicial: preferencia guardada o, si no hay, la del sistema. */
function temaInicial(): Tema {
  try {
    const guardado = localStorage.getItem(STORAGE_TEMA)
    if (guardado === 'claro' || guardado === 'oscuro') return guardado
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'oscuro'
  } catch {
    /* localStorage no disponible */
  }
  return 'claro'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(temaInicial)

  // Refleja el tema en la clase del <html> y lo persiste
  useEffect(() => {
    const root = document.documentElement
    if (tema === 'oscuro') root.classList.add('dark')
    else root.classList.remove('dark')
    try {
      localStorage.setItem(STORAGE_TEMA, tema)
    } catch {
      /* ignorar */
    }
  }, [tema])

  const alternar = useCallback(
    () => setTema((t) => (t === 'oscuro' ? 'claro' : 'oscuro')),
    [],
  )

  const value = useMemo<ThemeContextValue>(
    () => ({ tema, oscuro: tema === 'oscuro', alternar }),
    [tema, alternar],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme debe usarse dentro de <ThemeProvider>')
  }
  return ctx
}
