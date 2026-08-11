import { useState } from 'react'
import './App.css'

const SEMAFORO = {
  critico: { rango: [0, 39], grado: 'Crítico / Inicio', emoji: '🔴' },
  enProceso: { rango: [40, 74], grado: 'En Proceso', emoji: '🟡' },
  avanzado: { rango: [75, 100], grado: 'Avanzado / Completado', emoji: '🟢' },
}

function obtenerSemaforo(porcentaje) {
  if (porcentaje <= SEMAFORO.critico.rango[1]) return SEMAFORO.critico
  if (porcentaje <= SEMAFORO.enProceso.rango[1]) return SEMAFORO.enProceso
  return SEMAFORO.avanzado
}

const MATERIAS_MOCK = [
  { nombre: 'Análisis Matemático I', anio: 1, creditos: 8, estado: 'Aprobada' },
  { nombre: 'Álgebra I', anio: 1, creditos: 6, estado: 'Aprobada' },
  { nombre: 'Programación I', anio: 1, creditos: 8, estado: 'Regular' },
  { nombre: 'Inglés I', anio: 1, creditos: 4, estado: 'Cursando' },
  { nombre: 'Análisis Matemático II', anio: 2, creditos: 8, estado: 'Regular' },
  { nombre: 'Álgebra II', anio: 2, creditos: 6, estado: 'Pendiente' },
  { nombre: 'Física I', anio: 2, creditos: 6, estado: 'Cursando' },
]

const MESAS_MOCK = [
  { materia: 'Análisis Matemático I', llamado: 'Llamado de Febrero', fecha: '15/02/2026', nota: 8, intentos: 1 },
  { materia: 'Álgebra I', llamado: 'Llamado de Marzo', fecha: '10/03/2026', nota: null, intentos: 0 },
  { materia: 'Programación I', llamado: 'Llamado de Marzo', fecha: '18/03/2026', nota: null, intentos: 0 },
  { materia: 'Análisis Matemático II', llamado: 'Llamado de Junio', fecha: '22/06/2026', nota: 6, intentos: 2 },
]

const PERFILES = {
  estudiante: 'Estudiante',
  personal: 'Personal',
}

