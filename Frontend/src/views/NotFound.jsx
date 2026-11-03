import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

function NotFound() {
  const { user } = useAuth()

  return (
    <main className="flex-grow-1 d-flex align-items-center py-5 bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 text-center p-4 p-sm-5">
              <div
                className="rounded-circle bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center justify-content-center mx-auto mb-3"
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
                  <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm.5 4v4.25l3.25 1.95-.75 1.23L7 9.25V4h1.5z" />
                </svg>
              </div>

              <span className="badge text-bg-warning rounded-pill px-3 py-1 mx-auto mb-2 text-dark">
                Código de error: 404
              </span>

              <h1 className="h3 fw-bold text-dark mb-2">Página No Encontrada</h1>

              <p className="text-secondary mb-4">
                La dirección a la que intentás ingresar no existe, fue movida o no está disponible en la plataforma.
              </p>

              <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
                <Link to="/" className="btn btn-primary fw-semibold px-4">
                  Ir al Inicio
                </Link>
                {user ? (
                  <Link to="/materias" className="btn btn-outline-primary px-4">
                    Ver Plan de Estudio
                  </Link>
                ) : (
                  <Link to="/login" className="btn btn-outline-primary px-4">
                    Iniciar Sesión
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default NotFound
