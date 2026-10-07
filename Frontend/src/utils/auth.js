/**
 * Utilidades puras para validación y autenticación en memoria (TP7).
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Valida si un string cumple con la estructura básica de correo electrónico.
 *
 * @param {string} email
 * @returns {boolean}
 */
export function validarFormatoEmail(email) {
  if (typeof email !== 'string') {
    return false
  }
  return EMAIL_REGEX.test(email.trim())
}

/**
 * Autentica un usuario contra el repositorio en memoria.
 *
 * @param {Array} users - Lista de usuarios en memoria.
 * @param {string} username - Nombre de usuario.
 * @param {string} password - Contraseña ingresada.
 * @returns {{ ok: boolean, message?: string, user?: { username: string, email: string, rol: string } }}
 */
export function autenticarUsuario(users, username, password) {
  if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
    return { ok: false, message: 'Debe ingresar usuario y contraseña' }
  }

  const cleanUsername = username.trim().toLowerCase()
  const found = (users || []).find((u) => u.username.toLowerCase() === cleanUsername)

  if (!found || found.password !== password) {
    return { ok: false, message: 'Usuario o contraseña incorrecta' }
  }

  return {
    ok: true,
    user: {
      username: found.username,
      email: found.email,
      rol: found.rol,
    },
  }
}

/**
 * Valida los datos requeridos para registrar un nuevo usuario.
 *
 * @param {object} datos - { username, email, password }
 * @param {Array} users - Lista de usuarios existentes para verificar unicidad.
 * @returns {{ ok: boolean, message?: string }}
 */
export function validarRegistro({ username, email, password } = {}, users = []) {
  const cleanUsername = typeof username === 'string' ? username.trim() : ''
  const cleanEmail = typeof email === 'string' ? email.trim() : ''

  if (!cleanUsername || !cleanEmail || !password || typeof password !== 'string') {
    return { ok: false, message: 'Faltan datos obligatorios' }
  }

  if (password.length < 4) {
    return { ok: false, message: 'La contraseña debe tener al menos 4 caracteres' }
  }

  if (!validarFormatoEmail(cleanEmail)) {
    return { ok: false, message: 'El formato de email no es válido' }
  }

  const userExists = users.some((u) => u.username.toLowerCase() === cleanUsername.toLowerCase())
  if (userExists) {
    return { ok: false, message: 'El usuario ya existe' }
  }

  const emailExists = users.some((u) => u.email.toLowerCase() === cleanEmail.toLowerCase())
  if (emailExists) {
    return { ok: false, message: 'El email ya se encuentra registrado' }
  }

  return { ok: true }
}

/**
 * Genera la estructura de un nuevo usuario con rol estudiante.
 *
 * @param {object} datos - { username, email, password }
 * @returns {object} Usuario normalizado listo para persistir en memoria.
 */
export function crearUsuarioEstudiante({ username, email, password }) {
  return {
    username: username.trim(),
    email: email.trim(),
    password,
    rol: 'estudiante',
  }
}
