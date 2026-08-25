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
        <Link to="/" className="navbar-brand fw-semibold">Gestión de Carrera</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navegacionPrincipal" aria-controls="navegacionPrincipal" aria-expanded="false" aria-label="Abrir navegación">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navegacionPrincipal">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            <li className="nav-item"><Link to="/" className="nav-link active" aria-current="page">Inicio</Link></li>
            <li className="nav-item"><Link to="#" className="nav-link" onClick={(e) => e.preventDefault()}>Plan de Estudio</Link></li>
            <li className="nav-item"><Link to="#" className="nav-link" onClick={(e) => e.preventDefault()}>Mesas de Examen</Link></li>
          </ul>
          {user ? (
            <>
              <span className="navbar-text text-white me-2">Hola, {user.username}</span>
              <button type="button" className="btn btn-outline-light" onClick={handleLogout}>Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-light ms-lg-3 mt-2 mt-lg-0">Ingresar</Link>
              <Link to="/register" className="btn btn-light ms-lg-2 mt-2 mt-lg-0">Registrarse</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
