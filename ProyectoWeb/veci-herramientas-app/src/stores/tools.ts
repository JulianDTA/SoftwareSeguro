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

export const useToolsStore = defineStore('tools', {
  state: () => ({
    tools: [] as any[],
    error: null as string | null,
    successMessage: null as string | null,
  }),

  actions: {
    async fetchTools() {
      this.error = null
      try {
        const response = await api.get('/tools')
        this.tools = response.data
        return true
      } catch (e: any) {
        this.error = e.response?.data?.message || 'Error al cargar herramientas'
        return false
      }
    },

    // --- ACTUALIZADO: Acepta type y price ---
    async createTool(data: { 
      name: string; 
      description: string; 
      category: string; 
      type: string; // 'loan' o 'sale'
      price: number;
    }) {
      this.error = null
      this.successMessage = null
      try {
        const response = await api.post('/tools', data)
        // No la agregamos a la lista local inmediatamente porque el estado es PENDING
        // y requiere aprobación del admin.
        // this.tools.push(response.data) 
        
        return true
      } catch (e: any) {
        this.error = e.response?.data?.message || 'Error al crear la herramienta'
        return false
      }
    },
    async fetchUnavailableTools() {
      try {
        const response = await api.get('/tools/unavailable')
        // Podrías guardarlo en otra variable de estado si quieres separarlo
        // o usar una lógica diferente. Por simplicidad, retornamos la data.
        return response.data
      } catch (e) {
        return []
      }
    },

    async requestLoan(data: { toolId: string; startDate: string; endDate: string }) {
      this.error = null
      this.successMessage = null
      try {
        await api.post('/loans', data)
        this.successMessage = '¡Solicitud enviada con éxito!'
        return true
      } catch (e: any) {
        this.error = e.response?.data?.message || 'Error al enviar la solicitud'
        return false
      }
    },
  },
})