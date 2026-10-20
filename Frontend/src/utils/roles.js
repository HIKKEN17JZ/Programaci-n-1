/**
 * Constantes y utilidades para Control de Acceso Basado en Roles (RBAC).
 */

export const ROLES = {
  ADMIN: 'ADMIN',
  DOCENTE: 'DOCENTE',
  ESTUDIANTE: 'ESTUDIANTE',
}

/**
 * Determina si el usuario posee rol o privilegios de administrador.
 *
 * @param {object|null} user - Objeto de usuario.
 * @returns {boolean}
 */
export function isAdmin(user) {
  if (!user) return false
  return user.role === ROLES.ADMIN || user.is_superuser === true || user.is_admin === true
}

/**
 * Determina si el usuario posee rol de docente.
 *
 * @param {object|null} user - Objeto de usuario.
 * @returns {boolean}
 */
export function isDocente(user) {
  if (!user) return false
  return user.role === ROLES.DOCENTE
}

/**
 * Determina si el usuario posee rol de estudiante.
 *
 * @param {object|null} user - Objeto de usuario.
 * @returns {boolean}
 */
export function isEstudiante(user) {
  if (!user) return false
  return user.role === ROLES.ESTUDIANTE || (!user.role && !isAdmin(user) && !isDocente(user))
}

/**
 * Evalúa si el usuario tiene permisos para crear, editar o eliminar materias.
 *
 * @param {object|null} user - Objeto de usuario.
 * @returns {boolean}
 */
export function canManageMaterias(user) {
  return isAdmin(user) || isDocente(user)
}

/**
 * Evalúa si el usuario tiene permisos para registrar o calificar exámenes.
 *
 * @param {object|null} user - Objeto de usuario.
 * @returns {boolean}
 */
export function canManageExamenes(user) {
  return isAdmin(user) || isDocente(user)
}

/**
 * Evalúa si el usuario tiene permisos para gestionar facultades y sedes.
 *
 * @param {object|null} user - Objeto de usuario.
 * @returns {boolean}
 */
export function canManageFacultades(user) {
  return isAdmin(user)
}

export const ROLE_BADGE = {
  [ROLES.ADMIN]: 'text-bg-danger',
  [ROLES.DOCENTE]: 'text-bg-primary',
  [ROLES.ESTUDIANTE]: 'text-bg-info',
}

/**
 * Retorna la clase CSS Bootstrap para el badge del rol.
 *
 * @param {string} role - Código de rol.
 * @returns {string} Clase de Bootstrap.
 */
export function getRoleBadge(role) {
  return ROLE_BADGE[role] || 'text-bg-secondary'
}

export const ROLE_LABEL = {
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.DOCENTE]: 'Docente',
  [ROLES.ESTUDIANTE]: 'Estudiante',
}

/**
 * Retorna el nombre legible en español para el rol.
 *
 * @param {string} role - Código de rol.
 * @returns {string} Nombre en español.
 */
export function getRoleLabel(role) {
  return ROLE_LABEL[role] || 'Estudiante'
}
