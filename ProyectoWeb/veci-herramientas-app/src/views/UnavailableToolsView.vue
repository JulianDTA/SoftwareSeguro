<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToolsStore } from '@/stores/tools'
import { useRouter } from 'vue-router'

const toolsStore = useToolsStore()
const router = useRouter()
const unavailableTools = ref<any[]>([])
const isLoading = ref(true)

onMounted(async () => {
  unavailableTools.value = await toolsStore.fetchUnavailableTools()
  isLoading.value = false
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="mx-auto max-w-5xl">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-800">Herramientas No Disponibles</h1>
        <button @click="router.push({ name: 'dashboard' })" class="text-blue-600 hover:underline">Volver</button>
      </div>

      <div class="bg-white rounded-xl shadow-md p-6">
        <p class="text-gray-500 mb-6">Estas herramientas están actualmente prestadas o ya fueron vendidas.</p>

        <div v-if="isLoading" class="text-center py-8">Cargando...</div>
        
        <div v-else-if="unavailableTools.length === 0" class="text-center py-8 text-gray-400">
          No hay herramientas ocupadas en este momento.
        </div>

        <div v-else class="grid gap-6 md:grid-cols-2">
          <div v-for="tool in unavailableTools" :key="tool.id" class="border border-gray-200 rounded-lg p-4 bg-gray-50 opacity-75">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-bold text-lg text-gray-700">{{ tool.name }}</h3>
                <p class="text-sm text-gray-500">{{ tool.description }}</p>
                <p class="text-xs text-gray-400 mt-2">Dueño: {{ tool.owner?.name }}</p>
              </div>
              <span 
                class="px-3 py-1 rounded-full text-xs font-bold uppercase"
                :class="tool.type === 'sale' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'"
              >
                {{ tool.type === 'sale' ? 'Vendida' : 'Prestada' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>