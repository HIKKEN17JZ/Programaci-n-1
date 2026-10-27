/**
 * Pruebas unitarias para csvHelper (TDD - TP9)
 *
 * Valida la generación de plantillas CSV, el parseo tolerante a fallos
 * (delimitadores ',', ';', compatibilidad con Excel), y la exportación.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  generarPlantillaCSV,
  parsearCSVMaterias,
  exportarMateriasACSV,
  normalizarEstadoCSV,
  normalizarBooleanoCSV,
  normalizarAñoDictadoCSV,
} from './csvHelper.js'

describe('Utilidades de Importación y Exportación CSV (csvHelper - TDD)', () => {
  describe('normalizarAñoDictadoCSV', () => {
    it('mantiene años calendario válidos entre 1900 y 2100', () => {
      assert.equal(normalizarAñoDictadoCSV(2024), 2024)
      assert.equal(normalizarAñoDictadoCSV('2025'), 2025)
      assert.equal(normalizarAñoDictadoCSV('1999'), 1999)
    })

    it('acepta y conserva niveles de carrera (1 a 10) para catalogación directa', () => {
      assert.equal(normalizarAñoDictadoCSV(1), 1)
      assert.equal(normalizarAñoDictadoCSV('2'), 2)
      assert.equal(normalizarAñoDictadoCSV('5'), 5)
    })

    it('devuelve null si es inválido o está fuera de rango', () => {
      assert.equal(normalizarAñoDictadoCSV('abc'), null)
      assert.equal(normalizarAñoDictadoCSV('1850'), null)
      assert.equal(normalizarAñoDictadoCSV('2200'), null)
      assert.equal(normalizarAñoDictadoCSV('0'), null)
    })
  })

  describe('normalizarEstadoCSV', () => {
    it('reconoce códigos oficiales y nombres en español', () => {
      assert.equal(normalizarEstadoCSV('APR'), 'APR')
      assert.equal(normalizarEstadoCSV('Aprobada'), 'APR')
      assert.equal(normalizarEstadoCSV('aprobado'), 'APR')
      assert.equal(normalizarEstadoCSV('CUR'), 'CUR')
      assert.equal(normalizarEstadoCSV('Cursando'), 'CUR')
      assert.equal(normalizarEstadoCSV('REG'), 'REG')
      assert.equal(normalizarEstadoCSV('Regular'), 'REG')
      assert.equal(normalizarEstadoCSV('REC'), 'REC')
      assert.equal(normalizarEstadoCSV('Recursando'), 'REC')
      assert.equal(normalizarEstadoCSV('PEN'), 'PEN')
      assert.equal(normalizarEstadoCSV('Pendiente'), 'PEN')
    })

    it('asigna PEN por defecto si el estado está vacío o es desconocido', () => {
      assert.equal(normalizarEstadoCSV(''), 'PEN')
      assert.equal(normalizarEstadoCSV(null), 'PEN')
      assert.equal(normalizarEstadoCSV('DESCONOCIDO'), 'PEN')
    })
  })

  describe('normalizarBooleanoCSV', () => {
    it('interpreta afirmativos como true', () => {
      assert.equal(normalizarBooleanoCSV('si'), true)
      assert.equal(normalizarBooleanoCSV('SÍ'), true)
      assert.equal(normalizarBooleanoCSV('true'), true)
      assert.equal(normalizarBooleanoCSV('1'), true)
      assert.equal(normalizarBooleanoCSV(true), true)
    })

    it('interpreta negativos o valores vacíos como false', () => {
      assert.equal(normalizarBooleanoCSV('no'), false)
      assert.equal(normalizarBooleanoCSV('false'), false)
      assert.equal(normalizarBooleanoCSV('0'), false)
      assert.equal(normalizarBooleanoCSV(''), false)
      assert.equal(normalizarBooleanoCSV(null), false)
    })
  })

  describe('generarPlantillaCSV', () => {
    it('genera un CSV con encabezados esperados y filas de ejemplo', () => {
      const csv = generarPlantillaCSV()
      assert.ok(csv.includes('nombre,año_dictado,creditos_totales,horas_semanales,estado,es_promocionable'))
      assert.ok(csv.includes('Programación I'))
      assert.ok(csv.includes('CUR'))
    })

    it('contiene BOM UTF-8 para garantizar apertura correcta en Excel de habla hispana', () => {
      const csv = generarPlantillaCSV()
      assert.ok(csv.startsWith('\uFEFF'))
    })
  })

  describe('parsearCSVMaterias', () => {
    it('parsea correctamente un CSV válido separado por comas', () => {
      const contenido = `nombre,año_dictado,creditos_totales,horas_semanales,estado,es_promocionable
Sistemas Operativos,2024,6,4,CUR,si
Bases de Datos,2024,8,6,APR,no`

      const resultado = parsearCSVMaterias(contenido)
      assert.equal(resultado.errores.length, 0)
      assert.equal(resultado.materiasValidas.length, 2)

      const mat1 = resultado.materiasValidas[0]
      assert.equal(mat1.nombre, 'Sistemas Operativos')
      assert.equal(mat1.año_dictado, 2024)
      assert.equal(mat1.creditos_totales, 6)
      assert.equal(mat1.horas_semanales, 4)
      assert.equal(mat1.estado, 'CUR')
      assert.equal(mat1.es_promocionable, true)

      const mat2 = resultado.materiasValidas[1]
      assert.equal(mat2.nombre, 'Bases de Datos')
      assert.equal(mat2.año_dictado, 2024)
      assert.equal(mat2.creditos_totales, 8)
      assert.equal(mat2.horas_semanales, 6)
      assert.equal(mat2.estado, 'APR')
      assert.equal(mat2.es_promocionable, false)
    })

    it('soporta separadores por punto y coma y conserva nivel de cursada para catalogación', () => {
      const contenido = `nombre;año_dictado;creditos_totales;horas_semanales;estado;es_promocionable
Algoritmos y Estructuras;1;10;8;Aprobada;sí`

      const resultado = parsearCSVMaterias(contenido)
      assert.equal(resultado.materiasValidas.length, 1)
      assert.equal(resultado.errores.length, 0)
      assert.equal(resultado.materiasValidas[0].nombre, 'Algoritmos y Estructuras')
      assert.equal(resultado.materiasValidas[0].año_dictado, 1)
      assert.equal(resultado.materiasValidas[0].creditos_totales, 10)
      assert.equal(resultado.materiasValidas[0].estado, 'APR')
      assert.equal(resultado.materiasValidas[0].es_promocionable, true)
    })

    it('ignora líneas vacías y espacios residuales', () => {
      const contenido = `
nombre,año_dictado,creditos_totales,horas_semanales,estado,es_promocionable

Física I, 1, 6, 4, Pendiente, no  

`
      const resultado = parsearCSVMaterias(contenido)
      assert.equal(resultado.materiasValidas.length, 1)
      assert.equal(resultado.materiasValidas[0].nombre, 'Física I')
      assert.equal(resultado.materiasValidas[0].estado, 'PEN')
    })

    it('identifica y reporta filas inválidas sin romper el parseo del resto', () => {
      const contenido = `nombre,año_dictado,creditos_totales,horas_semanales,estado,es_promocionable
,1,6,4,PEN,si
Materia Sin Año,,6,4,PEN,si
Materia Válida,3,4,2,CUR,no`

      const resultado = parsearCSVMaterias(contenido)
      assert.equal(resultado.materiasValidas.length, 1)
      assert.equal(resultado.materiasValidas[0].nombre, 'Materia Válida')
      assert.equal(resultado.errores.length, 2)
      assert.ok(resultado.errores[0].mensaje.includes('nombre'))
      assert.ok(resultado.errores[1].mensaje.includes('año'))
    })

    it('lanza error o devuelve objeto de error si el contenido no tiene encabezados válidos', () => {
      const contenido = `columna_a,columna_b,columna_c\n1,2,3`
      const resultado = parsearCSVMaterias(contenido)
      assert.equal(resultado.materiasValidas.length, 0)
      assert.ok(resultado.errores.length > 0)
      assert.ok(resultado.errores[0].mensaje.includes('encabezado') || resultado.errores[0].mensaje.includes('nombre'))
    })
  })

  describe('exportarMateriasACSV', () => {
    it('convierte una lista de materias a formato CSV correctamente formateado', () => {
      const materias = [
        {
          id: 1,
          nombre: 'Matemática I, Álgebra y Geometría',
          año_dictado: 1,
          creditos_totales: 8,
          horas_semanales: 6,
          estado: 'APR',
          es_promocionable: true,
        },
        {
          id: 2,
          nombre: 'Laboratorio de Computación',
          año_dictado: 1,
          creditos_totales: 4,
          horas_semanales: 4,
          estado: 'CUR',
          es_promocionable: false,
        },
      ]

      const csv = exportarMateriasACSV(materias)
      assert.ok(csv.startsWith('\uFEFF'))
      assert.ok(csv.includes('"Matemática I, Álgebra y Geometría"'))
      assert.ok(csv.includes('Laboratorio de Computación'))
      assert.ok(csv.includes('APR'))
      assert.ok(csv.includes('CUR'))
    })

    it('maneja listas vacías devolviendo encabezados estándar', () => {
      const csv = exportarMateriasACSV([])
      assert.ok(csv.includes('nombre,año_dictado,creditos_totales,horas_semanales,estado,es_promocionable'))
    })
  })
})
