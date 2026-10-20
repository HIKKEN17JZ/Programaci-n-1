import { api } from './api.js'
import {
  calcularCreditos,
  calcularPorcentaje,
  formatearMesaExamen,
  calcularMetricasExamenes,
} from '../utils/progress.js'

export function createAcademicService({ apiClient = api } = {}) {
  // --- Materias ---
  async function getMaterias() {
    const data = await apiClient.get('/materias/')
    return Array.isArray(data) ? data : (data?.results || [])
  }

  async function getMateriaById(id) {
    return await apiClient.get(`/materias/${id}/`)
  }

  async function createMateria(payload) {
    return await apiClient.post('/materias/', payload)
  }

  async function updateMateria(id, payload) {
    return await apiClient.put(`/materias/${id}/`, payload)
  }

  async function patchMateria(id, payload) {
    return await apiClient.patch(`/materias/${id}/`, payload)
  }

  async function deleteMateria(id) {
    return await apiClient.delete(`/materias/${id}/`)
  }

  // --- Exámenes ---
  async function getExamenes() {
    const data = await apiClient.get('/examenes/')
    return Array.isArray(data) ? data : (data?.results || [])
  }

  async function getExamenById(id) {
    return await apiClient.get(`/examenes/${id}/`)
  }

  async function createExamen(payload) {
    return await apiClient.post('/examenes/', payload)
  }

  async function updateExamen(id, payload) {
    return await apiClient.put(`/examenes/${id}/`, payload)
  }

  async function patchExamen(id, payload) {
    return await apiClient.patch(`/examenes/${id}/`, payload)
  }

  async function deleteExamen(id) {
    return await apiClient.delete(`/examenes/${id}/`)
  }

  // --- Facultades ---
  async function getFacultades() {
    const data = await apiClient.get('/facultades/')
    return Array.isArray(data) ? data : (data?.results || [])
  }

  async function createFacultad(payload) {
    return await apiClient.post('/facultades/', payload)
  }

  // --- Dashboard Consolidado ---
  async function getDashboardData() {
    const [materias, examenes] = await Promise.all([
      getMaterias(),
      getExamenes(),
    ])

    const creditos = calcularCreditos(materias)
    const porcentaje = calcularPorcentaje(creditos.obtenidos, creditos.totales)
    const mesas = examenes.map((ex) => formatearMesaExamen(ex, materias))
    const metricasExamenes = calcularMetricasExamenes(examenes)

    return {
      materias,
      examenes,
      mesas,
      avance: {
        ...creditos,
        porcentaje,
      },
      metricasExamenes,
    }
  }

  return {
    getMaterias,
    getMateriaById,
    createMateria,
    updateMateria,
    patchMateria,
    deleteMateria,
    getExamenes,
    getExamenById,
    createExamen,
    updateExamen,
    patchExamen,
    deleteExamen,
    getFacultades,
    createFacultad,
    getDashboardData,
  }
}

export const academicService = createAcademicService()
