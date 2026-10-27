/**
 * Utilidades para importación, exportación y generación de plantillas CSV (TP9)
 *
 * Facilita la carga masiva del plan de estudio de un estudiante desde Excel/CSV
 * y la exportación de su historial académico para seguimiento personal.
 */

// BOM UTF-8 para garantizar que Microsoft Excel en español/Windows interprete acentos y tildes
export const BOM_UTF8 = '\uFEFF'

/**
 * Normaliza cualquier variante de estado (código o palabra en español) al código DRF.
 * @param {string|null|undefined} estado
 * @returns {'PEN'|'CUR'|'REG'|'APR'|'REC'}
 */
export function normalizarEstadoCSV(estado) {
  if (!estado || typeof estado !== 'string') return 'PEN'
  const limpio = estado.trim().toUpperCase()

  if (limpio === 'APR' || limpio.startsWith('APROB')) return 'APR'
  if (limpio === 'CUR' || limpio.startsWith('CURS')) return 'CUR'
  if (limpio === 'REG' || limpio.startsWith('REGUL')) return 'REG'
  if (limpio === 'REC' || limpio.startsWith('RECUR')) return 'REC'
  if (limpio === 'PEN' || limpio.startsWith('PEND')) return 'PEN'

  return 'PEN'
}

/**
 * Normaliza valores booleanos desde texto CSV.
 * @param {string|boolean|number} valor
 * @returns {boolean}
 */
export function normalizarBooleanoCSV(valor) {
  if (typeof valor === 'boolean') return valor
  if (typeof valor === 'number') return valor === 1
  if (!valor || typeof valor !== 'string') return false

  const limpio = valor.trim().toLowerCase()
  return limpio === 'si' || limpio === 'sí' || limpio === 'true' || limpio === '1'
}

/**
 * Normaliza el año de dictado o nivel de carrera.
 * Acepta tanto el nivel de la carrera (1° a 10° año) como años calendario (1900-2100).
 * @param {string|number} añoRaw
 * @returns {number|null}
 */
export function normalizarAñoDictadoCSV(añoRaw) {
  if (añoRaw === null || añoRaw === undefined || añoRaw === '') return null
  const num = parseInt(String(añoRaw).trim(), 10)
  if (isNaN(num)) return null

  // Nivel de carrera (1 a 10) o año calendario (1900 a 2100)
  if ((num >= 1 && num <= 10) || (num >= 1900 && num <= 2100)) {
    return num
  }

  return null
}

/**
 * Genera el contenido de una plantilla CSV lista para descargar y rellenar en Excel.
 * Utiliza los niveles de carrera correspondientes (1, 2, 3...) para catalogarlas directamente.
 * @returns {string}
 */
export function generarPlantillaCSV() {
  const encabezados = 'nombre,año_dictado,creditos_totales,horas_semanales,estado,es_promocionable'
  const ejemplos = [
    'Programación I,1,8,6,CUR,si',
    'Álgebra y Geometría Analítica,1,6,4,APR,no',
    'Matemática Discreta,1,6,4,PEN,si',
    'Sistemas Operativos,2,6,4,PEN,no',
    'Bases de Datos,2,8,6,PEN,si',
  ]

  return `${BOM_UTF8}${encabezados}\n${ejemplos.join('\n')}\n`
}

/**
 * Detecta si el separador principal del CSV es coma o punto y coma.
 * @param {string} linea
 * @returns {','|';'}
 */
function detectarDelimitador(linea) {
  const comas = (linea.match(/,/g) || []).length
  const puntosYComas = (linea.match(/;/g) || []).length
  return puntosYComas > comas ? ';' : ','
}

/**
 * Divide una línea CSV respetando comillas dobles (RFC 4180 simplificado).
 * @param {string} linea
 * @param {','|';'} delimitador
 * @returns {string[]}
 */
function dividirLineaCSV(linea, delimitador) {
  const resultado = []
  let actual = ''
  let dentroComillas = false

  for (let i = 0; i < linea.length; i++) {
    const char = linea[i]
    if (char === '"') {
      if (dentroComillas && linea[i + 1] === '"') {
        actual += '"'
        i++ // Escapar doble comilla
      } else {
        dentroComillas = !dentroComillas
      }
    } else if (char === delimitador && !dentroComillas) {
      resultado.push(actual.trim())
      actual = ''
    } else {
      actual += char
    }
  }
  resultado.push(actual.trim())
  return resultado
}

/**
 * Normaliza nombres de encabezado para ignorar mayúsculas, tildes y guiones.
 * @param {string} h
 * @returns {string}
 */
function normalizarEncabezado(h) {
  return h
    .toLowerCase()
    .replace(/[áàä]/g, 'a')
    .replace(/[éèë]/g, 'e')
    .replace(/[íìï]/g, 'i')
    .replace(/[óòö]/g, 'o')
    .replace(/[úùü]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9_]/g, '')
}

/**
 * Parsea el texto de un CSV de materias cargado por el usuario.
 * @param {string} csvText
 * @returns {{ materiasValidas: Array<object>, errores: Array<{ fila: number, mensaje: string }> }}
 */
