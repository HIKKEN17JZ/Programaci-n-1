import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  ROLES,
  isAdmin,
  isDocente,
  isEstudiante,
  canManageMaterias,
  canManageExamenes,
  canManageFacultades,
  getRoleBadge,
  getRoleLabel,
} from './roles.js'

describe('Utilidades de Roles y Permisos (RBAC - TDD)', () => {
  const adminUser = { id: 1, username: 'admin', role: ROLES.ADMIN }
  const superUser = { id: 2, username: 'superuser', is_superuser: true }
  const docenteUser = { id: 3, username: 'profesor', role: ROLES.DOCENTE }
  const estudianteUser = { id: 4, username: 'alumno', role: ROLES.ESTUDIANTE }

  describe('Verificación de roles individuales', () => {
    it('isAdmin identifica usuarios con rol ADMIN o superusuarios', () => {
      assert.strictEqual(isAdmin(adminUser), true)
      assert.strictEqual(isAdmin(superUser), true)
      assert.strictEqual(isAdmin({ is_admin: true }), true)
      assert.strictEqual(isAdmin(docenteUser), false)
      assert.strictEqual(isAdmin(estudianteUser), false)
      assert.strictEqual(isAdmin(null), false)
      assert.strictEqual(isAdmin(undefined), false)
    })

    it('isDocente identifica correctamente a usuarios docentes', () => {
      assert.strictEqual(isDocente(docenteUser), true)
      assert.strictEqual(isDocente(adminUser), false)
      assert.strictEqual(isDocente(estudianteUser), false)
      assert.strictEqual(isDocente(null), false)
    })

    it('isEstudiante identifica correctamente a usuarios estudiantes', () => {
      assert.strictEqual(isEstudiante(estudianteUser), true)
      assert.strictEqual(isEstudiante({ role: 'ESTUDIANTE' }), true)
      assert.strictEqual(isEstudiante(adminUser), false)
      assert.strictEqual(isEstudiante(docenteUser), false)
      assert.strictEqual(isEstudiante(null), false)
    })
  })

  describe('Permisos de gestión de recursos (RBAC)', () => {
    it('canManageMaterias permite acceso a ADMIN y DOCENTE, no a ESTUDIANTE', () => {
      assert.strictEqual(canManageMaterias(adminUser), true)
      assert.strictEqual(canManageMaterias(superUser), true)
      assert.strictEqual(canManageMaterias(docenteUser), true)
      assert.strictEqual(canManageMaterias(estudianteUser), false)
      assert.strictEqual(canManageMaterias(null), false)
    })

    it('canManageExamenes permite acceso a ADMIN y DOCENTE, no a ESTUDIANTE', () => {
      assert.strictEqual(canManageExamenes(adminUser), true)
      assert.strictEqual(canManageExamenes(docenteUser), true)
      assert.strictEqual(canManageExamenes(estudianteUser), false)
      assert.strictEqual(canManageExamenes(null), false)
    })

    it('canManageFacultades es exclusivo para ADMIN', () => {
      assert.strictEqual(canManageFacultades(adminUser), true)
      assert.strictEqual(canManageFacultades(superUser), true)
      assert.strictEqual(canManageFacultades(docenteUser), false)
      assert.strictEqual(canManageFacultades(estudianteUser), false)
    })
  })

  describe('Formateo visual de roles', () => {
    it('getRoleBadge devuelve la clase Bootstrap correspondiente', () => {
      assert.strictEqual(getRoleBadge(ROLES.ADMIN), 'text-bg-danger')
      assert.strictEqual(getRoleBadge(ROLES.DOCENTE), 'text-bg-primary')
      assert.strictEqual(getRoleBadge(ROLES.ESTUDIANTE), 'text-bg-info')
      assert.strictEqual(getRoleBadge('OTRO'), 'text-bg-secondary')
    })

    it('getRoleLabel devuelve el nombre legible en español', () => {
      assert.strictEqual(getRoleLabel(ROLES.ADMIN), 'Administrador')
      assert.strictEqual(getRoleLabel(ROLES.DOCENTE), 'Docente')
      assert.strictEqual(getRoleLabel(ROLES.ESTUDIANTE), 'Estudiante')
      assert.strictEqual(getRoleLabel(null), 'Estudiante')
    })
  })
})
