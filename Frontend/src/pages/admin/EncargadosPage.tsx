import UsuariosManager from '../../components/admin/UsuariosManager'
import { usuarioService } from '../../api/usuarioService'

export default function EncargadosPage() {
  return (
    <UsuariosManager
      titulo="Encargados"
      descripcion="Usuarios encargados de revisar, asignar y cerrar reclamos."
      rolFiltro="encargado"
      cargar={usuarioService.encargados}
    />
  )
}
