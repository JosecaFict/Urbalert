import UsuariosManager from '../../components/admin/UsuariosManager'
import { usuarioService } from '../../api/usuarioService'

export default function UsuariosPage() {
  return (
    <UsuariosManager
      titulo="Gestión de usuarios"
      descripcion="Administra todos los usuarios del sistema, sin importar su rol."
      cargar={usuarioService.listar}
    />
  )
}
