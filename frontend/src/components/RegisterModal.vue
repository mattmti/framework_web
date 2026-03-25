<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
         @click.self="$emit('close')">
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="$emit('close')" />

      <div class="relative card w-full max-w-md p-8 animate-pop">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="font-display text-3xl text-white tracking-wide">Inscription</h2>
            <p class="text-white/40 text-sm mt-1">Rejoins la compétition !</p>
          </div>
          <button @click="$emit('close')"
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-sm text-white/60 mb-2">Pseudo</label>
            <input v-model="form.username" type="text" class="input" placeholder="MonPseudo"
              minlength="3" maxlength="50" required />
          </div>
          <div>
            <label class="block text-sm text-white/60 mb-2">Email</label>
            <input v-model="form.email" type="email" class="input" placeholder="ton@email.com"
              autocomplete="email" required />
          </div>
          <div>
            <label class="block text-sm text-white/60 mb-2">Mot de passe</label>
            <input v-model="form.password" type="password" class="input" placeholder="Min. 6 caractères"
              minlength="6" autocomplete="new-password" required />
          </div>

          <!-- Password strength -->
          <div v-if="form.password" class="flex gap-1">
            <div v-for="i in 4" :key="i"
              class="h-1 flex-1 rounded-full transition-colors"
              :class="passwordStrength >= i ? strengthColor : 'bg-white/10'" />
          </div>

          <div v-if="error" class="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {{ error }}
          </div>

          <button type="submit" class="btn-primary w-full mt-6" :disabled="loading">
            <span v-if="loading" class="animate-spin">⟳</span>
            <span>{{ loading ? 'Création...' : 'Créer mon compte' }}</span>
          </button>
        </form>

        <p class="text-center text-sm text-white/40 mt-6">
          Déjà un compte ?
          <button @click="$emit('switch')" class="text-pitch-500 hover:text-pitch-400 font-semibold transition-colors ml-1">
            Se connecter
          </button>
        </p>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits(['close', 'switch'])
const auth = useAuthStore()

const form = ref({ username: '', email: '', password: '' })
const loading = ref(false)
const error = ref('')

const passwordStrength = computed(() => {
  const p = form.value.password
  let score = 0
  if (p.length >= 6) score++
  if (p.length >= 10) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9!@#$%]/.test(p)) score++
  return score
})

const strengthColor = computed(() => {
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-pitch-500']
  return colors[passwordStrength.value - 1] || 'bg-red-500'
})

const handleRegister = async () => {
  loading.value = true
  error.value = ''
  const result = await auth.register(form.value.username, form.value.email, form.value.password)
  loading.value = false

  if (result.success) {
    emit('close')
  } else {
    error.value = result.error
  }
}
</script>
