export interface ReglaContrasena {
  id: string
  label: string
  test: (valor: string) => boolean
}

export const REGLAS_CONTRASENA: ReglaContrasena[] = [
  { id: 'min', label: 'Mínimo 8 caracteres', test: (v) => v.length >= 8 },
  { id: 'upper', label: 'Una letra mayúscula', test: (v) => /[A-Z]/.test(v) },
  { id: 'lower', label: 'Una letra minúscula', test: (v) => /[a-z]/.test(v) },
  { id: 'digit', label: 'Un dígito', test: (v) => /\d/.test(v) },
  {
    id: 'special',
    label: 'Un carácter especial',
    test: (v) => /[!@#$%^&*()_+\-=[\]{};:'",.<>/?\\|`~]/.test(v),
  },
]

export function contrasenaValida(valor: string): boolean {
  return REGLAS_CONTRASENA.every((r) => r.test(valor))
}
