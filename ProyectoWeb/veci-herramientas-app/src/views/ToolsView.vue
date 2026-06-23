<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useToolsStore } from '@/stores/tools'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const toolsStore = useToolsStore()
const authStore = useAuthStore()
const router = useRouter()
const newTool = ref({
  name: '', 
  description: '',
  category: 'Carpintería',
  type: 'loan',
  price: 0,
})
const isCreating = ref(false)

const showModal = ref(false)
const selectedTool = ref<any>(null)
const loanDates = ref({
  startDate: '',
  endDate: '',
})
const isRequesting = ref(false)

const searchQuery = ref('')
const filterCategory = ref('')
const filterType = ref('all') 

const filteredTools = computed(() => {
  return toolsStore.tools.filter(tool => {
    // 1. Filtro Texto
    const query = searchQuery.value.toLowerCase()
    const matchesName = tool.name.toLowerCase().includes(query) || 
                        (tool.description && tool.description.toLowerCase().includes(query))
    
    const matchesCategory = filterCategory.value ? tool.category === filterCategory.value : true

    const matchesType = filterType.value === 'all' ? true : tool.type === filterType.value

    return matchesName && matchesCategory && matchesType
  })
})

// --- ACCIONES ---
onMounted(() => {
  toolsStore.fetchTools()
})

const handleSubmitTool = async () => {
  if (!newTool.value.name || !newTool.value.category) return
  
  isCreating.value = true
  
  // Enviamos los datos (incluyendo tipo y precio)
  const success = await toolsStore.createTool({
    ...newTool.value,
    // Si es préstamo, aseguramos que el precio sea 0
    price: newTool.value.type === 'sale' ? newTool.value.price : 0
  })

  if (success) {
    // Resetear formulario
    newTool.value = { 
      name: '', 
      description: '', 
      category: 'Carpintería', 
      type: 'loan', 
      price: 0 
    }
    alert('Tu herramienta ha sido enviada para revisión del administrador.')
  }
  isCreating.value = false
}

// --- Lógica del Modal de Préstamo ---
const openRequestModal = (tool: any) => {
  selectedTool.value = tool
  loanDates.value = { startDate: '', endDate: '' }
  toolsStore.error = null
  toolsStore.successMessage = null
  showModal.value = true
}

const handleRequestLoan = async () => {
  if (!loanDates.value.startDate || !loanDates.value.endDate) {
    toolsStore.error = 'Debes seleccionar ambas fechas.'
    return
  }
  isRequesting.value = true
  const success = await toolsStore.requestLoan({
    toolId: selectedTool.value.id,
    startDate: loanDates.value.startDate,
    endDate: loanDates.value.endDate,
  })
  if (success) {
    setTimeout(() => {
      showModal.value = false
    }, 2000)
  }
  isRequesting.value = false
}

