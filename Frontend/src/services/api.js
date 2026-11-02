import { tokenStorage } from './storage.js'

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

export class ApiError extends Error {
  constructor(status, data, defaultMessage = 'Error en la petición a la API') {
    const message = ApiError.extractMessage(data, defaultMessage, status)
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }

  static extractMessage(data, fallback, status = 0) {
    const fallbackFinal = obtenerFallbackPorStatus(status, fallback)

    if (!data) return fallbackFinal

    if (typeof data === 'string') {
      return traducirMensajeBackend(data)
    }

    if (data.detail && typeof data.detail === 'string') {
      return traducirMensajeBackend(data.detail)
    }

    if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
      return traducirMensajeBackend(data.non_field_errors[0])
    }

    if (typeof data === 'object') {
      const fieldErrors = Object.entries(data)
        .filter(([, val]) => Array.isArray(val) && val.length > 0)
        .map(([field, msgs]) => {
          const msgsTraducidos = msgs.map((m) => traducirMensajeBackend(m)).join(', ')
          return `${field}: ${msgsTraducidos}`
        })

      if (fieldErrors.length > 0) {
        return fieldErrors.join(' | ')
      }
    }

    return fallbackFinal
  }
}

function normalizeUrl(baseUrl, endpoint) {
  const sanitizedBase = baseUrl.replace(/\/+$/, '')
  const sanitizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${sanitizedBase}${sanitizedEndpoint}`
}

function resolveFetch(customFetch) {
  if (customFetch) return customFetch
  if (typeof fetch !== 'undefined') return fetch
  throw new Error('No fetch implementation available')
}

export function createApiClient({
  baseUrl = 'http://localhost:8000/api',
  getAuthToken = () => tokenStorage.getAccessToken(),
  storage = tokenStorage,
  customFetch = null,
} = {}) {
  const fetchFn = resolveFetch(customFetch)

  async function request(endpoint, options = {}) {
    const {
      method = 'GET',
      headers = {},
      body = null,
      skipAuth = false,
      ...extraOptions
    } = options

    const url = normalizeUrl(baseUrl, endpoint)
    const requestHeaders = { ...headers }

    if (!skipAuth) {
      const token = getAuthToken()
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`
      }
    }

    let serializedBody = body
    if (body && typeof body === 'object' && !(body instanceof FormData)) {
      requestHeaders['Content-Type'] = 'application/json'
      serializedBody = JSON.stringify(body)
    }

    let response
    try {
      response = await fetchFn(url, {
        method,
        headers: requestHeaders,
        body: serializedBody,
        ...extraOptions,
      })
    } catch (networkError) {
      if (networkError instanceof ApiError) {
        throw networkError
      }
      throw new ApiError(
        0,
        null,
        'No se pudo conectar con el servidor. Verificá tu conexión a internet o si el backend está activo.'
      )
    }

    if (response.status === 204) {
      return null
    }

    const contentType = response.headers.get('content-type') || ''
    const isJson = contentType.includes('application/json')
    const responseData = isJson ? await response.json() : await response.text()

    if (!response.ok) {
      if (response.status === 401 && !skipAuth && !options._isRetry) {
        const refreshToken = storage?.getRefreshToken ? storage.getRefreshToken() : null
        if (refreshToken) {
          try {
            const refreshUrl = normalizeUrl(baseUrl, '/token/refresh/')
            const refreshRes = await fetchFn(refreshUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh: refreshToken }),
            })

            if (refreshRes.ok) {
              const refreshData = await refreshRes.json()
              if (refreshData?.access) {
                storage.setTokens({
                  access: refreshData.access,
                  refresh: refreshData.refresh || refreshToken,
                })
                return await request(endpoint, {
                  ...options,
                  _isRetry: true,
                })
              }
            }
          } catch {
            // El refresh falló, limpiar tokens y notificar expiración
          }
        }

        if (storage?.clearTokens) {
          storage.clearTokens()
        }
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('auth:expired'))
        }
      }

      throw new ApiError(response.status, responseData, `Error HTTP ${response.status}`)
    }

    return responseData
  }

  return {
    request,
    get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
    post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
    put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
    patch: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PATCH', body }),
    delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
  }
}

const defaultApiUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://localhost:8000/api'

export const api = createApiClient({
  baseUrl: defaultApiUrl,
  getAuthToken: () => tokenStorage.getAccessToken(),
})
