export interface Usuario {
  id: number
  nombre: string
  email: string
  nivelActual: number
  nombreNivel: string
  xpTotal: number
  xpParaSiguienteNivel: number | null
  rachaActual: number
  mejorRacha: number
  metaSemanalKg: number
  co2TotalEvitadoKg: number
}

export interface TipoResiduo {
  id: number
  codigo: string
  nombre: string
  factorCo2Kg: number
  xpPorKg: number
}

export interface RegistroReciclaje {
  id: number
  tipoResiduo: string
  tipoResiduoCodigo: string
  cantidadKg: number
  xpGanado: number
  co2EvitadoKg: number
  fechaRegistro: string
}

export interface Insignia {
  id: number
  nombre: string
  descripcion: string
  icono: string
  xpBonus: number
  desbloqueada: boolean
  fechaDesbloqueada: string | null
}

export interface ChatMessage {
  rol: 'user' | 'assistant'
  contenido: string
}

export interface AuthResponse {
  token: string
  email: string
  nombre: string
}

export interface ImpactoStats {
  co2EvitadoKg: number
  residuosKgTotal: number
  registrosTotales: number
}

export interface ImpactoResumen {
  co2TotalKg: number
  kgTotalReciclado: number
  totalRegistros: number
  equivalenteArboles: number
  equivalenteKmAuto: number
  equivalenteCargasTelefono: number
}

export interface ImpactoMensualItem {
  mes: string
  co2Kg: number
  kgReciclado: number
  xpGanado: number
}

export interface ImpactoPorTipoItem {
  codigo: string
  tipoResiduo: string
  co2Kg: number
  kgReciclado: number
  xpGanado: number
  registros: number
}

export interface ActualizarPerfilRequest {
  nombre: string
  metaSemanalKg: number
}

export interface RegistroRequest {
  tipoResiduoId: number
  cantidadKg: number
}

export interface RegistroResponse {
  id: number
  tipoResiduo: string
  cantidadKg: number
  xpGanado: number
  co2EvitadoKg: number
  fechaRegistro: string
  levelUp: boolean
  nivelNuevo: number | null
  nombreNivelNuevo: string | null
  nuevasInsignias: string[]
}
