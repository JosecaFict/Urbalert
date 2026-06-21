import UsuariosManager from '../../components/admin/UsuariosManager'
import { usuarioService } from '../../api/usuarioService'

export default function CiudadanosPage() {
  return (
    <UsuariosManager
      titulo="Ciudadanos"
      descripcion="Usuarios ciudadanos que reportan reclamos urbanos."
      rolFiltro="ciudadano"
      cargar={usuarioService.ciudadanos}
    />
  )
}
