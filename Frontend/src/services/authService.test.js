import { describe, it } from 'node:test'
import assert from 'node:assert'
import { createAuthService } from './authService.js'
import { ApiError } from './api.js'

describe('Servicio de Autenticación (authService - TP8 - TDD)', () => {
  it('login exitoso: obtiene tokens, los almacena y recupera perfil de usuario', async () => {
    let tokensGuardados = null
    const fakeStorage = {
      setTokens: (tokens) => { tokensGuardados = tokens },
      getAccessToken: () => 'access-token-123',
      clearTokens: () => { tokensGuardados = null },
      hasToken: () => Boolean(tokensGuardados),
    }

    const fakeApiClient = {
      post: async (endpoint, body, options) => {
        if (endpoint === '/token/') {
          assert.deepStrictEqual(body, { username: 'alumno', password: 'secretPassword' })
          assert.strictEqual(options?.skipAuth, true)
          return { access: 'access-token-123', refresh: 'refresh-token-456' }
        }
        throw new Error(`Endpoint inesperado: ${endpoint}`)
      },
      get: async (endpoint) => {
        if (endpoint === '/users/me/') {
          return {
            id: 1,
            username: 'alumno',
            email: 'alumno@um.edu.ar',
            role: 'ESTUDIANTE',
            plan_estudio_nombre: 'Ingeniería en Informática',
          }
        }
        throw new Error(`Endpoint inesperado: ${endpoint}`)
      },
    }

    const authService = createAuthService({ apiClient: fakeApiClient, storage: fakeStorage })
    const result = await authService.login('alumno', 'secretPassword')

    assert.strictEqual(result.ok, true)
    assert.deepStrictEqual(tokensGuardados, { access: 'access-token-123', refresh: 'refresh-token-456' })
    assert.deepStrictEqual(result.user, {
      id: 1,
      username: 'alumno',
      email: 'alumno@um.edu.ar',
      role: 'ESTUDIANTE',
      plan_estudio_nombre: 'Ingeniería en Informática',
    })
  })

  it('login rechazado: credenciales incorrectas (401) no guardan token y devuelven mensaje', async () => {
    let tokensGuardados = null
    const fakeStorage = {
      setTokens: (tokens) => { tokensGuardados = tokens },
      getAccessToken: () => null,
      clearTokens: () => { tokensGuardados = null },
      hasToken: () => false,
    }

    const fakeApiClient = {
      post: async () => {
        throw new ApiError(401, { detail: 'No active account found with the given credentials' })
      },
      get: async () => {
        throw new Error('No debería llamar a get')
      },
    }

    const authService = createAuthService({ apiClient: fakeApiClient, storage: fakeStorage })
    const result = await authService.login('alumno', 'password_erroneo')

    assert.strictEqual(result.ok, false)
    assert.strictEqual(result.message, 'No active account found with the given credentials')
    assert.strictEqual(tokensGuardados, null)
  })

  it('login con campos vacíos es rechazado inmediatamente sin llamar a la API', async () => {
    let apiLlamada = false
    const fakeApiClient = {
      post: async () => { apiLlamada = true },
      get: async () => {},
    }
    const fakeStorage = {
      setTokens: () => {},
      clearTokens: () => {},
      hasToken: () => false,
    }

    const authService = createAuthService({ apiClient: fakeApiClient, storage: fakeStorage })

    const resultSinUsuario = await authService.login('', '1234')
    assert.strictEqual(resultSinUsuario.ok, false)
    assert.strictEqual(resultSinUsuario.message, 'Debe ingresar usuario y contraseña')

    const resultSinPass = await authService.login('usuario', '')
    assert.strictEqual(resultSinPass.ok, false)
    assert.strictEqual(resultSinPass.message, 'Debe ingresar usuario y contraseña')

    assert.strictEqual(apiLlamada, false)
  })

  it('getCurrentUser devuelve el perfil cuando hay token en storage', async () => {
    const fakeStorage = {
      hasToken: () => true,
      getAccessToken: () => 'token-valido',
      clearTokens: () => {},
    }
    const fakeApiClient = {
      get: async (endpoint) => {
        if (endpoint === '/users/me/') {
          return { id: 5, username: 'docente_user', role: 'DOCENTE' }
        }
      },
    }

    const authService = createAuthService({ apiClient: fakeApiClient, storage: fakeStorage })
    const user = await authService.getCurrentUser()

    assert.deepStrictEqual(user, { id: 5, username: 'docente_user', role: 'DOCENTE' })
  })

  it('getCurrentUser devuelve null y limpia tokens si el backend responde 401 (token expirado)', async () => {
    let tokensLimpiados = false
    const fakeStorage = {
      hasToken: () => true,
      getAccessToken: () => 'token-expirado',
      clearTokens: () => { tokensLimpiados = true },
    }
    const fakeApiClient = {
      get: async () => {
        throw new ApiError(401, { detail: 'Token is invalid or expired' })
      },
    }

    const authService = createAuthService({ apiClient: fakeApiClient, storage: fakeStorage })
    const user = await authService.getCurrentUser()

    assert.strictEqual(user, null)
    assert.strictEqual(tokensLimpiados, true)
  })

  it('logout limpia los tokens en storage', () => {
    let tokensLimpiados = false
    const fakeStorage = {
      clearTokens: () => { tokensLimpiados = true },
    }

    const authService = createAuthService({ storage: fakeStorage })
    authService.logout()

    assert.strictEqual(tokensLimpiados, true)
  })

  it('register exitoso: envía POST a /users/register/ con datos normalizados y skipAuth: true', async () => {
    let capturedBody = null
    let capturedOptions = null
    const fakeApiClient = {
      post: async (endpoint, body, options) => {
        if (endpoint === '/users/register/') {
          capturedBody = body
          capturedOptions = options
          return { id: 10, username: 'nuevo_estudiante', email: 'nuevo@um.edu.ar' }
        }
        throw new Error(`Endpoint inesperado: ${endpoint}`)
      },
    }

    const authService = createAuthService({ apiClient: fakeApiClient })
    const result = await authService.register({
      username: '  nuevo_estudiante  ',
      email: '  nuevo@um.edu.ar  ',
      password: 'MiPassword123',
    })

    assert.strictEqual(result.ok, true)
    assert.deepStrictEqual(capturedBody, {
      username: 'nuevo_estudiante',
      email: 'nuevo@um.edu.ar',
      password: 'MiPassword123',
    })
    assert.strictEqual(capturedOptions?.skipAuth, true)
  })

  it('register validación temprana: rechaza campos obligatorios faltantes o inválidos', async () => {
    let apiLlamada = false
    const fakeApiClient = {
      post: async () => { apiLlamada = true },
    }
    const authService = createAuthService({ apiClient: fakeApiClient })

    const resIncompleto = await authService.register({ username: '', email: 'test@um.edu.ar', password: '123' })
    assert.strictEqual(resIncompleto.ok, false)
    assert.strictEqual(resIncompleto.message, 'Faltan datos obligatorios')

    const resPassCorta = await authService.register({ username: 'user', email: 'test@um.edu.ar', password: '12' })
    assert.strictEqual(resPassCorta.ok, false)
    assert.strictEqual(resPassCorta.message, 'La contraseña debe tener al menos 4 caracteres')

    const resEmailMalo = await authService.register({ username: 'user', email: 'correo-invalido', password: 'password' })
    assert.strictEqual(resEmailMalo.ok, false)
    assert.strictEqual(resEmailMalo.message, 'El formato de email no es válido')

    assert.strictEqual(apiLlamada, false)
  })

  it('register error de API: propaga errores de validación de Django (ej. usuario duplicado)', async () => {
    const fakeApiClient = {
      post: async () => {
        throw new ApiError(400, { username: ['A user with that username already exists.'] })
      },
    }
    const authService = createAuthService({ apiClient: fakeApiClient })

    const result = await authService.register({
      username: 'existente',
      email: 'existente@um.edu.ar',
      password: 'Password123',
    })

    assert.strictEqual(result.ok, false)
    assert.strictEqual(result.message, 'username: A user with that username already exists.')
  })
})

