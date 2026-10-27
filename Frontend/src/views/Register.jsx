import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

function Register() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user !== null) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await register({
        username: username.trim(),
        password,
        email: email.trim(),
      })

      if (result.ok) {
        navigate('/login', { state: { registered: username.trim() }, replace: true })
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError(err?.message || 'Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-diagonal-bg d-flex justify-content-center align-items-center py-5 px-3">
      <div className="container" style={{ maxWidth: '960px' }}>
        <div className="row g-4 align-items-stretch justify-content-center">
          {/* Ventana 1: Registro */}
          <div className="col-12 col-md-6">
            <div className="card border-0 shadow-lg h-100 rounded-4">
              <div className="card-body p-4 p-sm-5 d-flex flex-column justify-content-center">
                <div className="text-center mb-4">
                  <span className="badge rounded-pill text-bg-light text-primary mb-2">
                    Crear cuenta
                  </span>
                  <h1 className="h3 fw-bold text-dark mb-1">Registrarse</h1>
                  <p className="text-secondary small mb-0">
                    Completá tus datos para empezar a gestionar tu carrera
                  </p>
                </div>

                {error && (
                  <div className="alert alert-danger py-2 px-3 small" role="alert">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="registerUsername" className="form-label fw-semibold small">
                      Nombre de usuario
                    </label>
                    <input
                      id="registerUsername"
                      type="text"
                      className="form-control"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      autoComplete="username"
                      placeholder="Tu nombre de usuario"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="registerEmail" className="form-label fw-semibold small">
                      Email
                    </label>
                    <input
                      id="registerEmail"
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                      placeholder="tu@email.com"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="registerPassword" className="form-label fw-semibold small">
                      Contraseña
                    </label>
                    <input
                      id="registerPassword"
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      required
                      minLength={4}
                      disabled={loading}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
                    {loading ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    ) : null}
                    {loading ? 'Registrando...' : 'Registrarse'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Ventana 2: Invitación a Iniciar Sesión */}
          <div className="col-12 col-md-6">
            <div className="card border-0 shadow-lg h-100 rounded-4 bg-white">
              <div className="card-body p-4 p-sm-5 d-flex flex-column justify-content-center text-center">
                <div
                  className="rounded-circle bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ width: '68px', height: '68px' }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="34"
                    height="34"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
                    <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
                  </svg>
                </div>

                <h2 className="h3 fw-bold text-dark mb-3">
                  ¿Ya tenés una cuenta creada?
                </h2>

                <p className="text-secondary mb-4" style={{ lineHeight: '1.6' }}>
                  Iniciá sesión para acceder a tu historial académico, consultar tus calificaciones y continuar con el seguimiento de tu carrera.
                </p>

                <div className="mt-2">
                  <Link
                    to="/login"
                    className="btn btn-outline-primary btn-lg w-100 fw-semibold shadow-sm"
                  >
                    Iniciar sesión
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Register