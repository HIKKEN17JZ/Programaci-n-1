import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm sticky-top">
      <div className="container">
        <Link to="/" className="navbar-brand fw-semibold d-flex align-items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="26"
            height="26"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
            <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
          </svg>
          <span>Gestión de Carrera</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navegacionPrincipal"
          aria-controls="navegacionPrincipal"
          aria-expanded="false"
          aria-label="Abrir navegación"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navegacionPrincipal">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-1">
            <li className="nav-item">
              <NavLink
                to="/"
                end
                className={({ isActive }) => `nav-link ${isActive ? 'active fw-semibold' : ''}`}
              >
                Inicio
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/materias"
                className={({ isActive }) => `nav-link ${isActive ? 'active fw-semibold' : ''}`}
              >
                Plan de Estudio
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/examenes"
                className={({ isActive }) => `nav-link ${isActive ? 'active fw-semibold' : ''}`}
              >
                Mesas de Examen
              </NavLink>
            </li>
          </ul>

          {user ? (
            <div className="d-flex align-items-center gap-2 mt-2 mt-lg-0 ms-lg-3">
              <NavLink
                to="/perfil"
                className={({ isActive }) =>
                  `btn btn-outline-light btn-sm d-inline-flex align-items-center gap-1 ${
                    isActive ? 'active' : ''
                  }`
                }
                title="Ver mi perfil"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
                </svg>
                <span>Hola, {user.username}</span>
              </NavLink>
              <button
                type="button"
                className="btn btn-outline-light btn-sm"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="d-flex gap-2 mt-2 mt-lg-0 ms-lg-3">
              <Link to="/login" className="btn btn-outline-light">Ingresar</Link>
              <Link to="/register" className="btn btn-light">Registrarse</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
