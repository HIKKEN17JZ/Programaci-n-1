import {
  calcularPorcentaje,
  obtenerSemaforo,
  ESTADO_BADGE,
  obtenerEtiquetaEstado,
} from '../utils/progress.js'

const MATERIAS_MOCK = [
  { nombre: 'Análisis Matemático I', creditos: 8, estado: 'Aprobada' },
  { nombre: 'Álgebra I', creditos: 6, estado: 'Aprobada' },
  { nombre: 'Programación I', creditos: 8, estado: 'Regular' },
  { nombre: 'Inglés I', creditos: 4, estado: 'Cursando' },
]

const MESAS_MOCK = [
  { materia: 'Análisis Matemático I', llamado: 'Llamado Febrero', fecha: '15/02/2026', nota: 8 },
  { materia: 'Álgebra I', llamado: 'Llamado Marzo', fecha: '10/03/2026', nota: null },
  { materia: 'Programación I', llamado: 'Llamado Marzo', fecha: '18/03/2026', nota: null },
]

const AVANCE_MOCK = { creditosObtenidos: 40, creditosTotales: 64 }

function StatCard({ valor, etiqueta }) {
  return (
    <div className="col-12 col-md-4 mb-3">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body">
          <p className="fs-3 fw-bold text-primary mb-0">{valor}</p>
          <p className="text-secondary mb-0">{etiqueta}</p>
        </div>
      </div>
    </div>
  )
}

function ProgressCard({ obtenidos, totales }) {
  const porcentaje = calcularPorcentaje(obtenidos, totales)
  const semaforo = obtenerSemaforo(porcentaje)

  return (
    <div className="col-12 col-md-4 mb-4">
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

function PlanEstudioCard({ materias }) {
  return (
    <div className="col-12 col-md-4 mb-4">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">Plan de Estudio</h5>
          <ul className="list-unstyled mb-3">
            {materias.map((materia) => (
              <li key={materia.nombre} className="d-flex justify-content-between align-items-center mb-2">
                <span>{materia.nombre}</span>
                <span className={`badge ${ESTADO_BADGE[materia.estado] || 'text-bg-secondary'}`}>
                  {obtenerEtiquetaEstado(materia.estado)}
                </span>
              </li>
            ))}
          </ul>
          <a href="#" className="btn btn-outline-primary btn-sm mt-auto" onClick={(e) => e.preventDefault()}>
            Ver más
          </a>
        </div>
      </div>
    </div>
  )
}

function MesasExamenCard({ mesas }) {
  return (
    <div className="col-12 col-md-4 mb-4">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">Mesas de Examen</h5>
          <ul className="list-unstyled mb-3">
            {mesas.map((mesa) => (
              <li key={`${mesa.materia}-${mesa.fecha}`} className="d-flex justify-content-between align-items-center mb-2">
                <span>{mesa.materia} — {mesa.llamado}</span>
                <span className={`badge ${mesa.nota === null ? 'text-bg-secondary' : 'text-bg-success'}`}>
                  {mesa.nota === null ? 'Pendiente' : `Nota ${mesa.nota}`}
                </span>
              </li>
            ))}
          </ul>
          <a href="#" className="btn btn-outline-primary btn-sm mt-auto" onClick={(e) => e.preventDefault()}>
            Ver más
          </a>
        </div>
      </div>
    </div>
  )
}

function Home() {
  const porcentaje = calcularPorcentaje(AVANCE_MOCK.creditosObtenidos, AVANCE_MOCK.creditosTotales)

  return (
    <main className="flex-grow-1">
      <section className="bg-primary text-white text-center py-5">
        <div className="container">
          <span className="badge rounded-pill text-bg-light text-primary mb-3">
            Seguimiento académico
          </span>
          <h1 className="display-4 fw-bold">Plataforma de Gestión de Carrera</h1>
          <p className="lead mx-auto" style={{ maxWidth: '640px' }}>
            Plan de estudio, mesas de examen y progreso académico en un solo lugar.
          </p>
          <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
            <a href="#" className="btn btn-light btn-lg px-4" onClick={(e) => e.preventDefault()}>
              Comenzá ahora
            </a>
            <a href="#" className="btn btn-outline-light btn-lg px-4" onClick={(e) => e.preventDefault()}>
              Ver características
            </a>
          </div>
        </div>
      </section>

      <section className="bg-light py-4">
        <div className="container">
          <div className="row text-center">
            <StatCard valor={MATERIAS_MOCK.length} etiqueta="Materias en tu plan" />
            <StatCard valor={MESAS_MOCK.length} etiqueta="Mesas de examen" />
            <StatCard valor={`${porcentaje}%`} etiqueta="Avance de la carrera" />
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Gestioná tu carrera en un solo lugar</h2>
            <p className="text-secondary mx-auto" style={{ maxWidth: '560px' }}>
              Tu historial académico, organizado y al día.
            </p>
          </div>

          <div className="row">
            <ProgressCard
              obtenidos={AVANCE_MOCK.creditosObtenidos}
              totales={AVANCE_MOCK.creditosTotales}
            />
            <PlanEstudioCard materias={MATERIAS_MOCK} />
            <MesasExamenCard mesas={MESAS_MOCK} />
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home

