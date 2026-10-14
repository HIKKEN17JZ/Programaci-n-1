import { describe, it } from 'node:test'
import assert from 'node:assert'
import { createAcademicService } from './academicService.js'

describe('Servicio Académico (academicService - TP8 - TDD)', () => {
  it('getMaterias consulta el endpoint /materias/ con el cliente API', async () => {
    let capturedEndpoint = ''
    const fakeApiClient = {
      get: async (endpoint) => {
        capturedEndpoint = endpoint
        return [{ id: 1, nombre: 'Programación I', creditos_totales: 8, estado: 'CUR' }]
      },
    }

    const service = createAcademicService({ apiClient: fakeApiClient })
    const materias = await service.getMaterias()

    assert.strictEqual(capturedEndpoint, '/materias/')
    assert.strictEqual(materias.length, 1)
    assert.strictEqual(materias[0].nombre, 'Programación I')
  })

  it('getExamenes consulta el endpoint /examenes/ con el cliente API', async () => {
    let capturedEndpoint = ''
    const fakeApiClient = {
      get: async (endpoint) => {
        capturedEndpoint = endpoint
        return [{ id: 10, materia: 1, fecha: '2026-12-10', nota: 8, tipo: 'FIN' }]
      },
    }

    const service = createAcademicService({ apiClient: fakeApiClient })
    const examenes = await service.getExamenes()

    assert.strictEqual(capturedEndpoint, '/examenes/')
    assert.strictEqual(examenes.length, 1)
  })

  it('getDashboardData recupera concurrentemente materias y examenes y calcula métricas', async () => {
    const fakeApiClient = {
      get: async (endpoint) => {
        if (endpoint === '/materias/') {
          return [
            { id: 1, nombre: 'Programación I', creditos_totales: 10, estado: 'APR' },
            { id: 2, nombre: 'Álgebra', creditos_totales: 10, estado: 'CUR' },
          ]
        }
        if (endpoint === '/examenes/') {
          return [
            { id: 101, materia: 1, fecha: '2026-12-10', nota: 9, tipo: 'FIN' },
          ]
        }
        throw new Error(`Endpoint no soportado: ${endpoint}`)
      },
    }

    const service = createAcademicService({ apiClient: fakeApiClient })
    const data = await service.getDashboardData()

    assert.strictEqual(data.materias.length, 2)
    assert.strictEqual(data.mesas.length, 1)
    assert.strictEqual(data.mesas[0].materia, 'Programación I')
    assert.strictEqual(data.mesas[0].llamado, 'Examen Final')
    assert.strictEqual(data.avance.totales, 20)
    assert.strictEqual(data.avance.obtenidos, 10)
    assert.strictEqual(data.avance.porcentaje, 50)
  })
})
