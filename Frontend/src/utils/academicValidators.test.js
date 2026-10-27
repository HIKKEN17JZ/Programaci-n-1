import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  validarFormularioMateria,
  validarFormularioExamen,
} from './academicValidators.js'

describe('Validadores de Formularios Académicos (TDD - TP9 - Bloque 4)', () => {
  describe('validarFormularioMateria', () => {
    const materiaValida = {
      nombre: 'Programación Orientada a Objetos',
      año_dictado: 2026,
      creditos_totales: 8,
      estado: 'CUR',
      es_promocionable: true,
    }

    it('valida exitosamente un payload de materia correcto', () => {
      const res = validarFormularioMateria(materiaValida)
      assert.strictEqual(res.esValido, true)
      assert.deepStrictEqual(res.errores, {})
    })

    it('rechaza nombres vacíos, nulos o solo con espacios', () => {
      const resVacio = validarFormularioMateria({ ...materiaValida, nombre: '' })
      assert.strictEqual(resVacio.esValido, false)
      assert.match(resVacio.errores.nombre, /nombre/i)

      const resEspacios = validarFormularioMateria({ ...materiaValida, nombre: '   ' })
      assert.strictEqual(resEspacios.esValido, false)
    })

    it('rechaza nombres excesivamente largos (> 150 caracteres)', () => {
      const nombreLargo = 'A'.repeat(151)
      const res = validarFormularioMateria({ ...materiaValida, nombre: nombreLargo })
      assert.strictEqual(res.esValido, false)
      assert.match(res.errores.nombre, /150 caracteres/i)
    })

    it('rechaza años de dictado fuera del rango [1900, 2100] o no numéricos', () => {
      const resMenor = validarFormularioMateria({ ...materiaValida, año_dictado: 1899 })
      assert.strictEqual(resMenor.esValido, false)
      assert.match(resMenor.errores.año_dictado, /año/i)

      const resMayor = validarFormularioMateria({ ...materiaValida, año_dictado: 2101 })
      assert.strictEqual(resMayor.esValido, false)

      const resNaN = validarFormularioMateria({ ...materiaValida, año_dictado: 'no-num' })
      assert.strictEqual(resNaN.esValido, false)
    })

    it('rechaza créditos totales negativos o inválidos', () => {
      const resNegativo = validarFormularioMateria({ ...materiaValida, creditos_totales: -1 })
      assert.strictEqual(resNegativo.esValido, false)
      assert.match(resNegativo.errores.creditos_totales, /créditos/i)
    })

    it('rechaza estados de materia que no pertenezcan a los permitidos', () => {
      const resInvalido = validarFormularioMateria({ ...materiaValida, estado: 'DESCONOCIDO' })
      assert.strictEqual(resInvalido.esValido, false)
      assert.match(resInvalido.errores.estado, /estado/i)
    })
  })

  describe('validarFormularioExamen', () => {
    const examenValido = {
      materia: 1,
      fecha: '2026-11-20',
      tipo: 'PAR',
      nota: '8.50',
    }

    it('valida exitosamente un examen completo con nota', () => {
      const res = validarFormularioExamen(examenValido)
      assert.strictEqual(res.esValido, true)
      assert.deepStrictEqual(res.errores, {})
    })

    it('permite exámenes sin nota (nota pendiente / acta abierta)', () => {
      const resSinNota = validarFormularioExamen({ ...examenValido, nota: '' })
      assert.strictEqual(resSinNota.esValido, true)

      const resNull = validarFormularioExamen({ ...examenValido, nota: null })
      assert.strictEqual(resNull.esValido, true)
    })

    it('rechaza si falta la materia asociada', () => {
      const resSinMateria = validarFormularioExamen({ ...examenValido, materia: '' })
      assert.strictEqual(resSinMateria.esValido, false)
      assert.match(resSinMateria.errores.materia, /materia/i)
    })

    it('rechaza fechas vacías o con formato inválido', () => {
      const resFechaVacia = validarFormularioExamen({ ...examenValido, fecha: '' })
      assert.strictEqual(resFechaVacia.esValido, false)
      assert.match(resFechaVacia.errores.fecha, /fecha/i)

      const resFechaInvalida = validarFormularioExamen({ ...examenValido, fecha: 'fecha-erronea' })
      assert.strictEqual(resFechaInvalida.esValido, false)
    })

    it('rechaza tipos de examen que no correspondan a PAR, FIN o PRO', () => {
      const resTipoInvalido = validarFormularioExamen({ ...examenValido, tipo: 'OTRO' })
      assert.strictEqual(resTipoInvalido.esValido, false)
      assert.match(resTipoInvalido.errores.tipo, /tipo/i)
    })

    it('rechaza notas numéricas fuera del rango permitido [0, 10]', () => {
      const resNegativa = validarFormularioExamen({ ...examenValido, nota: -0.5 })
      assert.strictEqual(resNegativa.esValido, false)
      assert.match(resNegativa.errores.nota, /nota/i)

      const resExcedida = validarFormularioExamen({ ...examenValido, nota: 10.5 })
      assert.strictEqual(resExcedida.esValido, false)
      assert.match(resExcedida.errores.nota, /nota/i)
    })
  })
})
