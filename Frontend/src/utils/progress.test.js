import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  calcularPorcentaje,
  obtenerSemaforo,
  SEMAFORO,
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
})
