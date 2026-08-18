function Footer() {
  return (
    <footer className="bg-dark text-light py-5" role="contentinfo" aria-label="Pie de página">
      <div className="container">
        <div className="row gy-4">
          <div className="col-12 col-md-4">
            <p className="fw-semibold mb-1">Plataforma de Gestión de Carrera</p>
            <p className="text-secondary mb-0">Seguimiento académico de tu carrera.</p>
          </div>
          <div className="col-6 col-md-4">
            <p className="fw-semibold mb-2">Secciones</p>
            <ul className="list-unstyled mb-0">
              <li><a href="#" className="text-secondary text-decoration-none">Plan de Estudio</a></li>
              <li><a href="#" className="text-secondary text-decoration-none">Mesas de Examen</a></li>
              <li><a href="#" className="text-secondary text-decoration-none">Contacto</a></li>
            </ul>
          </div>
          <div className="col-6 col-md-4">
            <p className="fw-semibold mb-2">Contacto</p>
            <ul className="list-unstyled mb-0 text-secondary">
              <li>Facultad de Ingeniería</li>
              <li>soporte@gestioncarrera.edu.ar</li>
            </ul>
          </div>
        </div>
        <hr className="border-secondary" />
        <p className="text-center text-secondary mb-0">
          © {new Date().getFullYear()} Plataforma de Gestión de Carrera
        </p>
      </div>
    </footer>
  )
}

export default Footer
