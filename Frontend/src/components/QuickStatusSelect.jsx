import { useState } from 'react'
import { academicService } from '../services/academicService'

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
 * persistiendo en la API y actualizando el seguimiento sin abrir un modal.
 */
export function QuickStatusSelect({ materia, onEstadoActualizado, disabled = false }) {
  const [guardando, setGuardando] = useState(false)
  const [estadoActual, setEstadoActual] = useState(materia.estado || 'PEN')

  const handleChange = async (e) => {
    const nuevoEstado = e.target.value
    if (nuevoEstado === estadoActual || guardando) return

    const estadoAnterior = estadoActual
    setEstadoActual(nuevoEstado)
    setGuardando(true)

    try {
      const materiaActualizada = await academicService.updateMateria(materia.id, {
        nombre: materia.nombre,
        año_dictado: materia.año_dictado,
        creditos_totales: materia.creditos_totales,
        horas_semanales: materia.horas_semanales,
        es_promocionable: materia.es_promocionable,
        estado: nuevoEstado,
        facultad: materia.facultad,
      })
      onEstadoActualizado?.(materiaActualizada)
    } catch {
      // Rollback al estado anterior si la API rechaza la actualización
      setEstadoActual(estadoAnterior)
      alert(`No se pudo actualizar el estado de "${materia.nombre}". Verifica tu conexión.`)
    } finally {
      setGuardando(false)
    }
  }

  const opcionSeleccionada = OPCIONES_ESTADO.find((o) => o.valor === estadoActual)
  const claseBordeColor = opcionSeleccionada?.clase || 'border-secondary text-secondary'

  return (
    <div className="d-inline-flex align-items-center gap-1" style={{ minWidth: '135px' }}>
      <select
        className={`form-select form-select-sm fw-semibold shadow-none ${claseBordeColor}`}
        value={estadoActual}
        onChange={handleChange}
        disabled={disabled || guardando}
        aria-label={`Cambiar estado de ${materia.nombre}`}
        style={{ fontSize: '0.82rem', padding: '0.2rem 1.8rem 0.2rem 0.5rem' }}
      >
        {OPCIONES_ESTADO.map((opt) => (
          <option key={opt.valor} value={opt.valor} className="text-dark fw-normal">
            {opt.etiqueta}
          </option>
        ))}
      </select>
      {guardando && (
        <span
          className="spinner-border spinner-border-sm text-primary flex-shrink-0"
          role="status"
          aria-hidden="true"
        />
      )}
    </div>
  )
}
