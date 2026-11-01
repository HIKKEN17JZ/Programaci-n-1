import { Link } from 'react-router-dom'
import {
  ESTADO_BADGE,
  obtenerEtiquetaEstado,
  formatearNivelCarrera,
} from '../../utils/progress.js'
import { calcularEstadisticasMaterias } from '../../utils/materiaFilters.js'

function MateriasDetallePanel({ materias = [] }) {
  const estadisticas = calcularEstadisticasMaterias(materias)
  const materiasMuestra = materias.slice(0, 6)

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden interactive-panel">
      {/* Cabecera del panel */}
      <div className="card-header bg-white border-bottom py-3 px-4 d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div className="d-flex align-items-center gap-2">
          <span className="fs-3">📚</span>
          <div>
            <h3 className="h5 fw-bold mb-0 text-dark">Plan de Estudio y Asignaturas</h3>
            <span className="text-secondary small">
              {materias.length === 0
                ? 'Sin materias registradas aún'
                : `Total: ${materias.length} materias registradas en tu gestor personal`}
            </span>
          </div>
        </div>
        <Link to="/materias" className="btn btn-outline-primary btn-sm fw-semibold">
          Administrar Plan Completo →
        </Link>
      </div>

      <div className="card-body p-4">
        {/* Métricas rápidas de asignaturas */}
        <div className="row g-2 mb-4 text-center">
          <div className="col-6 col-md-3">
            <div className="p-2 rounded-3 bg-light border">
              <span className="fs-5 fw-bold text-primary">{estadisticas.total}</span>
              <span className="text-secondary small d-block">Asignaturas</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-2 rounded-3 bg-light border">
              <span className="fs-5 fw-bold text-success">{estadisticas.aprobadas}</span>
              <span className="text-secondary small d-block">Aprobadas ({estadisticas.creditosAprobados} pts)</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-2 rounded-3 bg-light border">
              <span className="fs-5 fw-bold text-info">{estadisticas.cursando}</span>
              <span className="text-secondary small d-block">En Cursada</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-2 rounded-3 bg-light border">
              <span className="fs-5 fw-bold text-warning">{estadisticas.regulares}</span>
              <span className="text-secondary small d-block">Regulares</span>
            </div>
          </div>
        </div>

        {/* Listado de materias */}
        {materias.length === 0 ? (
          <div className="text-center py-5 px-3 bg-light rounded-3 border">
            <span className="display-5 text-muted mb-2 d-inline-block">📖</span>
            <h4 className="h6 fw-bold">Actualmente no tienes un plan cargado</h4>
            <p className="text-secondary small mx-auto mb-3" style={{ maxWidth: '460px' }}>
              ¡No te quedes atrás! Da el primer paso agregando tus materias o importando tu plan de estudio para poner en marcha tu seguimiento.
            </p>
            <Link to="/materias" className="btn btn-primary btn-sm fw-semibold">
              + Cargar mi Plan de Estudio
            </Link>
          </div>
        ) : (
          <div className="table-responsive border rounded-3 mb-3">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small">
                <tr>
                  <th>Materia</th>
                  <th className="text-center">Año / Nivel</th>
                  <th className="text-center">Créditos</th>
                  <th className="text-center">Condición</th>
                  <th className="text-end">Acción</th>
                </tr>
              </thead>
              <tbody>
                {materiasMuestra.map((m) => (
                  <tr key={m.id || m.nombre}>
                    <td>
                      <span className="fw-semibold text-dark">{m.nombre}</span>
                    </td>
                    <td className="text-center">
                      <span className="badge text-bg-light border text-dark">
                        {formatearNivelCarrera(m.año_dictado)}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="text-secondary">{m.creditos_totales || 0} pts</span>
                    </td>
                    <td className="text-center">
                      <span className={`badge ${ESTADO_BADGE[m.estado] || 'text-bg-secondary'}`}>
                        {obtenerEtiquetaEstado(m.estado)}
                      </span>
                    </td>
                    <td className="text-end">
                      <Link to={`/materias/${m.id}`} className="btn btn-outline-secondary btn-sm py-0 px-2" style={{ fontSize: '0.8rem' }}>
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {materias.length > 6 && (
              <div className="text-center py-2 bg-light border-top text-secondary small">
                Mostrando las primeras 6 de {materias.length} asignaturas.
              </div>
            )}
          </div>
        )}

        {/* Footer del panel */}
        <div className="d-flex justify-content-end pt-2 border-top">
          <Link to="/materias" className="btn btn-primary btn-sm fw-semibold">
            Ver Catálogo Completo con Buscador y Filtros ({materias.length}) →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default MateriasDetallePanel
