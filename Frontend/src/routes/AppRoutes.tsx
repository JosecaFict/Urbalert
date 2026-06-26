import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../components/routes/ProtectedRoute'
import RoleRoute from '../components/routes/RoleRoute'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import { rutaInicialPorRol } from '../utils/roleLabels'

// Público
import LandingPage from '../pages/landing/LandingPage'

// Auth
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'

// Admin
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import UsuariosPage from '../pages/admin/UsuariosPage'
import CategoriasPage from '../pages/admin/CategoriasPage'
import TodosReclamosPage from '../pages/admin/TodosReclamosPage'
import BitacoraPage from '../pages/admin/BitacoraPage'

// Ciudadano
import CiudadanoDashboardPage from '../pages/ciudadano/CiudadanoDashboardPage'
import CrearReclamoPage from '../pages/ciudadano/CrearReclamoPage'
import MisReclamosPage from '../pages/ciudadano/MisReclamosPage'
import DetalleMiReclamoPage from '../pages/ciudadano/DetalleMiReclamoPage'

// Encargado
import EncargadoDashboardPage from '../pages/encargado/EncargadoDashboardPage'
import ReclamosPendientesPage from '../pages/encargado/ReclamosPendientesPage'
import GestionReclamoPage from '../pages/encargado/GestionReclamoPage'
import AsignarTrabajadorPage from '../pages/encargado/AsignarTrabajadorPage'
import RevisarReportePage from '../pages/encargado/RevisarReportePage'

// Trabajador
import TrabajadorDashboardPage from '../pages/trabajador/TrabajadorDashboardPage'
import MisAsignacionesPage from '../pages/trabajador/MisAsignacionesPage'
import DetalleAsignacionPage from '../pages/trabajador/DetalleAsignacionPage'
import CrearReportePage from '../pages/trabajador/CrearReportePage'

// General
import PerfilPage from '../pages/perfil/PerfilPage'
import NotFoundPage from '../pages/notfound/NotFoundPage'

function RaizInicio() {
  const { autenticado, rol } = useAuth()
  // Si ya inició sesión, va directo a su panel; si no, ve la landing pública.
  if (autenticado) return <Navigate to={rutaInicialPorRol(rol)} replace />
  return <LandingPage />
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Perfil (todos los roles) */}
          <Route path="/perfil" element={<PerfilPage />} />

          {/* Administrador */}
          <Route element={<RoleRoute roles={['administrador']} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/usuarios" element={<UsuariosPage />} />
            <Route path="/admin/ciudadanos" element={<Navigate to="/admin/usuarios?rol=ciudadano" replace />} />
            <Route path="/admin/encargados" element={<Navigate to="/admin/usuarios?rol=encargado" replace />} />
            <Route path="/admin/trabajadores" element={<Navigate to="/admin/usuarios?rol=trabajador" replace />} />
            <Route path="/admin/categorias" element={<CategoriasPage />} />
            <Route path="/admin/reclamos" element={<TodosReclamosPage />} />
            <Route path="/admin/bitacora" element={<BitacoraPage />} />
          </Route>

          {/* Ciudadano */}
          <Route element={<RoleRoute roles={['ciudadano']} />}>
            <Route path="/ciudadano" element={<CiudadanoDashboardPage />} />
            <Route path="/ciudadano/nuevo-reclamo" element={<CrearReclamoPage />} />
            <Route path="/ciudadano/mis-reclamos" element={<MisReclamosPage />} />
            <Route path="/ciudadano/reclamos/:id" element={<DetalleMiReclamoPage />} />
          </Route>

          {/* Encargado */}
          <Route element={<RoleRoute roles={['encargado']} />}>
            <Route path="/encargado" element={<EncargadoDashboardPage />} />
            <Route path="/encargado/pendientes" element={<ReclamosPendientesPage />} />
            <Route path="/encargado/reclamos" element={<GestionReclamoPage />} />
            <Route path="/encargado/reclamos/:id" element={<GestionReclamoPage />} />
            <Route path="/encargado/reclamos/:id/asignar" element={<AsignarTrabajadorPage />} />
            <Route path="/encargado/reportes" element={<RevisarReportePage />} />
            <Route path="/encargado/reportes/:id" element={<RevisarReportePage />} />
          </Route>

          {/* Trabajador */}
          <Route element={<RoleRoute roles={['trabajador']} />}>
            <Route path="/trabajador" element={<TrabajadorDashboardPage />} />
            <Route path="/trabajador/asignaciones" element={<MisAsignacionesPage />} />
            <Route path="/trabajador/asignaciones/:id" element={<DetalleAsignacionPage />} />
            <Route path="/trabajador/asignaciones/:id/reporte" element={<CrearReportePage />} />
          </Route>
        </Route>
      </Route>

      {/* Raíz y 404 */}
      <Route path="/" element={<RaizInicio />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
