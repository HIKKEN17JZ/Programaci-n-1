/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { authService } from '../services/authService.js'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Carga inicial del usuario autenticado si existe token guardado
  useEffect(() => {
    let isMounted = true

    async function initializeAuth() {
      try {
        const currentUser = await authService.getCurrentUser()
        if (isMounted) {
          setUser(currentUser)
        }
      } catch {
        if (isMounted) {
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      isMounted = false
    }
  }, [])

  const login = useCallback(async (username, password) => {
    const resultado = await authService.login(username, password)
    if (resultado.ok) {
      setUser(resultado.user)
    }
    return resultado
  }, [])

  const register = useCallback(async ({ username, password, email }) => {
    return await authService.register({ username, password, email })
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const contextValue = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  )

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}
