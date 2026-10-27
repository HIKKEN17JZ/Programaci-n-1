/**
 * Utilidades puras para búsqueda, filtrado y cálculo de estadísticas en listas de materias.
 */

/**
 * Filtra una colección de materias por texto, estado y año de dictado.
 *
 * @param {Array} materias - Lista de materias.
 * @param {object} filtros
 * @param {string} [filtros.busqueda] - Texto de búsqueda por nombre.
 * @param {string} [filtros.estado] - Estado específico ('APR', 'CUR', etc.) o 'TODOS'.
 * @param {number|string} [filtros.año] - Año de dictado o 'TODOS'.
 * @returns {Array} Materias filtradas.
 */
export function filtrarMaterias(materias = [], { busqueda = '', estado = 'TODOS', año = 'TODOS' } = {}) {
  if (!Array.isArray(materias)) {
    return []
  }

  const query = String(busqueda || '').trim().toLowerCase()
  const estadoFiltro = String(estado || 'TODOS').toUpperCase()
  const añoFiltro = año !== undefined && año !== null && String(año) !== 'TODOS' ? String(año) : null

  return materias.filter((materia) => {
    if (!materia) return false

    // Filtro por búsqueda de nombre
    if (query) {
      const nombre = String(materia.nombre || '').toLowerCase()
      if (!nombre.includes(query)) {
        return false
      }
    }

    // Filtro por estado
    if (estadoFiltro !== 'TODOS') {
      const estadoMat = String(materia.estado || '').toUpperCase()
      if (estadoMat !== estadoFiltro) {
        return false
      }
    }

    // Filtro por año de dictado
    if (añoFiltro !== null) {
      const añoMat = String(materia.año_dictado ?? materia.anio ?? '')
      if (añoMat !== añoFiltro) {
        return false
      }
    }

    return true
  })
}

/**
 * Extrae los años únicos de dictado presentes en la lista de materias, ordenados numéricamente.
 *
 * @param {Array} materias - Lista de materias.
 * @returns {Array<number>} Años disponibles ordenados.
 */
export function obtenerAñosDisponibles(materias = []) {
  if (!Array.isArray(materias) || materias.length === 0) {
    return []
  }

  const añosSet = new Set()
  for (const m of materias) {
    const año = Number(m?.año_dictado ?? m?.anio)
    if (!Number.isNaN(año) && año > 0) {
      añosSet.add(año)
    }
  }

  return Array.from(añosSet).sort((a, b) => a - b)
}

/**
 * Consolida métricas de conteo por estado y créditos sobre una colección de materias.
 *
 * @param {Array} materias - Lista de materias.
 * @returns {object} Resumen cuantitativo.
 */
export function calcularEstadisticasMaterias(materias = []) {
  const lista = Array.isArray(materias) ? materias : []

  return lista.reduce(
    (acc, m) => {
      acc.total += 1
      const creditos = Number(m?.creditos_totales ?? m?.creditos) || 0
      acc.creditosTotales += creditos

      const estado = String(m?.estado || '').toUpperCase()
      if (estado === 'APR' || estado === 'APROBADA') {
        acc.aprobadas += 1
        acc.creditosAprobados += creditos
      } else if (estado === 'CUR' || estado === 'CURSANDO') {
        acc.cursando += 1
      } else if (estado === 'REG' || estado === 'REGULAR') {
        acc.regulares += 1
      } else if (estado === 'PEN' || estado === 'PENDIENTE') {
        acc.pendientes += 1
      } else if (estado === 'REC' || estado === 'RECURSANDO') {
        acc.recursando += 1
      }
      return acc
    },
    {
      total: 0,
      aprobadas: 0,
      cursando: 0,
      regulares: 0,
      pendientes: 0,
      recursando: 0,
      creditosAprobados: 0,
      creditosTotales: 0,
    }
  )
}
