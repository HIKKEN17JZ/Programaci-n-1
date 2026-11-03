/**
 * Utilidades de traducción e internacionalización de errores del backend (Clean Code - SRP).
 * Convierte respuestas técnicas en inglés (DRF, SimpleJWT, HTTP) a un español amigable para el usuario.
 */

export function traducirMensajeBackend(mensaje) {
  if (typeof mensaje !== 'string') return mensaje

  const trimmed = mensaje.trim()
  const lower = trimmed.toLowerCase()

  // 1. Autenticación y credenciales de acceso
  if (
    lower.includes('no active account found with the given credentials') ||
    lower.includes('combinación de credenciales no tiene una cuenta activa') ||
    lower.includes('invalid username or password') ||
    lower.includes('unable to log in with provided credentials')
  ) {
    return 'Usuario o contraseña incorrectos. Por favor, verificá tus datos e intentalo nuevamente.'
  }

  if (lower.includes('user account is disabled') || lower.includes('user is inactive')) {
    return 'Esta cuenta de usuario ha sido deshabilitada. Comunicate con el administrador.'
  }

  // 2. Tokens JWT y sesiones
  if (
    lower.includes('given token not valid') ||
    lower.includes('token_not_valid') ||
    lower.includes('token is invalid or expired') ||
    lower.includes('token dado no es valido') ||
    lower.includes('token claim has expired')
  ) {
    return 'Tu sesión ha expirado por inactividad. Por favor, iniciá sesión nuevamente para continuar.'
  }

  if (lower.includes('token is blacklisted') || lower.includes('token está en lista negra')) {
    return 'La sesión ha sido cerrada. Por favor, iniciá sesión nuevamente.'
  }

  // 3. Permisos y credenciales
  if (lower.includes('authentication credentials were not provided')) {
    return 'No has iniciado sesión o no se proporcionaron credenciales.'
  }

  if (lower.includes('you do not have permission to perform this action')) {
    return 'No tienes permisos para realizar esta acción.'
  }

  // 4. Recursos no encontrados y métodos HTTP
  if (lower === 'not found.' || lower === 'not found') {
    return 'El recurso solicitado no fue encontrado.'
  }

  if (lower.includes('method') && lower.includes('not allowed')) {
    return 'Método no permitido para esta operación.'
  }

  // 5. Validaciones de campos
  if (lower.includes('this field is required') || lower.includes('this field may not be null')) {
    return 'Este campo es obligatorio.'
  }

  if (lower.includes('this field may not be blank')) {
    return 'Este campo no puede estar en blanco.'
  }

  if (lower.includes('a valid integer is required')) {
    return 'Se requiere un número entero válido.'
  }

  if (lower.includes('a valid number is required')) {
    return 'Se requiere un número válido.'
  }

  if (lower.includes('enter a valid email address')) {
    return 'Ingresá un correo electrónico válido.'
  }

  if (
    lower.includes('a user with that username already exists') ||
    lower.includes('user with this username already exists')
  ) {
    return 'Ya existe un usuario con ese nombre de usuario.'
  }

  // 6. Errores de red y conexión
  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('load failed') ||
    lower.includes('network request failed')
  ) {
    return 'No se pudo conectar con el servidor. Verificá tu conexión a internet.'
  }

  return trimmed
}

export function obtenerFallbackPorStatus(status, fallbackPredeterminado) {
  if (fallbackPredeterminado && !fallbackPredeterminado.startsWith('Error HTTP')) {
    return fallbackPredeterminado
  }

  switch (status) {
    case 400:
      return 'Los datos enviados son inválidos. Por favor, revisá el formulario.'
    case 401:
      return 'No autorizado o credenciales inválidas.'
    case 403:
      return 'No tienes permisos para realizar esta acción.'
    case 404:
      return 'El recurso solicitado no fue encontrado.'
    case 405:
      return 'Método no permitido para esta operación.'
    case 500:
      return 'Ocurrió un error interno en el servidor. Por favor, intentá nuevamente más tarde.'
    case 502:
    case 503:
    case 504:
      return 'El servidor no se encuentra disponible. Por favor, intentá nuevamente en unos minutos.'
    default:
      return fallbackPredeterminado || 'Error en la petición a la API'
  }
}
