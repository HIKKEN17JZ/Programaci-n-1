import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  validarFormularioMateria,
  validarFormularioExamen,
  filtrarMateriasParaExamen,
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

    it('acepta niveles de carrera de 1 a 6 como año válido', () => {
      const resNivel1 = validarFormularioMateria({ ...materiaValida, año_dictado: 1 })
      assert.strictEqual(resNivel1.esValido, true)
      const resNivel3 = validarFormularioMateria({ ...materiaValida, año_dictado: 3 })
      assert.strictEqual(resNivel3.esValido, true)
    })

    it('rechaza años fuera de los rangos válidos (1 a 10 y 1900 a 2100) o no numéricos', () => {
      const resCero = validarFormularioMateria({ ...materiaValida, año_dictado: 0 })
      assert.strictEqual(resCero.esValido, false)
      assert.match(resCero.errores.año_dictado, /año/i)

      const resMenor = validarFormularioMateria({ ...materiaValida, año_dictado: 1899 })
      assert.strictEqual(resMenor.esValido, false)

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
      tipo: 'FIN',
      nota: '8.50',
    }

    it('valida exitosamente un examen completo con nota', () => {
      const res = validarFormularioExamen(examenValido)
      assert.strictEqual(res.esValido, true)
      assert.deepStrictEqual(res.errores, {})
    })

    it('permite exámenes finales sin nota (nota pendiente / acta abierta)', () => {
      const resSinNota = validarFormularioExamen({ ...examenValido, nota: '' })
      assert.strictEqual(resSinNota.esValido, true)

      const resNull = validarFormularioExamen({ ...examenValido, nota: null })
      assert.strictEqual(resNull.esValido, true)
    })

    it('permite exámenes finales con notas desaprobadas (< 6)', () => {
      const resAplazo = validarFormularioExamen({ ...examenValido, tipo: 'FIN', nota: 4 })
      assert.strictEqual(resAplazo.esValido, true)
    })

    it('valida exitosamente una promoción con nota aprobatoria (>= 6)', () => {
      const resPromo6 = validarFormularioExamen({ ...examenValido, tipo: 'PRO', nota: 6 })
      assert.strictEqual(resPromo6.esValido, true)

      const resPromo10 = validarFormularioExamen({ ...examenValido, tipo: 'PRO', nota: 10 })
      assert.strictEqual(resPromo10.esValido, true)
    })

    it('rechaza promoción con nota inferior a 6 con mensaje explicativo', () => {
      const resPromoReprobada = validarFormularioExamen({ ...examenValido, tipo: 'PRO', nota: 5 })
      assert.strictEqual(resPromoReprobada.esValido, false)
      assert.match(resPromoReprobada.errores.nota, /promoción requiere una calificación aprobatoria/i)
    })

    it('rechaza promoción sin nota informada', () => {
      const resPromoVacia = validarFormularioExamen({ ...examenValido, tipo: 'PRO', nota: '' })
      assert.strictEqual(resPromoVacia.esValido, false)
      assert.match(resPromoVacia.errores.nota, /ingresar una nota igual o superior a 6/i)

      const resPromoNull = validarFormularioExamen({ ...examenValido, tipo: 'PRO', nota: null })
      assert.strictEqual(resPromoNull.esValido, false)
      assert.match(resPromoNull.errores.nota, /ingresar una nota igual o superior a 6/i)
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

    it('rechaza exámenes parciales (PAR) y tipos no permitidos en mesas de examen', () => {
      const resParcial = validarFormularioExamen({ ...examenValido, tipo: 'PAR' })
      assert.strictEqual(resParcial.esValido, false)
      assert.match(resParcial.errores.tipo, /Final \(FIN\) o Promoción \(PRO\)/i)

      const resTipoInvalido = validarFormularioExamen({ ...examenValido, tipo: 'OTRO' })
      assert.strictEqual(resTipoInvalido.esValido, false)
      assert.match(resTipoInvalido.errores.tipo, /Final \(FIN\) o Promoción \(PRO\)/i)
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

  describe('filtrarMateriasParaExamen', () => {
    const materiasPrueba = [
      { id: 1, nombre: 'Matemática Discreta', estado: 'CUR' },
      { id: 2, nombre: 'Álgebra Lineal', estado: 'APR' },
      { id: 3, nombre: 'Programación I', estado: 'REG' },
      { id: 4, nombre: 'Física I', estado: 'PEN' },
      { id: 5, nombre: 'Química', estado: 'Aprobada' },
      { id: 6, nombre: 'Sistemas Operativos', estado: 'REC' },
    ]

    it('excluye materias aprobadas (APR / Aprobada) al crear un nuevo examen', () => {
      const disponibles = filtrarMateriasParaExamen(materiasPrueba, null)
      const ids = disponibles.map((m) => m.id)

      assert.strictEqual(ids.includes(2), false, 'La materia 2 (APR) no debe aparecer')
      assert.strictEqual(ids.includes(5), false, 'La materia 5 (Aprobada) no debe aparecer')
      assert.deepStrictEqual(ids, [1, 3, 4, 6])
    })

    it('conserva la materia aprobada si se está editando un examen perteneciente a ella', () => {
      const examenDeAlgebra = { id: 99, materia: 2, tipo: 'FIN', nota: 8 }
      const disponibles = filtrarMateriasParaExamen(materiasPrueba, examenDeAlgebra)
      const ids = disponibles.map((m) => m.id)

      assert.strictEqual(ids.includes(2), true, 'La materia en edición debe mantenerse visible')
      assert.strictEqual(ids.includes(5), false, 'Otras materias aprobadas siguen excluidas')
      assert.deepStrictEqual(ids, [1, 2, 3, 4, 6])
    })

    it('maneja listas vacías, nulas o elementos inválidos sin fallar', () => {
      assert.deepStrictEqual(filtrarMateriasParaExamen([]), [])
      assert.deepStrictEqual(filtrarMateriasParaExamen(null), [])
      assert.deepStrictEqual(filtrarMateriasParaExamen(undefined), [])
      assert.deepStrictEqual(filtrarMateriasParaExamen([null, undefined, {}]), [])
    })
  })
})
