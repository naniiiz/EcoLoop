import api from './api'
import {
  ActualizarPerfilRequest,
  Insignia,
  ImpactoMensualItem,
  ImpactoPorTipoItem,
  ImpactoResumen,
  RegistroReciclaje,
  RegistroRequest,
  RegistroResponse,
  TipoResiduo,
  Usuario
} from '../types'

export async function getPerfil() {
  const { data } = await api.get<Usuario>('/usuarios/me')
  return data
}

export async function updatePerfil(payload: ActualizarPerfilRequest) {
  const { data } = await api.put<Usuario>('/usuarios/me', payload)
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

export async function getRegistros() {
  const { data } = await api.get<unknown>('/residuos')
  if (!Array.isArray(data)) throw new Error('residuos no devolvio una lista')
  return data as RegistroReciclaje[]
}

export async function registrarResiduo(payload: RegistroRequest) {
  const { data } = await api.post<RegistroResponse>('/residuos', payload)
  return data
}

export async function deleteRegistro(id: number) {
  await api.delete(`/residuos/${id}`)
}

export async function enviarMensajeKiru(mensaje: string) {
  const { data } = await api.post<{ respuesta: string; xpGanado: number }>('/agente/chat', { mensaje })
  return data
}

export interface VisionResponse {
  nombre: string
  categoria: string
  reciclable: boolean
  contenedor: string
  consejo: string
}

export async function identificarResiduo(imagen: File): Promise<VisionResponse> {
  const form = new FormData()
  form.append('imagen', imagen)
  const { data } = await api.post<VisionResponse>('/vision/identificar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
