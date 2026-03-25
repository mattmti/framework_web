<template>
  <Teleport to="body">
    <div class="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none" style="max-width: 360px;">
      <TransitionGroup name="toast">
        <div v-for="toast in toasts" :key="toast.id"
          class="flex items-start gap-3 px-4 py-3 rounded-xl border shadow-xl pointer-events-auto animate-slide-in"
          :class="toastClass(toast.type)">
          <span class="text-lg flex-shrink-0 mt-0.5">{{ toastIcon(toast.type) }}</span>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold" v-if="toast.title">{{ toast.title }}</p>
            <p class="text-sm opacity-80">{{ toast.message }}</p>
          </div>
          <button @click="removeToast(toast.id)" class="opacity-40 hover:opacity-70 transition-opacity flex-shrink-0">
            ✕
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const toasts = ref([])

const toastClass = (type) => ({
  success: 'bg-night-800 border-pitch-500/30 text-white',
  error: 'bg-night-800 border-red-500/30 text-white',
  info: 'bg-night-800 border-white/10 text-white',
  warning: 'bg-night-800 border-yellow-500/30 text-white',
}[type] || 'bg-night-800 border-white/10 text-white')

const toastIcon = (type) => ({
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️',
}[type] || 'ℹ️')

const removeToast = (id) => {
  const idx = toasts.value.findIndex(t => t.id === id)
  if (idx > -1) toasts.value.splice(idx, 1)
}

// API globale pour ajouter des toasts depuis n'importe où
window.showToast = ({ message, title, type = 'info', duration = 4000 }) => {
  const id = Date.now() + Math.random()
  toasts.value.push({ id, message, title, type })
  setTimeout(() => removeToast(id), duration)
}
</script>

<style scoped>
.toast-enter-active { transition: all 0.3s ease-out; }
.toast-leave-active { transition: all 0.2s ease-in; }
.toast-enter-from { opacity: 0; transform: translateX(20px); }
.toast-leave-to { opacity: 0; transform: translateX(20px); }
</style>
