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
      const storage = getStorage()
      return storage ? storage.getItem(ACCESS_TOKEN_KEY) : null
    },

    getRefreshToken() {
      const storage = getStorage()
      return storage ? storage.getItem(REFRESH_TOKEN_KEY) : null
    },

    setTokens({ access, refresh } = {}) {
      const storage = getStorage()
      if (!storage) return

      if (access) {
        storage.setItem(ACCESS_TOKEN_KEY, access)
      }
      if (refresh) {
        storage.setItem(REFRESH_TOKEN_KEY, refresh)
      }
    },

    clearTokens() {
      const storage = getStorage()
      if (!storage) return

      storage.removeItem(ACCESS_TOKEN_KEY)
      storage.removeItem(REFRESH_TOKEN_KEY)
    },

    hasToken() {
      const storage = getStorage()
      return Boolean(storage && storage.getItem(ACCESS_TOKEN_KEY))
    },
  }
}

export const tokenStorage = createTokenStorage()
