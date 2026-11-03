import { describe, it } from 'node:test'
import assert from 'node:assert'
import { createApiClient, ApiError } from './api.js'

describe('Cliente API HTTP (TP8 - TDD)', () => {
  it('ApiError captura status, data y extrae mensaje legible de DRF detail', () => {
    const errorData = { detail: 'Credenciales inválidas' }
    const err = new ApiError(401, errorData, 'Error por defecto')

    assert.strictEqual(err.status, 401)
    assert.deepStrictEqual(err.data, errorData)
    assert.strictEqual(err.message, 'Credenciales inválidas')
  })

  it('ApiError traduce mensajes técnicos de token inválido o expirado a un aviso comprensible en español', () => {
    const errorData = { detail: 'Given token not valid for any token type', code: 'token_not_valid' }
    const err = new ApiError(401, errorData, 'Error por defecto')

    assert.strictEqual(err.status, 401)
    assert.strictEqual(
      err.message,
      'Tu sesión ha expirado por inactividad. Por favor, iniciá sesión nuevamente para continuar.'
    )
  })

  it('ApiError extrae mensajes de validación de campos de DRF', () => {
    const errorData = { username: ['Este usuario ya existe.'] }
    const err = new ApiError(400, errorData, 'Error al registrar')

    assert.strictEqual(err.status, 400)
    assert.strictEqual(err.message, 'username: Este usuario ya existe.')
  })

  it('construye la URL base correctamente sin duplicar barras diagonales', async () => {
    let capturedUrl = ''
    const mockFetch = async (url) => {
      capturedUrl = url
      return {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ resultado: 'ok' }),
      }
    }

    const client = createApiClient({
      baseUrl: 'http://localhost:8000/api/',
      customFetch: mockFetch,
    })

    const data = await client.get('/materias/')
    assert.strictEqual(capturedUrl, 'http://localhost:8000/api/materias/')
    assert.deepStrictEqual(data, { resultado: 'ok' })
  })

  it('adjunta header Authorization con Bearer token cuando hay sesión', async () => {
    let capturedHeaders = {}
    const mockFetch = async (url, options) => {
      capturedHeaders = options.headers
      return {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ([]),
      }
    }

    const client = createApiClient({
      baseUrl: 'http://localhost:8000/api',
      getAuthToken: () => 'token-jwt-secreto',
      customFetch: mockFetch,
    })

    await client.get('/examenes/')
    assert.strictEqual(capturedHeaders['Authorization'], 'Bearer token-jwt-secreto')
  })

  it('omite header Authorization si skipAuth es true o no hay token', async () => {
    let capturedHeaders = {}
    const mockFetch = async (url, options) => {
      capturedHeaders = options.headers
      return {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ access: 'nuevo-token' }),
      }
    }

    const client = createApiClient({
      baseUrl: 'http://localhost:8000/api',
      getAuthToken: () => 'token-existente',
      customFetch: mockFetch,
    })

    await client.post('/token/', { username: 'test', password: '123' }, { skipAuth: true })
    assert.strictEqual(capturedHeaders['Authorization'], undefined)
    assert.strictEqual(capturedHeaders['Content-Type'], 'application/json')
  })

  it('serializa el body JSON automáticamente en peticiones POST', async () => {
    let capturedBody = ''
    const mockFetch = async (url, options) => {
      capturedBody = options.body
      return {
        ok: true,
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ id: 1 }),
      }
    }

    const client = createApiClient({
      baseUrl: 'http://localhost:8000/api',
      customFetch: mockFetch,
    })

    await client.post('/users/register/', { username: 'nuevo' })
    assert.strictEqual(capturedBody, JSON.stringify({ username: 'nuevo' }))
  })

  it('serializa el body y realiza petición con método PATCH', async () => {
    let capturedMethod = ''
    let capturedBody = ''
    const mockFetch = async (url, options) => {
      capturedMethod = options.method
      capturedBody = options.body
      return {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ id: 1, plan_estudio_nombre: 'Medicina' }),
      }
    }

    const client = createApiClient({
      baseUrl: 'http://localhost:8000/api',
      customFetch: mockFetch,
    })

    const res = await client.patch('/users/me/', { plan_estudio_nombre: 'Medicina' })
    assert.strictEqual(capturedMethod, 'PATCH')
    assert.strictEqual(capturedBody, JSON.stringify({ plan_estudio_nombre: 'Medicina' }))
    assert.strictEqual(res.plan_estudio_nombre, 'Medicina')
  })

  it('lanza ApiError con status y datos cuando el servidor responde con error', async () => {
    const mockFetch = async () => ({
      ok: false,
      status: 400,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ email: ['Formato inválido'] }),
    })

    const client = createApiClient({
      baseUrl: 'http://localhost:8000/api',
      customFetch: mockFetch,
    })

    await assert.rejects(
      async () => {
        await client.post('/users/register/', { email: 'invalido' })
      },
      (err) => {
        assert(err instanceof ApiError)
        assert.strictEqual(err.status, 400)
        assert.strictEqual(err.message, 'email: Formato inválido')
        return true
      }
    )
  })

  it('devuelve null de forma segura en respuestas 204 No Content', async () => {
    const mockFetch = async () => ({
      ok: true,
      status: 204,
      headers: new Headers(),
      json: async () => {
        throw new SyntaxError('Unexpected end of JSON input')
      },
      text: async () => '',
    })

    const client = createApiClient({
      baseUrl: 'http://localhost:8000/api',
      customFetch: mockFetch,
    })

    const result = await client.delete('/materias/1/')
    assert.strictEqual(result, null)
  })

  it('ApiError traduce mensajes de credenciales incorrectas de SimpleJWT a español amigable', () => {
    const errorData = { detail: 'No active account found with the given credentials' }
    const err = new ApiError(401, errorData, 'Error por defecto')

    assert.strictEqual(err.status, 401)
    assert.strictEqual(
      err.message,
      'Usuario o contraseña incorrectos. Por favor, verificá tus datos e intentalo nuevamente.'
    )
  })

  it('ApiError traduce cuenta de usuario deshabilitada a español', () => {
    const errorData = { detail: 'User account is disabled.' }
    const err = new ApiError(401, errorData)

    assert.strictEqual(
      err.message,
      'Esta cuenta de usuario ha sido deshabilitada. Comunicate con el administrador.'
    )
  })

  it('ApiError traduce credenciales no provistas y permisos denegados a español', () => {
    const errCred = new ApiError(401, { detail: 'Authentication credentials were not provided.' })
    assert.strictEqual(errCred.message, 'No has iniciado sesión o no se proporcionaron credenciales.')

    const errPerm = new ApiError(403, { detail: 'You do not have permission to perform this action.' })
    assert.strictEqual(errPerm.message, 'No tienes permisos para realizar esta acción.')
  })

  it('ApiError traduce campos obligatorios en inglés a español en validaciones de formulario', () => {
    const errorData = {
      nombre: ['This field may not be blank.'],
      codigo: ['This field is required.'],
    }
    const err = new ApiError(400, errorData)

    assert.strictEqual(
      err.message,
      'nombre: Este campo no puede estar en blanco. | codigo: Este campo es obligatorio.'
    )
  })

  it('ApiError proporciona fallbacks limpios en español según el código HTTP cuando no hay data', () => {
    const err404 = new ApiError(404, null, 'Error HTTP 404')
    assert.strictEqual(err404.message, 'El recurso solicitado no fue encontrado.')

    const err500 = new ApiError(500, null, 'Error HTTP 500')
    assert.strictEqual(err500.message, 'Ocurrió un error interno en el servidor. Por favor, intentá nuevamente más tarde.')
  })

  it('createApiClient captura excepciones de red (fetch) y lanza ApiError en español', async () => {
    const mockFailingFetch = async () => {
      throw new TypeError('Failed to fetch')
    }

    const client = createApiClient({
      baseUrl: 'http://localhost:8000/api',
      customFetch: mockFailingFetch,
    })

    await assert.rejects(
      async () => {
        await client.get('/materias/')
      },
      (err) => {
        assert(err instanceof ApiError)
        assert.strictEqual(err.status, 0)
        assert.match(err.message, /No se pudo conectar con el servidor/i)
        return true
      }
    )
  })

  it('createApiClient comparte una única llamada de refresh token ante peticiones concurrentes 401', async () => {
    let refreshCalls = 0
    let tokensGuardados = { access: 'old-access', refresh: 'valid-refresh' }

    const fakeStorage = {
      getAccessToken: () => tokensGuardados.access,
      getRefreshToken: () => tokensGuardados.refresh,
      setTokens: (nuevos) => { tokensGuardados = nuevos },
      clearTokens: () => { tokensGuardados = {} },
    }

    const mockFetch = async (url) => {
      if (url.includes('/token/refresh/')) {
        refreshCalls++
        // Simular latencia de red en renovación
        await new Promise((resolve) => setTimeout(resolve, 20))
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ access: 'brand-new-access', refresh: 'brand-new-refresh' }),
        }
      }

      // Si la llamada trae el token viejo, simular 401
      if (url.includes('/materias/') || url.includes('/examenes/')) {
        if (tokensGuardados.access === 'old-access') {
          return {
            ok: false,
            status: 401,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({ detail: 'Token inválido' }),
          }
        }
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ data: 'ok' }),
        }
      }

      return { ok: true, status: 200, headers: new Headers(), json: async () => ({}) }
    }

    const client = createApiClient({
      baseUrl: 'http://localhost:8000/api',
      getAuthToken: () => tokensGuardados.access,
      storage: fakeStorage,
      customFetch: mockFetch,
    })

    // Dos peticiones concurrentes
    const [res1, res2] = await Promise.all([
      client.get('/materias/'),
      client.get('/examenes/'),
    ])

    assert.deepStrictEqual(res1, { data: 'ok' })
    assert.deepStrictEqual(res2, { data: 'ok' })
    // Solo debe haber ocurrido 1 llamada a refresh token para ambas peticiones
    assert.strictEqual(refreshCalls, 1)
    assert.strictEqual(tokensGuardados.access, 'brand-new-access')
  })
})
