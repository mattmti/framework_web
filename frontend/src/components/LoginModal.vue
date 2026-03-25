<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
         @click.self="$emit('close')">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="$emit('close')" />

      <!-- Modal -->
      <div class="relative card w-full max-w-md p-8 animate-pop">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="font-display text-3xl text-white tracking-wide">Connexion</h2>
            <p class="text-white/40 text-sm mt-1">Content de te revoir !</p>
          </div>
          <button @click="$emit('close')"
            class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm text-white/60 mb-2">Email</label>
            <input v-model="form.email" type="email" class="input" placeholder="ton@email.com"
              autocomplete="email" required />
          </div>
          <div>
            <label class="block text-sm text-white/60 mb-2">Mot de passe</label>
            <input v-model="form.password" type="password" class="input" placeholder="••••••••"
              autocomplete="current-password" required />
          </div>

          <!-- Error -->
          <div v-if="error" class="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {{ error }}
          </div>

          <button type="submit" class="btn-primary w-full mt-6" :disabled="loading">
            <span v-if="loading" class="animate-spin">⟳</span>
            <span>{{ loading ? 'Connexion...' : 'Se connecter' }}</span>
          </button>
        </form>

        <!-- Switch -->
        <p class="text-center text-sm text-white/40 mt-6">
          Pas encore de compte ?
          <button @click="$emit('switch')" class="text-pitch-500 hover:text-pitch-400 font-semibold transition-colors ml-1">
            S'inscrire
          </button>
        </p>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits(['close', 'switch'])
const auth = useAuthStore()
const router = useRouter()

const form = ref({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  const result = await auth.login(form.value.email, form.value.password)
  loading.value = false

  if (result.success) {
    emit('close')
    // Redirection profil si paramètre
    const redirect = router.currentRoute.value.query.redirect
    if (redirect) router.push(redirect)
  } else {
    error.value = result.error
  }
}
</script>
