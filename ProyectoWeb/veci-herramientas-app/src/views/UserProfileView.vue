<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const user = ref<any>(null)
const reviews = ref<any[]>([])
const isLoading = ref(true)

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { Authorization: `Bearer ${authStore.token}` }
})

onMounted(async () => {
  const userId = route.params.id as string
  try {
    const userRes = await api.get(`/users/${userId}`)
    user.value = userRes.data

    const reviewsRes = await api.get(`/reviews/user/${userId}`)
    reviews.value = reviewsRes.data
  } catch (e) {
    alert('Error al cargar el perfil o usuario no encontrado')
    router.push({ name: 'dashboard' })
  } finally {
    isLoading.value = false
  }
})

const averageRating = computed(() => {
  if (!reviews.value.length) return 0
  const sum = reviews.value.reduce((acc, r) => acc + r.rating, 0)
  return (sum / reviews.value.length).toFixed(1)
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div v-if="isLoading" class="text-center text-gray-500 text-xl mt-10">Cargando perfil...</div>
    
    <div v-else class="mx-auto max-w-5xl">
      <button @click="router.back()" class="mb-6 text-blue-600 hover:underline font-medium">&larr; Volver</button>

      <div class="mb-8 overflow-hidden rounded-xl bg-white shadow-lg">
        <div class="bg-gradient-to-r from-blue-600 to-blue-500 p-8 text-white">
          <div class="flex items-center gap-6">
            <div class="flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl font-bold text-blue-600 shadow-inner uppercase">
              {{ user.name.charAt(0) }}
            </div>
            <div>
              <h1 class="text-4xl font-bold">{{ user.name }}</h1>
              <p class="text-blue-100 mt-1 opacity-90">Miembro de la comunidad</p>
            </div>
          </div>
        </div>
        
        <div class="p-6 border-b border-gray-100">
          <div class="flex items-center gap-3 text-xl">
            <span class="font-bold text-gray-700">Reputación:</span>
            <div class="flex items-center bg-yellow-50 px-3 py-1 rounded-lg">
              <span class="text-yellow-500 text-2xl mr-2">★</span>
              <span class="font-bold text-yellow-700">{{ averageRating }}</span>
              <span class="text-gray-400 text-base ml-2">/ 5.0</span>
            </div>
            <span class="text-gray-500 text-sm ml-2">({{ reviews.length }} reseñas recibidas)</span>
          </div>
        </div>
      </div>

      <div class="grid gap-8 md:grid-cols-2">
        <div>
          <h2 class="mb-4 text-2xl font-bold text-gray-800 flex items-center gap-2">
            Lo que dicen sus vecinos
          </h2>
          <div v-if="reviews.length === 0" class="rounded-lg bg-white p-8 text-center text-gray-500 shadow-sm border border-gray-200">
            Este usuario aún no ha recibido reseñas.
          </div>
          <div v-else class="space-y-4">
            <div v-for="review in reviews" :key="review.id" class="rounded-lg bg-white p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div class="flex justify-between items-start mb-2">
                <span class="font-bold text-gray-700">{{ review.reviewer?.name || 'Vecino Anónimo' }}</span>
                <div class="flex text-yellow-400 text-sm">
                  <span v-for="n in 5" :key="n">{{ n <= review.rating ? '★' : '☆' }}</span>
                </div>
              </div>
              <p class="text-gray-600 italic mb-3">"{{ review.comment }}"</p>
              <p class="text-xs text-gray-400 text-right">{{ new Date(review.createdAt).toLocaleDateString() }}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 class="mb-4 text-2xl font-bold text-gray-800 flex items-center gap-2">
            Su Catálogo
          </h2>
          <div v-if="user.tools.length === 0" class="rounded-lg bg-white p-8 text-center text-gray-500 shadow-sm border border-gray-200">
            No tiene herramientas publicadas actualmente.
          </div>
          <div v-else class="space-y-4">
            <div v-for="tool in user.tools" :key="tool.id" class="rounded-lg bg-white p-5 shadow-sm border border-gray-100 flex justify-between items-center hover:bg-gray-50 transition-colors">
              <div>
                <h3 class="font-bold text-gray-800 text-lg">{{ tool.name }}</h3>
                <span class="inline-block mt-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-100">
                  {{ tool.category }}
                </span>
              </div>
              
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>