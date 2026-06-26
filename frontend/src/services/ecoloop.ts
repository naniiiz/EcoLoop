import api from './api'
import {
  Insignia,
  ImpactoMensualItem,
  ImpactoPorTipoItem,
  ImpactoResumen,
  RegistroRequest,
  RegistroResponse,
  TipoResiduo,
  Usuario
} from '../types'

export async function getPerfil() {
  const { data } = await api.get<Usuario>('/usuarios/me')
  return data
}

export async function getTiposResiduo() {
  const { data } = await api.get<unknown>('/tipos-residuo')
  if (!Array.isArray(data)) throw new Error('tipos-residuo no devolvio una lista')
  return data as TipoResiduo[]
}

export async function getImpactoResumen() {
  const { data } = await api.get<ImpactoResumen>('/impacto/resumen')
  return data
}

export async function getImpactoMensual() {
  const { data } = await api.get<unknown>('/impacto/mensual')
  if (!Array.isArray(data)) throw new Error('impacto/mensual no devolvio una lista')
  return data as ImpactoMensualItem[]
}

export async function getImpactoPorTipo() {
  const { data } = await api.get<unknown>('/impacto/por-tipo')
  if (!Array.isArray(data)) throw new Error('impacto/por-tipo no devolvio una lista')
  return data as ImpactoPorTipoItem[]
}

export async function getInsignias() {
  const { data } = await api.get<unknown>('/gamificacion/insignias')
  if (!Array.isArray(data)) throw new Error('gamificacion/insignias no devolvio una lista')
  return data as Insignia[]
}

export async function registrarResiduo(payload: RegistroRequest) {
  const { data } = await api.post<RegistroResponse>('/residuos', payload)
  return data
}

export async function enviarMensajeKiru(mensaje: string) {
  const { data } = await api.post<{ respuesta: string; tokensUsados: number }>('/agente/chat', { mensaje })
  return data
}
