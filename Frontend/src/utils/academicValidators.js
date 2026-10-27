/**
 * Utilidades de validación para formularios académicos (Clean Code & TDD - Bloque 4).
 */

export const ESTADOS_VALIDOS_MATERIA = ['PEN', 'CUR', 'REG', 'APR', 'REC']
export const TIPOS_VALIDOS_EXAMEN = ['PAR', 'FIN', 'PRO']

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

  // Validación de año de dictado (1900 a 2100 según serializer de Django)
  const año = Number(datos.año_dictado)
  if (isNaN(año) || año < 1900 || año > 2100) {
    errores.año_dictado = 'El año de cursada debe ser un año válido entre 1900 y 2100.'
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

  // Validación de tipo de examen
  if (!datos.tipo || !TIPOS_VALIDOS_EXAMEN.includes(datos.tipo)) {
    errores.tipo = 'El tipo de examen debe ser Parcial (PAR), Final (FIN) o Promoción (PRO).'
  }

  // Validación de nota (opcional, entre 0 y 10 si se provee)
  if (datos.nota !== null && datos.nota !== undefined && String(datos.nota).trim() !== '') {
    const notaNum = Number(datos.nota)
    if (isNaN(notaNum) || notaNum < 0 || notaNum > 10) {
      errores.nota = 'La calificación debe ser una nota numérica entre 0 y 10.'
    }
  }

  return {
    esValido: Object.keys(errores).length === 0,
    errores,
  }
}
