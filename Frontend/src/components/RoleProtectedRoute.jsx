import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { verificarAccesoRuta } from '../utils/routeGuards.js'

/**
 * Componente guardián de rutas que valida tanto la autenticación como los roles requeridos.
 *
 * @param {object} props
 * @param {string|string[]} [props.allowedRoles] - Lista o rol único autorizado para acceder a la ruta.
 * @param {React.ReactNode} [props.children] - Componente hijo opcional (si no se usa como ruta anidada con Outlet).
 * @returns {React.ReactElement}
 */
function RoleProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Validando permisos de sesión...</span>
        </div>
      </div>
    )
  }

  const resultado = verificarAccesoRuta(user, allowedRoles)

  if (!resultado.autorizado) {
    if (resultado.motivo === 'NO_AUTENTICADO') {
      return <Navigate to="/login" replace state={{ from: location }} />
    }

    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{
          from: location,
          motivo: resultado.motivo,
          rolActual: resultado.rolActual,
          allowedRoles,
        }}
      />
    )
  }

  return children ? children : <Outlet />
}

export default RoleProtectedRoute
