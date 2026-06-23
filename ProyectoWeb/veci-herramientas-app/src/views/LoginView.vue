<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-100">
    <div class="w-full max-w-md rounded-lg bg-white p-8 shadow-lg text-center">
      <h1 class="mb-4 text-3xl font-bold text-gray-800">Veci-Herramientas</h1>
      <p class="mb-8 text-gray-500">Inicia sesión con tu cuenta institucional</p>

      <button
        @click="authStore.login()"
        class="w-full rounded-md bg-blue-600 p-3 text-white font-semibold transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Iniciar sesión con Keycloak
      </button>

      <p class="mt-6 text-xs text-gray-400">
        Al iniciar sesión serás redirigido al portal de autenticación centralizado.<br />
        Si ya iniciaste sesión en otra aplicación del sistema, entrarás automáticamente.
      </p>
    </div>
  </div>
</template>
