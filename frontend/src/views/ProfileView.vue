<template>
  <div class="max-w-2xl mx-auto px-4 py-12">

    <!-- Header profil -->
    <div class="card p-8 mb-6">
      <div class="flex items-center gap-6 mb-8">
        <!-- Avatar grand -->
        <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-pitch-500 to-pitch-700
          flex items-center justify-center text-3xl font-bold text-white flex-shrink-0">
          {{ auth.username.charAt(0).toUpperCase() }}
        </div>
        <div>
          <h1 class="font-display text-3xl text-white tracking-wide">{{ auth.username }}</h1>
          <p class="text-white/40 text-sm">{{ user?.email }}</p>
          <div class="flex items-center gap-3 mt-2">
            <span class="badge-green">{{ user?.total_points || 0 }} pts</span>
            <span v-if="auth.isAdmin" class="badge bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Admin</span>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-4">
        <div class="text-center p-4 rounded-xl bg-white/5">
          <div class="font-display text-3xl text-pitch-500">{{ user?.total_points || 0 }}</div>
          <div class="text-xs text-white/40 mt-1">Points totaux</div>
        </div>
        <div class="text-center p-4 rounded-xl bg-white/5">
          <div class="font-display text-3xl text-white">{{ user?.daily_wins || 0 }}</div>
          <div class="text-xs text-white/40 mt-1">🗓️ Quotidiens gagnés</div>
        </div>
        <div class="text-center p-4 rounded-xl bg-white/5">
          <div class="font-display text-3xl text-white">{{ user?.random_wins || 0 }}</div>
          <div class="text-xs text-white/40 mt-1">🎲 Aléatoires gagnés</div>
        </div>
      </div>
    </div>

    <!-- Modifier le profil -->
    <div class="card p-6 mb-6">
      <h2 class="font-display text-2xl text-white tracking-wide mb-5">Modifier le profil</h2>

      <form @submit.prevent="handleUpdateProfile" class="space-y-4">
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm text-white/60 mb-2">Pseudo</label>
            <input v-model="form.username" type="text" class="input"
              :placeholder="auth.username" minlength="3" maxlength="50" />
          </div>
          <div>
            <label class="block text-sm text-white/60 mb-2">Email</label>
            <input v-model="form.email" type="email" class="input"
              :placeholder="user?.email" />
          </div>
        </div>

        <div class="border-t border-white/5 pt-4">
          <div class="text-sm text-white/60 mb-3 font-semibold">Changer le mot de passe</div>
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-white/40 mb-2">Mot de passe actuel</label>
              <input v-model="form.currentPassword" type="password" class="input"
                placeholder="••••••••" autocomplete="current-password" />
            </div>
            <div>
              <label class="block text-xs text-white/40 mb-2">Nouveau mot de passe</label>
              <input v-model="form.newPassword" type="password" class="input"
                placeholder="Min. 6 caractères" autocomplete="new-password" minlength="6" />
            </div>
          </div>
        </div>

        <!-- Messages -->
        <div v-if="updateSuccess" class="px-4 py-3 rounded-xl bg-pitch-500/10 border border-pitch-500/20 text-pitch-500 text-sm">
          ✅ {{ updateSuccess }}
        </div>
        <div v-if="updateError" class="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {{ updateError }}
        </div>

        <div class="flex justify-end">
          <button type="submit" class="btn-primary" :disabled="auth.loading">
            {{ auth.loading ? 'Enregistrement...' : 'Enregistrer les modifications' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Historique récent -->
    <div class="card p-6 mb-6">
      <h2 class="font-display text-2xl text-white tracking-wide mb-5">Historique récent</h2>

      <div v-if="historyLoading" class="text-center py-8 text-white/30">
        <div class="w-6 h-6 border-2 border-pitch-500/30 border-t-pitch-500 rounded-full animate-spin mx-auto mb-2" />
        <p class="text-sm">Chargement...</p>
      </div>

      <div v-else-if="history.length === 0" class="text-center py-8 text-white/30">
        <div class="text-3xl mb-2">🎮</div>
        <p class="text-sm">Aucune partie jouée pour l'instant.</p>
      </div>

      <div v-else class="space-y-2">
        <div v-for="session in history" :key="session.id"
          class="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
          <div class="text-xl flex-shrink-0">{{ session.won ? '🏆' : '😔' }}</div>
          <div class="w-8 h-8 rounded-full overflow-hidden bg-white/5 flex-shrink-0">
            <img v-if="session.player_photo" :src="session.player_photo" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-xs text-white/30">?</div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-semibold text-white truncate">
              {{ session.player_name || 'Joueur inconnu' }}
            </div>
            <div class="text-xs text-white/40">
              {{ session.game_type === 'daily' ? '🗓️ Quotidien' : '🎲 Aléatoire' }}
              · {{ session.attempts }}/10 tentatives
              · {{ formatDate(session.game_date) }}
            </div>
          </div>
          <div class="font-mono text-sm font-semibold flex-shrink-0"
            :class="session.won ? 'text-pitch-500' : 'text-white/30'">
            {{ session.won ? `+${session.points_earned}` : '—' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Déconnexion -->
    <div class="card p-6">
      <h2 class="font-display text-2xl text-white tracking-wide mb-2">Mon compte</h2>
      <p class="text-white/40 text-sm mb-5">Compte créé le {{ formatDate(user?.created_at) }}</p>
      <button @click="handleLogout" class="btn-danger">
        🚪 Se déconnecter
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const auth = useAuthStore()
const router = useRouter()

const user = ref(null)
const history = ref([])
const historyLoading = ref(true)

const form = ref({ username: '', email: '', currentPassword: '', newPassword: '' })
const updateSuccess = ref('')
const updateError = ref('')

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

const handleUpdateProfile = async () => {
  updateSuccess.value = ''
  updateError.value = ''

  const payload = {}
  if (form.value.username) payload.username = form.value.username
  if (form.value.email) payload.email = form.value.email
  if (form.value.newPassword) {
    payload.newPassword = form.value.newPassword
    payload.currentPassword = form.value.currentPassword
  }

  const result = await auth.updateProfile(payload)

  if (result.success) {
    updateSuccess.value = result.message
    form.value = { username: '', email: '', currentPassword: '', newPassword: '' }
    user.value = { ...user.value, ...auth.user }
    setTimeout(() => { updateSuccess.value = '' }, 3000)
  } else {
    updateError.value = result.error
  }
}

const handleLogout = () => {
  auth.logout()
  router.push('/')
}

onMounted(async () => {
  try {
    const [profileRes, historyRes] = await Promise.all([
      api.get('/users/profile'),
      api.get('/users/history'),
    ])
    user.value = profileRes.data.user
    history.value = historyRes.data.history
  } catch (err) {
    console.error(err)
  } finally {
    historyLoading.value = false
  }
})
</script>
