import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { academicService } from '../services/academicService.js'
import { authService } from '../services/authService.js'
import { getRoleBadge, getRoleLabel } from '../utils/roles.js'
import { obtenerSemaforo } from '../utils/progress.js'

function Profile() {
  const { user, updateUser, refreshUser, logout } = useAuth()
  const navigate = useNavigate()

  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editandoCarrera, setEditandoCarrera] = useState(false)
  const [carreraInput, setCarreraInput] = useState(user?.plan_estudio_nombre || '')
  const [guardandoCarrera, setGuardandoCarrera] = useState(false)

  useEffect(() => {
    let isMounted = true

    academicService
      .getDashboardData()
      .then((data) => {
        if (isMounted) setDashboard(data)
      })
      .catch(() => {
        // Fallback defensivo si el servicio no responde
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const handleGuardarCarrera = async () => {
    const nueva = carreraInput.trim()
    setGuardandoCarrera(true)
    try {
      await authService.updateProfile({ plan_estudio_nombre: nueva })
      updateUser?.({ plan_estudio_nombre: nueva })
      await refreshUser?.()
      setEditandoCarrera(false)
    } catch {
      // Manejo silencioso o feedback en UI
    } finally {
      setGuardandoCarrera(false)
    }
  }

  const semaforo = obtenerSemaforo(dashboard?.avance?.porcentaje || 0)
  const iniciales = user?.username ? user.username.slice(0, 2).toUpperCase() : 'US'

  return (
    <main className="flex-grow-1 pb-5">
      {/* Hero Banner compacto y consistente */}
      <section className="bg-primary text-white text-center py-3 py-md-4 mb-3 shadow-sm">
        <div className="container">
          <span className="badge rounded-pill text-bg-light text-primary mb-2">
            Perfil de Usuario
          </span>
          <h1 className="h3 fw-bold mb-1">Mi Perfil Académico</h1>
          <p className="small text-white-50 mx-auto mb-0" style={{ maxWidth: '580px' }}>
            Información de la cuenta, plan de estudio y avance curricular en tiempo real.
          </p>
        </div>
      </section>

      <div className="container">
        {/* Migas de pan */}
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item"><Link to="/">Inicio</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Mi Perfil</li>
          </ol>
        </nav>

        <div className="row g-4">
          {/* Columna Izquierda: Tarjeta de Identidad */}
          <div className="col-12 col-md-5 col-lg-4">
            <div className="card border-0 shadow-sm text-center p-4 h-100">
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3 shadow"
                style={{ width: '84px', height: '84px', fontSize: '28px', fontWeight: 'bold' }}
              >
                {iniciales}
              </div>

              <h2 className="h4 fw-bold mb-1">{user?.username || 'Usuario'}</h2>
              <p className="text-secondary small mb-2">{user?.email || 'Sin correo asociado'}</p>

              <div className="mb-3">
                <span className={`badge ${getRoleBadge(user?.role)} fs-6 px-3 py-1`}>
                  {getRoleLabel(user?.role)}
                </span>
              </div>

              <hr className="my-3" />

              <div className="text-start small">
                <div className="mb-3">
                  <span className="text-secondary d-block">Plan de Estudio / Carrera:</span>
                  {editandoCarrera ? (
                    <div className="input-group input-group-sm mt-1">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej. Medicina, Sistemas..."
                        value={carreraInput}
                        onChange={(e) => setCarreraInput(e.target.value)}
                        disabled={guardandoCarrera}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleGuardarCarrera}
                        disabled={guardandoCarrera || !carreraInput.trim()}
                      >
                        {guardandoCarrera ? '...' : 'Guardar'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setEditandoCarrera(false)
                          setCarreraInput(user?.plan_estudio_nombre || '')
                        }}
                        disabled={guardandoCarrera}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="d-flex align-items-center justify-content-between mt-1">
                      <span className="fw-semibold text-dark">
                        {user?.plan_estudio_nombre || 'Sin carrera asignada'}
                      </span>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm py-0 px-2 small"
                        onClick={() => {
                          setCarreraInput(user?.plan_estudio_nombre || '')
                          setEditandoCarrera(true)
                        }}
                      >
                        ✏️ Editar
                      </button>
                    </div>
                  )}
                </div>
                <div className="mb-2">
                  <span className="text-secondary d-block">ID de Usuario:</span>
                  <span className="fw-semibold text-dark">#{user?.id || '—'}</span>
                </div>
              </div>

              <div className="mt-auto pt-3">
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm w-100"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Estado Académico y Acciones */}
          <div className="col-12 col-md-7 col-lg-8">
            <div className="card border-0 shadow-sm p-4 mb-4">
              <h3 className="h5 fw-bold mb-3">Resumen de Carrera e Historial</h3>

              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary spinner-border-sm" role="status" />
                  <span className="ms-2 small text-secondary">Cargando métricas de perfil...</span>
                </div>
              ) : dashboard ? (
                <>
                  <div className="row g-3 mb-4">
                    <div className="col-6 col-md-4">
                      <div className="p-3 bg-light rounded text-center">
                        <span className="text-secondary small d-block">Materias en Plan</span>
                        <span className="fs-4 fw-bold text-primary">
                          {dashboard.materias.length}
                        </span>
                      </div>
                    </div>

                    <div className="col-6 col-md-4">
                      <div className="p-3 bg-light rounded text-center">
                        <span className="text-secondary small d-block">Créditos Obtenidos</span>
                        <span className="fs-4 fw-bold text-success">
                          {dashboard.avance.obtenidos} / {dashboard.avance.totales}
                        </span>
                      </div>
                    </div>

                    <div className="col-12 col-md-4">
                      <div className="p-3 bg-light rounded text-center">
                        <span className="text-secondary small d-block">Avance General</span>
                        <span className={`badge ${semaforo.clase} fs-6 mt-1`}>
                          {semaforo.emoji} {dashboard.avance.porcentaje}% ({semaforo.grado})
                        </span>
                      </div>
                    </div>
                  </div>

                  {dashboard.metricasExamenes && (
                    <div className="p-3 border rounded bg-light mb-4">
                      <h4 className="h6 fw-bold mb-2">Desempeño en Evaluaciones</h4>
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 small">
                        <span>Exámenes rendidos: <strong>{dashboard.metricasExamenes.rendidos}</strong></span>
                        <span>Aprobados: <strong className="text-success">{dashboard.metricasExamenes.aprobados}</strong></span>
                        <span>Promedio general: <strong className="text-primary">{dashboard.metricasExamenes.promedioGeneral || '—'}</strong></span>
                        <span>Promedio sin aplazos: <strong className="text-dark">{dashboard.metricasExamenes.promedioAprobados || '—'}</strong></span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-secondary small">No fue posible obtener el resumen académico en este momento.</p>
              )}

              <h4 className="h6 fw-bold mb-3">Accesos Rápidos</h4>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/materias" className="btn btn-outline-primary">
                  📚 Ver Mis Materias
                </Link>
                <Link to="/examenes" className="btn btn-outline-secondary">
                  📝 Ver Mesas de Examen
                </Link>
                <Link to="/" className="btn btn-light border">
                  🏠 Ir al Inicio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Profile
