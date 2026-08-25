/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useMemo, useState } from 'react'
import { HARDCODED_USERS } from '../data/hardcodedUsers.js'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(HARDCODED_USERS)
  const [user, setUser] = useState(null)

  const login = useCallback((username, password) => {
    const found = users.find((u) => u.username === username)
    if (!found || found.password !== password) {
      return { ok: false, message: 'Usuario o contraseña incorrecta' }
    }
    setUser({ username: found.username, email: found.email, rol: found.rol })
    return { ok: true }
  }, [users])

  const register = useCallback(({ username, password, email }) => {
    if (!username || !password || !email) {
      return { ok: false, message: 'Faltan datos obligatorios' }
    }
    if (users.some((u) => u.username === username)) {
      return { ok: false, message: 'El usuario ya existe' }
    }
    setUsers((prev) => [...prev, { username, password, email, rol: 'estudiante' }])
    return { ok: true }
  }, [users])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const contextValue = useMemo(() => ({ user, login, register, logout }), [user, login, register, logout])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}
