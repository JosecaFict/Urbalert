/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base del backend en producción, ej. https://tu-backend.up.railway.app/api */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
