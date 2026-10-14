import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import { academicService } from '../services/academicService.js'
import StatCard from '../components/StatCard.jsx'
import ProgressCard from '../components/ProgressCard.jsx'
import PlanEstudioCard from '../components/PlanEstudioCard.jsx'
import MesasExamenCard from '../components/MesasExamenCard.jsx'

function Home() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [dashboard, setDashboard] = useState({
    materias: [],
    mesas: [],
    avance: { obtenidos: 0, totales: 0, porcentaje: 0 },
  })

  useEffect(() => {
    let isMounted = true

    academicService
      .getDashboardData()
      .then((data) => {
        if (isMounted) {
          setDashboard(data)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.message || 'Error al cargar los datos académicos del servidor.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [reloadKey])

  const handleRetry = () => {
    setLoading(true)
    setError('')
    setReloadKey((prev) => prev + 1)
  }

  const planNombre = user?.plan_estudio_nombre || 'Plataforma de Gestión de Carrera'

  return (
    <main className="flex-grow-1">
      <section className="bg-primary text-white text-center py-5">
        <div className="container">
          <span className="badge rounded-pill text-bg-light text-primary mb-3">
            Seguimiento académico
          </span>
          <h1 className="display-4 fw-bold">
            {user ? `¡Hola, ${user.username}!` : 'Plataforma de Gestión de Carrera'}
          </h1>
          <p className="lead mx-auto" style={{ maxWidth: '640px' }}>
            {planNombre}. Plan de estudio, mesas de examen y progreso académico en tiempo real.
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

      {error && (
        <div className="container mt-4">
          <div className="alert alert-danger d-flex align-items-center justify-content-between" role="alert">
            <div>
              <strong>Error:</strong> {error}
            </div>
            <button type="button" className="btn btn-outline-danger btn-sm" onClick={handleRetry}>
              Reintentar
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando datos académicos...</span>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          <section className="bg-light py-4">
            <div className="container">
              <div className="row text-center">
                <StatCard
                  valor={dashboard.materias.length}
                  etiqueta="Materias en tu plan"
                  targetId="plan-estudio"
                />
                <StatCard
                  valor={dashboard.mesas.length}
                  etiqueta="Mesas de examen"
                  targetId="mesas-examen"
                />
                <StatCard
                  valor={`${dashboard.avance.porcentaje}%`}
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
                  Tu historial académico conectado a la API de Django.
                </p>
              </div>

              <div className="row">
                <ProgressCard
                  obtenidos={dashboard.avance.obtenidos}
                  totales={dashboard.avance.totales}
                />
                <PlanEstudioCard materias={dashboard.materias} />
                <MesasExamenCard mesas={dashboard.mesas} />
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  )
}

export default Home
