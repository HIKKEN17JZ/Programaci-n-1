import { useState } from 'react'
import {
  parsearCSVMaterias,
  generarPlantillaCSV,
  descargarArchivoCSV,
} from '../utils/csvHelper'
import { academicService } from '../services/academicService'
import { authService } from '../services/authService'
import { useAuth } from '../hooks/useAuth'
import { formatearNivelCarrera } from '../utils/progress'

/**
 * Contenido interno del modal para importación masiva de plan de estudio.
 * Se monta fresco cada vez que el modal se abre.
 */
function ImportarPlanModalContent({ onClose, onSuccess }) {
  const { user, updateUser, refreshUser } = useAuth()
  const [archivoNombre, setArchivoNombre] = useState('')
  const [carreraNombre, setCarreraNombre] = useState(user?.plan_estudio_nombre || '')
  const [guardandoCarrera, setGuardandoCarrera] = useState(false)
  const [carreraGuardada, setCarreraGuardada] = useState(false)
  const [materiasValidas, setMateriasValidas] = useState([])
  const [errores, setErrores] = useState([])
  const [procesando, setProcesando] = useState(false)
  const [progreso, setProgreso] = useState({ actual: 0, total: 0 })
  const [errorGlobal, setErrorGlobal] = useState(null)

  const handleDescargarPlantilla = () => {
    const csv = generarPlantillaCSV(carreraNombre)
    descargarArchivoCSV(csv, 'plantilla_plan_estudio.csv')
  }

  const handleGuardarSoloCarrera = async () => {
    const nueva = carreraNombre.trim()
    if (!nueva) return
    setGuardandoCarrera(true)
    setErrorGlobal(null)
    try {
      await authService.updateProfile({ plan_estudio_nombre: nueva })
      updateUser?.({ plan_estudio_nombre: nueva })
      await refreshUser?.()
      setCarreraGuardada(true)
    } catch (err) {
      setErrorGlobal(`Error al guardar la carrera: ${err?.message || 'Error en el servidor'}`)
    } finally {
      setGuardandoCarrera(false)
    }
  }

  const handleSeleccionarArchivo = (e) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return

    setArchivoNombre(archivo.name)
    setErrorGlobal(null)
    setMateriasValidas([])
    setErrores([])

    const lector = new FileReader()
    lector.onload = (evento) => {
      try {
        const texto = evento.target?.result
        const resultado = parsearCSVMaterias(texto)
        setMateriasValidas(resultado.materiasValidas)
        setErrores(resultado.errores)
        if (resultado.carreraDetectada) {
          setCarreraNombre(resultado.carreraDetectada)
          setCarreraGuardada(false)
        }
      } catch (err) {
        setErrorGlobal(err?.message || 'No se pudo leer el archivo seleccionado.')
      }
    }
    lector.onerror = () => {
      setErrorGlobal('Ocurrió un error al intentar leer el archivo local.')
    }
    lector.readAsText(archivo, 'UTF-8')
  }

  const handleConfirmarImportacion = async () => {
    if (materiasValidas.length === 0) return

    setProcesando(true)
    setErrorGlobal(null)
    setProgreso({ actual: 0, total: materiasValidas.length })

    // Si el usuario especificó o se detectó la carrera, actualizar su perfil
    const nuevaCarrera = carreraNombre.trim()
    if (nuevaCarrera) {
      try {
        await authService.updateProfile({ plan_estudio_nombre: nuevaCarrera })
        updateUser?.({ plan_estudio_nombre: nuevaCarrera })
        await refreshUser?.()
      } catch (err) {
        console.error('Error al actualizar carrera en perfil:', err)
      }
    }

    let creadas = 0
    const fallos = []

    for (let i = 0; i < materiasValidas.length; i++) {
      const materia = materiasValidas[i]
      try {
        await academicService.createMateria(materia)
        creadas++
      } catch (err) {
        fallos.push(`"${materia.nombre}": ${err?.message || 'Error en el servidor'}`)
      }
      setProgreso({ actual: i + 1, total: materiasValidas.length })
    }

    setProcesando(false)

    if (fallos.length > 0) {
      setErrorGlobal(`Se importaron ${creadas} materias, pero fallaron ${fallos.length}: ${fallos.slice(0, 3).join(', ')}`)
    }

    if (creadas > 0) {
      onSuccess?.(creadas)
      if (fallos.length === 0) {
        onClose()
      }
    }
  }

  const porcentajeProgreso =
    progreso.total > 0 ? Math.round((progreso.actual / progreso.total) * 100) : 0

  return (
    <>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="importarPlanModalTitle"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header bg-primary text-white">
              <h2 className="modal-title h5 mb-0" id="importarPlanModalTitle">
                📥 Importar Plan de Estudio (CSV / Excel)
              </h2>
              <button
                type="button"
                className="btn-close btn-close-white"
                aria-label="Cerrar"
                onClick={onClose}
                disabled={procesando}
              />
            </div>

            <div className="modal-body p-4">
              <p className="text-secondary small mb-3">
                Sube un archivo en formato <strong>CSV</strong> (compatible con Microsoft Excel y Google Sheets)
                para cargar masivamente las materias de tu carrera en tu gestor personal.
              </p>

              {/* Botón de Descarga de Plantilla de Ejemplo */}
              <div className="alert alert-light border d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3 py-2 px-3">
                <div className="small">
                  ¿No conoces el formato requerido? Descarga la plantilla oficial con ejemplos.
                  <span className="d-block text-muted" style={{ fontSize: '0.78rem' }}>
                    Tip: En <code>año_dictado</code> coloca directamente el año de tu carrera (1 para 1er año, 2 para 2do año, etc.).
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm text-nowrap align-self-start align-self-md-center"
                  onClick={handleDescargarPlantilla}
                >
                  📄 Descargar Plantilla CSV
                </button>
              </div>

              {/* Input de archivo */}
              <div className="mb-3">
                <label htmlFor="input-csv-file" className="form-label fw-semibold small">
                  Seleccionar archivo .csv
                </label>
                <input
                  id="input-csv-file"
                  type="file"
                  accept=".csv,text/csv"
                  className="form-control"
                  disabled={procesando}
                  onChange={handleSeleccionarArchivo}
                />
                {archivoNombre && (
                  <div className="form-text text-muted">
                    Archivo cargado: <strong>{archivoNombre}</strong>
                  </div>
                )}
              </div>

              {/* Nombre de la Carrera o Plan de Estudio */}
              <div className="mb-3 p-3 bg-light rounded-3 border">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label htmlFor="input-carrera-nombre" className="form-label fw-semibold small text-dark mb-0">
                    🎓 Nombre de tu Carrera / Plan de Estudio:
                  </label>
                  {carreraGuardada && (
                    <span className="badge text-bg-success small">✓ Guardado</span>
                  )}
                </div>
                <div className="input-group">
                  <input
                    id="input-carrera-nombre"
                    type="text"
                    className="form-control"
                    placeholder="Ej. Medicina, Ingeniería en Informática, Abogacía..."
                    value={carreraNombre}
                    onChange={(e) => {
                      setCarreraNombre(e.target.value)
                      setCarreraGuardada(false)
                    }}
                    disabled={procesando}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm px-3"
                    onClick={handleGuardarSoloCarrera}
                    disabled={procesando || !carreraNombre.trim() || guardandoCarrera}
                    title="Guardar inmediatamente el nombre de tu carrera en el perfil"
                  >
                    {guardandoCarrera ? 'Guardando...' : 'Guardar Carrera'}
                  </button>
                </div>
                <div className="form-text text-muted" style={{ fontSize: '0.78rem' }}>
                  Este título se mostrará en el encabezado principal de inicio y en tu seguimiento académico.
                </div>
              </div>

              {/* Error Global */}
              {errorGlobal && (
                <div className="alert alert-danger py-2 small" role="alert">
                  {errorGlobal}
                </div>
              )}

              {/* Barra de Progreso durante la importación */}
              {procesando && (
                <div className="my-3">
                  <div className="d-flex justify-content-between small text-secondary mb-1">
                    <span>Importando materias en tu cuenta...</span>
                    <span>{progreso.actual} / {progreso.total} ({porcentajeProgreso}%)</span>
                  </div>
                  <div className="progress" role="progressbar" aria-valuenow={porcentajeProgreso} aria-valuemin="0" aria-valuemax="100">
                    <div
                      className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                      style={{ width: `${porcentajeProgreso}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Resumen de Detección */}
              {materiasValidas.length > 0 && !procesando && (
                <div className="alert alert-success py-2 small mb-3 d-flex justify-content-between align-items-center">
                  <span>
                    ✅ Se detectaron <strong>{materiasValidas.length}</strong> materias válidas listas para importar.
                  </span>
                </div>
              )}

              {/* Alerta de errores en filas */}
              {errores.length > 0 && (
                <div className="alert alert-warning py-2 small mb-3">
                  <strong>⚠️ {errores.length} advertencia(s) en filas del archivo:</strong>
                  <ul className="mb-0 mt-1 ps-3">
                    {errores.slice(0, 5).map((e, idx) => (
                      <li key={idx}>
                        Fila {e.fila}: {e.mensaje}
                      </li>
                    ))}
                    {errores.length > 5 && (
                      <li>... y {errores.length - 5} observaciones adicionales.</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Vista previa de materias a importar */}
              {materiasValidas.length > 0 && (
                <div className="table-responsive border rounded mb-2" style={{ maxHeight: '220px' }}>
                  <table className="table table-sm table-striped align-middle mb-0 small">
                    <thead className="table-light sticky-top">
                      <tr>
                        <th>Materia</th>
                        <th className="text-center">Año</th>
                        <th className="text-center">Créditos</th>
                        <th className="text-center">Condición</th>
                        <th className="text-center">Promocionable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materiasValidas.slice(0, 10).map((m, idx) => (
                        <tr key={idx}>
                          <td className="fw-semibold">{m.nombre}</td>
                          <td className="text-center">{formatearNivelCarrera(m.año_dictado)}</td>
                          <td className="text-center">{m.creditos_totales} pts</td>
                          <td className="text-center">
                            <span className="badge text-bg-light border">{m.estado}</span>
                          </td>
                          <td className="text-center">{m.es_promocionable ? 'Sí' : 'No'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {materiasValidas.length > 10 && (
                    <div className="text-center py-1 text-muted small bg-light border-top">
                      Mostrando 10 de {materiasValidas.length} materias detectadas
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer bg-light">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onClose}
                disabled={procesando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary fw-semibold"
                onClick={handleConfirmarImportacion}
                disabled={procesando || materiasValidas.length === 0}
              >
                {procesando ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    Importando ({progreso.actual}/{progreso.total})...
                  </>
                ) : (
                  `Cargar ${materiasValidas.length} Materias`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export function ImportarPlanModal({ isOpen, onClose, onSuccess }) {
  if (!isOpen) return null

  return (
    <ImportarPlanModalContent
      onClose={onClose}
      onSuccess={onSuccess}
    />
  )
}
