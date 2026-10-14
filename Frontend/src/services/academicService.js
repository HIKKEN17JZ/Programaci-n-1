import { api } from './api.js'
import {
  calcularCreditos,
  calcularPorcentaje,
  formatearMesaExamen,
} from '../utils/progress.js'

export function createAcademicService({ apiClient = api } = {}) {
  async function getMaterias() {
    const data = await apiClient.get('/materias/')
    return Array.isArray(data) ? data : (data?.results || [])
  }

  async function getExamenes() {
    const data = await apiClient.get('/examenes/')
    return Array.isArray(data) ? data : (data?.results || [])
  }

  async function getDashboardData() {
    const [materias, examenes] = await Promise.all([
      getMaterias(),
      getExamenes(),
    ])

    const creditos = calcularCreditos(materias)
    const porcentaje = calcularPorcentaje(creditos.obtenidos, creditos.totales)
    const mesas = examenes.map((ex) => formatearMesaExamen(ex, materias))

    return {
      materias,
      mesas,
      avance: {
        ...creditos,
        porcentaje,
      },
    }
  }

  return {
    getMaterias,
    getExamenes,
    getDashboardData,
  }
}

export const academicService = createAcademicService()
