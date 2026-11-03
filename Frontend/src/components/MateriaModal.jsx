import { useState } from 'react'
import { academicService } from '../services/academicService.js'
import { validarFormularioMateria, ESTADOS_VALIDOS_MATERIA } from '../utils/academicValidators.js'
import { ESTADO_BADGE, obtenerEtiquetaEstado } from '../utils/progress.js'

function MateriaModalForm({ materiaAEditar, tieneExamenAprobado = false, onClose, onSuccess }) {
  const [nombre, setNombre] = useState(materiaAEditar?.nombre || '')
  const [añoDictado, setAñoDictado] = useState(
    materiaAEditar?.año_dictado ?? 1
  )
  const [creditos, setCreditos] = useState(materiaAEditar?.creditos_totales ?? 6)
  const [estado, setEstado] = useState(materiaAEditar?.estado || 'PEN')
  const [esPromocionable, setEsPromocionable] = useState(
    materiaAEditar?.es_promocionable ?? true
  )

  const [errores, setErrores] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const esEdicion = Boolean(materiaAEditar)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setServerError('')

    const datos = {
      nombre,
      año_dictado: Number(añoDictado),
      creditos_totales: Number(creditos),
      estado,
      es_promocionable: esPromocionable,
    }

    const validacion = validarFormularioMateria(datos)
    if (!validacion.esValido) {
      setErrores(validacion.errores)
      return
    }

    setLoading(true)

    try {
      let resultado
      if (esEdicion) {
        resultado = await academicService.updateMateria(materiaAEditar.id, datos)
      } else {
        resultado = await academicService.createMateria(datos)
      }

      onSuccess(resultado, esEdicion ? 'EDIT' : 'CREATE')
      onClose()
    } catch (err) {
      setServerError(err?.message || 'Error al guardar la materia en el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)', backdropFilter: 'blur(2px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="materiaModalTitulo"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header bg-primary text-white py-3 px-4 rounded-top-4">
            <h5 className="modal-title fw-bold" id="materiaModalTitulo">
              {esEdicion ? 'Editar Asignatura' : 'Registrar Nueva Asignatura'}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Cerrar modal"
              onClick={onClose}
              disabled={loading}
            />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {serverError && (
                <div className="alert alert-danger py-2 px-3 small mb-3" role="alert">
                  <strong>Error:</strong> {serverError}
                </div>
              )}

              {/* Campo Nombre */}
              <div className="mb-3">
                <label htmlFor="materiaNombre" className="form-label fw-semibold small">
                  Nombre de la Asignatura *
                </label>
                <input
                  id="materiaNombre"
                  type="text"
                  className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Programación II, Álgebra Lineal"
                  disabled={loading}
                  maxLength={150}
                  required
                />
                {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
              </div>

              <div className="row g-3 mb-3">
                {/* Año / Nivel de carrera */}
                <div className="col-12 col-sm-6">
                  <label htmlFor="materiaAño" className="form-label fw-semibold small">
                    Año de la Carrera *
                  </label>
                  <select
                    id="materiaAño"
                    className={`form-select ${errores.año_dictado ? 'is-invalid' : ''}`}
                    value={añoDictado}
                    onChange={(e) => setAñoDictado(Number(e.target.value))}
                    disabled={loading}
                    required
                  >
                    <option value={1}>1er Año (1°)</option>
                    <option value={2}>2do Año (2°)</option>
                    <option value={3}>3er Año (3°)</option>
                    <option value={4}>4to Año (4°)</option>
                    <option value={5}>5to Año (5°)</option>
                    <option value={6}>6to Año (6°)</option>
                    <option value={7}>7mo Año (7°)</option>
                    <option value={8}>8vo Año (8°)</option>
                    <option value={9}>9no Año (9°)</option>
                    <option value={10}>10mo Año (10°)</option>
                    {Number(añoDictado) >= 1900 && (
                      <option value={añoDictado}>Año {añoDictado}</option>
                    )}
                  </select>
                  {errores.año_dictado && (
                    <div className="invalid-feedback">{errores.año_dictado}</div>
                  )}
                </div>

                {/* Créditos */}
                <div className="col-12 col-sm-6">
                  <label htmlFor="materiaCreditos" className="form-label fw-semibold small">
                    Créditos Académicos *
                  </label>
                  <input
                    id="materiaCreditos"
                    type="number"
                    className={`form-control ${errores.creditos_totales ? 'is-invalid' : ''}`}
                    value={creditos}
                    onChange={(e) => setCreditos(e.target.value)}
                    min={0}
                    disabled={loading}
                    required
                  />
                  {errores.creditos_totales && (
                    <div className="invalid-feedback">{errores.creditos_totales}</div>
                  )}
                </div>
              </div>

              {/* Estado de cursada */}
              <div className="mb-3">
                <label htmlFor="materiaEstado" className="form-label fw-semibold small">
                  Estado de Cursada *
                </label>
                <select
                  id="materiaEstado"
                  className={`form-select ${errores.estado ? 'is-invalid' : ''}`}
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  disabled={loading}
                >
                  {ESTADOS_VALIDOS_MATERIA.map((cod) => {
                    const bloqueadoApr = cod === 'APR' && materiaAEditar?.estado !== 'APR' && !tieneExamenAprobado
                    return (
                      <option key={cod} value={cod} disabled={bloqueadoApr}>
                        {bloqueadoApr
                          ? '🔒 Aprobada (requiere examen ≥ 6)'
                          : `${obtenerEtiquetaEstado(cod)} (${ESTADO_BADGE[cod]?.texto || cod})`}
                      </option>
                    )
                  })}
                </select>
                {errores.estado && <div className="invalid-feedback">{errores.estado}</div>}
                {materiaAEditar?.estado !== 'APR' && !tieneExamenAprobado && (
                  <div className="form-text text-muted" style={{ fontSize: '0.78rem' }}>
                    💡 Para asentar la materia como <strong>Aprobada</strong>, se debe registrar su mesa de examen aprobada (nota ≥ 6) en Mesas de Examen.
                  </div>
                )}
              </div>

              {/* Promocionable */}
              <div className="form-check form-switch mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="materiaPromocionable"
                  checked={esPromocionable}
                  onChange={(e) => setEsPromocionable(e.target.checked)}
                  disabled={loading}
                />
                <label className="form-check-label small" htmlFor="materiaPromocionable">
                  Materia con régimen de promoción directa
                </label>
              </div>
            </div>

            <div className="modal-footer bg-light px-4 py-3 rounded-bottom-4">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm px-4 fw-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />
                    Guardando...
                  </>
                ) : esEdicion ? (
                  'Guardar Cambios'
                ) : (
                  'Registrar Materia'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function MateriaModal({ isOpen, materiaAEditar, tieneExamenAprobado = false, onClose, onSuccess }) {
  if (!isOpen) return null

  return (
    <MateriaModalForm
      key={materiaAEditar ? `edit-${materiaAEditar.id}` : 'new'}
      materiaAEditar={materiaAEditar}
      tieneExamenAprobado={tieneExamenAprobado}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  )
}

export default MateriaModal
