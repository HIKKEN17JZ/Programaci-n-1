/**
 * Utilidades de cálculo y visualización de avance de carrera y semáforo.
 */

export const SEMAFORO = {
  critico: {
    rango: [0, 39],
    grado: 'Crítico / Inicio',
    emoji: '🔴',
    clase: 'text-bg-danger',
  },
  enProceso: {
    rango: [40, 74],
    grado: 'En Proceso',
    emoji: '🟡',
    clase: 'text-bg-warning',
  },
  avanzado: {
    rango: [75, 100],
    grado: 'Avanzado / Completado',
    emoji: '🟢',
    clase: 'text-bg-success',
  },
}

export const ESTADO_BADGE = {
  Aprobada: 'text-bg-success',
  Regular: 'text-bg-warning',
  Cursando: 'text-bg-info',
  Pendiente: 'text-bg-secondary',
}

/**
 * Calcula el porcentaje de avance acotado entre 0 y 100%.
 * Maneja de forma segura divisiones por cero y valores no numéricos.
 *
 * @param {number} obtenidos - Créditos aprobados.
 * @param {number} totales - Créditos totales requeridos.
 * @returns {number} Porcentaje entero entre 0 y 100.
 */
export function calcularPorcentaje(obtenidos, totales) {
  if (typeof obtenidos !== 'number' || typeof totales !== 'number') {
    return 0
  }
  if (totales <= 0 || Number.isNaN(obtenidos) || Number.isNaN(totales)) {
    return 0
  }
  const porcentaje = Math.round((obtenidos / totales) * 100)
  return Math.max(0, Math.min(100, porcentaje))
}

/**
 * Retorna la configuración del semáforo según el porcentaje de avance académico.
 *
 * @param {number} porcentaje - Porcentaje de avance (0 a 100).
 * @returns {object} Configuración del semáforo con rango, grado, emoji y clase CSS.
 */
export function obtenerSemaforo(porcentaje) {
  const p = Math.max(0, Math.min(100, Number(porcentaje) || 0))
  if (p <= SEMAFORO.critico.rango[1]) {
    return SEMAFORO.critico
  }
  if (p <= SEMAFORO.enProceso.rango[1]) {
    return SEMAFORO.enProceso
  }
  return SEMAFORO.avanzado
}
