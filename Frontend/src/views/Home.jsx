import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import { academicService } from '../services/academicService.js'
import StatCard from '../components/StatCard.jsx'
import ProgresoDetallePanel from '../components/home/ProgresoDetallePanel.jsx'
import MateriasDetallePanel from '../components/home/MateriasDetallePanel.jsx'
import MesasDetallePanel from '../components/home/MesasDetallePanel.jsx'

function Home() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [seccionActiva, setSeccionActiva] = useState('progreso') // 'progreso' | 'materias' | 'examenes'
  const [dashboard, setDashboard] = useState({
    materias: [],
    mesas: [],
    avance: { obtenidos: 0, totales: 0, porcentaje: 0 },
    metricasExamenes: {
      total: 0,
      rendidos: 0,
      aprobados: 0,
      aplazados: 0,
      promedioConAplazos: 0,
      promedioSinAplazos: 0,
    },
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

  const handleCambiarSeccion = (seccion) => {
    setSeccionActiva(seccion)
    const elemento = document.getElementById('panel-interactivo')
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }

  const tieneMaterias = (dashboard?.materias || []).length > 0
  const carreraNombre = user?.plan_estudio_nombre?.trim()

  // Determinar encabezado contextual y motivacional del Hero Banner
  let heroBadge
  let heroTitulo
  let heroSubtitulo

  if (carreraNombre) {
    heroBadge = 'Plan de estudio activo'
    heroTitulo = carreraNombre
    heroSubtitulo = tieneMaterias
      ? `¿Futuro profesional en ${carreraNombre}? Aquí tienes tu avance, materias y mesas de examen en tiempo real.`
      : `Plan de estudio: ${carreraNombre}. Aún no tienes asignaturas cargadas. Carga tus materias para ver tu progreso.`
  } else if (!tieneMaterias) {
    heroBadge = 'Sin carrera activa'
    heroTitulo = 'Actualmente no estás cursando una carrera'
    heroSubtitulo = 'Aún no tienes asignaturas registradas. Carga tu plan de estudios o importa tus materias para iniciar tu seguimiento académico.'
  } else {
    heroBadge = 'Trayectoria en curso'
    heroTitulo = 'Tu Carrera Universitaria'
    heroSubtitulo = 'Seguimiento de materias, mesas de examen y avance de plan de estudio en tiempo real.'
  }

  return (
    <main className="flex-grow-1 pb-5">
      {/* Hero Banner */}
      <section className="bg-primary text-white text-center py-3 py-md-4 shadow-sm">
        <div className="container">
          <span className="badge rounded-pill text-bg-light text-primary mb-2">
            {heroBadge}
          </span>
          <h1 className="h3 fw-bold mb-1">
            {heroTitulo}
          </h1>
          <p className="small text-white-50 mx-auto mb-0" style={{ maxWidth: '580px' }}>
            {heroSubtitulo}
          </p>
        </div>
      </section>

      {/* Manejo de Error */}
      {error && (
        <div className="container mt-4">
          <div className="alert alert-danger d-flex align-items-center justify-content-between shadow-sm" role="alert">
            <div>
              <strong>Error:</strong> {error}
            </div>
            <button type="button" className="btn btn-outline-danger btn-sm" onClick={handleRetry}>
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Spinner de Carga */}
      {loading && (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando datos académicos...</span>
          </div>
        </div>
      )}

      {/* Contenido Interactivo */}
      {!loading && !error && (
        <>
          {/* Fila de 3 Notificadores / Selectores Interactivos */}
          <section className="bg-light py-4 border-bottom shadow-xs" id="panel-selector">
            <div className="container">
              <div className="row text-center">
                <StatCard
                  valor={`${dashboard.avance.porcentaje}%`}
                  etiqueta="Avance de la carrera"
                  icono="📊"
                  isActive={seccionActiva === 'progreso'}
                  onClick={() => handleCambiarSeccion('progreso')}
                  subetiqueta="Ver semáforo y créditos"
                />
                <StatCard
                  valor={dashboard.materias.length}
                  etiqueta="Materias en tu plan"
                  icono="📚"
                  isActive={seccionActiva === 'materias'}
                  onClick={() => handleCambiarSeccion('materias')}
                  subetiqueta="Ver catálogo y estado"
                />
                <StatCard
                  valor={dashboard.mesas.length}
                  etiqueta="Mesas de examen"
                  icono="📝"
                  isActive={seccionActiva === 'examenes'}
                  onClick={() => handleCambiarSeccion('examenes')}
                  subetiqueta="Ver notas y promedios"
                />
              </div>
            </div>
          </section>

          {/* Panel Desplegado según la sección seleccionada */}
          <section className="py-4" id="panel-interactivo">
            <div className="container">
              {seccionActiva === 'progreso' && (
                <ProgresoDetallePanel
                  avance={dashboard.avance}
                  materias={dashboard.materias}
                  metricasExamenes={dashboard.metricasExamenes}
                />
              )}

              {seccionActiva === 'materias' && (
                <MateriasDetallePanel materias={dashboard.materias} />
              )}

              {seccionActiva === 'examenes' && (
                <MesasDetallePanel
                  mesas={dashboard.mesas}
                  metricasExamenes={dashboard.metricasExamenes}
                />
              )}
            </div>
          </section>
        </>
      )}
    </main>
  )
}

export default Home
