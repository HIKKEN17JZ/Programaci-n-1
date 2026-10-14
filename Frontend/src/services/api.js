import { tokenStorage } from './storage.js'

export class ApiError extends Error {
  constructor(status, data, defaultMessage = 'Error en la petición a la API') {
    const message = ApiError.extractMessage(data, defaultMessage)
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }

  static extractMessage(data, fallback) {
    if (!data) return fallback

    if (typeof data === 'string') return data

    if (data.detail && typeof data.detail === 'string') {
      return data.detail
    }

    if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
      return data.non_field_errors[0]
    }

    if (typeof data === 'object') {
      const fieldErrors = Object.entries(data)
        .filter(([, val]) => Array.isArray(val) && val.length > 0)
        .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)

      if (fieldErrors.length > 0) {
        return fieldErrors.join(' | ')
      }
    }

    return fallback
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

    const response = await fetchFn(url, {
      method,
      headers: requestHeaders,
      body: serializedBody,
      ...extraOptions,
    })

    if (response.status === 204) {
      return null
    }

    const contentType = response.headers.get('content-type') || ''
    const isJson = contentType.includes('application/json')
    const responseData = isJson ? await response.json() : await response.text()

    if (!response.ok) {
      throw new ApiError(response.status, responseData, `Error HTTP ${response.status}`)
    }

    return responseData
  }

  return {
    request,
    get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
    post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
    put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
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
