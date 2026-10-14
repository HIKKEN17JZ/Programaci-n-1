import { api } from './api.js'
import { tokenStorage } from './storage.js'
import { validarCredencialesLogin, validarRegistro } from '../utils/auth.js'

export function createAuthService({ apiClient = api, storage = tokenStorage } = {}) {
  async function login(username, password) {
    const validation = validarCredencialesLogin(username, password)
    if (!validation.ok) {
      return { ok: false, message: validation.message }
    }

    try {
      const tokens = await apiClient.post(
        '/token/',
        { username: username.trim(), password },
        { skipAuth: true }
      )

      storage.setTokens({
        access: tokens.access,
        refresh: tokens.refresh,
      })

      const user = await apiClient.get('/users/me/')
      return { ok: true, user }
    } catch (error) {
      storage.clearTokens()
      return {
        ok: false,
        message: error?.message || 'Error al iniciar sesión',
      }
    }
  }

  async function register({ username, email, password }) {
    const validation = validarRegistro({ username, email, password })
    if (!validation.ok) {
      return { ok: false, message: validation.message }
    }

    try {
      const data = await apiClient.post(
        '/users/register/',
        {
          username: username.trim(),
          email: email.trim(),
          password,
        },
        { skipAuth: true }
      )
      return { ok: true, data }
    } catch (error) {
      return {
        ok: false,
        message: error?.message || 'Error al registrar usuario',
      }
    }
  }

  async function refreshToken() {
    const refresh = storage.getRefreshToken ? storage.getRefreshToken() : null
    if (!refresh) {
      return null
    }

    try {
      const response = await apiClient.post(
        '/token/refresh/',
        { refresh },
        { skipAuth: true }
      )

      if (response?.access) {
        storage.setTokens({
          access: response.access,
          refresh: response.refresh || refresh,
        })
        return response.access
      }

      storage.clearTokens()
      return null
    } catch {
      storage.clearTokens()
      return null
    }
  }

  async function getCurrentUser() {
    if (!storage.hasToken()) {
      return null
    }

    try {
      return await apiClient.get('/users/me/')
    } catch (error) {
      if (error?.status === 401) {
        const renewedToken = await refreshToken()
        if (renewedToken) {
          try {
            return await apiClient.get('/users/me/')
          } catch {
            storage.clearTokens()
            return null
          }
        }
        storage.clearTokens()
      }
      return null
    }
  }

  async function logout() {
    const refreshTokenValue = storage.getRefreshToken ? storage.getRefreshToken() : null
    if (refreshTokenValue) {
      try {
        await apiClient.post(
          '/logout/',
          { refresh: refreshTokenValue },
          { skipAuth: true }
        )
      } catch {
        // Ignoramos errores de red o token ya invalidado para
        // garantizar siempre la destrucción local de la sesión.
      }
    }
    storage.clearTokens()
  }

  return {
    login,
    register,
    refreshToken,
    getCurrentUser,
    logout,
  }
}

export const authService = createAuthService()
