export const MATERIAS_MOCK = [
  { nombre: 'Análisis Matemático I', creditos: 8, estado: 'Aprobada' },
  { nombre: 'Álgebra I', creditos: 6, estado: 'Aprobada' },
  { nombre: 'Programación I', creditos: 8, estado: 'Regular' },
  { nombre: 'Inglés I', creditos: 4, estado: 'Cursando' },
]

export const MESAS_MOCK = [
  { materia: 'Análisis Matemático I', llamado: 'Llamado Febrero', fecha: '15/02/2026', nota: 8 },
  { materia: 'Álgebra I', llamado: 'Llamado Marzo', fecha: '10/03/2026', nota: null },
  { materia: 'Programación I', llamado: 'Llamado Marzo', fecha: '18/03/2026', nota: null },
]

export const AVANCE_MOCK = {
  creditosObtenidos: 40,
  creditosTotales: 64,
}
