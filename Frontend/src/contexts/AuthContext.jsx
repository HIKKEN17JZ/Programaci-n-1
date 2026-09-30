/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useMemo, useState } from 'react'
import { HARDCODED_USERS } from '../data/hardcodedUsers.js'
import {
  autenticarUsuario,
  validarRegistro,
  crearUsuarioEstudiante,
} from '../utils/auth.js'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(HARDCODED_USERS)
  const [user, setUser] = useState(null)

  const login = useCallback(
    (username, password) => {
      const resultado = autenticarUsuario(users, username, password)
      if (!resultado.ok) {
        return resultado
      }
      setUser(resultado.user)
      return { ok: true }
    },
    [users],
  )

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
    setUser(null)
  }, [])

  const contextValue = useMemo(() => ({ user, login, register, logout }), [user, login, register, logout])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}
