import { describe, it } from 'node:test'
import assert from 'node:assert'
import { createActivityLogService } from './activityLogService.js'

describe('Servicio de Auditoría e Historial de Actividad (activityLogService - TDD)', () => {
  function crearMockStorage() {
    const store = new Map()
    return {
      getItem: (key) => store.get(key) || null,
      setItem: (key, val) => store.set(key, String(val)),
      removeItem: (key) => store.delete(key),
      clear: () => store.clear(),
    }
  }

  it('inicia con un historial vacío si no hay registros previos', () => {
    const storage = crearMockStorage()
    const service = createActivityLogService({ storage })
    assert.deepStrictEqual(service.getLog('user-1'), [])
  })

  it('registra una acción de eliminación de examen con timestamp y detalle técnico', () => {
    const storage = crearMockStorage()
    const service = createActivityLogService({ storage })

    const evento = service.registrarAccion({
      accion: 'ELIMINAR',
      entidad: 'EXAMEN',
      detalle: 'Mesa de examen eliminada: Final de Álgebra',
      idReferencia: 14,
      userId: 'user-1',
    })

    assert.strictEqual(evento.accion, 'ELIMINAR')
    assert.strictEqual(evento.entidad, 'EXAMEN')
    assert.strictEqual(evento.idReferencia, '14')
    assert.match(evento.detalle, /Final de Álgebra/i)
    assert.ok(evento.timestamp)
    assert.ok(evento.fechaFormateada)

    const logs = service.getLog('user-1')
    assert.strictEqual(logs.length, 1)
    assert.strictEqual(logs[0].id, evento.id)
  })

  it('registra acciones múltiples ordenadas de la más reciente a la más antigua', () => {
    const storage = crearMockStorage()
    const service = createActivityLogService({ storage })

    service.registrarAccion({
      accion: 'CREAR',
      entidad: 'MATERIA',
      detalle: 'Asignatura creada: Algoritmos I',
      idReferencia: 1,
      userId: 'user-1',
    })

    service.registrarAccion({
      accion: 'ELIMINAR',
      entidad: 'EXAMEN',
      detalle: 'Mesa de examen eliminada: Parcial de Física',
      idReferencia: 9,
      userId: 'user-1',
    })

    const logs = service.getLog('user-1')
    assert.strictEqual(logs.length, 2)
    assert.strictEqual(logs[0].accion, 'ELIMINAR')
    assert.strictEqual(logs[1].accion, 'CREAR')
  })

  it('aísla el historial por cada usuario (userId)', () => {
    const storage = crearMockStorage()
    const service = createActivityLogService({ storage })

    service.registrarAccion({
      accion: 'CREAR',
      entidad: 'MATERIA',
      detalle: 'Materia User 1',
      userId: 'user-1',
    })

    service.registrarAccion({
      accion: 'ELIMINAR',
      entidad: 'EXAMEN',
      detalle: 'Examen User 2',
      userId: 'user-2',
    })

    assert.strictEqual(service.getLog('user-1').length, 1)
    assert.strictEqual(service.getLog('user-2').length, 1)
    assert.strictEqual(service.getLog('user-1')[0].detalle, 'Materia User 1')
  })

  it('permite limpiar el historial mediante clearLog', () => {
    const storage = crearMockStorage()
    const service = createActivityLogService({ storage })

    service.registrarAccion({
      accion: 'CREAR',
      entidad: 'MATERIA',
      detalle: 'Asignatura temporal',
      userId: 'user-1',
    })

    assert.strictEqual(service.getLog('user-1').length, 1)
    service.clearLog('user-1')
    assert.strictEqual(service.getLog('user-1').length, 0)
  })

  it('maneja excepciones de almacenamiento de forma segura', () => {
    const faultyStorage = {
      getItem: () => {
        throw new Error('Storage bloqueado')
      },
      setItem: () => {
        throw new Error('Cuota excedida')
      },
      removeItem: () => {
        throw new Error('Error al remover')
      },
    }

    const service = createActivityLogService({ storage: faultyStorage })
    assert.doesNotThrow(() => {
      service.getLog('user-1')
      service.registrarAccion({ accion: 'CREAR', entidad: 'MATERIA', detalle: 'Test' })
      service.clearLog('user-1')
    })
  })
})
