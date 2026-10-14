import { api } from './api.js'
import { tokenStorage } from './storage.js'
import { validarFormatoEmail } from '../utils/auth.js'

function validateLoginInput(username, password) {
  if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
    return 'Debe ingresar usuario y contraseña'
  }
  if (!username.trim() || !password.trim()) {
    return 'Debe ingresar usuario y contraseña'
  }
  return null
}

function validateRegisterInput({ username, email, password } = {}) {
  const cleanUsername = typeof username === 'string' ? username.trim() : ''
  const cleanEmail = typeof email === 'string' ? email.trim() : ''

  if (!cleanUsername || !cleanEmail || !password || typeof password !== 'string') {
    return 'Faltan datos obligatorios'
  }
  if (password.length < 4) {
    return 'La contraseña debe tener al menos 4 caracteres'
  }
  if (!validarFormatoEmail(cleanEmail)) {
    return 'El formato de email no es válido'
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

    async register({ username, email, password }) {
      const validationError = validateRegisterInput({ username, email, password })
      if (validationError) {
        return { ok: false, message: validationError }
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

    async logout() {
      const refreshToken = storage.getRefreshToken()
      if (refreshToken) {
        try {
          await apiClient.post(
            '/logout/',
            { refresh: refreshToken },
            { skipAuth: true }
          )
        } catch {
          // Ignoramos errores de red o token ya invalidado para
          // garantizar siempre la destrucción local de la sesión.
        }
      }
      storage.clearTokens()
    },
  }
}

export const authService = createAuthService()
