const SEMAFORO = {
  critico: { rango: [0, 39], grado: 'Crítico / Inicio', emoji: '🔴', clase: 'text-bg-danger' },
  enProceso: { rango: [40, 74], grado: 'En Proceso', emoji: '🟡', clase: 'text-bg-warning' },
  avanzado: { rango: [75, 100], grado: 'Avanzado / Completado', emoji: '🟢', clase: 'text-bg-success' },
}

function obtenerSemaforo(porcentaje) {
  const p = Math.max(0, Math.min(100, porcentaje))
  if (p <= SEMAFORO.critico.rango[1]) return SEMAFORO.critico
  if (p <= SEMAFORO.enProceso.rango[1]) return SEMAFORO.enProceso
  return SEMAFORO.avanzado
}

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

const ESTADO_BADGE = {
  Aprobada: 'text-bg-success',
  Regular: 'text-bg-warning',
  Cursando: 'text-bg-info',
  Pendiente: 'text-bg-secondary',
}

const avance = { creditosObtenidos: 40, creditosTotales: 64 }
const porcentaje = Math.round((avance.creditosObtenidos / avance.creditosTotales) * 100)
const semaforo = obtenerSemaforo(porcentaje)

function Home() {
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
            <a href="#" className="btn btn-light btn-lg px-4">Comenzá ahora</a>
            <a href="#" className="btn btn-outline-light btn-lg px-4">Ver características</a>
          </div>
        </div>
      </section>

      <section className="bg-light py-4">
        <div className="container">
          <div className="row text-center">
            <div className="col-12 col-md-4 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <p className="fs-3 fw-bold text-primary mb-0">{MATERIAS_MOCK.length}</p>
                  <p className="text-secondary mb-0">Materias en tu plan</p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <p className="fs-3 fw-bold text-primary mb-0">{MESAS_MOCK.length}</p>
                  <p className="text-secondary mb-0">Mesas de examen</p>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <p className="fs-3 fw-bold text-primary mb-0">{porcentaje}%</p>
                  <p className="text-secondary mb-0">Avance de la carrera</p>
                </div>
              </div>
            </div>
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
            <div className="col-12 col-md-4 mb-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">Seguimiento de Progreso</h5>
                  <p className="card-text">
                    {avance.creditosObtenidos} de {avance.creditosTotales} créditos
                  </p>
                  <div className="progress mb-3">
                    <div className={`progress-bar ${semaforo.clase}`} role="progressbar" aria-valuenow={porcentaje} aria-valuemin={0} aria-valuemax={100} style={{ width: `${porcentaje}%` }}>
                      {porcentaje}%
                    </div>
                  </div>
                  <span className={`badge ${semaforo.clase} mb-3`}>
                    {semaforo.emoji} {semaforo.grado}
                  </span>
                  <a href="#" className="btn btn-outline-primary btn-sm mt-auto">Ver más</a>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4 mb-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">Plan de Estudio</h5>
                  <ul className="list-unstyled mb-3">
                    {MATERIAS_MOCK.map((materia) => (
                      <li key={materia.nombre} className="d-flex justify-content-between align-items-center mb-2">
                        <span>{materia.nombre}</span>
                        <span className={`badge ${ESTADO_BADGE[materia.estado]}`}>{materia.estado}</span>
                      </li>
                    ))}
                  </ul>
                  <a href="#" className="btn btn-outline-primary btn-sm mt-auto">Ver más</a>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4 mb-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">Mesas de Examen</h5>
                  <ul className="list-unstyled mb-3">
                    {MESAS_MOCK.map((mesa) => (
                      <li key={`${mesa.materia}-${mesa.fecha}`} className="d-flex justify-content-between align-items-center mb-2">
                        <span>{mesa.materia} — {mesa.llamado}</span>
                        <span className={`badge ${mesa.nota === null ? 'text-bg-secondary' : 'text-bg-success'}`}>{mesa.nota === null ? 'Pendiente' : `Nota ${mesa.nota}`}</span>
                      </li>
                    ))}
                  </ul>
                  <a href="#" className="btn btn-outline-primary btn-sm mt-auto">Ver más</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home
