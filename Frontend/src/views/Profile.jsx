import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { academicService } from '../services/academicService.js'
import { authService } from '../services/authService.js'
import { activityLogService } from '../services/activityLogService.js'
import { getRoleBadge, getRoleLabel } from '../utils/roles.js'
import ConfirmModal from '../components/ConfirmModal.jsx'
import {
  obtenerSemaforo,
} from '../utils/progress.js'

function Profile() {
  const { user, updateUser, refreshUser, logout } = useAuth()
  const navigate = useNavigate()

  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editandoCarrera, setEditandoCarrera] = useState(false)
  const [carreraInput, setCarreraInput] = useState(user?.plan_estudio_nombre || '')
  const [guardandoCarrera, setGuardandoCarrera] = useState(false)

  // Estado para el historial de cambios desplegable
  const [historialAbierto, setHistorialAbierto] = useState(false)
  const [logKey, setLogKey] = useState(0)
  const [filtroAccion, setFiltroAccion] = useState('TODOS')
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)

  const eventosLog = useMemo(() => {
    if (!user?.id) return []
    // Referencia intencional para sincronizar el historial al desplegar o limpiar
    void logKey
    void historialAbierto
    return activityLogService.getLog(user.id)
  }, [user?.id, logKey, historialAbierto])

  useEffect(() => {
    let isMounted = true

    academicService
      .getDashboardData()
      .then((data) => {
        if (!isMounted) return
        setDashboard(data)
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
  }, [user?.id])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const handleGuardarCarrera = async () => {
    const nueva = carreraInput.trim()
    setGuardandoCarrera(true)
    try {
      await authService.updateProfile({ plan_estudio_nombre: nueva })
      activityLogService.registrarAccion({
        accion: 'EDITAR',
        entidad: 'PLAN',
        detalle: `Plan de estudio / carrera actualizado a "${nueva}"`,
        userId: user?.id,
      })
      updateUser?.({ plan_estudio_nombre: nueva })
      await refreshUser?.()
      setEditandoCarrera(false)
      setLogKey((prev) => prev + 1)
    } catch {
      // Manejo silencioso o feedback en UI
    } finally {
      setGuardandoCarrera(false)
    }
  }

  const handleLimpiarHistorial = () => {
    setConfirmClearOpen(true)
  }

  const handleConfirmarLimpiar = () => {
    activityLogService.clearLog(user?.id)
    setLogKey((prev) => prev + 1)
    setConfirmClearOpen(false)
  }

  const semaforo = obtenerSemaforo(dashboard?.avance?.porcentaje || 0)
  const iniciales = user?.username ? user.username.slice(0, 2).toUpperCase() : 'US'

  const eventosFiltrados = useMemo(() => {
    if (filtroAccion === 'TODOS') return eventosLog
    if (filtroAccion === 'ELIMINAR') return eventosLog.filter((e) => e.accion === 'ELIMINAR')
    if (filtroAccion === 'CREAR') return eventosLog.filter((e) => e.accion === 'CREAR')
    if (filtroAccion === 'EDITAR') {
      return eventosLog.filter((e) => e.accion === 'EDITAR' || e.accion === 'ESTADO')
    }
    return eventosLog
  }, [eventosLog, filtroAccion])

  const conteoEliminados = useMemo(
    () => eventosLog.filter((e) => e.accion === 'ELIMINAR').length,
    [eventosLog]
  )
  const conteoCreados = useMemo(
    () => eventosLog.filter((e) => e.accion === 'CREAR').length,
    [eventosLog]
  )
  const conteoModificados = useMemo(
    () => eventosLog.filter((e) => e.accion === 'EDITAR' || e.accion === 'ESTADO').length,
    [eventosLog]
  )

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

            {/* Componente Desplegable de Historial de Cambios y Registro de Actividad */}
            <div className="card border-0 shadow-sm mt-4 overflow-hidden">
              <button
                type="button"
                className="btn btn-light w-100 text-start p-3 d-flex justify-content-between align-items-center bg-white border-0"
                onClick={() => setHistorialAbierto((prev) => !prev)}
                aria-expanded={historialAbierto}
                aria-controls="panelHistorialAuditoria"
              >
                <div className="d-flex align-items-center gap-3">
                  <span className="fs-4">📜</span>
                  <div>
                    <div className="fw-bold text-dark">Historial de Cambios y Registro de Actividad</div>
                    <div className="text-secondary small">
                      Registro de acciones realizadas (mesas eliminadas, materias creadas y cambios de condición).
                    </div>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge text-bg-primary rounded-pill">
                    {eventosLog.length} {eventosLog.length === 1 ? 'registro' : 'registros'}
                  </span>
                  <span className="text-secondary small fw-semibold">
                    {historialAbierto ? '▲ Plegar' : '▼ Desplegar'}
                  </span>
                </div>
              </button>

              {historialAbierto && (
                <div id="panelHistorialAuditoria" className="border-top p-4 bg-light bg-opacity-25">
                  <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
                    <div className="btn-group btn-group-sm" role="group" aria-label="Filtro de acciones">
                      <button
                        type="button"
                        className={`btn ${filtroAccion === 'TODOS' ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setFiltroAccion('TODOS')}
                      >
                        Todos ({eventosLog.length})
                      </button>
                      <button
                        type="button"
                        className={`btn ${filtroAccion === 'ELIMINAR' ? 'btn-danger' : 'btn-outline-secondary'}`}
                        onClick={() => setFiltroAccion('ELIMINAR')}
                      >
                        🗑️ Eliminados ({conteoEliminados})
                      </button>
                      <button
                        type="button"
                        className={`btn ${filtroAccion === 'CREAR' ? 'btn-success' : 'btn-outline-secondary'}`}
                        onClick={() => setFiltroAccion('CREAR')}
                      >
                        ➕ Creados ({conteoCreados})
                      </button>
                      <button
                        type="button"
                        className={`btn ${filtroAccion === 'EDITAR' ? 'btn-info' : 'btn-outline-secondary'}`}
                        onClick={() => setFiltroAccion('EDITAR')}
                      >
                        ✏️ Modificaciones ({conteoModificados})
                      </button>
                    </div>

                    {eventosLog.length > 0 && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={handleLimpiarHistorial}
                      >
                        Limpiar registro
                      </button>
                    )}
                  </div>

                  {eventosFiltrados.length === 0 ? (
                    <div className="text-center py-4 bg-white rounded-3 border">
                      <span className="display-6 text-muted d-block mb-2">📋</span>
                      <p className="text-secondary small mb-1">
                        {eventosLog.length === 0
                          ? 'Aún no se registran movimientos en el historial.'
                          : 'No hay eventos en esta categoría.'}
                      </p>
                      <span className="text-muted extra-small" style={{ fontSize: '12px' }}>
                        Las próximas mesas de examen eliminadas, altas de materias o calificaciones se guardarán aquí cronológicamente.
                      </span>
                    </div>
                  ) : (
                    <div className="table-responsive bg-white rounded-3 border">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th scope="col" style={{ width: '220px' }}>Fecha y Hora</th>
                            <th scope="col" style={{ width: '150px' }}>Acción</th>
                            <th scope="col">Detalle del Evento</th>
                          </tr>
                        </thead>
                        <tbody>
                          {eventosFiltrados.map((ev) => {
                            let badgeClase = 'text-bg-secondary'
                            let labelAccion = ev.accion
                            if (ev.accion === 'ELIMINAR') {
                              badgeClase = 'text-bg-danger'
                              labelAccion = '🗑️ Eliminado'
                            } else if (ev.accion === 'CREAR') {
                              badgeClase = 'text-bg-success'
                              labelAccion = '➕ Registrado'
                            } else if (ev.accion === 'EDITAR') {
                              badgeClase = 'text-bg-info text-dark'
                              labelAccion = '✏️ Modificado'
                            } else if (ev.accion === 'ESTADO') {
                              badgeClase = 'text-bg-warning text-dark'
                              labelAccion = '⚡ Condición'
                            } else if (ev.accion === 'IMPORTAR') {
                              badgeClase = 'text-bg-primary'
                              labelAccion = '📥 Plan CSV'
                            }

                            return (
                              <tr key={ev.id}>
                                <td className="text-secondary small">
                                  {ev.fechaFormateada}
                                </td>
                                <td>
                                  <span className={`badge ${badgeClase} small`}>
                                    {labelAccion}
                                  </span>
                                </td>
                                <td>
                                  <span className="fw-semibold text-dark">{ev.detalle}</span>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Modal accesible para Confirmar Vaciado de Historial */}
      <ConfirmModal
        isOpen={confirmClearOpen}
        titulo="Vaciar historial de actividad"
        mensaje="¿Estás seguro de que deseas vaciar el historial de cambios registrados? Esta acción no se puede deshacer."
        confirmTexto="Vaciar historial"
        confirmClase="btn-danger"
        onClose={() => setConfirmClearOpen(false)}
        onConfirm={handleConfirmarLimpiar}
      />
    </main>
  )
}

export default Profile
