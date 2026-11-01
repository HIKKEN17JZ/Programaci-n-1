import { Link } from 'react-router-dom'

function MesasDetallePanel({ mesas = [], metricasExamenes = {} }) {
  const mesasMuestra = mesas.slice(0, 6)
  const promedioCon = Number(metricasExamenes?.promedioConAplazos) || 0
  const promedioSin = Number(metricasExamenes?.promedioSinAplazos) || 0
  const totalRendidos = Number(metricasExamenes?.rendidos) || 0
  const totalAprobados = Number(metricasExamenes?.aprobados) || 0

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden interactive-panel">
      {/* Cabecera del panel */}
      <div className="card-header bg-white border-bottom py-3 px-4 d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div className="d-flex align-items-center gap-2">
          <span className="fs-3">📝</span>
          <div>
            <h3 className="h5 fw-bold mb-0 text-dark">Mesas de Examen y Calificaciones</h3>
            <span className="text-secondary small">
              Historial de evaluaciones, llamados a final y promedios académicos
            </span>
          </div>
        </div>
        <Link to="/examenes" className="btn btn-outline-primary btn-sm fw-semibold">
          Administrar Exámenes →
        </Link>
      </div>

      <div className="card-body p-4">
        {/* Métricas rápidas de exámenes */}
        <div className="row g-2 mb-4 text-center">
          <div className="col-6 col-md-3">
            <div className="p-2 rounded-3 bg-light border">
              <span className="fs-5 fw-bold text-primary">{mesas.length}</span>
              <span className="text-secondary small d-block">Mesas / Evaluaciones</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-2 rounded-3 bg-light border">
              <span className="fs-5 fw-bold text-success">{totalAprobados}</span>
              <span className="text-secondary small d-block">Aprobados de {totalRendidos}</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-2 rounded-3 bg-light border">
              <span className="fs-5 fw-bold text-dark">
                {promedioCon > 0 ? `${promedioCon} pts` : '—'}
              </span>
              <span className="text-secondary small d-block">Promedio con aplazos</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="p-2 rounded-3 bg-light border">
              <span className="fs-5 fw-bold text-success">
                {promedioSin > 0 ? `${promedioSin} pts` : '—'}
              </span>
              <span className="text-secondary small d-block">Promedio sin aplazos</span>
            </div>
          </div>
        </div>

        {/* Listado de mesas */}
        {mesas.length === 0 ? (
          <div className="text-center py-5 px-3 bg-light rounded-3 border">
            <span className="display-5 text-muted mb-2 d-inline-block">📋</span>
            <h4 className="h6 fw-bold">No hay mesas de examen o evaluaciones registradas</h4>
            <p className="text-secondary small mx-auto mb-3" style={{ maxWidth: '460px' }}>
              Registra tus fechas de examen, parciales y finales para calcular automáticamente tus promedios.
            </p>
            <Link to="/examenes" className="btn btn-primary btn-sm fw-semibold">
              + Registrar Examen o Nota
            </Link>
          </div>
        ) : (
          <div className="table-responsive border rounded-3 mb-3">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small">
                <tr>
                  <th>Materia</th>
                  <th>Instancia / Llamado</th>
                  <th className="text-center">Calificación</th>
                </tr>
              </thead>
              <tbody>
                {mesasMuestra.map((m, idx) => (
                  <tr key={m.id || idx}>
                    <td>
                      <span className="fw-semibold text-dark">{m.materia}</span>
                    </td>
                    <td>
                      <span className="badge text-bg-light border text-secondary">
                        {m.llamado || 'Examen'}
                      </span>
                    </td>
                    <td className="text-center">
                      <span
                        className={`badge ${
                          m.nota === null
                            ? 'text-bg-secondary'
                            : Number(m.nota) >= 4
                            ? 'text-bg-success'
                            : 'text-bg-danger'
                        } fs-6 px-3 py-1`}
                      >
                        {m.nota === null ? 'Pendiente' : `Nota ${m.nota}`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {mesas.length > 6 && (
              <div className="text-center py-2 bg-light border-top text-secondary small">
                Mostrando las 6 evaluaciones más recientes de {mesas.length}.
              </div>
            )}
          </div>
        )}

        {/* Footer del panel */}
        <div className="d-flex justify-content-end pt-2 border-top">
          <Link to="/examenes" className="btn btn-primary btn-sm fw-semibold">
            Ver todas las actas y calificaciones ({mesas.length}) →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default MesasDetallePanel
