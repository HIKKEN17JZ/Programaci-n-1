import { useState, useMemo } from 'react'
import { academicService } from '../services/academicService.js'
import {
  validarFormularioExamen,
  filtrarMateriasParaExamen,
  TIPOS_VALIDOS_EXAMEN,
} from '../utils/academicValidators.js'

const TIPOS_LABEL = {
  FIN: 'Examen Final',
  PRO: 'Instancia de Promoción',
}

function ExamenModalForm({
  examenAEditar,
  materias,
  materiaPreseleccionadaId,
  onClose,
  onSuccess,
}) {
  const esEdicion = Boolean(examenAEditar)

  // Materias disponibles: excluye asignaturas ya aprobadas al rendir nuevos exámenes
  const materiasDisponibles = useMemo(() => {
    return filtrarMateriasParaExamen(materias, examenAEditar)
  }, [materias, examenAEditar])

  const defaultMateriaId = examenAEditar
    ? (examenAEditar.materia ? String(examenAEditar.materia) : '')
    : (materiaPreseleccionadaId
        ? String(materiaPreseleccionadaId)
        : (materiasDisponibles[0]?.id ? String(materiasDisponibles[0].id) : ''))

  const [materiaId, setMateriaId] = useState(defaultMateriaId)
  const [fecha, setFecha] = useState(
    examenAEditar?.fecha || new Date().toISOString().slice(0, 10)
  )
  const [tipo, setTipo] = useState(
    examenAEditar?.tipo && ['FIN', 'PRO'].includes(examenAEditar.tipo)
      ? examenAEditar.tipo
      : 'FIN'
  )
  const [nota, setNota] = useState(
    examenAEditar?.nota !== null && examenAEditar?.nota !== undefined
      ? String(examenAEditar.nota)
      : ''
  )

  const [errores, setErrores] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setServerError('')

    const datos = {
      materia: Number(materiaId),
      fecha,
      tipo,
      nota: nota.trim() === '' ? null : Number(nota),
    }

    const validacion = validarFormularioExamen(datos)
    if (!validacion.esValido) {
      setErrores(validacion.errores)
      return
    }

    setLoading(true)

    try {
      let resultado
      if (esEdicion) {
        resultado = await academicService.updateExamen(examenAEditar.id, datos)
      } else {
        resultado = await academicService.createExamen(datos)
      }

      onSuccess(resultado, esEdicion ? 'EDIT' : 'CREATE')
      onClose()
    } catch (err) {
      setServerError(err?.message || 'Error al guardar el examen en el servidor.')
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
      aria-labelledby="examenModalTitulo"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header bg-primary text-white py-3 px-4 rounded-top-4">
            <h5 className="modal-title fw-bold" id="examenModalTitulo">
              {esEdicion ? 'Editar / Calificar Examen' : 'Registrar Mesa de Examen'}
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

              {/* Selector de Materia */}
              <div className="mb-3">
                <label htmlFor="examenMateria" className="form-label fw-semibold small">
                  Asignatura Evaluada *
                </label>
                <select
                  id="examenMateria"
                  className={`form-select ${errores.materia ? 'is-invalid' : ''}`}
                  value={materiaId}
                  onChange={(e) => setMateriaId(e.target.value)}
                  disabled={loading || Boolean(materiaPreseleccionadaId && !esEdicion) || (!esEdicion && materiasDisponibles.length === 0)}
                  required
                >
                  {materiasDisponibles.length === 0 ? (
                    <option value="">No hay materias pendientes de rendir</option>
                  ) : (
                    <>
                      <option value="">Selecciona una asignatura...</option>
                      {materiasDisponibles.map((mat) => (
                        <option key={mat.id} value={mat.id}>
                          {mat.nombre} ({mat.año_dictado})
                        </option>
                      ))}
                    </>
                  )}
                </select>
                {errores.materia && <div className="invalid-feedback">{errores.materia}</div>}
                {!esEdicion && materiasDisponibles.length === 0 && (
                  <div className="alert alert-success d-flex align-items-center gap-2 mt-2 py-2 px-3 small" role="alert">
                    <span>🎉</span>
                    <div>
                      ¡Todas tus materias se encuentran aprobadas! No tienes asignaturas pendientes para rendir examen.
                    </div>
                  </div>
                )}
              </div>

              <div className="row g-3 mb-3">
                {/* Tipo de Examen */}
                <div className="col-12 col-sm-6">
                  <label htmlFor="examenTipo" className="form-label fw-semibold small">
                    Tipo de Instancia *
                  </label>
                  <select
                    id="examenTipo"
                    className={`form-select ${errores.tipo ? 'is-invalid' : ''}`}
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    disabled={loading}
                  >
                    {TIPOS_VALIDOS_EXAMEN.map((t) => (
                      <option key={t} value={t}>
                        {TIPOS_LABEL[t] || t}
                      </option>
                    ))}
                  </select>
                  {errores.tipo && <div className="invalid-feedback">{errores.tipo}</div>}
                </div>

                {/* Fecha */}
                <div className="col-12 col-sm-6">
                  <label htmlFor="examenFecha" className="form-label fw-semibold small">
                    Fecha de Evaluación *
                  </label>
                  <input
                    id="examenFecha"
                    type="date"
                    className={`form-control ${errores.fecha ? 'is-invalid' : ''}`}
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    disabled={loading}
                    required
                  />
                  {errores.fecha && <div className="invalid-feedback">{errores.fecha}</div>}
                </div>
              </div>

              {/* Calificación / Nota */}
              <div className="mb-2">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label htmlFor="examenNota" className="form-label fw-semibold small mb-0">
                    {tipo === 'PRO' ? 'Calificación de la Promoción (mínimo 6) *' : 'Calificación Obtenida (0 a 10)'}
                  </label>
                  {nota.trim() !== '' && !isNaN(Number(nota)) ? (
                    <span className={`badge ${Number(nota) >= 6 ? 'text-bg-success' : 'text-bg-danger'} small`}>
                      {Number(nota) >= 6
                        ? (tipo === 'PRO' ? '✓ Promoción Aprobada (≥ 6)' : '✓ Aprobado (≥ 6)')
                        : (tipo === 'PRO' ? '⚠ Inválido: Promoción exige nota ≥ 6' : '⚠ Desaprobado (< 6)')}
                    </span>
                  ) : tipo === 'PRO' ? (
                    <span className="badge text-bg-warning text-dark small">
                      ⚠ Nota requerida ≥ 6
                    </span>
                  ) : null}
                </div>
                <input
                  id="examenNota"
                  type="number"
                  step="0.25"
                  min={tipo === 'PRO' ? '6' : '0'}
                  max="10"
                  className={`form-control ${errores.nota ? 'is-invalid' : ''}`}
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  placeholder={
                    tipo === 'PRO'
                      ? 'Ingresá la calificación de promoción (entre 6 y 10)'
                      : 'Dejar vacío si el acta está abierta / pendiente'
                  }
                  disabled={loading}
                  required={tipo === 'PRO'}
                />
                {errores.nota && <div className="invalid-feedback">{errores.nota}</div>}
                <div className="form-text small">
                  {tipo === 'PRO'
                    ? 'La promoción directa acredita la materia con nota 6 o superior. Si no alcanzaste la promoción, selecciona Examen Final.'
                    : 'Escala de 0 a 10. Se aprueba con nota 6 o superior. Dejar vacío si aún no fue calificado.'}
                </div>
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
                disabled={loading || (!esEdicion && materiasDisponibles.length === 0)}
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
                  'Registrar Examen'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function ExamenModal({
  isOpen,
  examenAEditar,
  materias = [],
  materiaPreseleccionadaId,
  onClose,
  onSuccess,
}) {
  if (!isOpen) return null

  return (
    <ExamenModalForm
      key={examenAEditar ? `edit-${examenAEditar.id}` : `new-${materiaPreseleccionadaId || 'any'}`}
      examenAEditar={examenAEditar}
      materias={materias}
      materiaPreseleccionadaId={materiaPreseleccionadaId}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  )
}

export default ExamenModal
