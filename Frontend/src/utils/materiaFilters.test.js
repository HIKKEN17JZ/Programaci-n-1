import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  filtrarMaterias,
  obtenerAñosDisponibles,
  calcularEstadisticasMaterias,
} from './materiaFilters.js'

describe('Utilidades de Filtrado y Búsqueda de Materias (TDD - TP9)', () => {
  const materias = [
    { id: 1, nombre: 'Programación I', año_dictado: 1, creditos_totales: 8, estado: 'APR' },
    { id: 2, nombre: 'Álgebra Lineal', año_dictado: 1, creditos_totales: 6, estado: 'REG' },
    { id: 3, nombre: 'Programación II', año_dictado: 2, creditos_totales: 10, estado: 'CUR' },
    { id: 4, nombre: 'Base de Datos', año_dictado: 2, creditos_totales: 8, estado: 'PEN' },
    { id: 5, nombre: 'Física I', año_dictado: 1, creditos_totales: 6, estado: 'REC' },
  ]

  describe('filtrarMaterias', () => {
    it('devuelve todas las materias si no hay filtros activos', () => {
      const res = filtrarMaterias(materias, {})
      assert.strictEqual(res.length, 5)
    })

    it('filtra por búsqueda de texto insensible a mayúsculas y espacios', () => {
      const res = filtrarMaterias(materias, { busqueda: '  programación  ' })
      assert.strictEqual(res.length, 2)
      assert.strictEqual(res[0].nombre, 'Programación I')
      assert.strictEqual(res[1].nombre, 'Programación II')
    })

    it('filtra por estado de materia específico', () => {
      const resApr = filtrarMaterias(materias, { estado: 'APR' })
      assert.strictEqual(resApr.length, 1)
      assert.strictEqual(resApr[0].nombre, 'Programación I')

      const resCur = filtrarMaterias(materias, { estado: 'CUR' })
      assert.strictEqual(resCur.length, 1)
      assert.strictEqual(resCur[0].nombre, 'Programación II')
    })

    it('ignora filtro de estado si es "TODOS" o vacío', () => {
      const res = filtrarMaterias(materias, { estado: 'TODOS' })
      assert.strictEqual(res.length, 5)
    })

    it('filtra por año de cursada', () => {
      const resAño1 = filtrarMaterias(materias, { año: 1 })
      assert.strictEqual(resAño1.length, 3)

      const resAño2 = filtrarMaterias(materias, { año: '2' })
      assert.strictEqual(resAño2.length, 2)
    })

    it('combina múltiples filtros simultáneos (texto + año + estado)', () => {
      const res = filtrarMaterias(materias, {
        busqueda: 'prog',
        año: 2,
        estado: 'CUR',
      })
      assert.strictEqual(res.length, 1)
      assert.strictEqual(res[0].nombre, 'Programación II')
    })

    it('maneja listas nulas o indefinidas de forma segura', () => {
      assert.deepStrictEqual(filtrarMaterias(null, {}), [])
      assert.deepStrictEqual(filtrarMaterias(undefined, {}), [])
    })
  })

  describe('obtenerAñosDisponibles', () => {
    it('extrae y ordena los años únicos disponibles', () => {
      const años = obtenerAñosDisponibles(materias)
      assert.deepStrictEqual(años, [1, 2])
    })

    it('devuelve array vacío de forma segura ante listas vacías o nulas', () => {
      assert.deepStrictEqual(obtenerAñosDisponibles([]), [])
      assert.deepStrictEqual(obtenerAñosDisponibles(null), [])
    })
  })

  describe('calcularEstadisticasMaterias', () => {
    it('calcula totales por cada estado y suma de créditos', () => {
      const stats = calcularEstadisticasMaterias(materias)
      assert.strictEqual(stats.total, 5)
      assert.strictEqual(stats.aprobadas, 1)
      assert.strictEqual(stats.cursando, 1)
      assert.strictEqual(stats.regulares, 1)
      assert.strictEqual(stats.pendientes, 1)
      assert.strictEqual(stats.recursando, 1)
      assert.strictEqual(stats.creditosAprobados, 8)
      assert.strictEqual(stats.creditosTotales, 38)
    })
  })
})
