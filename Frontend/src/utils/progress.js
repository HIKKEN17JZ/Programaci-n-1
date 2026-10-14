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
  Recursando: 'text-bg-danger',
  APR: 'text-bg-success',
  REG: 'text-bg-warning',
  CUR: 'text-bg-info',
  PEN: 'text-bg-secondary',
  REC: 'text-bg-danger',
}

export const ESTADO_LABEL = {
  APR: 'Aprobada',
  REG: 'Regular',
  CUR: 'Cursando',
  PEN: 'Pendiente',
  REC: 'Recursando',
}

/**
 * Normaliza y devuelve la etiqueta legible para un estado de materia.
 *
 * @param {string} estado - Código o texto de estado.
 * @returns {string} Etiqueta descriptiva en español.
 */
export function obtenerEtiquetaEstado(estado) {
  return ESTADO_LABEL[estado] || estado || 'Pendiente'
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

export const TIPO_EXAMEN_LABEL = {
  PAR: 'Examen Parcial',
  FIN: 'Examen Final',
  PRO: 'Promoción',
}

/**
 * Calcula créditos totales y obtenidos a partir de la lista de materias de la API.
 *
 * @param {Array} materias - Lista de materias.
 * @returns {{ obtenidos: number, totales: number }}
 */
export function calcularCreditos(materias = []) {
  if (!Array.isArray(materias) || materias.length === 0) {
    return { obtenidos: 0, totales: 0 }
  }

  return materias.reduce(
    (acc, m) => {
      const creditos = Number(m.creditos_totales ?? m.creditos) || 0
      acc.totales += creditos
      if (m.estado === 'APR' || m.estado === 'Aprobada') {
        acc.obtenidos += creditos
      }
      return acc
    },
    { obtenidos: 0, totales: 0 },
  )
}

/**
 * Normaliza un objeto de examen para la interfaz visual.
 *
 * @param {object} examen - Objeto de examen devuelto por la API.
 * @param {Array} materias - Lista de materias del usuario para resolver el nombre.
 * @returns {{ id: any, materia: string, llamado: string, fecha: string, nota: number|null }}
 */
export function formatearMesaExamen(examen = {}, materias = []) {
  let nombreMateria = examen.materia
  if (typeof examen.materia === 'number') {
    const encontrada = (materias || []).find((m) => m.id === examen.materia)
    nombreMateria = encontrada?.nombre || `Materia #${examen.materia}`
  }

  const llamado = TIPO_EXAMEN_LABEL[examen.tipo] || examen.llamado || 'Examen'

  return {
    id: examen.id,
    materia: nombreMateria || 'Materia sin especificar',
    llamado,
    fecha: examen.fecha,
    nota: examen.nota !== undefined ? examen.nota : null,
  }
}

