/**
 * Utilidades de validación para formularios académicos (Clean Code & TDD - Bloque 4).
 */

export const ESTADOS_VALIDOS_MATERIA = ['PEN', 'CUR', 'REG', 'APR', 'REC']
export const TIPOS_VALIDOS_EXAMEN = ['FIN', 'PRO']

/**
 * Valida los campos ingresados para la creación o edición de una Materia.
 *
 * @param {object} datos - Datos ingresados en el formulario.
 * @returns {{ esValido: boolean, errores: Record<string, string> }}
 */
export function validarFormularioMateria(datos = {}) {
  const errores = {}

  // Validación de nombre
  const nombre = typeof datos.nombre === 'string' ? datos.nombre.trim() : ''
  if (!nombre) {
    errores.nombre = 'El nombre de la materia es obligatorio.'
  } else if (nombre.length > 150) {
    errores.nombre = 'El nombre no puede superar los 150 caracteres.'
  }

  // Validación de año (1 a 10 para nivel de carrera, o 1900 a 2100 para año calendario)
  const año = Number(datos.año_dictado)
  if (isNaN(año) || !((año >= 1 && año <= 10) || (año >= 1900 && año <= 2100))) {
    errores.año_dictado = 'El año de la materia debe ser el nivel de carrera (1 a 10) o un año válido.'
  }

  // Validación de créditos totales
  const creditos = Number(datos.creditos_totales)
  if (isNaN(creditos) || creditos < 0) {
    errores.creditos_totales = 'Los créditos académicos deben ser un valor positivo o cero.'
  }

  // Validación de estado de cursada
  if (!datos.estado || !ESTADOS_VALIDOS_MATERIA.includes(datos.estado)) {
    errores.estado = 'El estado de la materia seleccionado no es válido.'
  }

  return {
    esValido: Object.keys(errores).length === 0,
    errores,
  }
}

/**
 * Valida los campos ingresados para el registro o edición de una Mesa de Examen.
 *
 * @param {object} datos - Datos ingresados en el formulario.
 * @returns {{ esValido: boolean, errores: Record<string, string> }}
 */
export function validarFormularioExamen(datos = {}) {
  const errores = {}

  // Validación de materia asignada
  if (!datos.materia || String(datos.materia).trim() === '') {
    errores.materia = 'Debes seleccionar la materia a la que pertenece el examen.'
  }

  // Validación de fecha (formato YYYY-MM-DD y fecha real)
  const fechaStr = typeof datos.fecha === 'string' ? datos.fecha.trim() : ''
  if (!fechaStr) {
    errores.fecha = 'La fecha del examen es obligatoria.'
  } else {
    const fechaObj = new Date(fechaStr)
    if (isNaN(fechaObj.getTime())) {
      errores.fecha = 'La fecha ingresada tiene un formato inválido.'
    }
  }

  // Validación de tipo de examen (solo FIN y PRO permitidos en mesas de examen)
  if (!datos.tipo || !TIPOS_VALIDOS_EXAMEN.includes(datos.tipo)) {
    errores.tipo = 'El tipo de examen debe ser Final (FIN) o Promoción (PRO).'
  }

  // Validación de nota (opcional para final, obligatoria >= 6 para promoción)
  const tieneNota = datos.nota !== null && datos.nota !== undefined && String(datos.nota).trim() !== ''
  if (tieneNota) {
    const notaNum = Number(datos.nota)
    if (isNaN(notaNum) || notaNum < 0 || notaNum > 10) {
      errores.nota = 'La calificación debe ser una nota numérica entre 0 y 10.'
    } else if (datos.tipo === 'PRO' && notaNum < 6) {
      errores.nota = 'Una instancia de promoción requiere una calificación aprobatoria (mínimo 6). Si no alcanzaste la promoción, selecciona Examen Final.'
    }
  } else if (datos.tipo === 'PRO') {
    errores.nota = 'Debes ingresar una nota igual o superior a 6 para registrar una promoción.'
  }

  return {
    esValido: Object.keys(errores).length === 0,
    errores,
  }
}

/**
 * Filtra la lista de materias disponibles para ser seleccionadas en el registro de un examen.
 * Excluye aquellas materias que ya se encuentran aprobadas (APR), a menos que se esté
 * editando un examen que ya pertenecía a dicha materia.
 *
 * @param {Array} materias - Lista de materias del estudiante.
 * @param {object|null} [examenAEditar] - Examen en proceso de edición (opcional).
 * @returns {Array} Materias aptas para rendir examen.
 */
export function filtrarMateriasParaExamen(materias = [], examenAEditar = null) {
  if (!Array.isArray(materias)) return []
  const esEdicion = Boolean(examenAEditar)
  const materiaIdEdicion = examenAEditar && examenAEditar.materia !== undefined && examenAEditar.materia !== null
    ? String(examenAEditar.materia)
    : null

  return materias.filter((mat) => {
    if (!mat || mat.id === undefined || mat.id === null) return false
    // Si se está editando un examen existente, mantener su materia visible en el selector
    if (esEdicion && materiaIdEdicion !== null && String(mat.id) === materiaIdEdicion) {
      return true
    }
    // Para nuevos exámenes, excluir materias que ya estén aprobadas
    const esAprobada = mat.estado === 'APR' || mat.estado === 'Aprobada'
    return !esAprobada
  })
}
