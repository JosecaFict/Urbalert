import { useEffect, useState, type FormEvent } from 'react'
import { Eye, EyeOff, Check, X } from 'lucide-react'
import Modal from '../common/Modal'
import Input from '../common/Input'
import Button from '../common/Button'
import { REGLAS_CONTRASENA, contrasenaValida } from '../../utils/passwordRules'
import type { Usuario } from '../../types/usuario'

interface RestablecerPasswordModalProps {
  abierto: boolean
  onCerrar: () => void
  onConfirmar: (password: string) => Promise<void>
  usuario: Usuario | null
  guardando?: boolean
}

export default function RestablecerPasswordModal({
  abierto,
  onCerrar,
  onConfirmar,
  usuario,
  guardando,
}: RestablecerPasswordModalProps) {
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [mostrar, setMostrar] = useState(false)
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false)

  useEffect(() => {
    if (abierto) {
      setPassword('')
      setConfirmar('')
      setMostrar(false)
      setMostrarConfirmar(false)
    }
  }, [abierto])

  const cumplePolitica = contrasenaValida(password)
  const coinciden = password.length > 0 && password === confirmar
  const puedeEnviar = cumplePolitica && coinciden && !guardando

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!puedeEnviar) return
    await onConfirmar(password)
  }

  const toggleIcon = (visible: boolean, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
      aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      tabIndex={-1}
    >
      {visible ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  )

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo="Restablecer contraseña"
      tamano="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {usuario && (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Vas a establecer una nueva contraseña para{' '}
            <strong className="text-slate-800 dark:text-slate-100">
              {usuario.nombre_completo || usuario.email}
            </strong>
            .
          </p>
        )}

        <Input
          label="Nueva contraseña"
          type={mostrar ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Ingresa la nueva contraseña"
          accionDerecha={toggleIcon(mostrar, () => setMostrar((v) => !v))}
          autoFocus
        />

        <Input
          label="Confirmar contraseña"
          type={mostrarConfirmar ? 'text' : 'password'}
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          placeholder="Repite la nueva contraseña"
          accionDerecha={toggleIcon(mostrarConfirmar, () =>
            setMostrarConfirmar((v) => !v),
          )}
          error={
            confirmar.length > 0 && !coinciden
              ? 'Las contraseñas no coinciden.'
              : undefined
          }
        />

        <ul className="space-y-1 rounded-lg bg-slate-50 dark:bg-slate-900/40 p-3 text-sm">
          {REGLAS_CONTRASENA.map((regla) => {
            const ok = regla.test(password)
            return (
              <li
                key={regla.id}
                className={`flex items-center gap-2 ${
                  ok
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {ok ? <Check size={14} /> : <X size={14} />}
                <span>{regla.label}</span>
              </li>
            )
          })}
        </ul>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button type="submit" cargando={guardando} disabled={!puedeEnviar}>
            Restablecer
          </Button>
        </div>
      </form>
    </Modal>
  )
}
