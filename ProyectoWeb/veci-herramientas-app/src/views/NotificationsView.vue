<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const notifications = ref<any[]>([])

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { Authorization: `Bearer ${authStore.token}` }
})

const fetchNotifications = async () => {
  try {
    const res = await api.get('/notifications')
    notifications.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const markAsRead = async (notification: any) => {
  if (notification.read) return
  try {
    await api.patch(`/notifications/${notification.id}/read`)
    notification.read = true
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  fetchNotifications()
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="mx-auto max-w-3xl">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold text-gray-800">Notificaciones</h1>
        <button @click="router.push({ name: 'dashboard' })" class="text-blue-600 hover:underline">Volver</button>
      </div>

      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <div v-if="notifications.length === 0" class="p-8 text-center text-gray-500">
          No tienes notificaciones nuevas.
        </div>

        <div v-else class="divide-y divide-gray-100">
          <div 
            v-for="notif in notifications" 
            :key="notif.id" 
            class="p-4 transition-colors hover:bg-gray-50 cursor-pointer flex items-start gap-4"
            :class="{ 'bg-blue-50': !notif.read }"
            @click="markAsRead(notif)"
          >
            <div class="mt-1 text-2xl">
              {{ notif.read ? '📩' : '📫' }}
            </div>
            <div class="flex-1">
              <p class="text-gray-800" :class="{ 'font-bold': !notif.read }">
                {{ notif.message }}
              </p>
              <p class="text-xs text-gray-400 mt-1">
                {{ new Date(notif.createdAt).toLocaleString() }}
              </p>
            </div>
            <div v-if="!notif.read" class="self-center">
              <span class="h-3 w-3 rounded-full bg-blue-500 block"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>