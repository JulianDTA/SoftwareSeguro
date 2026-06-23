<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { RouterLink, useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="mx-auto max-w-5xl">
      <!-- HEADER -->
      <div class="mb-8 rounded-xl bg-white p-8 shadow-lg border-l-8 border-blue-600 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Hola, {{ authStore.user?.name || 'Vecino' }}!</h1>
          <p class="mt-2 text-gray-600">Bienvenido a tu comunidad de herramientas.</p>
        </div>
        <div class="flex gap-3">
          <!-- BOTÓN NOTIFICACIONES -->
          <RouterLink to="/notifications" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition">
            <span>🔔</span> Notificaciones
          </RouterLink>

          <!-- BOTÓN MENSAJES-->
          <RouterLink to="/chat" class="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition">
            <span>💬</span> Mensajes
          </RouterLink>

          <!-- BOTÓN ADMIN (SOLO ADMINS) -->
          <RouterLink v-if="authStore.isAdmin" to="/admin" class="bg-gray-500 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition shadow-lg">
            <span>🛡️</span> Panel Admin
          </RouterLink>
        </div>
      </div>

      <!-- GRID DE ACCIONES -->
      <div class="grid gap-6 md:grid-cols-3 mb-12">
        <RouterLink to="/tools" class="group bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition border border-transparent hover:border-blue-100 flex flex-col items-center text-center">
          <div class="mb-4 bg-blue-50 p-4 rounded-full text-4xl group-hover:bg-blue-100 transition">🛠️</div>
          <h2 class="text-xl font-bold text-gray-800 mb-2">Catálogo</h2>
          <p class="text-sm text-gray-500">Compra, vende o presta herramientas en tu zona.</p>
        </RouterLink>

        <RouterLink to="/my-loans" class="group bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition border border-transparent hover:border-purple-100 flex flex-col items-center text-center">
          <div class="mb-4 bg-purple-50 p-4 rounded-full text-4xl group-hover:bg-purple-100 transition">🤝</div>
          <h2 class="text-xl font-bold text-gray-800 mb-2">Mis Préstamos</h2>
          <p class="text-sm text-gray-500">Gestiona tus solicitudes enviadas y recibidas.</p>
        </RouterLink>

        <RouterLink v-if="authStore.user" :to="{ name: 'user-profile', params: { id: authStore.user.userId } }" class="group bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition border border-transparent hover:border-yellow-100 flex flex-col items-center text-center">
          <div class="mb-4 bg-yellow-50 p-4 rounded-full text-4xl group-hover:bg-yellow-100 transition">👤</div>
          <h2 class="text-xl font-bold text-gray-800 mb-2">Mi Perfil</h2>
          <p class="text-sm text-gray-500">Revisa tu reputación y herramientas públicas.</p>
        </RouterLink>

        <RouterLink to="/unavailable" class="group bg-white p-8 rounded-xl shadow hover:shadow-xl transition text-center border border-transparent hover:border-gray-300">
          <div class="text-4xl mb-4 group-hover:scale-110 transition">🚫</div>
          <h2 class="text-xl font-bold text-gray-800 mb-2">Historial</h2>
          <p class="text-sm text-gray-500">Ver herramientas vendidas o prestadas.</p>
        </RouterLink>
      </div>

      <div class="text-center">
        <button @click="handleLogout" class="text-red-500 font-medium hover:underline hover:text-red-700">Cerrar Sesión</button>
      </div>
    </div>
  </div>
</template>