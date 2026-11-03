import { tokenStorage } from './storage.js'
import {
  traducirMensajeBackend,
  obtenerFallbackPorStatus,
} from '../utils/errorTranslations.js'

export { traducirMensajeBackend, obtenerFallbackPorStatus }

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
  let pendingRefreshPromise = null

  async function renovarToken() {
    const refreshToken = storage?.getRefreshToken ? storage.getRefreshToken() : null
    if (!refreshToken) return null

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
          return refreshData.access
        }
      }
      return null
    } catch {
      return null
    } finally {
      pendingRefreshPromise = null
    }
  }

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
          if (!pendingRefreshPromise) {
            pendingRefreshPromise = renovarToken()
          }

          const nuevoToken = await pendingRefreshPromise
          if (nuevoToken) {
            return await request(endpoint, {
              ...options,
              _isRetry: true,
            })
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
