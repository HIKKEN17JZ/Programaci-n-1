import { api } from './api.js'
import { tokenStorage } from './storage.js'

function validateLoginInput(username, password) {
  if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
    return 'Debe ingresar usuario y contraseña'
  }
  if (!username.trim() || !password.trim()) {
    return 'Debe ingresar usuario y contraseña'
  }
  return null
}

export function createAuthService({ apiClient = api, storage = tokenStorage } = {}) {
  return {
    async login(username, password) {
      const validationError = validateLoginInput(username, password)
      if (validationError) {
        return { ok: false, message: validationError }
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
    },

    async getCurrentUser() {
      if (!storage.hasToken()) {
        return null
      }

      try {
        return await apiClient.get('/users/me/')
      } catch (error) {
        if (error?.status === 401) {
          storage.clearTokens()
        }
        return null
      }
    },

    logout() {
      storage.clearTokens()
    },
  }
}

export const authService = createAuthService()
