function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container">
        <a className="navbar-brand fw-semibold" href="#">Gestión de Carrera</a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navegacionPrincipal" aria-controls="navegacionPrincipal" aria-expanded="false" aria-label="Abrir navegación">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navegacionPrincipal">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            <li className="nav-item"><a className="nav-link active" aria-current="page" href="#">Inicio</a></li>
            <li className="nav-item"><a className="nav-link" href="#">Plan de Estudio</a></li>
            <li className="nav-item"><a className="nav-link" href="#">Mesas de Examen</a></li>
          </ul>
          <a href="#" className="btn btn-outline-light ms-lg-3 mt-2 mt-lg-0" aria-label="Iniciar sesión">Ingresar</a>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
