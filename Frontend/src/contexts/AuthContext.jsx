/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useState } from 'react'
import { HARDCODED_USERS } from '../data/hardcodedUsers.js'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(HARDCODED_USERS)
  const [user, setUser] = useState(null)

  const login = useCallback((username, password) => {
    const found = users.find((u) => u.username === username)
    if (!found) {
      return { ok: false, message: 'Usuario no encontrado' }
    }
    if (found.password !== password) {
      return { ok: false, message: 'Contraseña incorrecta' }
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

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
