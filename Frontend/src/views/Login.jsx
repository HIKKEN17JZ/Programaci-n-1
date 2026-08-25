import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (user !== null) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = login(username.trim(), password)
    if (result.ok) {
      navigate(location.state?.from ?? '/', { replace: true })
    } else {
      setError(result.message)
    }
  }

  const registeredUser = location.state?.registered

  return (
    <main className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card shadow-sm" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card-body p-4">
          <h1 className="h4 fw-bold text-center mb-4">Iniciar sesión</h1>
          {registeredUser && (
            <div className="alert alert-success" role="alert">
              Usuario registrado. Iniciá sesión como {registeredUser}
            </div>
          )}
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="loginUsername" className="form-label">Usuario</label>
              <input
                id="loginUsername"
                type="text"
                className="form-control"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="loginPassword" className="form-label">Contraseña</label>
              <input
                id="loginPassword"
                type="password"
                className="form-control"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                minLength={4}
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">Ingresar</button>
          </form>
          <p className="text-center mt-3 mb-0">
            <Link to="/register">¿No tenés cuenta? Registrate</Link>
          </p>
        </div>
      </div>
    </main>
  )
}

export default Login
