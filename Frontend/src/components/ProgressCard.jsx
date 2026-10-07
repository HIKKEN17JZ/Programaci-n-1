import { calcularPorcentaje, obtenerSemaforo } from '../utils/progress.js'

function ProgressCard({ obtenidos, totales }) {
  const porcentaje = calcularPorcentaje(obtenidos, totales)
  const semaforo = obtenerSemaforo(porcentaje)

  return (
    <div id="progreso-carrera" className="col-12 col-md-4 mb-4">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">Seguimiento de Progreso</h5>
          <p className="card-text">
            {obtenidos} de {totales} créditos
          </p>
          <div className="progress mb-3">
            <div
              className={`progress-bar ${semaforo.clase}`}
              role="progressbar"
              aria-valuenow={porcentaje}
              aria-valuemin={0}
              aria-valuemax={100}
              style={{ width: `${porcentaje}%` }}
            >
              {porcentaje}%
            </div>
          </div>
          <span className={`badge ${semaforo.clase} mb-3`}>
            {semaforo.emoji} {semaforo.grado}
          </span>
          <a href="#" className="btn btn-outline-primary btn-sm mt-auto" onClick={(e) => e.preventDefault()}>
            Ver más
          </a>
        </div>
      </div>
    </div>
  )
}

export default ProgressCard