function App() {
  const [seccion, setSeccion] = useState('login')
  const [abierta, setAbierta] = useState('resumen')
  const [tipoUsuario, setTipoUsuario] = useState(PERFILES.estudiante)
  const [facultad, setFacultad] = useState('Facultad de Ingeniería')
  const [usuario, setUsuario] = useState('')

  const avance = { creditosObtenidos: 40, creditosTotales: 64 }
  const porcentaje = Math.round((avance.creditosObtenidos / avance.creditosTotales) * 100)
  const semaforo = obtenerSemaforo(porcentaje)

  const creditosPorAnio = {}
  MATERIAS_MOCK.forEach((materia) => {
    creditosPorAnio[materia.anio] = (creditosPorAnio[materia.anio] || 0) + materia.creditos
  })

  const cerrarSesion = () => {
    setSeccion('login')
    setUsuario('')
  }

  if (seccion === 'login') {
    return (
      <main className="auth">
        <section className="auth__card">
          <h1 className="auth__titulo">Plataforma de Gestión de Carrera</h1>
          <p className="auth__subtitulo">Historial académico y seguimiento de tu plan de estudio.</p>
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault()
              setUsuario(usuario || 'Estudiante')
              setSeccion('dashboard')
            }}
          >
            <label className="form__campo">
              <span className="form__etiqueta">Email</span>
              <input
                type="email"
                className="form__input"
                placeholder="tu@email.com"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
              />
            </label>
            <label className="form__campo">
              <span className="form__etiqueta">Contraseña</span>
              <input type="password" className="form__input" placeholder="••••••••" />
            </label>
            <button type="submit" className="btn btn--primario">
              Ingresar
            </button>
          </form>
          <p className="auth__nota">
            ¿No tenés cuenta? <a href="#" onClick={(e) => e.preventDefault()}>Registrate</a> (modo de demostración).
          </p>
        </section>
      </main>
    )
  }

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1 className="topbar__titulo">Plataforma de Gestión de Carrera</h1>
          <p className="topbar__subtitulo">
            Hola, {usuario || 'Estudiante'} · {PERFILES[tipoUsuario]}
          </p>
        </div>
        <button type="button" className="btn btn--secundario" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <nav className="nav">
            <button
              type="button"
              className={`nav__item ${abierta === 'resumen' ? 'nav__item--activo' : ''}`}
              onClick={() => setAbierta('resumen')}
            >
              Resumen de Progreso
            </button>
            <button
              type="button"
              className={`nav__item ${abierta === 'plan' ? 'nav__item--activo' : ''}`}
              onClick={() => setAbierta('plan')}
            >
              Plan de Estudio
            </button>
            <button
              type="button"
              className={`nav__item ${abierta === 'mesas' ? 'nav__item--activo' : ''}`}
              onClick={() => setAbierta('mesas')}
            >
              Mesas de Examen
            </button>
            <button
              type="button"
              className={`nav__item ${abierta === 'perfil' ? 'nav__item--activo' : ''}`}
              onClick={() => setAbierta('perfil')}
            >
              Perfil / Facultad
            </button>
          </nav>
        </aside>

        <main className="contenido">
          {abierta === 'resumen' && (
            <section className="tarjeta">
              <h2 className="tarjeta__titulo">Resumen de Progreso</h2>
              <p className="tarjeta__texto">
                Avance anual: {avance.creditosObtenidos} de {avance.creditosTotales} créditos ({porcentaje}%).
              </p>
              <div
                className="barra"
                role="progressbar"
                aria-valuenow={porcentaje}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <span className="barra__relleno" style={{ width: `${porcentaje}%` }} />
              </div>
              <p className={`semaforo semaforo--${semaforo === SEMAFORO.critico ? 'rojo' : semaforo === SEMAFORO.enProceso ? 'amarillo' : 'verde'}`}>
                {semaforo.emoji} {semaforo.grado} ({semaforo.rango[0]}% - {semaforo.rango[1]}%)
              </p>
            </section>
          )}

          {abierta === 'plan' && (
            <section className="tarjeta">
              <h2 className="tarjeta__titulo">Plan de Estudio</h2>
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Materia</th>
                    <th>Año</th>
                    <th>Créditos</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {MATERIAS_MOCK.map((materia) => (
                    <tr key={materia.nombre}>
                      <td>{materia.nombre}</td>
                      <td>Año {materia.anio}</td>
                      <td>{materia.creditos}</td>
                      <td>
                        <span className={`estado estado--${materia.estado.toLowerCase()}`}>
                          {materia.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="tarjeta__texto">
                Créditos por año: {Object.entries(creditosPorAnio).map(([anio, creditos]) => (
                  <span key={anio}>
                    {' '}Año {anio}: <strong>{creditos}</strong>
                  </span>
                ))}
              </p>
            </section>
          )}

          {abierta === 'mesas' && (
            <section className="tarjeta">
              <h2 className="tarjeta__titulo">Mesas de Examen</h2>
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Materia</th>
                    <th>Llamado</th>
                    <th>Fecha</th>
                    <th>Nota</th>
                    <th>Intentos</th>
                  </tr>
                </thead>
                <tbody>
                  {MESAS_MOCK.map((mesa) => (
                    <tr key={`${mesa.materia}-${mesa.fecha}`}>
                      <td>{mesa.materia}</td>
                      <td>{mesa.llamado}</td>
                      <td>{mesa.fecha}</td>
                      <td>{mesa.nota === null ? '—' : mesa.nota}</td>
                      <td>{mesa.intentos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {abierta === 'perfil' && (
            <section className="tarjeta">
              <h2 className="tarjeta__titulo">Perfil / Facultad</h2>
              <div className="form__fila">
                <label className="form__campo">
                  <span className="form__etiqueta">Vinculación</span>
                  <select
                    className="form__input"
                    value={tipoUsuario}
                    onChange={(e) => setTipoUsuario(e.target.value)}
                  >
                    <option value={PERFILES.estudiante}>Estudiante</option>
                    <option value={PERFILES.personal}>Personal</option>
                  </select>
                </label>
                <label className="form__campo">
                  <span className="form__etiqueta">Facultad</span>
                  <select
                    className="form__input"
                    value={facultad}
                    onChange={(e) => setFacultad(e.target.value)}
                  >
                    <option>Facultad de Ingeniería</option>
                    <option>Facultad de Ciencias</option>
                    <option>Facultad de Económicas</option>
                  </select>
                </label>
              </div>
              <p className="tarjeta__texto">
                Vinculado como <strong>{PERFILES[tipoUsuario]}</strong> de <strong>{facultad}</strong>.
              </p>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

export default App