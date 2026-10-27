import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { academicService } from '../services/academicService.js'
import { useAuth } from '../hooks/useAuth.js'
import { canManageExamenes, canManageMaterias } from '../utils/roles.js'
import {
  ESTADO_BADGE,
  obtenerEtiquetaEstado,
  TIPO_EXAMEN_LABEL,
  calcularPromedio,
  formatearNivelCarrera,
} from '../utils/progress.js'
import MateriaModal from '../components/MateriaModal.jsx'
import ExamenModal from '../components/ExamenModal.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'

function MateriaDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [materia, setMateria] = useState(null)
  const [examenes, setExamenes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [recarga, setRecarga] = useState(0)

  // Estados para modales de creación, edición y eliminación
  const [materiaModalOpen, setMateriaModalOpen] = useState(false)
  const [examenModalOpen, setExamenModalOpen] = useState(false)
  const [examenSeleccionado, setExamenSeleccionado] = useState(null)
  const [confirmDeleteMateriaOpen, setConfirmDeleteMateriaOpen] = useState(false)
  const [confirmDeleteExamenOpen, setConfirmDeleteExamenOpen] = useState(false)
  const [examenAEliminar, setExamenAEliminar] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    let isMounted = true

    Promise.all([
      academicService.getMateriaById(id),
      academicService.getExamenes(),
    ])
      .then(([materiaData, todosLosExamenes]) => {
        if (!isMounted) return
        setMateria(materiaData)
        const asociados = (todosLosExamenes || []).filter(
          (ex) => String(ex?.materia) === String(id)
        )
        setExamenes(asociados)
      })
      .catch((err) => {
        if (!isMounted) return
        if (err?.status === 404) {
          setError('La materia solicitada no existe o no tienes permisos para visualizarla.')
        } else {
          setError(err?.message || 'Error al recuperar los datos de la materia.')
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id, recarga])

  const handleReintentar = () => {
    setLoading(true)
    setError('')
    setRecarga((prev) => prev + 1)
  }

  const promedioMateria = calcularPromedio(examenes)
  const puedeEditarMateria = canManageMaterias(user)
  const puedeRegistrarExamen = canManageExamenes(user)

  const handleModalMateriaSuccess = (res) => {
    setMateria(res)
    setFeedback({ tipo: 'success', mensaje: 'Asignatura actualizada con éxito.' })
    setRecarga((prev) => prev + 1)
  }

  const handleConfirmarEliminarMateria = async () => {
    if (!materia) return
    setDeleting(true)
    try {
      await academicService.deleteMateria(materia.id)
      navigate('/materias', {
        replace: true,
        state: {
          feedback: {
            tipo: 'success',
            mensaje: `La materia "${materia.nombre}" fue eliminada exitosamente.`,
          },
        },
      })
    } catch (err) {
      setFeedback({ tipo: 'danger', mensaje: err?.message || 'Error al eliminar la materia.' })
    } finally {
      setDeleting(false)
      setConfirmDeleteMateriaOpen(false)
    }
  }

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
    setConfirmDeleteExamenOpen(true)
  }

  const handleConfirmarEliminarExamen = async () => {
    if (!examenAEliminar) return
    setDeleting(true)
    try {
      await academicService.deleteExamen(examenAEliminar.id)
      setFeedback({ tipo: 'success', mensaje: 'Examen eliminado del historial correctamente.' })
      setConfirmDeleteExamenOpen(false)
      setExamenAEliminar(null)
      setRecarga((prev) => prev + 1)
    } catch (err) {
      setFeedback({ tipo: 'danger', mensaje: err?.message || 'Error al eliminar el examen.' })
    } finally {
      setDeleting(false)
    }
  }

  const handleModalExamenSuccess = (res, accion) => {
    const accionTxt = accion === 'CREATE' ? 'registrado' : 'actualizado'
    setFeedback({ tipo: 'success', mensaje: `Examen ${accionTxt} exitosamente.` })
    setRecarga((prev) => prev + 1)
  }

  return (
    <main className="flex-grow-1 pb-5">
      {/* Hero Banner compacto y consistente */}
      <section className="bg-primary text-white text-center py-3 py-md-4 mb-3 shadow-sm">
        <div className="container">
          <span className="badge rounded-pill text-bg-light text-primary mb-2">
            Detalle de Asignatura
          </span>
          <h1 className="h3 fw-bold mb-1">{materia ? materia.nombre : 'Detalle de Materia'}</h1>
          <p className="small text-white-50 mx-auto mb-0" style={{ maxWidth: '580px' }}>
            {materia
              ? `Plan de Estudio • ${formatearNivelCarrera(materia.año_dictado)} • ${materia.creditos_totales} créditos académicos`
              : 'Información curricular e historial de evaluaciones en tiempo real.'}
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

        {/* Navegación de migas de pan y botones */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><Link to="/">Inicio</Link></li>
              <li className="breadcrumb-item"><Link to="/materias">Materias</Link></li>
              <li className="breadcrumb-item active" aria-current="page">
                {materia ? materia.nombre : 'Detalle'}
              </li>
            </ol>
          </nav>

          <div className="d-flex gap-2">
            <Link to="/materias" className="btn btn-outline-secondary btn-sm">
              ← Volver a Materias
            </Link>
            {puedeEditarMateria && materia && (
              <>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setMateriaModalOpen(true)}
                >
                  ✏️ Editar Materia
                </button>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => setConfirmDeleteMateriaOpen(true)}
                >
                  🗑️ Eliminar
                </button>
              </>
            )}
          </div>
        </div>

        {/* Manejo de Error */}
        {error && (
          <div className="alert alert-danger shadow-sm d-flex flex-column gap-2 mb-4" role="alert">
            <div className="d-flex align-items-center justify-content-between">
              <strong>Atención:</strong>
              <button type="button" className="btn btn-outline-danger btn-sm" onClick={handleReintentar}>
                Reintentar
              </button>
            </div>
            <p className="mb-0">{error}</p>
            <div>
              <button
                type="button"
                className="btn btn-secondary btn-sm mt-2"
                onClick={() => navigate('/materias')}
              >
                ← Volver al catálogo de materias
              </button>
            </div>
          </div>
        )}

        {/* Spinner de Carga */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando detalle de la materia...</span>
            </div>
            <p className="text-secondary small mt-2">Cargando información académica...</p>
          </div>
        )}

        {/* Contenido Principal */}
        {!loading && !error && materia && (
          <>
            {/* Header / Estado de la Materia */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className={`badge ${ESTADO_BADGE[materia.estado] || 'text-bg-secondary'} fs-6`}>
                    {obtenerEtiquetaEstado(materia.estado)}
                  </span>
                  <span className="badge text-bg-light border text-secondary">
                    ID: #{materia.id}
                  </span>
                </div>
                <h2 className="h4 fw-bold text-dark mb-1">{materia.nombre}</h2>
                <p className="text-secondary mb-0">
                  Estado académico y actas registradas en el sistema.
                </p>
              </div>
            </div>

            {/* Tarjetas de Datos Clave */}
            <div className="row g-3 mb-4">
              <div className="col-12 col-sm-6 col-md-3">
                <div className="card border-0 shadow-sm h-100 text-center py-3">
                  <span className="text-secondary small mb-1">Año de Carrera</span>
                  <span className="fs-4 fw-bold text-primary">{formatearNivelCarrera(materia.año_dictado)}</span>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-md-3">
                <div className="card border-0 shadow-sm h-100 text-center py-3">
                  <span className="text-secondary small mb-1">Créditos que otorga</span>
                  <span className="fs-4 fw-bold text-success">{materia.creditos_totales} pts</span>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-md-3">
                <div className="card border-0 shadow-sm h-100 text-center py-3">
                  <span className="text-secondary small mb-1">Régimen Promoción</span>
                  <span className={`fs-5 fw-bold ${materia.es_promocionable ? 'text-success' : 'text-secondary'}`}>
                    {materia.es_promocionable ? 'Promocionable' : 'Examen Final'}
                  </span>
                </div>
              </div>

              <div className="col-12 col-sm-6 col-md-3">
                <div className="card border-0 shadow-sm h-100 text-center py-3">
                  <span className="text-secondary small mb-1">Promedio Calificaciones</span>
                  <span className="fs-4 fw-bold text-dark">
                    {promedioMateria > 0 ? `${promedioMateria} pts` : 'Sin notas'}
                  </span>
                </div>
              </div>
            </div>

            {/* Sección de Exámenes Rendidos / Programados */}
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h3 className="h5 fw-bold mb-0">Instancias de Examen y Evaluaciones</h3>
                {puedeRegistrarExamen && (
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm fw-semibold"
                    onClick={handleAbrirCrearExamen}
                  >
                    + Cargar Nota / Examen
                  </button>
                )}
              </div>
              <div className="card-body p-0">
                {examenes.length === 0 ? (
                  <div className="text-center py-5 px-3">
                    <span className="display-6 text-muted mb-2 d-inline-block">📝</span>
                    <p className="text-secondary mb-2">
                      No se registran exámenes ni calificaciones para <strong>{materia.nombre}</strong>.
                    </p>
                    <span className="text-muted small">
                      Las mesas rendidas o programadas asociadas a esta materia aparecerán aquí automáticamente.
                    </span>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th scope="col">Tipo de Evaluación</th>
                          <th scope="col">Fecha</th>
                          <th scope="col" className="text-center">Calificación</th>
                          <th scope="col" className="text-center">Resultado</th>
                          {puedeRegistrarExamen && <th scope="col" className="text-end">Acción</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {examenes.map((ex) => {
                          const notaNum = ex.nota !== null && ex.nota !== undefined ? Number(ex.nota) : null
                          const aprobado = notaNum !== null && notaNum >= 4

                          return (
                            <tr key={ex.id}>
                              <td className="fw-semibold">
                                {TIPO_EXAMEN_LABEL[ex.tipo] || ex.tipo || 'Examen'}
                              </td>
                              <td>{ex.fecha || 'Sin fecha'}</td>
                              <td className="text-center">
                                {notaNum !== null ? (
                                  <span className={`fw-bold fs-6 ${aprobado ? 'text-success' : 'text-danger'}`}>
                                    {notaNum} / 10
                                  </span>
                                ) : (
                                  <span className="text-muted fst-italic">Pendiente de nota</span>
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
                              {puedeRegistrarExamen && (
                                <td className="text-end">
                                  <div className="d-inline-flex gap-1">
                                    <button
                                      type="button"
                                      className="btn btn-outline-secondary btn-sm"
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
                                  </div>
                                </td>
                              )}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal para Editar Asignatura */}
      {materia && (
        <MateriaModal
          isOpen={materiaModalOpen}
          materiaAEditar={materia}
          onClose={() => setMateriaModalOpen(false)}
          onSuccess={handleModalMateriaSuccess}
        />
      )}

      {/* Modal para Confirmar Eliminación de la Materia */}
      <ConfirmModal
        isOpen={confirmDeleteMateriaOpen}
        titulo="Eliminar Asignatura"
        mensaje={`¿Estás seguro de que deseas eliminar la materia "${materia?.nombre}"? Esta acción no se puede deshacer.`}
        confirmTexto="Sí, eliminar materia"
        confirmClase="btn-danger"
        loading={deleting}
        onClose={() => setConfirmDeleteMateriaOpen(false)}
        onConfirm={handleConfirmarEliminarMateria}
      />

      {/* Modal para Registrar / Editar Examen */}
      <ExamenModal
        isOpen={examenModalOpen}
        examenAEditar={examenSeleccionado}
        materias={materia ? [materia] : []}
        materiaPreseleccionadaId={materia?.id}
        onClose={() => setExamenModalOpen(false)}
        onSuccess={handleModalExamenSuccess}
      />

      {/* Modal para Confirmar Eliminación de Examen */}
      <ConfirmModal
        isOpen={confirmDeleteExamenOpen}
        titulo="Eliminar Examen"
        mensaje="¿Estás seguro de que deseas eliminar este registro de examen del historial?"
        confirmTexto="Sí, eliminar examen"
        confirmClase="btn-danger"
        loading={deleting}
        onClose={() => {
          setConfirmDeleteExamenOpen(false)
          setExamenAEliminar(null)
        }}
        onConfirm={handleConfirmarEliminarExamen}
      />
    </main>
  )
}

export default MateriaDetail
