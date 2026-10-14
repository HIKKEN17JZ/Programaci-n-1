import { ESTADO_BADGE, obtenerEtiquetaEstado } from '../utils/progress.js'

function PlanEstudioCard({ materias }) {
  return (
    <div id="plan-estudio" className="col-12 col-md-4 mb-4">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">Plan de Estudio</h5>
          {(!materias || materias.length === 0) ? (
            <p className="text-secondary small fst-italic mb-3">No hay materias cargadas en tu plan.</p>
          ) : (
            <ul className="list-unstyled mb-3">
              {materias.map((materia) => (
                <li key={materia.id || materia.nombre} className="d-flex justify-content-between align-items-center mb-2">
                  <span className="me-2 text-break">{materia.nombre}</span>
                  <span className={`badge ${ESTADO_BADGE[materia.estado] || 'text-bg-secondary'} text-nowrap`}>
                    {obtenerEtiquetaEstado(materia.estado)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <a href="#" className="btn btn-outline-primary btn-sm mt-auto" onClick={(e) => e.preventDefault()}>
            Ver más
          </a>
        </div>
      </div>
    </div>
  )
}

export default PlanEstudioCard
