import { isAdmin, getRoleLabel, ROLES } from './roles.js'

/**
 * Normaliza un identificador de rol a formato mayúsculas sin espacios.
 *
 * @param {string|null|undefined} role - Rol a normalizar.
 * @returns {string} Rol normalizado.
 */
function normalizarRol(role) {
  if (!role || typeof role !== 'string') return ''
  return role.trim().toUpperCase()
}

/**
 * Evalúa si un usuario autenticado posee los permisos requeridos para acceder a una ruta.
 *
 * @param {object|null} user - Objeto del usuario en sesión.
 * @param {string|string[]} [allowedRoles] - Roles permitidos para acceder a la ruta.
 * @returns {{ autorizado: boolean, motivo?: string, redireccion?: string, rolActual?: string }}
 */
export function verificarAccesoRuta(user, allowedRoles) {
  if (!user) {
    return {
      autorizado: false,
      motivo: 'NO_AUTENTICADO',
      redireccion: '/login',
    }
  }

  // Si no se especificaron roles permitidos, cualquier usuario con sesión activa puede ingresar.
  if (!allowedRoles || (Array.isArray(allowedRoles) && allowedRoles.length === 0)) {
    return { autorizado: true }
  }

  // Los administradores o superusuarios poseen acceso universal a todos los recursos.
  if (isAdmin(user)) {
    return { autorizado: true }
  }

  const listaRoles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
  const rolesNormalizados = listaRoles.map(normalizarRol)
  const rolUsuario = normalizarRol(user.role || ROLES.ESTUDIANTE)

  if (rolesNormalizados.includes(rolUsuario)) {
    return { autorizado: true }
  }

  return {
    autorizado: false,
    motivo: 'ROL_NO_AUTORIZADO',
    redireccion: '/unauthorized',
    rolActual: user.role || ROLES.ESTUDIANTE,
  }
}

/**
 * Genera un mensaje comprensible en español explicando la causa de la denegación de acceso.
 *
 * @param {string} motivo - Motivo devuelto por verificarAccesoRuta.
 * @param {string} [rolActual] - Rol actual del usuario.
 * @param {string|string[]} [allowedRoles] - Roles que sí están autorizados.
 * @returns {string} Mensaje descriptivo para el usuario.
 */
export function obtenerMensajeErrorRol(motivo, rolActual, allowedRoles) {
  if (motivo === 'NO_AUTENTICADO') {
    return 'Debes iniciar sesión con una cuenta autorizada para acceder a esta sección.'
  }

  if (motivo === 'ROL_NO_AUTORIZADO') {
    const rolActualTexto = getRoleLabel(rolActual)
    const listaRoles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
    const rolesFiltrados = listaRoles.filter(Boolean)

    if (rolesFiltrados.length > 0) {
      const rolesRequeridos = rolesFiltrados.map(getRoleLabel).join(' o ')
      return `Tu cuenta tiene rol "${rolActualTexto}". Esta sección requiere permisos de ${rolesRequeridos}.`
    }

    return `Tu cuenta tiene rol "${rolActualTexto}", el cual no cuenta con los permisos requeridos para acceder a esta sección.`
  }

  return 'No tienes permisos suficientes para acceder a este recurso.'
}
