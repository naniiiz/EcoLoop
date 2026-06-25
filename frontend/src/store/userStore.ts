import { create } from 'zustand'
import { Usuario, RegistroReciclaje } from '../types'

interface UserState {
  usuario: Usuario | null
  registros: RegistroReciclaje[]
  setUsuario: (usuario: Usuario) => void
  setRegistros: (registros: RegistroReciclaje[]) => void
  addRegistro: (registro: RegistroReciclaje) => void
}

export const useUserStore = create<UserState>()(set => ({
  usuario: null,
  registros: [],
  setUsuario: usuario => set({ usuario }),
  setRegistros: registros => set({ registros }),
  addRegistro: registro => set(state => ({ registros: [registro, ...state.registros] }))
}))
