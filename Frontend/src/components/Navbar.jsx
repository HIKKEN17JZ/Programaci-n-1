import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
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
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navegacionPrincipal" aria-controls="navegacionPrincipal" aria-expanded="false" aria-label="Abrir navegación">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navegacionPrincipal">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            <li className="nav-item"><Link to="/" className="nav-link active" aria-current="page">Inicio</Link></li>
            <li className="nav-item"><a href="#plan-estudio" className="nav-link">Plan de Estudio</a></li>
            <li className="nav-item"><a href="#mesas-examen" className="nav-link">Mesas de Examen</a></li>
          </ul>
          {user ? (
            <div className="d-flex align-items-center gap-2 mt-2 mt-lg-0 ms-lg-3">
              <span className="navbar-text text-white">Hola, {user.username}</span>
              <button type="button" className="btn btn-outline-light btn-sm" onClick={handleLogout}>Cerrar sesión</button>
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
