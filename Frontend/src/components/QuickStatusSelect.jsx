import { useState } from 'react'
import { academicService } from '../services/academicService'
import { activityLogService } from '../services/activityLogService'

const OPCIONES_ESTADO = [
  { valor: 'PEN', etiqueta: '⏳ Pendiente', clase: 'border-secondary text-secondary' },
  { valor: 'CUR', etiqueta: '📖 Cursando', clase: 'border-primary text-primary' },
  { valor: 'REG', etiqueta: '📝 Regular', clase: 'border-warning text-warning' },
  { valor: 'APR', etiqueta: '✅ Aprobada', clase: 'border-success text-success' },
  { valor: 'REC', etiqueta: '🔄 Recursando', clase: 'border-danger text-danger' },
]

/**
 * Selector rápido de estado académico para materias.
 *
 * Permite cambiar la condición de cursada con 1 clic directamente desde la tabla,
 * persistiendo en la API mediante PATCH y actualizando el seguimiento sin abrir un modal.
 */
export function QuickStatusSelect({ materia, tieneExamenAprobado = false, onEstadoActualizado, disabled = false }) {
  const [guardando, setGuardando] = useState(false)
  const [estadoActual, setEstadoActual] = useState(materia.estado || 'PEN')
  const [avisoValidacion, setAvisoValidacion] = useState(null)

  const handleChange = async (e) => {
    const nuevoEstado = e.target.value
    if (nuevoEstado === estadoActual || guardando) return
    setAvisoValidacion(null)

    // Validación académica: no se puede marcar APR directamente sin un examen aprobado previo
    if (nuevoEstado === 'APR' && materia.estado !== 'APR' && !tieneExamenAprobado) {
      setAvisoValidacion(`Para marcar "${materia.nombre}" como Aprobada, primero debés registrar su mesa de examen aprobada (nota ≥ 6).`)
      setTimeout(() => setAvisoValidacion(null), 5000)
      return
    }

    const estadoAnterior = estadoActual
    setEstadoActual(nuevoEstado)
    setGuardando(true)

    try {
      const materiaActualizada = await academicService.patchMateria(materia.id, {
        estado: nuevoEstado,
      })
      activityLogService.registrarAccion({
        accion: 'ESTADO',
        entidad: 'MATERIA',
        detalle: `Estado de "${materia.nombre}" actualizado a ${nuevoEstado}`,
        idReferencia: materia.id,
      })
      onEstadoActualizado?.(materiaActualizada)
    } catch {
      // Rollback al estado anterior si la API rechaza la actualización
      setEstadoActual(estadoAnterior)
      setAvisoValidacion(`No se pudo actualizar el estado de "${materia.nombre}". Verificá tu conexión.`)
      setTimeout(() => setAvisoValidacion(null), 5000)
    } finally {
      setGuardando(false)
    }
  }

  const opcionSeleccionada = OPCIONES_ESTADO.find((o) => o.valor === estadoActual)
  const claseBordeColor = opcionSeleccionada?.clase || 'border-secondary text-secondary'

  return (
    <div className="d-inline-flex flex-column align-items-start" style={{ minWidth: '135px' }}>
      <div className="d-inline-flex align-items-center gap-1 w-100">
        <select
          className={`form-select form-select-sm fw-semibold shadow-none ${claseBordeColor}`}
          value={estadoActual}
          onChange={handleChange}
          disabled={disabled || guardando}
          aria-label={`Cambiar estado de ${materia.nombre}`}
          style={{ fontSize: '0.82rem', padding: '0.2rem 1.8rem 0.2rem 0.5rem' }}
        >
          {OPCIONES_ESTADO.map((opt) => {
            const bloqueadoApr = opt.valor === 'APR' && materia.estado !== 'APR' && !tieneExamenAprobado
            return (
              <option
                key={opt.valor}
                value={opt.valor}
                disabled={bloqueadoApr}
                className="text-dark fw-normal"
                title={bloqueadoApr ? 'Requiere registrar examen aprobado (≥ 6) en Mesas de Examen' : ''}
              >
                {bloqueadoApr ? '🔒 Aprobada (requiere examen ≥ 6)' : opt.etiqueta}
              </option>
            )
          })}
        </select>
        {guardando && (
          <span
            className="spinner-border spinner-border-sm text-primary flex-shrink-0"
            role="status"
            aria-hidden="true"
          />
        )}
      </div>
      {avisoValidacion && (
        <div className="alert alert-warning py-1 px-2 mt-1 mb-0 small text-wrap" style={{ fontSize: '0.72rem', maxWidth: '220px' }}>
          {avisoValidacion}
        </div>
      )}
    </div>
  )
}
