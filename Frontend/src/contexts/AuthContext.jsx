/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { authService } from '../services/authService.js'
import { HARDCODED_USERS } from '../data/hardcodedUsers.js'
import { validarRegistro, crearUsuarioEstudiante } from '../utils/auth.js'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(HARDCODED_USERS)
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

  const register = useCallback(
    ({ username, password, email }) => {
      const validacion = validarRegistro({ username, email, password }, users)
      if (!validacion.ok) {
        return validacion
      }
      const nuevoUsuario = crearUsuarioEstudiante({ username, email, password })
      setUsers((prev) => [...prev, nuevoUsuario])
      return { ok: true }
    },
    [users],
  )

  const logout = useCallback(() => {
    authService.logout()
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
