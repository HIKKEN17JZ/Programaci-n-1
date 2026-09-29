import { calcularPorcentaje } from '../utils/progress.js'
import { MATERIAS_MOCK, MESAS_MOCK, AVANCE_MOCK } from '../data/academicMock.js'
import StatCard from '../components/StatCard.jsx'
import ProgressCard from '../components/ProgressCard.jsx'
import PlanEstudioCard from '../components/PlanEstudioCard.jsx'
import MesasExamenCard from '../components/MesasExamenCard.jsx'

function Home() {
  const porcentaje = calcularPorcentaje(
    AVANCE_MOCK.creditosObtenidos,
    AVANCE_MOCK.creditosTotales,
  )

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
            <a href="#progreso-carrera" className="btn btn-light btn-lg px-4">
              Comenzá ahora
            </a>
            <a href="#plan-estudio" className="btn btn-outline-light btn-lg px-4">
              Ver características
            </a>
          </div>
        </div>
      </section>

      <section className="bg-light py-4">
        <div className="container">
          <div className="row text-center">
            <StatCard
              valor={MATERIAS_MOCK.length}
              etiqueta="Materias en tu plan"
              targetId="plan-estudio"
            />
            <StatCard
              valor={MESAS_MOCK.length}
              etiqueta="Mesas de examen"
              targetId="mesas-examen"
            />
            <StatCard
              valor={`${porcentaje}%`}
              etiqueta="Avance de la carrera"
              targetId="progreso-carrera"
            />
          </div>
        </div>
      </section>

      <section className="py-5" id="caracteristicas">
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
