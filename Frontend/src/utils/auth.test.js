import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  autenticarUsuario,
  validarRegistro,
  validarFormatoEmail,
  crearUsuarioEstudiante,
} from './auth.js'

const USUARIOS_TEST = [
  { username: 'admin', password: 'admin123', email: 'admin@um.edu.ar', rol: 'admin' },
  { username: 'alumno', password: '1234', email: 'alumno@um.edu.ar', rol: 'estudiante' },
]

describe('Sistema de Autenticación y Control de Acceso (TP7)', () => {
  describe('validarFormatoEmail', () => {
    it('acepta formatos de email válidos', () => {
      assert.strictEqual(validarFormatoEmail('alumno@um.edu.ar'), true)
      assert.strictEqual(validarFormatoEmail('usuario.test@gmail.com'), true)
      assert.strictEqual(validarFormatoEmail('admin+lab@universidad.edu'), true)
    })

    it('rechaza formatos de email inválidos o vacíos', () => {
      assert.strictEqual(validarFormatoEmail('sin-arroba.com'), false)
      assert.strictEqual(validarFormatoEmail('@sin-usuario.com'), false)
      assert.strictEqual(validarFormatoEmail('usuario@'), false)
      assert.strictEqual(validarFormatoEmail(''), false)
      assert.strictEqual(validarFormatoEmail(null), false)
      assert.strictEqual(validarFormatoEmail(undefined), false)
    })
  })

  describe('autenticarUsuario', () => {
    it('autentica correctamente con credenciales válidas y no expone el password', () => {
      const resultado = autenticarUsuario(USUARIOS_TEST, 'alumno', '1234')
      assert.strictEqual(resultado.ok, true)
      assert.deepStrictEqual(resultado.user, {
        username: 'alumno',
        email: 'alumno@um.edu.ar',
        rol: 'estudiante',
      })
      assert.strictEqual('password' in (resultado.user || {}), false)
    })

    it('permite login insensible a mayúsculas y espacios en el username', () => {
      const resultado = autenticarUsuario(USUARIOS_TEST, '  ALUMNO  ', '1234')
      assert.strictEqual(resultado.ok, true)
      assert.strictEqual(resultado.user?.username, 'alumno')
    })

    it('rechaza login con contraseña incorrecta', () => {
      const resultado = autenticarUsuario(USUARIOS_TEST, 'alumno', 'erronea')
      assert.strictEqual(resultado.ok, false)
      assert.strictEqual(resultado.message, 'Usuario o contraseña incorrecta')
      assert.strictEqual(resultado.user, undefined)
    })

    it('rechaza login con usuario inexistente', () => {
      const resultado = autenticarUsuario(USUARIOS_TEST, 'no_existe', '1234')
      assert.strictEqual(resultado.ok, false)
      assert.strictEqual(resultado.message, 'Usuario o contraseña incorrecta')
    })

    it('rechaza login si faltan campos obligatorios', () => {
      assert.strictEqual(autenticarUsuario(USUARIOS_TEST, '', '1234').ok, false)
      assert.strictEqual(autenticarUsuario(USUARIOS_TEST, 'alumno', '').ok, false)
      assert.strictEqual(autenticarUsuario(USUARIOS_TEST, null, null).ok, false)
    })
  })

  describe('validarRegistro', () => {
    it('aprueba registro con datos válidos y únicos', () => {
      const nuevo = { username: 'nuevo_alumno', email: 'nuevo@um.edu.ar', password: 'password123' }
      const resultado = validarRegistro(nuevo, USUARIOS_TEST)
      assert.strictEqual(resultado.ok, true)
    })

    it('rechaza registro si faltan campos obligatorios o son solo espacios', () => {
      assert.strictEqual(validarRegistro({ username: '   ', email: 'a@a.com', password: '1234' }, USUARIOS_TEST).ok, false)
      assert.strictEqual(validarRegistro({ username: 'user', email: '', password: '1234' }, USUARIOS_TEST).ok, false)
      assert.strictEqual(validarRegistro({ username: 'user', email: 'a@a.com', password: '' }, USUARIOS_TEST).ok, false)
    })

    it('rechaza registro con contraseña de menos de 4 caracteres', () => {
      const resultado = validarRegistro({ username: 'user', email: 'u@test.com', password: '12' }, USUARIOS_TEST)
      assert.strictEqual(resultado.ok, false)
      assert.strictEqual(resultado.message, 'La contraseña debe tener al menos 4 caracteres')
    })

    it('rechaza registro con email con formato inválido', () => {
      const resultado = validarRegistro({ username: 'user', email: 'invalido', password: 'password123' }, USUARIOS_TEST)
      assert.strictEqual(resultado.ok, false)
      assert.strictEqual(resultado.message, 'El formato de email no es válido')
    })

    it('rechaza registro si el nombre de usuario ya existe (insensible a mayúsculas)', () => {
      const resultado = validarRegistro({ username: 'ALUMNO', email: 'distinto@um.edu.ar', password: 'password123' }, USUARIOS_TEST)
      assert.strictEqual(resultado.ok, false)
      assert.strictEqual(resultado.message, 'El usuario ya existe')
    })

    it('rechaza registro si el email ya existe en la lista de usuarios', () => {
      const resultado = validarRegistro({ username: 'otro_user', email: 'alumno@um.edu.ar', password: 'password123' }, USUARIOS_TEST)
      assert.strictEqual(resultado.ok, false)
      assert.strictEqual(resultado.message, 'El email ya se encuentra registrado')
    })
  })

  describe('crearUsuarioEstudiante', () => {
    it('crea la estructura de usuario normalizada con rol estudiante', () => {
      const usuario = crearUsuarioEstudiante({
        username: '  carlos  ',
        email: '  carlos@um.edu.ar  ',
        password: 'secretPassword',
      })
      assert.deepStrictEqual(usuario, {
        username: 'carlos',
        email: 'carlos@um.edu.ar',
        password: 'secretPassword',
        rol: 'estudiante',
      })
    })
  })
})
