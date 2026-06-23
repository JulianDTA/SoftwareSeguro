<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const pendingTools = ref<any[]>([])
const isLoading = ref(false)

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { Authorization: `Bearer ${authStore.token}` }
})

const fetchPending = async () => {
  isLoading.value = true
  try {
    const res = await api.get('/tools/pending')
    pendingTools.value = res.data
  } catch (e) {
    console.error(e)
    alert('No tienes permisos de administrador.')
    router.push({ name: 'dashboard' })
  } finally {
    isLoading.value = false
  }
}

// Aprobar o Rechazar
const decideTool = async (id: string, status: 'approved' | 'rejected') => {
  if (!confirm(`¿Estás seguro de ${status === 'approved' ? 'APROBAR' : 'RECHAZAR'} esta publicación?`)) return
  
  try {
    await api.patch(`/tools/${id}/status`, { status })
    pendingTools.value = pendingTools.value.filter(t => t.id !== id)
    alert(`Herramienta ${status === 'approved' ? 'aprobada' : 'rechazada'} correctamente.`)
  } catch (e) {
    alert('Error al actualizar el estado.')
  }
}

onMounted(() => {
  // Verificación extra en frontend
  if (!authStore.user || authStore.user.role !== 'admin') {
    if (authStore.user) router.push({ name: 'dashboard' })
  }
  fetchPending()
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="mx-auto max-w-6xl">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-800">Panel de Administración</h1>
        <button @click="router.push({ name: 'dashboard' })" class="text-blue-600 hover:underline">Volver al Dashboard</button>
      </div>
      
      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="p-6 border-b border-gray-100 bg-gray-50">
          <h2 class="text-xl font-semibold text-gray-700">Solicitudes de Publicación ({{ pendingTools.length }})</h2>
        </div>
        
        <div v-if="isLoading" class="p-8 text-center text-gray-500">Cargando solicitudes...</div>

        <div v-else-if="pendingTools.length === 0" class="p-12 text-center">
          <div class="text-5xl mb-4">✅</div>
          <p class="text-gray-500 text-lg">Todo al día. No hay herramientas pendientes de revisión.</p>
        </div>

        <div v-else class="divide-y divide-gray-100">
          <div v-for="tool in pendingTools" :key="tool.id" class="p-6 hover:bg-gray-50 transition-colors">
            <div class="flex flex-col md:flex-row justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="font-bold text-lg text-gray-800">{{ tool.name }}</h3>
                  
                  <!-- Badges de Tipo -->
                  <span v-if="tool.type === 'sale'" class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold border border-green-200 uppercase">Venta ${{ tool.price }}</span>
                  <span v-else class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold border border-blue-200 uppercase">Préstamo</span>
                  
                  <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs border border-gray-200">{{ tool.category }}</span>
                </div>
                
                <p class="text-gray-600 mb-2">{{ tool.description }}</p>
                
                <div class="flex items-center gap-2 text-sm text-gray-500">
                  <span>👤 Publicado por: <strong>{{ tool.owner?.name }}</strong></span>
                  <span>•</span>
                  <span>{{ new Date(tool.createdAt).toLocaleDateString() }}</span>
                </div>
              </div>
              
              <div class="flex items-center gap-3">
                <button 
                  @click="decideTool(tool.id, 'approved')"
                  class="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-medium transition-colors shadow-sm"
                >
                  <span>✓</span> Aprobar
                </button>
                <button 
                  @click="decideTool(tool.id, 'rejected')"
                  class="flex items-center gap-2 bg-white text-red-500 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 font-medium transition-colors"
                >
                  <span>✕</span> Rechazar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>