export function parsearCSVMaterias(csvText) {
  const materiasValidas = []
  const errores = []

  if (!csvText || typeof csvText !== 'string') {
    return {
      materiasValidas: [],
      errores: [{ fila: 0, mensaje: 'El archivo CSV está vacío o no es válido.' }],
    }
  }

  // Limpiar BOM UTF-8 si está presente
  const textoLimpio = csvText.startsWith(BOM_UTF8) ? csvText.slice(1) : csvText
  const lineas = textoLimpio
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  if (lineas.length === 0) {
    return {
      materiasValidas: [],
      errores: [{ fila: 0, mensaje: 'El archivo no contiene filas con datos.' }],
    }
  }

  const delimitador = detectarDelimitador(lineas[0])
  const encabezadosOriginales = dividirLineaCSV(lineas[0], delimitador)
  const encabezados = encabezadosOriginales.map(normalizarEncabezado)

  // Validar que exista al menos la columna del nombre
  const idxNombre = encabezados.findIndex((h) => h === 'nombre' || h === 'materia' || h === 'asignatura')
  if (idxNombre === -1) {
    return {
      materiasValidas: [],
      errores: [
        {
          fila: 1,
          mensaje: 'El archivo CSV debe tener un encabezado con la columna "nombre" o "materia".',
        },
      ],
    }
  }

  const idxAño = encabezados.findIndex((h) => h.includes('an') || h.includes('anio') || h.includes('año') || h === 'nivel')
  const idxCreditos = encabezados.findIndex((h) => h.includes('credit') || h === 'pts' || h === 'puntos')
  const idxHoras = encabezados.findIndex((h) => h.includes('hora') || h.includes('hs'))
  const idxEstado = encabezados.findIndex((h) => h === 'estado' || h === 'condicion')
  const idxPromocionable = encabezados.findIndex((h) => h.includes('promoc') || h === 'promocion')

  for (let i = 1; i < lineas.length; i++) {
    const filaNum = i + 1
    const valores = dividirLineaCSV(lineas[i], delimitador)

    const nombre = valores[idxNombre]?.trim()
    if (!nombre) {
      errores.push({ fila: filaNum, mensaje: 'El nombre de la materia no puede estar vacío.' })
      continue
    }

    const añoRaw = idxAño !== -1 ? valores[idxAño] : String(new Date().getFullYear())
    const añoDictado = normalizarAñoDictadoCSV(añoRaw)
    if (!añoDictado) {
      errores.push({
        fila: filaNum,
        mensaje: `El año de dictado "${añoRaw}" debe ser un año calendario (1900-2100) o año de carrera (1 a 10).`,
      })
      continue
    }

    const creditosRaw = idxCreditos !== -1 ? valores[idxCreditos] : '4'
    const creditos = parseInt(creditosRaw, 10)
    if (isNaN(creditos) || creditos < 0) {
      errores.push({
        fila: filaNum,
        mensaje: `Los créditos "${creditosRaw}" deben ser un número positivo.`,
      })
      continue
    }

    const horasRaw = idxHoras !== -1 ? valores[idxHoras] : '4'
    const horas = parseInt(horasRaw, 10)
    const horasSemanales = isNaN(horas) || horas < 0 ? 4 : horas

    const estadoRaw = idxEstado !== -1 ? valores[idxEstado] : 'PEN'
    const estado = normalizarEstadoCSV(estadoRaw)

    const promoRaw = idxPromocionable !== -1 ? valores[idxPromocionable] : 'false'
    const esPromocionable = normalizarBooleanoCSV(promoRaw)

    materiasValidas.push({
      nombre,
      año_dictado: añoDictado,
      creditos_totales: creditos,
      horas_semanales: horasSemanales,
      estado,
      es_promocionable: esPromocionable,
    })
  }

  return { materiasValidas, errores }
}

/**
 * Escapa un campo para formato CSV según RFC 4180.
 * @param {any} valor
 * @returns {string}
 */
function escaparCampoCSV(valor) {
  if (valor === null || valor === undefined) return ''
  const str = String(valor)
  if (str.includes(',') || str.includes(';') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Exporta una lista de materias al formato estándar CSV descargable.
 * @param {Array<object>} materias
 * @returns {string}
 */
export function exportarMateriasACSV(materias = []) {
  const encabezados = [
    'nombre',
    'año_dictado',
    'creditos_totales',
    'horas_semanales',
    'estado',
    'es_promocionable',
  ]

  const filas = materias.map((m) =>
    [
      escaparCampoCSV(m.nombre),
      escaparCampoCSV(m.año_dictado ?? 1),
      escaparCampoCSV(m.creditos_totales ?? 0),
      escaparCampoCSV(m.horas_semanales ?? 0),
      escaparCampoCSV(m.estado ?? 'PEN'),
      escaparCampoCSV(m.es_promocionable ? 'si' : 'no'),
    ].join(',')
  )

  return `${BOM_UTF8}${encabezados.join(',')}\n${filas.join('\n')}\n`
}

/**
 * Dispara la descarga de un archivo de texto/CSV en el navegador.
 * Seguro ante navegadores sin soporte directo o entornos no DOM.
 * @param {string} contenido
 * @param {string} nombreArchivo
 */
export function descargarArchivoCSV(contenido, nombreArchivo = 'materias_plan_estudio.csv') {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.setAttribute('href', url)
  enlace.setAttribute('download', nombreArchivo)
  enlace.style.visibility = 'hidden'
  document.body.appendChild(enlace)
  enlace.click()
  document.body.removeChild(enlace)
  URL.revokeObjectURL(url)
}
