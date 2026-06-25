export interface Usuario {
  id: number
  nombre: string
  email: string
  nivelActual: number
  xpTotal: number
  rachaActual: number
  mejorRacha: number
  metaSemanalKg: number
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
  tipoResiduo: TipoResiduo
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
  desbloqueada: boolean
  xpBonus: number
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
