<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
if (authStore.isAuthenticated) {
  authStore.fetchProfile()
}
</script>

<template>
  <RouterView />
</template>