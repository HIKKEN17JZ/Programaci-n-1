import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { academicService } from '../services/academicService.js'
import { useAuth } from '../hooks/useAuth.js'
import { canManageMaterias } from '../utils/roles.js'
import {
  ESTADO_BADGE,
  obtenerEtiquetaEstado,
  formatearNivelCarrera,
} from '../utils/progress.js'
import {
  filtrarMaterias,
  obtenerAñosDisponibles,
  calcularEstadisticasMaterias,
} from '../utils/materiaFilters.js'
import MateriaModal from '../components/MateriaModal.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import { ImportarPlanModal } from '../components/ImportarPlanModal.jsx'
import { QuickStatusSelect } from '../components/QuickStatusSelect.jsx'
import { activityLogService } from '../services/activityLogService.js'
import {
  generarPlantillaCSV,
  exportarMateriasACSV,
  descargarArchivoCSV,
} from '../utils/csvHelper.js'

function MateriasList() {
  const { user } = useAuth()
  const [materias, setMaterias] = useState([])
  const [examenes, setExamenes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('TODOS')
  const [filtroAño, setFiltroAño] = useState('TODOS')
  const [recarga, setRecarga] = useState(0)

  // Estados para modales de creación, edición, eliminación e importación
  const [materiaModalOpen, setMateriaModalOpen] = useState(false)
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [materiaAEliminar, setMateriaAEliminar] = useState(null)
  const [importarModalOpen, setImportarModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    let isMounted = true

    Promise.all([
      academicService.getMaterias(),
      academicService.getExamenes().catch(() => []),
    ])
      .then(([materiasData, examenesData]) => {
        if (isMounted) {
          setMaterias(materiasData)
          setExamenes(examenesData)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.message || 'Error al conectar con el servidor para obtener las materias.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [recarga])

  const materiasAprobadasPorExamen = useMemo(() => {
    const ids = new Set()
    for (const ex of examenes) {
      const nota = ex?.nota !== null && ex?.nota !== undefined ? Number(ex.nota) : null
      const tipo = ex?.tipo
      if (nota !== null && nota >= 6 && (!tipo || tipo === 'FIN' || tipo === 'PRO')) {
        const matId = typeof ex.materia === 'object' ? ex.materia?.id : ex.materia
        if (matId) ids.add(Number(matId))
      }
    }
    return ids
  }, [examenes])

  const añosDisponibles = useMemo(() => obtenerAñosDisponibles(materias), [materias])
  const estadisticas = useMemo(() => calcularEstadisticasMaterias(materias), [materias])

  const materiasFiltradas = useMemo(() => {
    return filtrarMaterias(materias, {
      busqueda,
      estado: filtroEstado,
      año: filtroAño,
    })
  }, [materias, busqueda, filtroEstado, filtroAño])

  const handleLimpiarFiltros = () => {
    setBusqueda('')
    setFiltroEstado('TODOS')
    setFiltroAño('TODOS')
  }

  const handleReintentar = () => {
    setLoading(true)
    setError('')
    setRecarga((prev) => prev + 1)
  }

  const tieneFiltrosActivos = busqueda.trim() !== '' || filtroEstado !== 'TODOS' || filtroAño !== 'TODOS'
  const puedeGestionar = canManageMaterias(user)

  const handleAbrirCrear = () => {
    setMateriaSeleccionada(null)
    setMateriaModalOpen(true)
  }

  const handleAbrirEditar = (materia) => {
    setMateriaSeleccionada(materia)
    setMateriaModalOpen(true)
  }

  const handleAbrirEliminar = (materia) => {
    setMateriaAEliminar(materia)
    setConfirmModalOpen(true)
  }

  const handleConfirmarEliminar = async () => {
    if (!materiaAEliminar) return
    setDeleting(true)
    try {
      // Exámenes vinculados a esta materia que se darán de baja por cascada
      const examenesAsociados = (examenes || []).filter(
        (ex) => String(ex.materia) === String(materiaAEliminar.id)
      )

      await academicService.deleteMateria(materiaAEliminar.id)

      activityLogService.registrarAccion({
        accion: 'ELIMINAR',
        entidad: 'MATERIA',
        detalle: `Asignatura eliminada: "${materiaAEliminar.nombre}" (${formatearNivelCarrera(materiaAEliminar.año_dictado)})`,
        idReferencia: materiaAEliminar.id,
        userId: user?.id,
      })

      examenesAsociados.forEach((ex) => {
        activityLogService.registrarAccion({
          accion: 'ELIMINAR',
          entidad: 'EXAMEN',
          detalle: `Mesa de examen eliminada por baja de "${materiaAEliminar.nombre}": llamado ${ex.tipo}`,
          idReferencia: ex.id,
          userId: user?.id,
        })
      })

      setFeedback({
        tipo: 'success',
        mensaje: `La materia "${materiaAEliminar.nombre}" fue eliminada correctamente del plan de estudio.`,
      })
      setConfirmModalOpen(false)
      setMateriaAEliminar(null)
      setRecarga((prev) => prev + 1)
    } catch (err) {
      setFeedback({
        tipo: 'danger',
        mensaje: err?.message || 'Error al eliminar la materia del servidor.',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleModalSuccess = (resultado, accion) => {
    const accionTxt = accion === 'CREATE' ? 'registrada' : 'actualizada'
    activityLogService.registrarAccion({
      accion: accion === 'CREATE' ? 'CREAR' : 'EDITAR',
      entidad: 'MATERIA',
      detalle: `Asignatura ${accion === 'CREATE' ? 'creada' : 'modificada'}: "${resultado.nombre}" (${formatearNivelCarrera(resultado.año_dictado)})`,
      idReferencia: resultado.id,
      userId: user?.id,
    })
    setFeedback({
      tipo: 'success',
      mensaje: `Asignatura "${resultado.nombre}" ${accionTxt} con éxito.`,
    })
    setRecarga((prev) => prev + 1)
  }

  const handleDescargarPlantilla = () => {
    const csv = generarPlantillaCSV()
    descargarArchivoCSV(csv, 'plantilla_plan_estudio.csv')
  }

  const handleExportarPlan = () => {
    const csv = exportarMateriasACSV(materias)
    descargarArchivoCSV(csv, 'mi_plan_de_estudio.csv')
    setFeedback({
      tipo: 'info',
      mensaje: `Plan de estudio exportado exitosamente con ${materias.length} materias.`,
    })
  }

  const handleEstadoActualizado = (materiaActualizada) => {
    activityLogService.registrarAccion({
      accion: 'ESTADO',
      entidad: 'MATERIA',
      detalle: `Condición actualizada en "${materiaActualizada.nombre}": pasó a ${obtenerEtiquetaEstado(materiaActualizada.estado)}`,
      idReferencia: materiaActualizada.id,
      userId: user?.id,
    })
    setMaterias((prev) =>
      prev.map((m) => (m.id === materiaActualizada.id ? materiaActualizada : m))
    )
    setFeedback({
      tipo: 'success',
      mensaje: `Condición de "${materiaActualizada.nombre}" actualizada a "${obtenerEtiquetaEstado(materiaActualizada.estado)}".`,
    })
  }

  return (
    <main className="flex-grow-1 pb-5">
      {/* Hero Banner compacto y consistente */}
      <section className="bg-primary text-white text-center py-3 py-md-4 mb-3 shadow-sm">
        <div className="container">
          <span className="badge rounded-pill text-bg-light text-primary mb-2">
            Plan de Estudio Oficial
          </span>
          <h1 className="h3 fw-bold mb-1">Catálogo de Materias</h1>
          <p className="small text-white-50 mx-auto mb-0" style={{ maxWidth: '580px' }}>
            Seguimiento curricular, estado de cursada y acreditación de horas académicas en tiempo real.
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
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><Link to="/">Inicio</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Plan de Estudio</li>
            </ol>
          </nav>

          {puedeGestionar && (
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={handleDescargarPlantilla}
                title="Descargar plantilla CSV con ejemplos para completar en Excel"
              >
                📄 Plantilla CSV
              </button>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={handleExportarPlan}
                disabled={materias.length === 0}
                title="Exportar todas las materias actuales a un archivo CSV"
              >
                📤 Exportar Plan
              </button>
              <button
                type="button"
                className="btn btn-outline-success btn-sm fw-semibold"
                onClick={() => setImportarModalOpen(true)}
                title="Cargar plan de materias completo desde archivo CSV / Excel"
              >
                📥 Importar CSV
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm fw-semibold shadow-sm"
                onClick={handleAbrirCrear}
              >
                + Nueva Materia
              </button>
            </div>
          )}
        </div>

        {/* Tarjetas de Métricas Rápidas */}
        {!loading && !error && materias.length > 0 && (
          <div className="row g-2 mb-4">
            <div className="col-6 col-md-3">
              <div className="card border-0 bg-light shadow-sm text-center py-2">
                <span className="fs-5 fw-bold text-primary">{estadisticas.total}</span>
                <span className="text-secondary small">Total materias</span>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card border-0 bg-light shadow-sm text-center py-2">
                <span className="fs-5 fw-bold text-success">{estadisticas.aprobadas}</span>
                <span className="text-secondary small">Aprobadas ({estadisticas.creditosAprobados} pts)</span>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card border-0 bg-light shadow-sm text-center py-2">
                <span className="fs-5 fw-bold text-info">{estadisticas.cursando}</span>
                <span className="text-secondary small">Cursando actualmente</span>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card border-0 bg-light shadow-sm text-center py-2">
                <span className="fs-5 fw-bold text-warning">{estadisticas.regulares}</span>
                <span className="text-secondary small">Regulares</span>
              </div>
            </div>
          </div>
        )}

        {/* Barra de Filtros y Búsqueda */}
        {!loading && !error && materias.length > 0 && (
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="row g-3 align-items-center">
                {/* Buscador */}
                <div className="col-12 col-md-5">
                  <label htmlFor="busqueda-materia" className="form-label small fw-semibold text-secondary mb-1">
                    Buscar por nombre
                  </label>
                  <div className="input-group">
                    <input
                      id="busqueda-materia"
                      type="text"
                      className="form-control"
                      placeholder="Ej. Programación, Álgebra, Redes..."
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

                {/* Filtro Estado */}
                <div className="col-6 col-md-3">
                  <label htmlFor="filtro-estado" className="form-label small fw-semibold text-secondary mb-1">
                    Estado
                  </label>
                  <select
                    id="filtro-estado"
                    className="form-select"
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                  >
                    <option value="TODOS">Todos los estados</option>
                    <option value="APR">Aprobadas (APR)</option>
                    <option value="CUR">Cursando (CUR)</option>
                    <option value="REG">Regulares (REG)</option>
                    <option value="PEN">Pendientes (PEN)</option>
                    <option value="REC">Recursando (REC)</option>
                  </select>
                </div>

                {/* Filtro Año */}
                <div className="col-6 col-md-2">
                  <label htmlFor="filtro-año" className="form-label small fw-semibold text-secondary mb-1">
                    Año de carrera
                  </label>
                  <select
                    id="filtro-año"
                    className="form-select"
                    value={filtroAño}
                    onChange={(e) => setFiltroAño(e.target.value)}
                  >
                    <option value="TODOS">Todos</option>
                    {añosDisponibles.map((año) => (
                      <option key={año} value={año}>
                        {formatearNivelCarrera(año)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Botón limpiar filtros */}
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
              <strong>Error al cargar materias:</strong> {error}
            </div>
            <button type="button" className="btn btn-outline-danger btn-sm" onClick={handleReintentar}>
              Reintentar
            </button>
          </div>
        )}

        {/* Indicador de Carga */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando materias...</span>
            </div>
            <p className="text-secondary small mt-2">Consultando el plan de estudio en el servidor...</p>
          </div>
        )}

        {/* Contenido / Listado */}
        {!loading && !error && (
          <>
            {materias.length === 0 ? (
              <div className="card border-0 shadow-sm text-center py-5 px-3">
                <div className="card-body">
                  <span className="display-4 text-muted mb-3 d-inline-block">📚</span>
                  <h3 className="h4 fw-bold">Actualmente no tienes un plan cargado</h3>
                  <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '520px' }}>
                    ¡Vamos, quiero creer que no eres un flojo! Da el primer paso organizando tu carrera: añade tus materias una a una o importa tu plan de estudio completo para poner en marcha tu seguimiento académico.
                  </p>
                  <Link to="/" className="btn btn-outline-primary mt-2">
                    Volver al Panel Principal
                  </Link>
                </div>
              </div>
            ) : materiasFiltradas.length === 0 ? (
              <div className="card border-0 shadow-sm text-center py-5 px-3">
                <div className="card-body">
                  <span className="display-5 text-muted mb-2 d-inline-block">🔍</span>
                  <h4 className="fw-semibold">Sin coincidencias</h4>
                  <p className="text-secondary mx-auto mb-3" style={{ maxWidth: '420px' }}>
                    No se encontraron materias que cumplan con los filtros de búsqueda aplicados.
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
                        <th scope="col" style={{ width: '40%' }}>Materia</th>
                        <th scope="col" className="text-center">Año</th>
                        <th scope="col" className="text-center">Créditos</th>
                        <th scope="col" className="text-center">Condición</th>
                        <th scope="col" className="text-center">Promocionable</th>
                        <th scope="col" className="text-end">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materiasFiltradas.map((materia) => (
                        <tr key={materia.id}>
                          <td>
                            <div className="fw-semibold text-dark">{materia.nombre}</div>
                          </td>
                          <td className="text-center">
                            <span className="badge text-bg-light border text-dark">
                              {formatearNivelCarrera(materia.año_dictado)}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className="fw-medium">{materia.creditos_totales} pts</span>
                          </td>
                          <td className="text-center">
                            {puedeGestionar ? (
                              <QuickStatusSelect
                                materia={materia}
                                tieneExamenAprobado={materiasAprobadasPorExamen.has(Number(materia.id))}
                                onEstadoActualizado={handleEstadoActualizado}
                              />
                            ) : (
                              <span className={`badge ${ESTADO_BADGE[materia.estado] || 'text-bg-secondary'}`}>
                                {obtenerEtiquetaEstado(materia.estado)}
                              </span>
                            )}
                          </td>
                          <td className="text-center">
                            {materia.es_promocionable ? (
                              <span className="badge text-bg-success-subtle text-success border border-success-subtle">
                                Sí
                              </span>
                            ) : (
                              <span className="badge text-bg-secondary-subtle text-secondary border border-secondary-subtle">
                                No
                              </span>
                            )}
                          </td>
                          <td className="text-end">
                            <div className="d-inline-flex gap-1">
                              <Link
                                to={`/materias/${materia.id}`}
                                className="btn btn-outline-primary btn-sm"
                                title="Ver detalles y exámenes"
                              >
                                Ver Detalle
                              </Link>
                              {puedeGestionar && (
                                <>
                                  <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    title="Editar asignatura"
                                    onClick={() => handleAbrirEditar(materia)}
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm"
                                    title="Eliminar asignatura"
                                    onClick={() => handleAbrirEliminar(materia)}
                                  >
                                    🗑️
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="card-footer bg-light text-secondary small py-2 d-flex justify-content-between align-items-center">
                  <span>Mostrando {materiasFiltradas.length} de {materias.length} materias</span>
                  {tieneFiltrosActivos && (
                    <span className="badge text-bg-info">Filtros aplicados</span>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal para Importación Masiva de Plan (CSV) */}
      <ImportarPlanModal
        isOpen={importarModalOpen}
        onClose={() => setImportarModalOpen(false)}
        onSuccess={(totalCreadas) => {
          setFeedback({
            tipo: 'success',
            mensaje: `¡Se importaron ${totalCreadas} materias exitosamente a tu plan de estudio!`,
          })
          setRecarga((prev) => prev + 1)
        }}
      />

      {/* Modal para Crear y Editar Materia */}
      <MateriaModal
        isOpen={materiaModalOpen}
        materiaAEditar={materiaSeleccionada}
        tieneExamenAprobado={materiaSeleccionada ? materiasAprobadasPorExamen.has(Number(materiaSeleccionada.id)) : false}
        onClose={() => setMateriaModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      {/* Modal para Confirmar Eliminación */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        titulo="Eliminar Asignatura"
        mensaje={
          materiaAEliminar
            ? `¿Estás seguro de que deseas eliminar permanentemente la materia "${materiaAEliminar.nombre}"? Todos sus exámenes asociados también se borrarán.`
            : '¿Deseas eliminar esta asignatura?'
        }
        confirmTexto="Sí, eliminar"
        confirmClase="btn-danger"
        loading={deleting}
        onClose={() => {
          setConfirmModalOpen(false)
          setMateriaAEliminar(null)
        }}
        onConfirm={handleConfirmarEliminar}
      />
    </main>
  )
}

export default MateriasList
