<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useLoansStore } from '@/stores/loans'
import { useRouter } from 'vue-router'
const showReviewModal = ref(false)
const reviewData = ref({
  loanId: '',
  rating: 5,
  comment: ''
})
const isSubmittingReview = ref(false)

const openReviewModal = (loanId: string) => {
  reviewData.value = { loanId, rating: 5, comment: '' }
  showReviewModal.value = true
}

const handleReviewSubmit = async () => {
  isSubmittingReview.value = true
  const success = await loansStore.submitReview(reviewData.value)
  isSubmittingReview.value = false

  if (success) {
    alert('¡Reseña enviada con éxito!')
    showReviewModal.value = false
  } else {
    alert(loansStore.error)
  }
}
const loansStore = useLoansStore()
const router = useRouter()
const activeTab = ref('incoming') // 'incoming' (recibidas) o 'outgoing' (enviadas)

onMounted(() => {
  loansStore.fetchMyLoans()
})

const handleStatusChange = async (loanId: string, newStatus: string) => {
  if (confirm(`¿Estás seguro de cambiar el estado a "${newStatus}"?`)) {
    await loansStore.updateLoanStatus(loanId, newStatus)
  }
}

// Función auxiliar para colores de estado
const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'approved': return 'bg-blue-100 text-blue-800'
    case 'active': return 'bg-green-100 text-green-800'
    case 'rejected': return 'bg-red-100 text-red-800'
    case 'returned': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100'
  }
}

// Traducción de estados
const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    approved: 'Aprobado (Por Entregar)',
    active: 'En Uso',
    rejected: 'Rechazado',
    returned: 'Devuelto / Finalizado'
  }
  return labels[status] || status
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="mx-auto max-w-5xl">
      <!-- Encabezado -->
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-3xl font-bold text-gray-800">Gestión de Préstamos</h1>
        <button @click="router.push({ name: 'dashboard' })" class="text-blue-600 hover:underline">
          Volver al Dashboard
        </button>
      </div>

      <!-- Pestañas de Navegación -->
      <div class="mb-6 flex border-b border-gray-300">
        <button @click="activeTab = 'incoming'" class="px-6 py-3 font-medium transition-colors"
          :class="activeTab === 'incoming' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'">
          Solicitudes Recibidas ({{ loansStore.incomingRequests.length }})
        </button>
        <button @click="activeTab = 'outgoing'" class="px-6 py-3 font-medium transition-colors"
          :class="activeTab === 'outgoing' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'">
          Mis Solicitudes Enviadas ({{ loansStore.myRequests.length }})
        </button>
      </div>

      <!-- SECCIÓN 1: SOLICITUDES RECIBIDAS (Soy el dueño) -->
      <div v-if="activeTab === 'incoming'">
        <div v-if="loansStore.incomingRequests.length === 0" class="rounded-lg bg-white p-8 text-center text-gray-500">
          No tienes solicitudes pendientes para tus herramientas.
        </div>

        <div v-else class="space-y-4">
          <div v-for="loan in loansStore.incomingRequests" :key="loan.id" class="rounded-lg bg-white p-6 shadow-sm">
            <div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h3 class="text-lg font-bold text-gray-800">{{ loan.tool?.name }}</h3>
                <p class="text-sm text-gray-600">
                  Solicitado por: <span class="font-medium">{{ loan.requester?.name }}</span>
                </p>
                <p class="text-sm text-gray-500">
                  Fechas: {{ loan.startDate }} al {{ loan.endDate }}
                </p>
              </div>

              <div class="flex flex-col items-end gap-2">
                <span
                  :class="`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(loan.status)}`">
                  {{ getStatusLabel(loan.status) }}
                </span>

                <!-- ACCIONES DE DUEÑO -->
                <div v-if="loan.status === 'pending'" class="flex gap-2">
                  <button @click="handleStatusChange(loan.id, 'approved')"
                    class="rounded bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600">
                    Aprobar
                  </button>
                  <button @click="handleStatusChange(loan.id, 'rejected')"
                    class="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600">
                    Rechazar
                  </button>
                </div>

                <div v-if="loan.status === 'approved'" class="mt-2">
                  <button @click="handleStatusChange(loan.id, 'active')"
                    class="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600">
                    Marcar como Entregado
                  </button>
                </div>

                <div v-if="loan.status === 'active'" class="mt-2">
                  <button @click="handleStatusChange(loan.id, 'returned')"
                    class="rounded bg-gray-500 px-3 py-1 text-sm text-white hover:bg-gray-600">
                    Confirmar Devolución
                  </button>
                </div>
                <div v-if="loan.status === 'returned'" class="mt-2 text-right">
                  <span class="text-sm text-gray-500 block mb-2">Préstamo finalizado</span>
                  <button @click="openReviewModal(loan.id)"
                    class="rounded bg-purple-600 px-3 py-1 text-sm text-white hover:bg-purple-700">
                    Calificar Usuario
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else>
        <div v-if="loansStore.myRequests.length === 0" class="rounded-lg bg-white p-8 text-center text-gray-500">
          No has solicitado ninguna herramienta todavía.
        </div>

        <div v-else class="space-y-4">
          <div v-for="loan in loansStore.myRequests" :key="loan.id" class="rounded-lg bg-white p-6 shadow-sm">
            <div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h3 class="text-lg font-bold text-gray-800">{{ loan.tool?.name }}</h3>
                <p class="text-sm text-gray-600">
                  Dueño: <span class="font-medium">{{ loan.owner?.name }}</span>
                </p>
                <p class="text-sm text-gray-500">
                  Fechas: {{ loan.startDate }} al {{ loan.endDate }}
                </p>
              </div>

              <div>
                <span
                  :class="`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(loan.status)}`">
                  {{ getStatusLabel(loan.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
  <div
    v-if="showReviewModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  >
    <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
      <h2 class="mb-4 text-2xl font-bold text-gray-800">Calificar Experiencia</h2>
      
      <form @submit.prevent="handleReviewSubmit">
        <div class="mb-4">
          <label class="mb-2 block font-medium">Calificación (1-5 Estrellas)</label>
          <div class="flex gap-2">
            <select v-model="reviewData.rating" class="w-full rounded-md border p-2">
              <option :value="5">⭐⭐⭐⭐⭐ (Excelente)</option>
              <option :value="4">⭐⭐⭐⭐ (Muy buena)</option>
              <option :value="3">⭐⭐⭐ (Regular)</option>
              <option :value="2">⭐⭐ (Mala)</option>
              <option :value="1">⭐ (Pésima)</option>
            </select>
          </div>
        </div>

        <div class="mb-4">
          <label class="mb-2 block font-medium">Comentario</label>
          <textarea
            v-model="reviewData.comment"
            class="w-full rounded-md border p-2"
            rows="3"
            placeholder="¿Cómo fue el trato? ¿La herramienta estaba bien?"
          ></textarea>
        </div>

        <div class="mt-6 flex justify-end gap-4">
          <button
            type="button"
            @click="showReviewModal = false"
            class="rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="isSubmittingReview"
            class="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
          >
            {{ isSubmittingReview ? 'Enviando...' : 'Enviar Reseña' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>