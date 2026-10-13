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
})
