import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  verificarAccesoRuta,
  obtenerMensajeErrorRol,
} from './routeGuards.js'
import { ROLES } from './roles.js'

describe('Guardias de Rutas y Control de Acceso por Rol (TDD - TP9)', () => {
  describe('verificarAccesoRuta', () => {
    it('deniega acceso y redirige a /login si no hay usuario autenticado', () => {
      const resultadoNull = verificarAccesoRuta(null, [ROLES.ADMIN])
      assert.strictEqual(resultadoNull.autorizado, false)
      assert.strictEqual(resultadoNull.motivo, 'NO_AUTENTICADO')
      assert.strictEqual(resultadoNull.redireccion, '/login')

      const resultadoUndefined = verificarAccesoRuta(undefined, [ROLES.ESTUDIANTE])
      assert.strictEqual(resultadoUndefined.autorizado, false)
      assert.strictEqual(resultadoUndefined.motivo, 'NO_AUTENTICADO')
    })

    it('permite acceso a cualquier usuario autenticado si la lista de roles está vacía o es indefinida', () => {
      const estudiante = { username: 'juan', role: ROLES.ESTUDIANTE }
      assert.deepStrictEqual(verificarAccesoRuta(estudiante), { autorizado: true })
      assert.deepStrictEqual(verificarAccesoRuta(estudiante, []), { autorizado: true })
    })

    it('permite acceso si el rol del usuario está dentro de los roles permitidos', () => {
      const docente = { username: 'profe', role: ROLES.DOCENTE }
      const res = verificarAccesoRuta(docente, [ROLES.DOCENTE, ROLES.ADMIN])
      assert.strictEqual(res.autorizado, true)
    })

    it('el administrador tiene acceso concedido aun si no figura explícitamente en la lista', () => {
      const admin = { username: 'admin', role: ROLES.ADMIN }
      const res = verificarAccesoRuta(admin, [ROLES.DOCENTE])
      assert.strictEqual(res.autorizado, true)

      const superuser = { username: 'root', is_superuser: true }
      const resSuper = verificarAccesoRuta(superuser, [ROLES.ESTUDIANTE])
      assert.strictEqual(resSuper.autorizado, true)
    })

    it('deniega acceso y redirige a /unauthorized si el rol no coincide', () => {
      const estudiante = { username: 'alumno', role: ROLES.ESTUDIANTE }
      const res = verificarAccesoRuta(estudiante, [ROLES.DOCENTE])

      assert.strictEqual(res.autorizado, false)
      assert.strictEqual(res.motivo, 'ROL_NO_AUTORIZADO')
      assert.strictEqual(res.redireccion, '/unauthorized')
      assert.strictEqual(res.rolActual, ROLES.ESTUDIANTE)
    })

    it('soporta pasar un único rol como string en lugar de array', () => {
      const docente = { username: 'prof', role: ROLES.DOCENTE }
      const resValido = verificarAccesoRuta(docente, ROLES.DOCENTE)
      assert.strictEqual(resValido.autorizado, true)

      const estudiante = { username: 'pepe', role: ROLES.ESTUDIANTE }
      const resInvalido = verificarAccesoRuta(estudiante, ROLES.DOCENTE)
      assert.strictEqual(resInvalido.autorizado, false)
    })

    it('maneja mayúsculas, minúsculas y espacios en blanco de forma insensible', () => {
      const docente = { username: 'profe', role: 'docente' }
      const res = verificarAccesoRuta(docente, ['  DOCENTE  '])
      assert.strictEqual(res.autorizado, true)
    })
  })

  describe('obtenerMensajeErrorRol', () => {
    it('devuelve mensaje para usuario no autenticado', () => {
      const msg = obtenerMensajeErrorRol('NO_AUTENTICADO')
      assert.match(msg, /iniciar sesión/i)
    })

    it('devuelve mensaje descriptivo con el rol actual y los roles requeridos', () => {
      const msg = obtenerMensajeErrorRol('ROL_NO_AUTORIZADO', ROLES.ESTUDIANTE, [ROLES.DOCENTE, ROLES.ADMIN])
      assert.match(msg, /Estudiante/i)
      assert.match(msg, /Docente/i)
    })

    it('devuelve mensaje claro si el rol no está autorizado y no se especificaron roles requeridos', () => {
      const msg = obtenerMensajeErrorRol('ROL_NO_AUTORIZADO', ROLES.ESTUDIANTE, [])
      assert.match(msg, /Estudiante/i)
      assert.match(msg, /no cuenta con los permisos/i)
    })

    it('devuelve mensaje genérico si el motivo no es reconocido', () => {
      const msg = obtenerMensajeErrorRol('OTRO_MOTIVO')
      assert.match(msg, /no tienes permisos/i)
    })
  })
})
