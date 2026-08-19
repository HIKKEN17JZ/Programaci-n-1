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

  if (user !== null) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = register({ username: username.trim(), password, email: email.trim() })
    if (result.ok) {
      navigate('/login', { state: { registered: username.trim() }, replace: true })
    } else {
      setError(result.message)
    }
  }

  return (
    <main className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card shadow-sm" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card-body p-4">
          <h1 className="h4 fw-bold text-center mb-4">Registrarse</h1>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="registerUsername" className="form-label">Nombre de usuario</label>
              <input
                id="registerUsername"
                type="text"
                className="form-control"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="registerEmail" className="form-label">Email</label>
              <input
                id="registerEmail"
                type="email"
                className="form-control"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="registerPassword" className="form-label">Contraseña</label>
              <input
                id="registerPassword"
                type="password"
                className="form-control"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">Registrarse</button>
          </form>
          <p className="text-center mt-3 mb-0">
            <Link to="/login">¿Ya tenés cuenta? Iniciá sesión</Link>
          </p>
        </div>
      </div>
    </main>
  )
}

export default Register