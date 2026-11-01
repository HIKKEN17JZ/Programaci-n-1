import { Link } from 'react-router-dom'
import { obtenerSemaforo } from '../../utils/progress.js'
import { calcularEstadisticasMaterias } from '../../utils/materiaFilters.js'

function ProgresoDetallePanel({ avance = {}, materias = [], metricasExamenes = {} }) {
  const porcentaje = Number(avance.porcentaje) || 0
  const obtenidos = Number(avance.obtenidos) || 0
  const totales = Number(avance.totales) || 0
  const semaforo = obtenerSemaforo(porcentaje)
  const estadisticas = calcularEstadisticasMaterias(materias)

  // Mensaje orientativo de diagnóstico según el semáforo
  let mensajeDiagnostico = 'Estás iniciando el trayecto formativo. Concéntrate en afianzar las asignaturas del ciclo básico.'
  if (materias.length === 0) {
    mensajeDiagnostico = 'Actualmente no tienes materias cargadas en tu plan. ¡Carga tus asignaturas o importa tu plan de estudio para ver tu semáforo y porcentaje de avance!'
  } else if (porcentaje >= 75) {
    mensajeDiagnostico = '¡Excelente ritmo! Has superado el 75% del plan de estudios y te encuentras en el tramo final de la carrera.'
  } else if (porcentaje >= 40) {
    mensajeDiagnostico = '¡Muy buen avance! Te encuentras en la mitad de la carrera con ritmo sostenido de cursada.'
  }

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden interactive-panel">
      {/* Cabecera del panel */}
      <div className="card-header bg-white border-bottom py-3 px-4 d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div className="d-flex align-items-center gap-2">
          <span className="fs-3">📊</span>
          <div>
            <h3 className="h5 fw-bold mb-0 text-dark">Monitor de Avance y Semáforo Académico</h3>
            <span className="text-secondary small">Medición de créditos acumulados y estado de cursada</span>
          </div>
        </div>
        <span className={`badge ${semaforo.clase} fs-6 px-3 py-2 shadow-sm rounded-pill`}>
          {semaforo.emoji} {semaforo.grado}
        </span>
      </div>

      <div className="card-body p-4">
        {/* Barra de progreso grande */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-baseline mb-2">
            <span className="fw-bold text-dark fs-5">
              {porcentaje}% <span className="fs-6 fw-normal text-secondary">completado</span>
            </span>
            <span className="text-secondary small">
              <strong>{obtenidos}</strong> de <strong>{totales}</strong> créditos obtenidos
            </span>
          </div>
          <div className="progress shadow-sm" style={{ height: '24px', borderRadius: '12px' }}>
            <div
              className={`progress-bar progress-bar-striped progress-bar-animated ${semaforo.clase}`}
              role="progressbar"
              aria-valuenow={porcentaje}
              aria-valuemin={0}
              aria-valuemax={100}
              style={{ width: `${porcentaje}%`, fontWeight: '600', fontSize: '0.9rem' }}
            >
              {porcentaje > 7 ? `${porcentaje}%` : ''}
            </div>
          </div>
          <p className="text-secondary small mt-2 mb-0">
            {mensajeDiagnostico}
          </p>
        </div>

        {/* Tarjetas de métricas de avance */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-4">
            <div className="p-3 rounded-3 bg-light border text-center h-100">
              <span className="text-secondary small d-block mb-1">Créditos de Carrera</span>
              <span className="fs-4 fw-bold text-primary">{obtenidos}</span>
              <span className="text-muted small"> / {totales} pts</span>
            </div>
          </div>

          <div className="col-12 col-sm-4">
            <div className="p-3 rounded-3 bg-light border text-center h-100">
              <span className="text-secondary small d-block mb-1">Materias Aprobadas</span>
              <span className="fs-4 fw-bold text-success">{estadisticas.aprobadas}</span>
              <span className="text-muted small"> de {estadisticas.total} totales</span>
            </div>
          </div>

          <div className="col-12 col-sm-4">
            <div className="p-3 rounded-3 bg-light border text-center h-100">
              <span className="text-secondary small d-block mb-1">Promedio Calificaciones</span>
              <span className="fs-4 fw-bold text-dark">
                {metricasExamenes?.promedioConAplazos > 0 ? `${metricasExamenes.promedioConAplazos} pts` : 'Sin notas'}
              </span>
              <span className="text-muted small d-block">
                {metricasExamenes?.promedioSinAplazos > 0 ? `(${metricasExamenes.promedioSinAplazos} sin aplazos)` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Distribución por Condición de Cursada */}
        <div className="p-3 rounded-3 border bg-light-subtle mb-4">
          <h4 className="h6 fw-bold mb-3 text-dark">Distribución de Asignaturas por Condición</h4>
          <div className="d-flex flex-wrap gap-2">
            <span className="badge text-bg-success px-3 py-2 fs-6 fw-semibold">
              ✅ Aprobadas: {estadisticas.aprobadas}
            </span>
            <span className="badge text-bg-primary px-3 py-2 fs-6 fw-semibold">
              📖 Cursando: {estadisticas.cursando}
            </span>
            <span className="badge text-bg-warning px-3 py-2 fs-6 fw-semibold">
              📝 Regulares: {estadisticas.regulares}
            </span>
            <span className="badge text-bg-secondary px-3 py-2 fs-6 fw-semibold">
              ⏳ Pendientes: {estadisticas.pendientes}
            </span>
            <span className="badge text-bg-danger px-3 py-2 fs-6 fw-semibold">
              🔄 Recursando: {estadisticas.recursando}
            </span>
          </div>
        </div>

        {/* Botón de acción rápida */}
        <div className="d-flex justify-content-end pt-2 border-top">
          <Link to="/materias" className="btn btn-primary btn-sm fw-semibold">
            Ir al Plan de Estudio Completo →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProgresoDetallePanel
