const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

function resolveBrowserStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage
  }
  return null
}

export function createTokenStorage(customStorage = null) {
  const getStorage = () => customStorage || resolveBrowserStorage()

  return {
    getAccessToken() {
      try {
        const storage = getStorage()
        return storage ? storage.getItem(ACCESS_TOKEN_KEY) : null
      } catch {
        return null
      }
    },

    getRefreshToken() {
      try {
        const storage = getStorage()
        return storage ? storage.getItem(REFRESH_TOKEN_KEY) : null
      } catch {
        return null
      }
    },

    setTokens({ access, refresh } = {}) {
      try {
        const storage = getStorage()
        if (!storage) return

        if (access) {
          storage.setItem(ACCESS_TOKEN_KEY, access)
        }
        if (refresh) {
          storage.setItem(REFRESH_TOKEN_KEY, refresh)
        }
      } catch {
        // Ignora errores si la cuota está excedida o el acceso está restringido
      }
    },

    clearTokens() {
      try {
        const storage = getStorage()
        if (!storage) return

        storage.removeItem(ACCESS_TOKEN_KEY)
        storage.removeItem(REFRESH_TOKEN_KEY)
      } catch {
        // Ignora errores si el acceso al storage está bloqueado
      }
    },

    hasToken() {
      try {
        const storage = getStorage()
        return Boolean(storage && storage.getItem(ACCESS_TOKEN_KEY))
      } catch {
        return false
      }
    },
  }
}

export const tokenStorage = createTokenStorage()
