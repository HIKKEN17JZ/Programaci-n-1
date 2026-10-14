import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  calcularPorcentaje,
  obtenerSemaforo,
  SEMAFORO,
  ESTADO_BADGE,
  obtenerEtiquetaEstado,
  calcularCreditos,
  formatearMesaExamen,
} from './progress.js'

describe('Utilidades de Progreso Académico', () => {
  describe('calcularPorcentaje', () => {
    it('calcula el porcentaje redondeado correctamente', () => {
      assert.strictEqual(calcularPorcentaje(40, 64), 63)
      assert.strictEqual(calcularPorcentaje(32, 64), 50)
      assert.strictEqual(calcularPorcentaje(64, 64), 100)
    })

    it('devuelve 0 si los créditos totales son 0 o negativos', () => {
      assert.strictEqual(calcularPorcentaje(10, 0), 0)
      assert.strictEqual(calcularPorcentaje(10, -5), 0)
    })

    it('devuelve 0 si algún valor no es numérico o es NaN', () => {
      assert.strictEqual(calcularPorcentaje('10', 50), 0)
      assert.strictEqual(calcularPorcentaje(10, '50'), 0)
      assert.strictEqual(calcularPorcentaje(NaN, 50), 0)
    })

    it('acota el resultado a un máximo de 100 si los obtenidos superan el total', () => {
      assert.strictEqual(calcularPorcentaje(80, 64), 100)
    })

    it('acota el resultado a un mínimo de 0 para valores negativos de obtenidos', () => {
      assert.strictEqual(calcularPorcentaje(-10, 64), 0)
    })
  })

  describe('obtenerSemaforo', () => {
    it('clasifica como Crítico / Inicio en el rango [0, 39]', () => {
      const semaforo0 = obtenerSemaforo(0)
      assert.strictEqual(semaforo0.grado, SEMAFORO.critico.grado)
      assert.strictEqual(semaforo0.emoji, '🔴')
      assert.strictEqual(semaforo0.clase, 'text-bg-danger')

      const semaforo39 = obtenerSemaforo(39)
      assert.strictEqual(semaforo39.grado, SEMAFORO.critico.grado)
    })

    it('clasifica como En Proceso en el rango [40, 74]', () => {
      const semaforo40 = obtenerSemaforo(40)
      assert.strictEqual(semaforo40.grado, SEMAFORO.enProceso.grado)
      assert.strictEqual(semaforo40.emoji, '🟡')
      assert.strictEqual(semaforo40.clase, 'text-bg-warning')

      const semaforo63 = obtenerSemaforo(63)
      assert.strictEqual(semaforo63.grado, SEMAFORO.enProceso.grado)

      const semaforo74 = obtenerSemaforo(74)
      assert.strictEqual(semaforo74.grado, SEMAFORO.enProceso.grado)
    })

    it('clasifica como Avanzado / Completado en el rango [75, 100]', () => {
      const semaforo75 = obtenerSemaforo(75)
      assert.strictEqual(semaforo75.grado, SEMAFORO.avanzado.grado)
      assert.strictEqual(semaforo75.emoji, '🟢')
      assert.strictEqual(semaforo75.clase, 'text-bg-success')

      const semaforo100 = obtenerSemaforo(100)
      assert.strictEqual(semaforo100.grado, SEMAFORO.avanzado.grado)
    })

    it('acota porcentajes fuera del rango 0-100 adecuadamente', () => {
      assert.strictEqual(obtenerSemaforo(-10).grado, SEMAFORO.critico.grado)
      assert.strictEqual(obtenerSemaforo(150).grado, SEMAFORO.avanzado.grado)
    })
  })

  describe('ESTADO_BADGE y obtenerEtiquetaEstado', () => {
    it('mapea correctamente códigos de estado de backend a etiquetas legibles', () => {
      assert.strictEqual(obtenerEtiquetaEstado('APR'), 'Aprobada')
      assert.strictEqual(obtenerEtiquetaEstado('REG'), 'Regular')
      assert.strictEqual(obtenerEtiquetaEstado('CUR'), 'Cursando')
      assert.strictEqual(obtenerEtiquetaEstado('PEN'), 'Pendiente')
      assert.strictEqual(obtenerEtiquetaEstado('REC'), 'Recursando')
      assert.strictEqual(obtenerEtiquetaEstado('Aprobada'), 'Aprobada')
      assert.strictEqual(obtenerEtiquetaEstado(null), 'Pendiente')
    })

    it('asigna clases Bootstrap consistentes a los estados de cursada', () => {
      assert.strictEqual(ESTADO_BADGE.APR, 'text-bg-success')
      assert.strictEqual(ESTADO_BADGE.Aprobada, 'text-bg-success')
      assert.strictEqual(ESTADO_BADGE.REG, 'text-bg-warning')
      assert.strictEqual(ESTADO_BADGE.CUR, 'text-bg-info')
      assert.strictEqual(ESTADO_BADGE.REC, 'text-bg-danger')
      assert.strictEqual(ESTADO_BADGE.Recursando, 'text-bg-danger')
    })
  })

  describe('calcularCreditos', () => {
    it('calcula créditos totales y obtenidos a partir de la lista de materias de la API', () => {
      const materias = [
        { nombre: 'Matemática I', creditos_totales: 8, estado: 'APR' },
        { nombre: 'Física I', creditos_totales: 6, estado: 'Aprobada' },
        { nombre: 'Programación I', creditos_totales: 10, estado: 'CUR' },
        { nombre: 'Química', creditos_totales: 4, estado: 'PEN' },
      ]
      const { obtenidos, totales } = calcularCreditos(materias)
      assert.strictEqual(totales, 28)
      assert.strictEqual(obtenidos, 14) // 8 + 6
    })

    it('devuelve ceros de forma segura ante listas vacías o nulas', () => {
      assert.deepStrictEqual(calcularCreditos([]), { obtenidos: 0, totales: 0 })
      assert.deepStrictEqual(calcularCreditos(null), { obtenidos: 0, totales: 0 })
    })
  })

  describe('formatearMesaExamen', () => {
    it('asocia el nombre de materia y formatea el llamado según el tipo de examen de la API', () => {
      const materias = [
        { id: 1, nombre: 'Programación I' },
        { id: 2, nombre: 'Base de Datos' },
      ]
      const examen = { id: 10, materia: 1, fecha: '2026-12-15', nota: 9, tipo: 'FIN' }

      const resultado = formatearMesaExamen(examen, materias)
      assert.strictEqual(resultado.materia, 'Programación I')
      assert.strictEqual(resultado.llamado, 'Examen Final')
      assert.strictEqual(resultado.nota, 9)
      assert.strictEqual(resultado.fecha, '2026-12-15')
    })

    it('resuelve adecuadamente si materia ya es texto o si no se encuentra en el mapa', () => {
      const examen = { id: 11, materia: 'Álgebra', fecha: '2026-11-20', nota: null, tipo: 'PAR' }
      const resultado = formatearMesaExamen(examen, [])
      assert.strictEqual(resultado.materia, 'Álgebra')
      assert.strictEqual(resultado.llamado, 'Examen Parcial')
      assert.strictEqual(resultado.nota, null)
    })
  })
})

