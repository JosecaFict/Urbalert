import UsuariosManager from '../../components/admin/UsuariosManager'
import { usuarioService } from '../../api/usuarioService'

export default function TrabajadoresPage() {
  return (
    <UsuariosManager
      titulo="Trabajadores"
      descripcion="Usuarios trabajadores que atienden los reclamos asignados."
      rolFiltro="trabajador"
      cargar={usuarioService.trabajadores}
    />
  )
}
