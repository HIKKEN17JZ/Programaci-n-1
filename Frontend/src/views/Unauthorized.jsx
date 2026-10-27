import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { obtenerMensajeErrorRol } from '../utils/routeGuards.js'
import { getRoleBadge, getRoleLabel } from '../utils/roles.js'

function Unauthorized() {
  const { user } = useAuth()
  const location = useLocation()

  const state = location.state || {}
  const esAutenticado = Boolean(user)
  const motivo = state.motivo || (!esAutenticado ? 'NO_AUTENTICADO' : 'ROL_NO_AUTORIZADO')
  const rolActual = state.rolActual || user?.role || null
  const allowedRoles = state.allowedRoles || []

  const mensajeDescriptivo = obtenerMensajeErrorRol(motivo, rolActual, allowedRoles)

  return (
    <main className="flex-grow-1 d-flex align-items-center py-5 bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 text-center p-4 p-sm-5">
              <div
                className={`rounded-circle ${
                  esAutenticado ? 'bg-danger bg-opacity-10 text-danger' : 'bg-warning bg-opacity-10 text-warning'
                } d-inline-flex align-items-center justify-content-center mx-auto mb-3`}
                style={{ width: '76px', height: '76px' }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="38"
                  height="38"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <path d="M8 1a2 2 0 0 1 2 2v2H6V3a2 2 0 0 1 2-2zm3 4V3a3 3 0 0 0-6 0v2a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zM5 8.5a.5.5 0 0 1 1 0v3a.5.5 0 0 1-1 0v-3zm3 0a.5.5 0 0 1 1 0v3a.5.5 0 0 1-1 0v-3zm3 0a.5.5 0 0 1 1 0v3a.5.5 0 0 1-1 0v-3z" />
                </svg>
              </div>

              <span
                className={`badge ${
                  esAutenticado ? 'text-bg-danger' : 'text-bg-warning text-dark'
                } rounded-pill px-3 py-1 mx-auto mb-2`}
              >
                {esAutenticado ? 'Código de error: 403' : 'Sesión requerida'}
              </span>

              <h1 className="h3 fw-bold text-dark mb-2">
                {esAutenticado ? 'Acceso Denegado' : 'Inicio de Sesión Requerido'}
              </h1>

              <p className="text-secondary mb-3">
                {mensajeDescriptivo}
              </p>

              {user && (
                <div className="p-3 bg-light rounded-3 border mb-4 text-start small">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-secondary">Usuario actual:</span>
                    <strong>{user.username}</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-secondary">Rol asignado:</span>
                    <span className={`badge ${getRoleBadge(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                </div>
              )}

              <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
                {esAutenticado ? (
                  <>
                    <Link to="/" className="btn btn-primary fw-semibold px-4">
                      Ir al Inicio
                    </Link>
                    <Link to="/perfil" className="btn btn-outline-primary px-4">
                      Ver mi Perfil
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="btn btn-primary fw-semibold px-4">
                      Iniciar Sesión
                    </Link>
                    <Link to="/" className="btn btn-outline-primary px-4">
                      Ir al Inicio
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Unauthorized