// --- Comprar ---
const handleBuy = async (tool: any) => {
  // Redirigir al chat con el ID del dueño
  router.push({ 
    name: 'chat', 
    query: { userId: tool.ownerId } 
  })
  // Opcional: Se podría usar el store de mensajes para pre-llenar un mensaje de "Hola, me interesa tu herramienta..."
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="mx-auto max-w-5xl">
      <button
        @click="router.push({ name: 'dashboard' })"
        class="mb-6 flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
      >
        <span class="mr-1">&larr;</span> Volver al Dashboard
      </button>

      <h1 class="mb-8 text-4xl font-extrabold text-gray-800 tracking-tight">Catálogo de la Comunidad</h1>

      <!--FORMULARIO DE NUEVA PUBLICACIÓN -->
      <form
        @submit.prevent="handleSubmitTool"
        class="mb-10 rounded-xl bg-white p-6 shadow-lg border-t-4 border-blue-500"
      >
        <h2 class="mb-6 text-2xl font-bold text-gray-700 flex items-center gap-2">
          Publicar Anuncio
        </h2>

        <!-- Feedback -->
        <div v-if="toolsStore.error && isCreating" class="mb-4 rounded-lg bg-red-50 p-4 text-center text-sm font-medium text-red-700 border border-red-200">
          {{ toolsStore.error }}
        </div>
         <div v-if="toolsStore.successMessage && isCreating" class="mb-4 rounded-lg bg-green-50 p-4 text-center text-sm font-medium text-green-700 border border-green-200">
          {{ toolsStore.successMessage }}
        </div>

        <div class="grid gap-6 md:grid-cols-2 mb-4">
          <div>
            <label class="mb-2 block text-sm font-semibold text-gray-600">Nombre del objeto</label>
            <input type="text" v-model="newTool.name" class="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-200 outline-none" placeholder="Ej. Taladro Percutor" required />
          </div>

          <div>
            <label class="mb-2 block text-sm font-semibold text-gray-600">Categoría</label>
            <select v-model="newTool.category" class="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-200 outline-none">
              <option>Carpintería</option><option>Jardinería</option><option>Cocina</option><option>Camping</option><option>Electrónica</option><option>Otro</option>
            </select>
          </div>
        </div>

        <!-- TIPO Y PRECIO -->
        <div class="grid gap-6 md:grid-cols-2 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div>
            <label class="mb-2 block text-sm font-semibold text-gray-600">Tipo de Publicación</label>
            <select v-model="newTool.type" class="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-200 outline-none">
              <option value="loan">🤝 Préstamo (Gratuito/Intercambio)</option>
              <option value="sale">💰 Venta</option>
            </select>
          </div>
          
          <div v-if="newTool.type === 'sale'">
            <label class="mb-2 block text-sm font-semibold text-gray-600">Precio ($)</label>
            <input type="number" v-model="newTool.price" class="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-green-200 outline-none" min="0" placeholder="0.00" />
          </div>
        </div>

        <div class="mb-6">
          <label class="mb-2 block text-sm font-semibold text-gray-600">Descripción</label>
          <textarea v-model="newTool.description" class="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-200 outline-none" placeholder="Ej. Estado, accesorios incluidos..." rows="2"></textarea>
        </div>

        <button type="submit" :disabled="isCreating" class="w-full md:w-auto md:px-8 rounded-lg bg-blue-600 py-3 text-white font-semibold shadow-md hover:bg-blue-700 transition-all" :class="{ 'opacity-70 cursor-wait': isCreating }">
          {{ isCreating ? 'Publicando...' : 'Enviar a Revisión' }}
        </button>
      </form>

      <!-- BARRA DE BÚSQUEDA Y FILTROS -->
      <div class="mb-6 flex flex-col gap-4 md:flex-row sticky top-4 z-10">
        <div class="relative flex-1">
          <input v-model="searchQuery" type="text" placeholder="Buscar..." class="w-full rounded-xl border border-gray-300 bg-white p-4 shadow-md focus:ring-2 focus:ring-blue-400 outline-none" />
        </div>
        
        <div class="w-full md:w-1/4">
          <select v-model="filterCategory" class="w-full h-full rounded-xl border border-gray-300 bg-white p-4 shadow-md focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer">
            <option value="">Todas las Categorías</option><option>Carpintería</option><option>Jardinería</option><option>Cocina</option><option>Camping</option><option>Electrónica</option>
          </select>
        </div>

        <!-- NUEVO FILTRO DE TIPO -->
        <div class="w-full md:w-1/4">
          <select v-model="filterType" class="w-full h-full rounded-xl border border-gray-300 bg-white p-4 shadow-md focus:ring-2 focus:ring-blue-400 outline-none cursor-pointer font-semibold text-gray-700">
            <option value="all">Todo (Ventas y Préstamos)</option>
            <option value="loan">🤝 Solo Préstamos</option>
            <option value="sale">💰 Solo Ventas</option>
          </select>
        </div>
      </div>

      <!-- LISTA DEL CATÁLOGO -->
      <div class="rounded-xl bg-white p-8 shadow-lg min-h-[300px]">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span>🛠️</span> Herramientas Disponibles
          </h2>
          <span class="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {{ filteredTools.length }} resultados
          </span>
        </div>

        <p v-if="!toolsStore.tools.length && !filteredTools.length" class="text-gray-500 text-center py-12 text-lg animate-pulse">
          Cargando herramientas del vecindario...
        </p>

        <div v-else-if="filteredTools.length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">🤷‍♂️</div>
          <p class="text-gray-600 text-lg">No encontramos herramientas con esos filtros.</p>
          <button @click="searchQuery = ''; filterCategory = ''; filterType = 'all'" class="mt-4 text-blue-600 font-semibold hover:underline">
            Limpiar filtros
          </button>
        </div>

        <div v-else class="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
          <div v-for="tool in filteredTools" :key="tool.id" class="group relative rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all bg-white">
            
            <div class="flex flex-col md:flex-row justify-between items-start gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 class="text-xl font-bold text-gray-800">{{ tool.name }}</h3>
                  
                  <!-- BADGES DE TIPO -->
                  <span v-if="tool.type === 'sale'" class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold border border-green-200 shadow-sm">
                    VENTA ${{ tool.price }}
                  </span>
                  <span v-else class="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold border border-purple-200 shadow-sm">
                    PRÉSTAMO
                  </span>

                  <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs border border-gray-200">
                    {{ tool.category }}
                  </span>
                </div>
                <p class="text-gray-600 leading-relaxed">{{ tool.description }}</p>
              </div>

              <div class="flex flex-col items-end gap-3 min-w-[140px]">
                <!-- ACCIONES DINÁMICAS -->
                <template v-if="authStore.user?.userId !== tool.ownerId">
                  <button 
                    v-if="tool.type === 'sale'"
                    @click="handleBuy(tool)"
                    class="w-full rounded-lg bg-green-600 px-4 py-2 text-white font-semibold shadow-sm hover:bg-green-700 hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span>🛒</span> Comprar
                  </button>
                  <button 
                    v-else
                    @click="openRequestModal(tool)"
                    class="w-full rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold shadow-sm hover:bg-blue-700 hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span>📅</span> Solicitar
                  </button>
                </template>
                <span v-else class="w-full text-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-bold text-gray-500 border border-gray-200 cursor-default select-none">
                  Es tuya
                </span>
              </div>
            </div>
            
            <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
              <span class="text-gray-500 flex items-center gap-1">
                👤 Dueño: 
                <router-link 
                  v-if="tool.owner"
                  :to="{ name: 'user-profile', params: { id: tool.owner.id } }"
                  class="font-bold text-gray-700 hover:text-blue-600 hover:underline cursor-pointer transition-colors"
                >
                  {{ tool.owner.name }}
                </router-link>
                <span v-else>...</span>
              </span>
              <span class="text-gray-400 text-xs">ID: {{ tool.id.slice(0, 8) }}...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL DE SOLICITUD-->
  <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm transition-opacity">
    <div class="w-full max-w-md transform rounded-2xl bg-white p-8 shadow-2xl transition-all scale-100">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Solicitar Préstamo</h2>
        <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
      </div>

      <div class="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
        <p class="text-sm text-blue-800 font-medium">Herramienta:</p>
        <p class="text-lg font-bold text-blue-900">{{ selectedTool?.name }}</p>
      </div>

      <div v-if="toolsStore.error" class="mb-6 rounded-lg bg-red-50 p-4 text-center text-sm font-medium text-red-700 border border-red-200">
        {{ toolsStore.error }}
      </div>
      <div v-if="toolsStore.successMessage" class="mb-6 rounded-lg bg-green-50 p-4 text-center text-sm font-medium text-green-700 border border-green-200">
        {{ toolsStore.successMessage }}
      </div>
      
      <form @submit.prevent="handleRequestLoan">
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label class="mb-2 block text-sm font-bold text-gray-700">Desde</label>
            <input type="date" v-model="loanDates.startDate" class="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 outline-none" required />
          </div>
          <div>
            <label class="mb-2 block text-sm font-bold text-gray-700">Hasta</label>
            <input type="date" v-model="loanDates.endDate" class="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 outline-none" required />
          </div>
        </div>

        <div class="flex justify-end gap-3">
          <button type="button" @click="showModal = false" class="rounded-lg bg-gray-100 px-5 py-3 text-gray-700 font-medium hover:bg-gray-200 transition-colors">Cancelar</button>
          <button type="submit" :disabled="isRequesting" class="rounded-lg bg-blue-600 px-6 py-3 text-white font-bold hover:bg-blue-700 shadow-md transition-all" :class="{'opacity-70 cursor-wait': isRequesting}">
            {{ isRequesting ? 'Enviando...' : 'Confirmar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>