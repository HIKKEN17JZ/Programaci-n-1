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

  it('soporta respuestas paginadas de DRF ({ results: [...] }) en getMaterias y getExamenes', async () => {
    const fakeApiClient = {
      get: async (endpoint) => {
        if (endpoint === '/materias/') {
          return {
            count: 1,
            next: null,
            previous: null,
            results: [{ id: 1, nombre: 'Base de Datos' }],
          }
        }
        if (endpoint === '/examenes/') {
          return {
            count: 1,
            next: null,
            previous: null,
            results: [{ id: 5, materia: 1, fecha: '2026-11-10' }],
          }
        }
      },
    }

    const service = createAcademicService({ apiClient: fakeApiClient })
    const materias = await service.getMaterias()
    const examenes = await service.getExamenes()

    assert.strictEqual(materias.length, 1)
    assert.strictEqual(materias[0].nombre, 'Base de Datos')
    assert.strictEqual(examenes.length, 1)
    assert.strictEqual(examenes[0].id, 5)
  })

  describe('Operaciones CRUD de Materias (TP9 - TDD)', () => {
    it('getMateriaById consulta el endpoint específico /materias/:id/', async () => {
      let requested = ''
      const fakeApiClient = {
        get: async (endpoint) => {
          requested = endpoint
          return { id: 7, nombre: 'Física I' }
        },
      }
      const service = createAcademicService({ apiClient: fakeApiClient })
      const res = await service.getMateriaById(7)
      assert.strictEqual(requested, '/materias/7/')
      assert.strictEqual(res.nombre, 'Física I')
    })

    it('createMateria envía POST a /materias/ con payload', async () => {
      let callInfo = null
      const fakeApiClient = {
        post: async (endpoint, payload) => {
          callInfo = { endpoint, payload }
          return { id: 12, ...payload }
        },
      }
      const service = createAcademicService({ apiClient: fakeApiClient })
      const payload = { nombre: 'Química', año_dictado: 2026, creditos_totales: 6, estado: 'CUR' }
      const res = await service.createMateria(payload)

      assert.strictEqual(callInfo.endpoint, '/materias/')
      assert.strictEqual(callInfo.payload.nombre, 'Química')
      assert.strictEqual(res.id, 12)
    })

    it('updateMateria envía PUT o PATCH a /materias/:id/', async () => {
      let putCall = null
      let patchCall = null
      const fakeApiClient = {
        put: async (endpoint, payload) => {
          putCall = { endpoint, payload }
          return { id: 12, ...payload }
        },
        patch: async (endpoint, payload) => {
          patchCall = { endpoint, payload }
          return { id: 12, ...payload }
        },
      }
      const service = createAcademicService({ apiClient: fakeApiClient })
      await service.updateMateria(12, { nombre: 'Química Orgánica' })
      await service.patchMateria(12, { estado: 'APR' })

      assert.strictEqual(putCall.endpoint, '/materias/12/')
      assert.strictEqual(putCall.payload.nombre, 'Química Orgánica')
      assert.strictEqual(patchCall.endpoint, '/materias/12/')
      assert.strictEqual(patchCall.payload.estado, 'APR')
    })

    it('deleteMateria envía DELETE a /materias/:id/', async () => {
      let deletedEndpoint = ''
      const fakeApiClient = {
        delete: async (endpoint) => {
          deletedEndpoint = endpoint
          return null
        },
      }
      const service = createAcademicService({ apiClient: fakeApiClient })
      await service.deleteMateria(15)
      assert.strictEqual(deletedEndpoint, '/materias/15/')
    })
  })

  describe('Operaciones CRUD de Exámenes (TP9 - TDD)', () => {
    it('getExamenById consulta /examenes/:id/', async () => {
      let requested = ''
      const fakeApiClient = {
        get: async (endpoint) => {
          requested = endpoint
          return { id: 3, materia: 1, nota: 10 }
        },
      }
      const service = createAcademicService({ apiClient: fakeApiClient })
      const res = await service.getExamenById(3)
      assert.strictEqual(requested, '/examenes/3/')
      assert.strictEqual(res.nota, 10)
    })

    it('createExamen envía POST a /examenes/', async () => {
      let postCall = null
      const fakeApiClient = {
        post: async (endpoint, payload) => {
          postCall = { endpoint, payload }
          return { id: 9, ...payload }
        },
      }
      const service = createAcademicService({ apiClient: fakeApiClient })
      const payload = { materia: 1, fecha: '2026-11-20', nota: 8, tipo: 'FIN' }
      const res = await service.createExamen(payload)

      assert.strictEqual(postCall.endpoint, '/examenes/')
      assert.strictEqual(res.id, 9)
    })

    it('updateExamen envía PUT a /examenes/:id/', async () => {
      let putCall = null
      const fakeApiClient = {
        put: async (endpoint, payload) => {
          putCall = { endpoint, payload }
          return { id: 9, ...payload }
        },
      }
      const service = createAcademicService({ apiClient: fakeApiClient })
      await service.updateExamen(9, { nota: 9 })
      assert.strictEqual(putCall.endpoint, '/examenes/9/')
      assert.strictEqual(putCall.payload.nota, 9)
    })

    it('deleteExamen envía DELETE a /examenes/:id/', async () => {
      let deleteEndpoint = ''
      const fakeApiClient = {
        delete: async (endpoint) => {
          deleteEndpoint = endpoint
          return null
        },
      }
      const service = createAcademicService({ apiClient: fakeApiClient })
      await service.deleteExamen(9)
      assert.strictEqual(deleteEndpoint, '/examenes/9/')
    })
  })

  describe('Operaciones de Facultades (TP9 - TDD)', () => {
    it('getFacultades y createFacultad conectan con /facultades/', async () => {
      let calls = []
      const fakeApiClient = {
        get: async (endpoint) => {
          calls.push({ method: 'GET', endpoint })
          return [{ id: 1, nombre: 'Ingeniería', sede: 'Central' }]
        },
        post: async (endpoint, payload) => {
          calls.push({ method: 'POST', endpoint, payload })
          return { id: 2, ...payload }
        },
      }
      const service = createAcademicService({ apiClient: fakeApiClient })
      const facultades = await service.getFacultades()
      const nueva = await service.createFacultad({ nombre: 'Ciencias Exactas', sede: 'Norte' })

      assert.strictEqual(facultades.length, 1)
      assert.strictEqual(nueva.id, 2)
      assert.strictEqual(calls[0].endpoint, '/facultades/')
      assert.strictEqual(calls[1].endpoint, '/facultades/')
    })
  })
})
