<script setup lang="ts">
import { ref, onMounted, nextTick, computed, onUnmounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { Authorization: `Bearer ${authStore.token}` }
})

// Estado
const contacts = ref<any[]>([])
const messages = ref<any[]>([])
const activeChat = ref<any>(null)
const newMessage = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
let pollingInterval: any = null

// Contexto de Venta
const currentToolId = ref<string | null>(null)
const currentTool = ref<any>(null) // Guardamos la info de la herramienta

// Lógica de "Venta": Solo mostramos el botón si soy el dueño de la herramienta en contexto
const canMarkAsSold = computed(() => {
  if (!currentTool.value || !authStore.user) return false
  return currentTool.value.ownerId === authStore.user.userId
})

const fetchContacts = async () => {
  try {
    const res = await api.get('/messages/contacts')
    contacts.value = res.data
  } catch (e) {}
}

const fetchMessages = async (isPolling = false) => {
  if (!activeChat.value) return
  try {
    const res = await api.get(`/messages/conversation/${activeChat.value.id}`)
    
    // Si hay nuevos mensajes, actualizamos
    if (res.data.length > messages.value.length) {
      messages.value = res.data
      if (!isPolling) scrollToBottom() // Scroll solo si no es polling o si estamos abajo
      else {
        // Opcional: Solo scroll si el usuario ya estaba abajo
        scrollToBottom()
      }
    }
  } catch (e) {}
}

const selectContact = async (contact: any) => {
  activeChat.value = contact
  messages.value = [] // Limpiar chat previo
  await fetchMessages(false)
  scrollToBottom()
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !activeChat.value) return
  const content = newMessage.value
  newMessage.value = ''
  
  // Optimistic update
  messages.value.push({
    id: Date.now(),
    content,
    senderId: authStore.user?.userId,
    createdAt: new Date()
  })
  scrollToBottom()

  try {
    // Esto disparará la notificación en el backend (verificado en MessagesService)
    await api.post('/messages', {
      receiverId: activeChat.value.id,
      content
    })
    fetchContacts() // Actualizar lista lateral para mostrar último mensaje
  } catch (e) {
    console.error(e)
  }
}

// --- ACCIÓN: MARCAR COMO VENDIDO ---
const markToolAsSold = async () => {
  if (!currentToolId.value) return
  
  const confirmMsg = `¿Confirmas que has vendido "${currentTool.value?.name}" a ${activeChat.value?.name}? \n\nLa herramienta dejará de estar disponible en el catálogo.`
  if (!confirm(confirmMsg)) return

  try {
    // Llamada al endpoint que inhabilita la herramienta (available = false)
    await api.patch(`/tools/${currentToolId.value}/sell`)
    alert('¡Venta registrada con éxito! La herramienta ha pasado al historial.')
    
    // Enviar mensaje automático de confirmación en el chat
    newMessage.value = `✅ He marcado "${currentTool.value?.name}" como VENDIDO. ¡Gracias por la compra!`
    await sendMessage()

    router.push({ name: 'dashboard' })
  } catch (e: any) {
    alert(e.response?.data?.message || 'Error al procesar la venta.')
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// --- Carga Inicial ---
onMounted(async () => {
  await fetchContacts()
  
  // Si venimos con contexto de herramienta (desde botón Comprar en el catálogo)
  if (route.query.toolId) {
    currentToolId.value = route.query.toolId as string
    
    // 1. Obtener detalles de la herramienta para verificar que soy el dueño
    try {
      const toolRes = await api.get(`/tools/${currentToolId.value}`)
      currentTool.value = toolRes.data
    } catch (e) {
      console.error("No se pudo cargar la herramienta", e)
    }
  }

  // Si venimos con un usuario destino
  if (route.query.userId) {
    const targetId = route.query.userId as string
    let contact = contacts.value.find(c => c.id === targetId)
    
    if (!contact) {
      // Si no existe chat previo, cargamos datos básicos del usuario
      try {
        const res = await api.get(`/users/${targetId}`)
        contact = res.data
        contacts.value.unshift(contact)
      } catch (e) {}
    }
    if (contact) selectContact(contact)
  }

  // Polling para "tiempo real" (Simula WebSockets recargando cada 3s)
  pollingInterval = setInterval(() => {
    fetchContacts()
    if (activeChat.value) fetchMessages(true)
  }, 3000)
})

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval)
})
</script>

