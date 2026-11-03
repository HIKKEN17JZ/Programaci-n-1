import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { academicService } from '../services/academicService.js'
import { useAuth } from '../hooks/useAuth.js'
import { canManageExamenes } from '../utils/roles.js'
import {
  formatearMesaExamen,
  calcularMetricasExamenes,
  TIPO_EXAMEN_LABEL,
} from '../utils/progress.js'
import ExamenModal from '../components/ExamenModal.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import { activityLogService } from '../services/activityLogService.js'

function ExamenesList() {
  const { user } = useAuth()
  const [examenes, setExamenes] = useState([])
  const [materias, setMaterias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('TODOS')
  const [filtroCondicion, setFiltroCondicion] = useState('TODOS')
  const [recarga, setRecarga] = useState(0)

  // Estados para modales de creación, edición y eliminación de exámenes
  const [examenModalOpen, setExamenModalOpen] = useState(false)
  const [examenSeleccionado, setExamenSeleccionado] = useState(null)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [examenAEliminar, setExamenAEliminar] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    let isMounted = true

    Promise.all([
      academicService.getExamenes(),
      academicService.getMaterias(),
    ])
      .then(([examenesData, materiasData]) => {
        if (!isMounted) return
        setExamenes(examenesData || [])
        setMaterias(materiasData || [])
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err?.message || 'Error al conectar con el servidor para obtener los exámenes.')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [recarga])

  const metricas = useMemo(() => calcularMetricasExamenes(examenes), [examenes])

  const examenesNormalizados = useMemo(() => {
    return examenes.map((ex) => {
      const formatted = formatearMesaExamen(ex, materias)
      return {
        ...ex,
        nombreMateria: formatted.materia,
        llamado: formatted.llamado,
      }
    })
  }, [examenes, materias])

  const examenesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()

    return examenesNormalizados.filter((ex) => {
      if (q && !ex.nombreMateria.toLowerCase().includes(q)) {
        return false
      }

      if (filtroTipo !== 'TODOS' && ex.tipo !== filtroTipo) {
        return false
      }

      if (filtroCondicion !== 'TODOS') {
        const nota = ex.nota !== null && ex.nota !== undefined ? Number(ex.nota) : null
        if (filtroCondicion === 'PENDIENTE' && nota !== null) return false
        if (filtroCondicion === 'APROBADO' && (nota === null || nota < 6)) return false
        if (filtroCondicion === 'DESAPROBADO' && (nota === null || nota >= 6)) return false
      }

      return true
    })
  }, [examenesNormalizados, busqueda, filtroTipo, filtroCondicion])

  const handleLimpiarFiltros = () => {
    setBusqueda('')
    setFiltroTipo('TODOS')
    setFiltroCondicion('TODOS')
  }

  const handleReintentar = () => {
    setLoading(true)
    setError('')
    setRecarga((prev) => prev + 1)
  }

  const tieneFiltrosActivos = busqueda.trim() !== '' || filtroTipo !== 'TODOS' || filtroCondicion !== 'TODOS'
  const puedeGestionar = canManageExamenes(user)

  const handleAbrirCrearExamen = () => {
    setExamenSeleccionado(null)
    setExamenModalOpen(true)
  }

  const handleAbrirEditarExamen = (ex) => {
    setExamenSeleccionado(ex)
    setExamenModalOpen(true)
  }

  const handleAbrirEliminarExamen = (ex) => {
    setExamenAEliminar(ex)
    setConfirmModalOpen(true)
  }

  const handleConfirmarEliminar = async () => {
    if (!examenAEliminar) return
    setDeleting(true)
    try {
      await academicService.deleteExamen(examenAEliminar.id)
      activityLogService.registrarAccion({
        accion: 'ELIMINAR',
        entidad: 'EXAMEN',
        detalle: `Mesa de examen eliminada: ${TIPO_EXAMEN_LABEL[examenAEliminar.tipo] || examenAEliminar.tipo} en "${examenAEliminar.nombreMateria || 'Materia'}"`,
        idReferencia: examenAEliminar.id,
        userId: user?.id,
      })
      setFeedback({
        tipo: 'success',
        mensaje: 'La mesa de examen fue eliminada correctamente del historial.',
      })
      setConfirmModalOpen(false)
      setExamenAEliminar(null)
      setRecarga((prev) => prev + 1)
    } catch (err) {
      setFeedback({
        tipo: 'danger',
        mensaje: err?.message || 'Error al eliminar el examen del servidor.',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleModalSuccess = (resultado, accion) => {
    const accionTxt = accion === 'CREATE' ? 'registrado' : 'actualizado'
    const esAprobado = resultado?.nota !== null && resultado?.nota !== undefined && Number(resultado.nota) >= 6
    const formatted = formatearMesaExamen(resultado, materias)
    activityLogService.registrarAccion({
      accion: accion === 'CREATE' ? 'CREAR' : 'EDITAR',
      entidad: 'EXAMEN',
      detalle: `Mesa de examen ${accionTxt}: ${formatted.llamado} en "${formatted.materia}" ${resultado?.nota !== null ? `(Nota: ${resultado.nota})` : '(Sin nota)'}`,
      idReferencia: resultado.id,
      userId: user?.id,
    })
    setFeedback({
      tipo: 'success',
      mensaje: esAprobado
        ? `¡Felicitaciones! Examen ${accionTxt} con éxito (Nota ${resultado.nota}). "${formatted.materia}" ha quedado Aprobada automáticamente.`
        : `Examen ${accionTxt} exitosamente.`,
    })
    setRecarga((prev) => prev + 1)
  }

  return (
    <main className="flex-grow-1 pb-5">
      {/* Hero Banner compacto y consistente */}
      <section className="bg-primary text-white text-center py-3 py-md-4 mb-3 shadow-sm">
        <div className="container">
          <span className="badge rounded-pill text-bg-light text-primary mb-2">
            Historial Académico
          </span>
          <h1 className="h3 fw-bold mb-1">Mesas de Examen y Calificaciones</h1>
          <p className="small text-white-50 mx-auto mb-0" style={{ maxWidth: '580px' }}>
            Historial de exámenes rendidos, actas de evaluación y promedios en tiempo real.
          </p>
        </div>
      </section>

      <div className="container">
        {/* Mensaje de retroalimentación de operaciones CRUD */}
        {feedback && (
          <div
            className={`alert alert-${feedback.tipo} alert-dismissible fade show d-flex align-items-center justify-content-between mb-3`}
            role="alert"
          >
            <div>{feedback.mensaje}</div>
            <button
              type="button"
              className="btn-close"
              aria-label="Cerrar"
              onClick={() => setFeedback(null)}
            />
          </div>
        )}

        {/* Barra superior de navegación y acciones */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><Link to="/">Inicio</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Mesas de Examen</li>
            </ol>
          </nav>

          {puedeGestionar && (
            <button
              type="button"
              className="btn btn-primary btn-sm fw-semibold shadow-sm"
              onClick={handleAbrirCrearExamen}
            >
              + Registrar Examen
            </button>
          )}
        </div>

        {/* Tarjetas de Métricas de Exámenes */}
        {!loading && !error && examenes.length > 0 && (
          <div className="row g-2 mb-4">
            <div className="col-6 col-md-3">
              <div className="card border-0 bg-light shadow-sm text-center py-2">
                <span className="fs-5 fw-bold text-primary">{metricas.total}</span>
                <span className="text-secondary small">Total exámenes</span>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card border-0 bg-light shadow-sm text-center py-2">
                <span className="fs-5 fw-bold text-info">{metricas.rendidos}</span>
                <span className="text-secondary small">Exámenes rendidos</span>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card border-0 bg-light shadow-sm text-center py-2">
                <span className="fs-5 fw-bold text-success">{metricas.aprobados}</span>
                <span className="text-secondary small">Aprobados</span>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card border-0 bg-light shadow-sm text-center py-2">
                <span className="fs-5 fw-bold text-dark">
                  {metricas.promedioGeneral > 0 ? `${metricas.promedioGeneral} pts` : '—'}
                </span>
                <span className="text-secondary small">Promedio general</span>
              </div>
            </div>
          </div>
        )}

        {/* Barra de Filtros */}
        {!loading && !error && examenes.length > 0 && (
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="row g-3 align-items-center">
                {/* Buscador */}
                <div className="col-12 col-md-5">
                  <label htmlFor="busqueda-examen" className="form-label small fw-semibold text-secondary mb-1">
                    Buscar por materia
                  </label>
                  <div className="input-group">
                    <input
                      id="busqueda-examen"
                      type="text"
                      className="form-control"
                      placeholder="Ej. Programación, Base de Datos..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                    />
                    {busqueda && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setBusqueda('')}
                        title="Limpiar búsqueda"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Filtro Tipo */}
                <div className="col-6 col-md-3">
                  <label htmlFor="filtro-tipo" className="form-label small fw-semibold text-secondary mb-1">
                    Tipo de examen
                  </label>
                  <select
                    id="filtro-tipo"
                    className="form-select"
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                  >
                    <option value="TODOS">Todos los tipos</option>
                    <option value="FIN">Final (FIN)</option>
                    <option value="PRO">Promoción (PRO)</option>
                  </select>
                </div>

                {/* Filtro Condición */}
                <div className="col-6 col-md-2">
                  <label htmlFor="filtro-condicion" className="form-label small fw-semibold text-secondary mb-1">
                    Resultado
                  </label>
                  <select
                    id="filtro-condicion"
                    className="form-select"
                    value={filtroCondicion}
                    onChange={(e) => setFiltroCondicion(e.target.value)}
                  >
                    <option value="TODOS">Todos</option>
                    <option value="APROBADO">Aprobados (≥ 6)</option>
                    <option value="DESAPROBADO">Desaprobados (&lt; 6)</option>
                    <option value="PENDIENTE">Pendientes</option>
                  </select>
                </div>

                {/* Botón limpiar */}
                <div className="col-12 col-md-2 d-flex align-items-end pt-md-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100"
                    onClick={handleLimpiarFiltros}
                    disabled={!tieneFiltrosActivos}
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Manejo de Error */}
        {error && (
          <div className="alert alert-danger d-flex align-items-center justify-content-between shadow-sm" role="alert">
            <div>
              <strong>Error al cargar exámenes:</strong> {error}
            </div>
            <button type="button" className="btn btn-outline-danger btn-sm" onClick={handleReintentar}>
              Reintentar
            </button>
          </div>
        )}

        {/* Spinner de Carga */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando exámenes...</span>
            </div>
            <p className="text-secondary small mt-2">Consultando las mesas de examen en el servidor...</p>
          </div>
        )}

        {/* Listado de Exámenes */}
        {!loading && !error && (
          <>
            {examenes.length === 0 ? (
              <div className="card border-0 shadow-sm text-center py-5 px-3">
                <div className="card-body">
                  <span className="display-4 text-muted mb-3 d-inline-block">📝</span>
                  <h3 className="h4 fw-bold">Aún no tienes exámenes registrados</h3>
                  <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '500px' }}>
                    ¡No te quedes atrás! Registra tus mesas de examen y notas obtenidas para llevar el control de tus fechas y ver el cálculo de tus promedios.
                  </p>
                  <Link to="/" className="btn btn-outline-primary mt-2">
                    Volver al Panel Principal
                  </Link>
                </div>
              </div>
            ) : examenesFiltrados.length === 0 ? (
              <div className="card border-0 shadow-sm text-center py-5 px-3">
                <div className="card-body">
                  <span className="display-5 text-muted mb-2 d-inline-block">🔍</span>
                  <h4 className="fw-semibold">Sin resultados</h4>
                  <p className="text-secondary mx-auto mb-3" style={{ maxWidth: '420px' }}>
                    No se encontraron mesas de examen que coincidan con los criterios de búsqueda.
                  </p>
                  <button type="button" className="btn btn-outline-primary" onClick={handleLimpiarFiltros}>
                    Restablecer filtros
                  </button>
                </div>
              </div>
            ) : (
              <div className="card border-0 shadow-sm overflow-hidden">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th scope="col" style={{ width: '35%' }}>Materia</th>
                        <th scope="col">Tipo de Examen</th>
                        <th scope="col">Fecha</th>
                        <th scope="col" className="text-center">Nota</th>
                        <th scope="col" className="text-center">Resultado</th>
                        <th scope="col" className="text-end">Materia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {examenesFiltrados.map((ex) => {
                        const notaNum = ex.nota !== null && ex.nota !== undefined ? Number(ex.nota) : null
                        const aprobado = notaNum !== null && notaNum >= 6

                        return (
                          <tr key={ex.id}>
                            <td>
                              <div className="fw-semibold text-dark">{ex.nombreMateria}</div>
                            </td>
                            <td>
                              <span className="badge text-bg-light border text-dark">
                                {TIPO_EXAMEN_LABEL[ex.tipo] || ex.tipo}
                              </span>
                            </td>
                            <td>{ex.fecha || 'Sin fecha'}</td>
                            <td className="text-center">
                              {notaNum !== null ? (
                                <span className={`fw-bold fs-6 ${aprobado ? 'text-success' : 'text-danger'}`}>
                                  {notaNum}
                                </span>
                              ) : (
                                <span className="text-secondary small fst-italic">Pendiente</span>
                              )}
                            </td>
                            <td className="text-center">
                              {notaNum === null ? (
                                <span className="badge text-bg-secondary">Pendiente</span>
                              ) : aprobado ? (
                                <span className="badge text-bg-success">Aprobado</span>
                              ) : (
                                <span className="badge text-bg-danger">Desaprobado</span>
                              )}
                            </td>
                            <td className="text-end">
                              <div className="d-inline-flex gap-1">
                                {ex.materia && (
                                  <Link
                                    to={`/materias/${ex.materia}`}
                                    className="btn btn-outline-secondary btn-sm"
                                    title="Ver detalle de la materia"
                                  >
                                    Ver Detalle
                                  </Link>
                                )}
                                {puedeGestionar && (
                                  <>
                                    <button
                                      type="button"
                                      className="btn btn-outline-primary btn-sm"
                                      title="Editar o calificar examen"
                                      onClick={() => handleAbrirEditarExamen(ex)}
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-outline-danger btn-sm"
                                      title="Eliminar examen"
                                      onClick={() => handleAbrirEliminarExamen(ex)}
                                    >
                                      🗑️
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="card-footer bg-light text-secondary small py-2 d-flex justify-content-between align-items-center">
                  <span>Mostrando {examenesFiltrados.length} de {examenes.length} exámenes</span>
                  {tieneFiltrosActivos && (
                    <span className="badge text-bg-info">Filtros aplicados</span>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal para Crear y Editar Examen */}
      <ExamenModal
        isOpen={examenModalOpen}
        examenAEditar={examenSeleccionado}
        materias={materias}
        onClose={() => setExamenModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      {/* Modal para Confirmar Eliminación */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        titulo="Eliminar Examen"
        mensaje="¿Estás seguro de que deseas eliminar permanentemente este registro de examen?"
        confirmTexto="Sí, eliminar"
        confirmClase="btn-danger"
        loading={deleting}
        onClose={() => {
          setConfirmModalOpen(false)
          setExamenAEliminar(null)
        }}
        onConfirm={handleConfirmarEliminar}
      />
    </main>
  )
}

export default ExamenesList
