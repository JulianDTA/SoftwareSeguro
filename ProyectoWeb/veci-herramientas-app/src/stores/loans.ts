import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
})

api.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

export const useLoansStore = defineStore('loans', {
  state: () => ({
    loans: [] as any[],
    error: null as string | null,
  }),

  getters: {
    // Filtramos los préstamos que YO solicité
    myRequests: (state) => {
      const authStore = useAuthStore()
      return state.loans.filter(l => l.requesterId === authStore.user?.userId)
    },
    // Filtramos los préstamos que ME solicitaron (para mis herramientas)
    incomingRequests: (state) => {
      const authStore = useAuthStore()
      return state.loans.filter(l => l.ownerId === authStore.user?.userId)
    }
  },

  actions: {
    async fetchMyLoans() {
      this.error = null
      try {
        const response = await api.get('/loans/my-loans')
        this.loans = response.data
      } catch (e: any) {
        this.error = 'Error al cargar los préstamos'
      }
    },

    async updateLoanStatus(loanId: string, status: string) {
      try {
        await api.patch(`/loans/${loanId}/status`, { status })
        // Actualizamos la lista localmente para ver el cambio inmediato
        await this.fetchMyLoans()
        return true
      } catch (e: any) {
        this.error = 'Error al actualizar el estado'
        return false
      }
    },
    async submitReview(data: { loanId: string; rating: number; comment: string }) {
      try {
        await api.post('/reviews', data)
        return true
      } catch (e: any) {
        this.error = e.response?.data?.message || 'Error al enviar reseña'
        return false
      }
    },
  }
})