<template>
  <div class="h-screen bg-gray-100 p-4 flex flex-col">
    
    <!-- BOTÓN REGRESAR AL DASHBOARD -->
    <div class="mb-3 flex justify-between items-center">
      <button 
        @click="router.push({ name: 'dashboard' })" 
        class="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors bg-white px-4 py-2 rounded-lg shadow-sm"
      >
        <span class="mr-2 text-xl">&larr;</span> Volver al Dashboard
      </button>
    </div>

    <div class="flex-1 flex gap-4 overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200">
      
      <!-- BARRA LATERAL (Contactos) -->
      <div class="w-1/3 border-r bg-gray-50 flex flex-col min-w-[250px]">
        <div class="p-4 border-b bg-white font-bold text-gray-700 shadow-sm z-10 flex justify-between items-center">
          <span>Mensajes</span>
          <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{{ contacts.length }}</span>
        </div>
        <div class="flex-1 overflow-y-auto">
          <div v-if="contacts.length === 0" class="p-6 text-center text-gray-400 text-sm">
            No tienes chats activos.
          </div>
          <div 
            v-for="contact in contacts" 
            :key="contact.id" 
            @click="selectContact(contact)" 
            class="p-4 border-b hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition-colors"
            :class="{ 'bg-blue-100 border-l-4 border-l-blue-500': activeChat?.id === contact.id }"
          >
            <div class="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shadow-sm flex-shrink-0">
              {{ contact.name.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-baseline">
                <h3 class="font-semibold text-gray-800 truncate">{{ contact.name }}</h3>
                <span class="text-[10px] text-gray-400" v-if="contact.lastMessageDate">
                  {{ new Date(contact.lastMessageDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}
                </span>
              </div>
              <p class="text-xs text-gray-500 truncate mt-1">{{ contact.lastMessage || 'Haz clic para escribir...' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ÁREA DE CHAT -->
      <div class="flex-1 flex flex-col relative bg-white">
        
        <div v-if="!activeChat" class="flex-1 flex flex-col items-center justify-center text-gray-300">
          <span class="text-6xl mb-4 grayscale opacity-50">💬</span>
          <p class="text-gray-500 font-medium">Selecciona un contacto para comenzar</p>
        </div>

        <template v-else>
          <!-- HEADER CHAT -->
          <div class="p-4 border-b bg-white flex justify-between items-center shadow-sm z-10">
            <div class="flex items-center gap-3">
              <div class="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                {{ activeChat.name.charAt(0).toUpperCase() }}
              </div>
              <div>
                <span class="font-bold text-gray-800 block leading-tight">{{ activeChat.name }}</span>
                <span class="text-xs text-green-500 font-medium">● En línea</span>
              </div>
            </div>
            
            <!-- BOTÓN DE VENTA (Solo visible si soy dueño y hay herramienta) -->
            <div v-if="canMarkAsSold" class="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-100">
              <span class="text-xs text-yellow-700 font-medium hidden md:inline">Negociando: <strong>{{ currentTool?.name }}</strong></span>
              <button 
                @click="markToolAsSold"
                class="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm font-bold hover:bg-green-700 shadow-sm transition-all active:scale-95 flex items-center gap-1"
              >
                <span>💰</span> Marcar como Vendido
              </button>
            </div>
          </div>

          <!-- MENSAJES -->
          <div ref="messagesContainer" class="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50">
            <div 
              v-for="msg in messages" 
              :key="msg.id" 
              class="flex" 
              :class="msg.senderId === authStore.user?.userId ? 'justify-end' : 'justify-start'"
            >
              <div 
                class="max-w-[75%] p-3 rounded-2xl text-sm shadow-sm relative group"
                :class="msg.senderId === authStore.user?.userId ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'"
              >
                {{ msg.content }}
                <!-- Hora del mensaje -->
                <span class="text-[9px] opacity-70 block text-right mt-1">
                  {{ new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}
                </span>
              </div>
            </div>
          </div>

          <!-- INPUT -->
          <div class="p-4 border-t bg-white">
            <form @submit.prevent="sendMessage" class="flex gap-2 items-center">
              <input 
                v-model="newMessage" 
                type="text" 
                placeholder="Escribe un mensaje..." 
                class="flex-1 border border-gray-300 rounded-full px-5 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow" 
              />
              <button 
                type="submit" 
                class="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-blue-700 shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!newMessage.trim()"
              >
                <span class="text-xl">➤</span>
              </button>
            </form>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>