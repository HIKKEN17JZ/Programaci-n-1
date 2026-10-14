import { describe, it } from 'node:test'
import assert from 'node:assert'
import { createTokenStorage } from './storage.js'

describe('Servicio de Almacenamiento de Tokens (TP8 - TDD)', () => {
  it('guarda y recupera tokens de acceso y refresh correctamente', () => {
    const memoryStore = new Map()
    const storageEngine = {
      getItem: (key) => memoryStore.get(key) ?? null,
      setItem: (key, value) => memoryStore.set(key, String(value)),
      removeItem: (key) => memoryStore.delete(key),
    }

    const tokenStorage = createTokenStorage(storageEngine)

    assert.strictEqual(tokenStorage.getAccessToken(), null)
    assert.strictEqual(tokenStorage.getRefreshToken(), null)

    tokenStorage.setTokens({ access: 'access-token-123', refresh: 'refresh-token-456' })

    assert.strictEqual(tokenStorage.getAccessToken(), 'access-token-123')
    assert.strictEqual(tokenStorage.getRefreshToken(), 'refresh-token-456')
  })

  it('elimina tokens al invocar clearTokens', () => {
    const memoryStore = new Map([
      ['access_token', 'token-abc'],
      ['refresh_token', 'token-xyz'],
    ])
    const storageEngine = {
      getItem: (key) => memoryStore.get(key) ?? null,
      setItem: (key, value) => memoryStore.set(key, String(value)),
      removeItem: (key) => memoryStore.delete(key),
    }

    const tokenStorage = createTokenStorage(storageEngine)
    tokenStorage.clearTokens()

    assert.strictEqual(tokenStorage.getAccessToken(), null)
    assert.strictEqual(tokenStorage.getRefreshToken(), null)
    assert.strictEqual(memoryStore.size, 0)
  })

  it('informa correctamente si existe sesion activa', () => {
    const memoryStore = new Map()
    const storageEngine = {
      getItem: (key) => memoryStore.get(key) ?? null,
      setItem: (key, value) => memoryStore.set(key, String(value)),
      removeItem: (key) => memoryStore.delete(key),
    }

    const tokenStorage = createTokenStorage(storageEngine)
    assert.strictEqual(tokenStorage.hasToken(), false)

    tokenStorage.setTokens({ access: 'token-valido' })
    assert.strictEqual(tokenStorage.hasToken(), true)
  })

  it('maneja excepciones de forma segura si el storage arroja error (ej. navegación privada o cuota excedida)', () => {
    const errorStorage = {
      getItem: () => {
        throw new Error('QuotaExceededError: Access denied')
      },
      setItem: () => {
        throw new Error('QuotaExceededError: Access denied')
      },
      removeItem: () => {
        throw new Error('QuotaExceededError: Access denied')
      },
    }

    const tokenStorage = createTokenStorage(errorStorage)

    assert.strictEqual(tokenStorage.getAccessToken(), null)
    assert.strictEqual(tokenStorage.getRefreshToken(), null)
    assert.strictEqual(tokenStorage.hasToken(), false)

    assert.doesNotThrow(() => {
      tokenStorage.setTokens({ access: 'tok', refresh: 'ref' })
      tokenStorage.clearTokens()
    })
  })
})
