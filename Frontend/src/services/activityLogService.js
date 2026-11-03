/**
 * Servicio de auditoría e historial de cambios en el cliente (Clean Code & TDD).
 * Registra y persiste cronológicamente las acciones realizadas por el usuario (altas, bajas, modificaciones, notas, IDs).
 */

const STORAGE_KEY_PREFIX = 'academic_activity_log_'

function getStorageKey(userId) {
  return `${STORAGE_KEY_PREFIX}${userId || 'global'}`
}

function safeGetStorage() {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null
  } catch {
    return null
  }
}

export function createActivityLogService({ storage = safeGetStorage() } = {}) {
  /**
   * Obtiene el listado de eventos de actividad ordenados del más reciente al más antiguo.
   * @param {string|number} [userId='global']
   * @returns {Array<object>}
   */
  function getLog(userId = 'global') {
    if (!storage) return []
    try {
      const raw = storage.getItem(getStorageKey(userId))
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  /**
   * Registra una nueva acción en el historial.
   * @param {object} param0
   * @param {'CREAR'|'EDITAR'|'ELIMINAR'|'ESTADO'|'IMPORTAR'} param0.accion
   * @param {'MATERIA'|'EXAMEN'|'PLAN'} param0.entidad
   * @param {string} param0.detalle - Descripción legible del cambio
   * @param {string|number|null} [param0.idReferencia] - ID técnico involucrado
   * @param {string|number} [param0.userId='global'] - ID del usuario activo
   * @returns {object} Evento registrado
   */
  function registrarAccion({
    accion,
    entidad,
    detalle,
    idReferencia = null,
    userId = 'global',
  }) {
    const ahora = new Date()
    const fechaLegible = ahora.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    const horaLegible = ahora.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    const nuevoEvento = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: ahora.toISOString(),
      fechaFormateada: `${fechaLegible} a las ${horaLegible}`,
      accion,
      entidad,
      detalle,
      idReferencia: idReferencia !== null && idReferencia !== undefined ? String(idReferencia) : null,
    }

    if (storage) {
      try {
        const actual = getLog(userId)
        // Mantener hasta un máximo de 100 eventos para evitar saturar el almacenamiento local
        const actualizado = [nuevoEvento, ...actual].slice(0, 100)
        storage.setItem(getStorageKey(userId), JSON.stringify(actualizado))
      } catch {
        // En caso de cuota excedida o modo privado, no bloquea la aplicación
      }
    }

    return nuevoEvento
  }

  /**
   * Limpia el registro de actividad del usuario especificado.
   * @param {string|number} [userId='global']
   */
  function clearLog(userId = 'global') {
    if (!storage) return
    try {
      storage.removeItem(getStorageKey(userId))
    } catch {
      // Ignorar de forma segura
    }
  }

  return {
    getLog,
    registrarAccion,
    clearLog,
  }
}

export const activityLogService = createActivityLogService()
